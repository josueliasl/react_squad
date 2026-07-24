'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Asumiendo que tu array de links es algo así:
const links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/sellers', label: 'Sellers' },
];

export function NavLinks() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center justify-center gap-6 h-full w-full">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={clsx(
                            
                            "flex items-center justify-center text-sm font-medium h-10 px-2 transition-all duration-200 active:text-gray-400 select-none", 
                            {
                                "text-black border-b-2 border-black": isActive,
                                "text-gray-500 hover:text-black": !isActive,
                            }
                        )}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}