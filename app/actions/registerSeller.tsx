'use server';

import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { pool } from '@/lib/db';
import { auth, clerkClient } from '@clerk/nextjs/server';

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

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

export async function registerSellerProfile(formData: FormData) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: 'You must be authenticated to register as a seller.',
      };
    }

    const bio = String(formData.get('bio') ?? '').trim();
    const story = String(formData.get('story') ?? '').trim();

    const rawProfileImage = formData.get('profile_image');

    if (!(rawProfileImage instanceof File)) {
      return { success: false, error: 'profile_image must be a valid file.' };
    }

    if (rawProfileImage.size === 0) {
      return { success: false, error: 'Profile image is empty.' };
    }

    if (rawProfileImage.size > MAX_IMAGE_SIZE_BYTES) {
      return { success: false, error: 'Max image size is 1MB.' };
    }

    if (!ALLOWED_IMAGE_TYPES.has(rawProfileImage.type)) {
      return { success: false, error: 'Invalid image type.' };
    }

    const file = rawProfileImage;

    // PASO 1: Obtener UUID del usuario desde DB
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

    const userUuid = userResult.rows[0].id as string;

    // PASO 2: Subir imagen a Supabase Storage como bytes
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const imageUuid = randomUUID();
    const filePath = `${imageUuid}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    const { error: storageError } = await supabase.storage
      .from('seller-images')
      .upload(filePath, fileBytes, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (storageError) {
      console.error('Supabase Storage error details:', {
        message: storageError.message,
        name: storageError.name,
        status: (storageError as any).status,
        statusCode: (storageError as any).statusCode,
        error: (storageError as any).error,
      });

      return {
        success: false,
        error: `Storage upload failed: ${storageError.message}`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('seller-images')
      .getPublicUrl(filePath);

    const profileImageUrl = publicUrlData.publicUrl;

    // PASO 3: Insertar en seller_profiles
    const query = `
    INSERT INTO seller_profiles (seller_id, bio, story, profile_image)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (seller_id)
    DO UPDATE SET
        bio = EXCLUDED.bio,
        story = EXCLUDED.story,
        profile_image = EXCLUDED.profile_image
    RETURNING *;
    `;
    const values = [userUuid, bio, story, profileImageUrl];
    const result = await pool.query(query, values);

      // Actualizar el rol del usuario a 'seller' en PostgreSQL
    const updateUserRoleQuery = `
      UPDATE users
      SET role = 'seller'
      WHERE id = $1;
    `;
    await pool.query(updateUserRoleQuery, [userUuid]);

    // -------------------------------------------------------------
    // PASO 4: Actualizar publicMetadata en Clerk
    // -------------------------------------------------------------
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        isSeller: 'seller', // Coincide con la verificación de tu Navbar
      },
    });

    return {
      success: true,
      data: result.rows[0],
    };
  } catch (error: unknown) {
    console.error('Error registering seller:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    };
  }
}