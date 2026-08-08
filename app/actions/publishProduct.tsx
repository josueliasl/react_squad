'use server';

import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { pool } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

const MAX_IMAGE_SIZE_BYTES = 1024 * 1024; // 1MB

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    }

    if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
        auth: {
        persistSession: false,
        },
    }
    );

export async function publishProduct(formData: FormData) {
  try {
    // -------------------------------------------------------------
    // PASO 1: Verificar autenticación
    // -------------------------------------------------------------
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: 'You must be authenticated to publish a product.',
      };
    }

    // -------------------------------------------------------------
    // PASO 2: Obtener datos del formulario
    // -------------------------------------------------------------
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const category = String(formData.get('category') ?? '').trim();

    const rawPrice = String(formData.get('price') ?? '').trim();
    const price = Number(rawPrice);

    const rawProductImage = formData.get('product_image');

    // -------------------------------------------------------------
    // Validaciones
    // -------------------------------------------------------------
    if (!title) {
      return {
        success: false,
        error: 'Product title is required.',
      };
    }

    if (!description) {
      return {
        success: false,
        error: 'Product description is required.',
      };
    }

    if (!category) {
      return {
        success: false,
        error: 'Product category is required.',
      };
    }

    if (!rawPrice || !Number.isFinite(price) || price < 0) {
      return {
        success: false,
        error: 'Please provide a valid price.',
      };
    }

    if (!(rawProductImage instanceof File)) {
      return {
        success: false,
        error: 'product_image must be a valid file.',
      };
    }

    if (rawProductImage.size === 0) {
      return {
        success: false,
        error: 'Product image is empty.',
      };
    }

    if (rawProductImage.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        success: false,
        error: 'Max image size is 1MB.',
      };
    }

    if (!ALLOWED_IMAGE_TYPES.has(rawProductImage.type)) {
      return {
        success: false,
        error: 'Invalid image type.',
      };
    }

    const file = rawProductImage;

    // -------------------------------------------------------------
    // PASO 3: Obtener UUID del usuario desde PostgreSQL
    // -------------------------------------------------------------
    const userQuery = `
      SELECT id
      FROM users
      WHERE clerk_id = $1
      LIMIT 1;
    `;

    const userResult = await pool.query(userQuery, [clerkUserId]);

    if (userResult.rows.length === 0) {
      return {
        success: false,
        error: 'User profile not found in database.',
      };
    }

    const sellerUuid = userResult.rows[0].id as string;

    // -------------------------------------------------------------
    // PASO 4: Subir imagen a Supabase Storage
    // -------------------------------------------------------------
    const fileExt =
      file.name.split('.').pop()?.toLowerCase() || 'jpg';

    const imageUuid = randomUUID();

    const filePath = `products/${imageUuid}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    const { error: storageError } = await supabase.storage
      .from('product-images')
      .upload(filePath, fileBytes, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (storageError) {
      console.error('Supabase Storage error:', {
        message: storageError.message,
        name: storageError.name,
        status: (storageError as any).status,
        statusCode: (storageError as any).statusCode,
      });

      return {
        success: false,
        error: `Storage upload failed: ${storageError.message}`,
      };
    }

    // -------------------------------------------------------------
    // PASO 5: Obtener URL pública
    // -------------------------------------------------------------
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // -------------------------------------------------------------
    // PASO 6: Insertar producto
    // -------------------------------------------------------------
    const insertQuery = `
      INSERT INTO products (
        seller_id,
        name,
        description,
        price,
        category,
        images
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    // IMPORTANTE:
    // images es un array, por eso enviamos [imageUrl]
    const values = [
      sellerUuid,
      title,
      description,
      price,
      category,
      [imageUrl],
    ];

    const result = await pool.query(insertQuery, values);

    // -------------------------------------------------------------
    // PASO 7: Actualizar dashboard
    // -------------------------------------------------------------
    revalidatePath('/seller/dashboard');

    return {
      success: true,
      data: result.rows[0],
    };

  } catch (error: unknown) {
    console.error('Error publishing product:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Internal server error.',
    };
  }
}