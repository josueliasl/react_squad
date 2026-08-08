'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NavLinks } from './Nav-links';
import { User, ShoppingCart, Store, LayoutDashboard } from 'lucide-react';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();

  // Verificar si el usuario tiene el rol de vendedor en la metadata
  const isSeller = user?.publicMetadata?.isSeller === 'seller';
  // Nota: Si usas un booleano en metadata como { isSeller: true }, usarías:
  // const isSeller = user?.publicMetadata?.isSeller === true;

  // Render minimal navbar while Clerk is loading
  if (!isLoaded) {
    return (
      <header className="bg-white shadow relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center flex-shrink-0">
              <Link 
                href="/" 
                className="text-xl font-bold flex whitespace-nowrap text-black hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/images/handcrafted-remove-bg-logo.png" 
                  alt="Handcrafted Haven Logo" 
                  className="h-8 w-auto mr-2" 
                />
                Handcrafted Haven
              </Link>
            </div>
            <div className="hidden md:block">
              <NavLinks />
            </div>
            <div className="md:hidden w-8 h-8" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link 
              href="/" 
              className="text-xl font-bold flex whitespace-nowrap text-black hover:opacity-80 transition-opacity"
            >
              <img 
                src="/images/handcrafted-remove-bg-logo.png" 
                alt="Handcrafted Haven Logo" 
                className="h-8 w-auto mr-2" 
              />
              Handcrafted Haven
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 h-full">
            <NavLinks />
            
            <div className="flex items-center gap-6 border-l border-gray-200 pl-6">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
                      <User className="w-5 h-5" />
                      <span>Iniciar Sesión</span>
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button className="bg-[#c95f3b] text-white rounded-full text-sm font-medium px-6 py-2 hover:bg-[#5a3de0] transition-colors">
                      Registrarse
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <div className="flex items-center gap-6">
                  {/* Botón dinámico según el rol del usuario */}
                  {isSeller ? (
                    <Link
                      href="/seller/dashboard"
                      className="flex items-center gap-2 text-sm font-medium text-[#c95f3b] hover:text-[#5a3de0] transition-colors"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Manage business</span>
                    </Link>
                  ) : (
                    <Link
                      href="/seller/become-seller"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#c95f3b] transition-colors"
                    >
                      <Store className="w-5 h-5" />
                      <span>Start selling</span>
                    </Link>
                  )}

                  <Link 
                    href="/cart" 
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Carrito</span>
                  </Link>

                  <UserButton />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-black hover:bg-gray-100 focus:outline-none"
              aria-label="Menu principal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute top-16 left-0 w-full px-4 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <NavLinks onLinkClick={() => setIsOpen(false)} />
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button 
                    className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-black px-4 py-3 rounded-md hover:bg-gray-50 w-full text-left"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Iniciar Sesión
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button 
                    className="bg-[#c95f3b] text-white rounded-full text-sm font-medium py-3 px-6 w-full hover:bg-[#5a3de0] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Registrarse
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                {/* Botón dinámico Mobile */}
                {isSeller ? (
                  <Link
                    href="/seller/dashboard"
                    className="flex items-center gap-3 text-sm font-medium text-[#c95f3b] hover:text-[#5a3de0] px-4 py-3 rounded-md hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Manage business
                  </Link>
                ) : (
                  <Link
                    href="/seller/become-seller"
                    className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-[#c95f3b] px-4 py-3 rounded-md hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <Store className="w-5 h-5" />
                    Start selling
                  </Link>
                )}

                <Link 
                  href="/cart" 
                  className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-black px-4 py-3 rounded-md hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Carrito
                </Link>
                
                <div className="px-4 py-2">
                  <UserButton />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}