'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { NavLinks } from './Nav-links'; 
import { User, ShoppingCart } from 'lucide-react';

export function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-white shadow relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    
                    <div className="flex items-center flex-shrink-0">
                        <Link 
                            href="/" 
                            className="text-xl font-bold flex whitespace-nowrap text-black hover:opacity-80 transition-opacity"
                        >
                            <img src="/images/handcrafted-remove-bg-logo.png" alt="Handcrafted Haven Logo" className="h-8 w-auto mr-2" />
                            Handcrafted Haven
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4 h-full">
                        <NavLinks />
                        <div className="flex items-center gap-6 border-l border-gray-200 pl-6 h-6">
                            <Link 
                                href="/login" 
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
                                <User className="w-8 h-8" /> 
                                <span>Iniciar Sesión</span>
                            </Link>
                            
                            <Link 
                                href="/cart" 
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
                                <ShoppingCart className="w-5 h-5" />
                                <span>Carrito</span>
                            </Link>
                        </div>
                    </div>

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

            {/* Menú Desplegable para Móviles */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute top-16 left-0 w-full px-4 py-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <NavLinks />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                        <Link 
                            href="/login" 
                            className="text-sm font-medium text-gray-500 hover:text-black px-2 py-2 rounded-md hover:bg-gray-50"
                            onClick={() => setIsOpen(false)} 
                        >
                            <User className="w-5 h-5" />Iniciar Sesión
                        </Link>
                        <Link 
                            href="/cart" 
                            className="text-sm font-medium text-gray-500 hover:text-black px-2 py-2 rounded-md hover:bg-gray-50"
                            onClick={() => setIsOpen(false)} 
                        >
                            <ShoppingCart className="w-5 h-5" />Carrito
                
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}