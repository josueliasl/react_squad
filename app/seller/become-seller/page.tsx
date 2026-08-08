
'use client';

import React, { useEffect, useState } from 'react';
import { registerSellerProfile } from '@/app/actions/registerSeller';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface SellerFormProps {
  currentUserId: string;
}

export default function BecomeSellerPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string>('');

  // Archivo seleccionado y URL temporal para la vista previa
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /**
   * Maneja la selección de una imagen.
   */
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Liberamos la URL anterior si existe
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Guardamos el archivo
    setSelectedFile(file);

    // Creamos una nueva URL temporal para la preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  /**
   * Elimina la imagen seleccionada.
   */
  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
  };

  /**
   * Libera la URL temporal cuando el componente se desmonta.
   */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Envía el formulario.
   */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget; // Guardamos la referencia antes del await

    setLoading(true);
    setMensaje('');

    try {
      const formData = new FormData(form);

      if (selectedFile) {
        formData.set('profile_image', selectedFile);
      }

      const res = await registerSellerProfile(formData);

      if (res.success) {
        setMensaje('Profile registered successfully!');

        // Limpiar formulario
        form.reset();

        // Limpiar preview de la imagen
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(null);
        setPreviewUrl(null);

        // Recargar los datos del usuario en Clerk
        // para actualizar información como isSeller
        if (user) {
          await user.reload();
        }

        // Redirigir al dashboard del vendedor
        router.push('/seller/dashboard');
        router.refresh();
      } else {
        setMensaje(`Error: ${res.error}`);
      }
    } catch (error) {
      console.error('Error registering seller:', error);

      setMensaje(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-stone-900">
            Seller Profile Registration
          </h1>

          <p className="mt-2 text-sm text-stone-600">
            Complete your information to start selling on the platform.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field: Bio */}
            <div className="space-y-2">
              <label
                htmlFor="bio"
                className="block text-sm font-semibold text-stone-700"
              >
                Bio
              </label>

              <textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="Tell us briefly about yourself..."
                className="w-full resize-none rounded-xl border border-stone-300 bg-stone-50/50 p-3.5 text-sm text-stone-800 placeholder-stone-400 transition duration-150 ease-in-out focus:border-[#2D5A27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20"
              />
            </div>

            {/* Field: Story */}
            <div className="space-y-2">
              <label
                htmlFor="story"
                className="block text-sm font-semibold text-stone-700"
              >
                Story / Business Background
              </label>

              <textarea
                id="story"
                name="story"
                rows={5}
                placeholder="How was your business founded? Share your vision and origins..."
                className="w-full resize-none rounded-xl border border-stone-300 bg-stone-50/50 p-3.5 text-sm text-stone-800 placeholder-stone-400 transition duration-150 ease-in-out focus:border-[#2D5A27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20"
              />
            </div>

            {/* Field: Profile Picture / Logo */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-700">
                Profile Picture / Logo
              </label>

              {selectedFile ? (
                /* Preview */
                <div className="mt-1 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex min-w-0 items-center space-x-4">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile image preview"
                        className="h-14 w-14 flex-shrink-0 rounded-lg border border-stone-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-stone-200 font-bold text-stone-500">
                        IMG
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-900">
                        {selectedFile.name}
                      </p>

                      <p className="text-xs text-stone-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>

                      <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#2D5A27]">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>

                        Ready to upload
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="ml-4 rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-[#C1440E] focus:outline-none"
                    title="Remove image"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                /* Upload */
                <div className="group relative mt-1 flex justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/50 px-6 pb-6 pt-5 transition-colors hover:border-[#2D5A27] hover:bg-white">
                  <label
                    htmlFor="profile_image"
                    className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-within:outline-none focus-within:ring-2 focus-within:ring-[#2D5A27]/20"
                  >
                    <input
                      type="file"
                      id="profile_image"
                      name="profile_image"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      required
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>

                  <div className="pointer-events-none relative z-0 space-y-2 text-center">
                    <svg
                      className="mx-auto h-10 w-10 text-stone-400 transition-colors group-hover:text-[#2D5A27]"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <div className="flex justify-center text-sm text-stone-600">
                      <span className="font-medium text-[#C1440E] group-hover:text-[#9A3209]">
                        Upload a file
                      </span>

                      <p className="pl-1 text-stone-600">
                        or drag and drop
                      </p>
                    </div>

                    <p className="text-xs text-stone-400">
                      PNG, JPG, GIF less than 1MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-[#C1440E] px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#C1440E]/20 transition duration-150 ease-in-out hover:bg-[#9A3209] active:bg-[#9A3209] focus:outline-none focus:ring-2 focus:ring-[#C1440E] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>

                  Saving...
                </span>
              ) : (
                'Save Profile'
              )}
            </button>

            {/* Status Message */}
            {mensaje && (
              <div className="animate-fade-in rounded-xl border border-[#E8633A]/30 bg-[#E8633A]/10 p-3.5 text-center text-sm font-medium text-[#9A3209]">
                {mensaje}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

