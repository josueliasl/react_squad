import React from 'react';
import Image from 'next/image';

const ProductCard = ({ name, price, title, img, className = "" }) => {
    return (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl w-full max-w-full sm:max-w-sm md:max-w-md transition-transform hover:scale-[1.02] ${className}`}>

            {/* Image Container */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                <Image
                    src={img}
                    alt={name}
                    fill 
                    sizes="(max-width: 640px) 56px, 64px"
                    className="object-cover border-2 border-white/20"
                />
            </div>

            {/* Text Container */}
            <div className="flex flex-col overflow-hidden">
                <h4 className="font-bold text-white text-sm sm:text-base truncate">{name}</h4>
                <p className="text-gray-300 text-[11px] sm:text-xs truncate">{title}</p>
                <p className="text-gray-300 text-[10px] sm:text-[11px] uppercase tracking-wide font-bold">{price}</p>
            </div>
        </div>
    );
};

export default ProductCard;
