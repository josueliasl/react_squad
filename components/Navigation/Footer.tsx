import Link from 'next/link';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 text-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-100">

                    <div className="flex flex-col gap-1">
                        <Link href="/" className="text-base font-bold text-black whitespace-nowrap">
                            Handcrafted Haven
                        </Link>
                        <p className="text-gray-500 leading-normal max-w-xs text-xs">
                            Descubre piezas únicas hechas a mano por artesanos locales de todo el mundo.
                        </p>
                    </div>

                    <div className="flex flex-col gap-1 md:text-right md:items-end">
                        <h3 className="font-semibold text-black text-xs">Contacto</h3>
                        <p className="text-gray-500 text-xs">¿Tienes dudas o deseas vender con nosotros?</p>
                        <a href="mailto:soporte@handcraftedhaven.com" className="text-black font-medium hover:underline text-xs">
                            soporte@handcraftedhaven.com
                        </a>
                    </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
                    <p>&copy; {currentYear} Handcrafted Haven. Todos los derechos reservados.</p>
                </div>

            </div>
        </footer>
    );
}