'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Store,
  Pencil,
  Trash2,
  Package,
} from 'lucide-react';

import { PublishProductModal } from '@/components/PublishProductModal';
import { EditProductModal } from '@/components/EditProductModal';

import {
  getSellerProducts,
  deleteProduct,
} from '@/app/actions/productActions';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  images?: string[];
  created_at?: string;
}

function getProductImageSrc(images?: string[]) {
  const rawSrc =
    Array.isArray(images) && images.length > 0
      ? images[0]
      : null;

  if (!rawSrc) {
    return null;
  }

  // Si ya es URL pública completa, úsala tal cual.
  if (
    rawSrc.startsWith('http://') ||
    rawSrc.startsWith('https://')
  ) {
    return rawSrc;
  }

  // Si ya viene como ruta local, también respétala.
  if (rawSrc.startsWith('/images/')) {
    return rawSrc;
  }

  // Si viene solo como filename o path relativo, construye la ruta.
  return `/images/${rawSrc.replace(/^\/+/, '')}`;
}

export default function SellerDashboardPage() {
  const [isPublishModalOpen, setIsPublishModalOpen] =
    useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingProductId, setDeletingProductId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  /**
   * Obtiene los productos pertenecientes
   * al seller autenticado.
   */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getSellerProducts();

      if (!res.success) {
        setError(
          res.error || 'Unable to load your products.'
        );

        setProducts([]);

        return;
      }

      setProducts(res.products);
    } catch (error) {
      console.error(
        'Error loading seller products:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load your products.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar productos al montar el componente.
   */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Abrir modal de edición.
   */
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  /**
   * Cerrar modal de edición.
   */
  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  /**
   * Eliminar producto.
   */
  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProductId(productId);
      setError(null);

      const res = await deleteProduct(productId);

      if (!res.success) {
        setError(
          res.error || 'Unable to delete the product.'
        );

        return;
      }

      await fetchProducts();
    } catch (error) {
      console.error(
        'Error deleting product:',
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : 'Unable to delete the product.'
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    /* Contenedor optimizado: ocupa hasta el 95% del ancho con un máximo flexible y padding responsivo */
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Main Header */}
      <header>
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          My Products
        </h1>

        <p className="mt-2 text-sm text-stone-600 sm:text-base">
          Manage and view all the items you have registered
          in your store catalog.
        </p>
      </header>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}

          <button
            type="button"
            onClick={fetchProducts}
            className="ml-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-16 text-center text-stone-500">
          <p className="text-sm">
            Loading your creations...
          </p>
        </div>
      ) : products.length === 0 ? (
        /* =====================================================
           EMPTY STATE
           No products -> only show the main Publish CTA
           ===================================================== */
        <section className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8633A]/10 text-[#C1440E]">
              <Store className="h-7 w-7" />
            </div>

            <p className="text-base font-medium leading-relaxed text-stone-800 sm:text-lg">
              Publish your items and share what your hands
              have created with the world.
            </p>

            <button
              type="button"
              onClick={() =>
                setIsPublishModalOpen(true)
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C1440E] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#C1440E]/20 transition duration-150 ease-in-out hover:bg-[#9A3209] focus:outline-none focus:ring-2 focus:ring-[#C1440E] focus:ring-offset-2 sm:w-auto"
            >
              <Plus className="h-5 w-5" />
              Publish new item
            </button>
          </div>
        </section>
      ) : (
        /* =====================================================
           PRODUCTS STATE
           Products exist -> show published items
           ===================================================== */
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-left text-lg font-bold text-stone-900 sm:text-xl">
              Your Published Items ({products.length})
            </h2>
          </div>

          {/* Product cards: Adaptativo desde 1 columna en móvil hasta 4 columnas en pantallas muy anchas */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const mainImage = getProductImageSrc(product.images);

              const isDeleting =
                deletingProductId === product.id;

              return (
                <div
                  key={product.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:shadow-md"
                >
                  {/* Image Header */}
                  <div className="relative h-48 w-full bg-stone-100">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-400">
                        <Package className="h-10 w-10" />
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                      {product.category}
                    </span>
                  </div>

                  {/* Content & Actions */}
                  <div className="flex flex-1 items-center justify-between p-5 text-left">
                    <div className="min-w-0 space-y-1">
                      <h3 className="line-clamp-1 font-bold text-stone-900">
                        {product.name}
                      </h3>

                      <p className="text-lg font-extrabold text-[#C1440E]">
                        $
                        {Number(product.price).toFixed(2)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(product)
                        }
                        disabled={isDeleting}
                        title="Edit Product"
                        className="rounded-lg p-2.5 text-stone-600 transition hover:bg-stone-100 hover:text-[#2D5A27] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(product.id)
                        }
                        disabled={isDeleting}
                        title="Delete Product"
                        className="rounded-lg p-2.5 text-stone-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <span className="block h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-red-600" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add another product */}
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={() =>
                setIsPublishModalOpen(true)
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C1440E] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#C1440E]/20 transition duration-150 ease-in-out hover:bg-[#9A3209] focus:outline-none focus:ring-2 focus:ring-[#C1440E] focus:ring-offset-2 sm:w-auto"
            >
              <Plus className="h-5 w-5" />
              Publish new item
            </button>
          </div>
        </section>
      )}

      {/* Publish Modal */}
      <PublishProductModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
        }}
        onSuccess={fetchProducts}
      />

      {/* Edit Modal */}
      <EditProductModal
        product={selectedProduct}
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onSuccess={fetchProducts}
      />
    </div>
  );
}