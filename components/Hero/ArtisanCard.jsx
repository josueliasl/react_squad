// ArtisanCard.jsx for Next.js
import React from 'react';
import Image from 'next/image';
const ArtisanCard = ({ name, title, rating, reviews, img, className = "" }) => {
    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-600"}>
                {i < Math.floor(rating) ? "★" : "☆"}
            </span>
        ));
    };

    return (
        <div className={`flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl max-w-sm w-full transition-transform hover:scale-[1.02] ${className}`}>

            {}
            <div className="relative w-14 h-14 flex-shrink-0">
                <Image
                    src={img}
                    alt={name}
                    fill 
                    className="rounded-full object-cover border-2 border-white/20"
                />
            </div>

            <div className="flex flex-col">
                <h4 className="font-bold text-white text-sm">{name}</h4>
                <p className="text-gray-300 text-[10px] uppercase tracking-wide">{title}</p>
                <div className="flex items-center gap-1 mt-0.5 text-xs">
                    <div className="flex">{renderStars(rating)}</div>
                    <span className="text-gray-400 text-[10px]">({reviews})</span>
                </div>
            </div>
        </div>
    );
};

export default ArtisanCard;