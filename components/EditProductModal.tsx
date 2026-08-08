
'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { updateProduct } from '@/app/actions/productActions';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  images?: string[];
}

interface EditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function EditProductModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: EditModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Limpiar el error cuando cambia el producto
   * que estamos editando o cuando se abre el modal.
   */
  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen, product]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!product) {
      return;
    }

    const form = e.currentTarget;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData(form);

      // El ID se obtiene del producto seleccionado,
      // no de un input manipulable del formulario.
      formData.set('id', product.id);

      const res = await updateProduct(formData);

      if (!res.success) {
        setError(res.error || 'Failed to update product.');
        return;
      }

      // Actualizar la lista del dashboard
      await onSuccess();

      // Cerrar modal después de actualizar correctamente
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);

      setError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-product-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="edit-product-title"
            className="text-xl font-bold text-stone-900"
          >
            Edit Product
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Product Name */}
          <div>
            <label
              htmlFor="edit-product-name"
              className="block text-sm font-semibold text-stone-700"
            >
              Product Name
            </label>

            <input
              id="edit-product-name"
              type="text"
              name="name"
              defaultValue={product.name}
              required
              disabled={loading}
              className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-[#2D5A27] focus:outline-none disabled:bg-stone-100"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-product-price"
                className="block text-sm font-semibold text-stone-700"
              >
                Price ($ USD)
              </label>

              <input
                id="edit-product-price"
                type="number"
                name="price"
                step="0.01"
                min="0"
                defaultValue={product.price}
                required
                disabled={loading}
                className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-[#2D5A27] focus:outline-none disabled:bg-stone-100"
              />
            </div>

            <div>
              <label
                htmlFor="edit-product-category"
                className="block text-sm font-semibold text-stone-700"
              >
                Category
              </label>

              <input
                id="edit-product-category"
                type="text"
                name="category"
                defaultValue={product.category}
                required
                disabled={loading}
                className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-[#2D5A27] focus:outline-none disabled:bg-stone-100"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="edit-product-description"
              className="block text-sm font-semibold text-stone-700"
            >
              Description
            </label>

            <textarea
              id="edit-product-description"
              name="description"
              rows={3}
              defaultValue={product.description || ''}
              disabled={loading}
              className="w-full resize-none rounded-xl border border-stone-300 p-3 text-sm focus:border-[#2D5A27] focus:outline-none disabled:bg-stone-100"
            />
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#2D5A27] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#2D5A27]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

