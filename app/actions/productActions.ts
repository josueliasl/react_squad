'use server';

import { pool } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';


/**
 * Obtener todos los productos pertenecientes
 * al vendedor autenticado.
 */
export async function getSellerProducts() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: 'Unauthorized',
        products: [],
      };
    }

    /**
     * No usamos created_at porque esa columna
     * no existe en la tabla products.
     */
    const query = `
      SELECT p.*
      FROM products p
      JOIN users u ON u.id = p.seller_id
      WHERE u.clerk_id = $1;
    `;

    const result = await pool.query(query, [clerkUserId]);

    return {
      success: true,
      products: result.rows,
    };
  } catch (error: unknown) {
    console.error(
      'Error fetching seller products:',
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unable to fetch seller products.',
      products: [],
    };
  }
}

/**
 * Actualizar un producto existente.
 *
 * El producto solamente puede actualizarse si
 * pertenece al seller autenticado.
 */
export async function updateProduct(formData: FormData) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const productId = String(
      formData.get('id') ?? ''
    ).trim();

    const name = String(
      formData.get('name') ?? ''
    ).trim();

    const category = String(
      formData.get('category') ?? ''
    ).trim();

    const description = String(
      formData.get('description') ?? ''
    ).trim();

    const rawPrice = String(
      formData.get('price') ?? ''
    ).trim();

    const price = Number(rawPrice);

    // -------------------------------------------------------------
    // Validaciones
    // -------------------------------------------------------------

    if (!productId) {
      return {
        success: false,
        error: 'Product ID is required.',
      };
    }

    if (!name) {
      return {
        success: false,
        error: 'Product name is required.',
      };
    }

    if (!category) {
      return {
        success: false,
        error: 'Product category is required.',
      };
    }

    if (!Number.isFinite(price) || price < 0) {
      return {
        success: false,
        error: 'Please provide a valid price.',
      };
    }

    // -------------------------------------------------------------
    // Actualizar únicamente si pertenece al seller autenticado.
    //
    // No usamos updated_at porque esa columna no forma
    // parte del esquema actual de products.
    // -------------------------------------------------------------

    const query = `
      UPDATE products
      SET
        name = $1,
        price = $2,
        category = $3,
        description = $4
      WHERE id = $5
        AND seller_id = (
          SELECT id
          FROM users
          WHERE clerk_id = $6
          LIMIT 1
        )
      RETURNING *;
    `;

    const values = [
      name,
      price,
      category,
      description,
      productId,
      clerkUserId,
    ];

    const result = await pool.query(
      query,
      values
    );

    if (result.rowCount === 0) {
      return {
        success: false,
        error: 'Product not found or unauthorized.',
      };
    }

    revalidatePath('/seller/dashboard');

    return {
      success: true,
      product: result.rows[0],
    };
  } catch (error: unknown) {
    console.error(
      'Error updating product:',
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unable to update product.',
    };
  }
}

/**
 * Eliminar un producto.
 *
 * El producto solamente puede eliminarse si
 * pertenece al seller autenticado.
 */
export async function deleteProduct(
  productId: string
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const cleanProductId = String(
      productId
    ).trim();

    if (!cleanProductId) {
      return {
        success: false,
        error: 'Product ID is required.',
      };
    }

    const query = `
      DELETE FROM products
      WHERE id = $1
        AND seller_id = (
          SELECT id
          FROM users
          WHERE clerk_id = $2
          LIMIT 1
        )
      RETURNING id;
    `;

    const result = await pool.query(query, [
      cleanProductId,
      clerkUserId,
    ]);

    /**
     * DELETE pudo ejecutarse correctamente pero
     * no encontrar ningún producto perteneciente
     * al seller.
     */
    if (result.rowCount === 0) {
      return {
        success: false,
        error: 'Product not found or unauthorized.',
      };
    }

    revalidatePath('/seller/dashboard');

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error(
      'Error deleting product:',
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unable to delete product.',
    };
  }
}



