'use client';

import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { publishProduct } from '@/app/actions/publishProduct';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function PublishProductModal({
  isOpen,
  onClose,
  onSuccess,
}: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData(e.currentTarget);

      if (selectedFile) {
        formData.set(
          'product_image',
          selectedFile
        );
      }

      const res = await publishProduct(formData);

      if (!res.success) {
        setErrorMessage(
          res.error || 'Failed to publish item.'
        );

        return;
      }

      // ---------------------------------------------------------
      // Producto creado correctamente.
      //
      // Primero actualizamos el dashboard para que vuelva
      // a consultar los productos del seller.
      // ---------------------------------------------------------
      await onSuccess();

      // Limpiar preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(null);
      setPreviewUrl(null);

      // Cerrar modal después de actualizar el dashboard
      onClose();
    } catch (err: unknown) {
      console.error(
        'Error publishing product:',
        err
      );

      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-bold text-stone-900">
              Publish New Item
            </h2>

            <p className="text-sm text-stone-500">
              Fill in the details to showcase your
              handcrafted creation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 pt-5 text-left"
        >
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-stone-700">
              Product Title *
            </label>

            <input
              type="text"
              name="title"
              required
              placeholder="e.g., Handwoven Wool Rug"
              className="w-full rounded-xl border border-stone-300 bg-stone-50/50 p-3 text-sm text-stone-800 focus:border-[#2D5A27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-stone-700">
                Price ($ USD) *
              </label>

              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                required
                placeholder="45.00"
                className="w-full rounded-xl border border-stone-300 bg-stone-50/50 p-3 text-sm text-stone-800 focus:border-[#2D5A27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-stone-700">
                Category *
              </label>

              <select
                name="category"
                required
                className="w-full rounded-xl border border-stone-300 bg-stone-50/50 p-3 text-sm text-stone-800 focus:border-[#2D5A27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20"
              >
                <option value="">
                  Select category
                </option>

                <option value="Pottery">
                  Pottery & Ceramics
                </option>

                <option value="Textiles">
                  Textiles & Weaving
                </option>

                <option value="Woodwork">
                  Woodwork
                </option>

                <option value="Jewelry">
                  Jewelry & Accessories
                </option>

                <option value="Art">
                  Art & Prints
                </option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-stone-700">
              Description
            </label>

            <textarea
              name="description"
              rows={3}
              placeholder="Describe materials, process, dimensions..."
              className="w-full resize-none rounded-xl border border-stone-300 bg-stone-50/50 p-3 text-sm text-stone-800 focus:border-[#2D5A27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-stone-700">
              Product Image *
            </label>

            {previewUrl ? (
              <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />

                  <span className="truncate text-xs font-medium text-stone-700">
                    {selectedFile?.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl) {
                      URL.revokeObjectURL(
                        previewUrl
                      );
                    }

                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  disabled={loading}
                  className="ml-3 shrink-0 text-xs font-semibold text-[#C1440E] hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/50 p-6 transition hover:border-[#2D5A27] hover:bg-white">
                <Upload className="mb-2 h-8 w-8 text-stone-400" />

                <span className="text-sm font-medium text-[#C1440E]">
                  Click to upload product photo
                </span>

                <span className="mt-1 text-xs text-stone-400">
                  PNG, JPG less than 1MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            )}
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700"
            >
              {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#C1440E] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#C1440E]/20 transition hover:bg-[#9A3209] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Publishing...'
                : 'Publish Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

