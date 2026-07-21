// HeroSection.jsx for Next.js
import React from 'react';
import Image from 'next/image';
import ArtisanCard from './ArtisanCard';
import StatItem from './StatItem';

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-[800px] overflow-hidden bg-[#1a1512] text-white flex items-center">
      
      {}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/alpaca_scarf_main.png" 
          alt="Pottery background" 
          fill 
          className="object-cover opacity-60 mix-blend-multiply brightness-75"
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1512]/80 via-[#1a1512]/40 to-transparent"></div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 flex flex-col gap-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#4a4c2c]/70 backdrop-blur-sm text-[#d4d4a8] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-[#5a5c3c]/50 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4d4a8]"></span>
            Supporting 2,400+ Local Artisans
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight">
            Made by Hand,<br />
            <span className="text-[#d46a41] italic">Loved</span> Forever
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed max-w-lg mt-2">
            Discover one-of-a-kind goods crafted by passionate makers from your community. Every purchase tells a story and sustains a craft.
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <button className="bg-[#c95f3b] hover:bg-[#b54e2b] text-white font-semibold px-8 py-3.5 rounded-full transition-colors flex items-center gap-2">
              Shop Artisan Goods
              <span className="text-xl">→</span>
            </button>
            <button className="border border-white/30 hover:border-white/80 hover:bg-white/10 text-white font-medium px-8 py-3.5 rounded-full transition-all backdrop-blur-sm">
              Meet the Makers
            </button>
          </div>

          <div className="flex gap-10 mt-10 pt-6 border-t border-white/10">
            <StatItem number="2,400+" label="Artisans" />
            <StatItem number="48,000+" label="Products" />
            <StatItem number="4.9★" label="Avg. Rating" />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 flex flex-col gap-5 lg:items-end lg:pl-10 mt-10 lg:mt-0">
          {/* Pass the strings as src, not imported variables */}
          <ArtisanCard 
            name="Sofia Chen" 
            title="Ceramic Artist · Portland, OR" 
            rating={5} 
            reviews={312}
            img="/images/coffee_mug_main.png" 
            className="lg:translate-x-8"
          />
          <ArtisanCard 
            name="Marcus Webb" 
            title="Woodworker · Asheville, NC" 
            rating={4.5} 
            reviews={189}
            img="/images/crescent_moon_main.png"
          />
          <ArtisanCard 
            name="Elena Vasquez" 
            title="Textile Weaver · Santa Fe, NM" 
            rating={4} 
            reviews={247}
            img="/images/peony_plate_main.png"
            className="lg:-translate-x-8"
          />
        </div>

      </div>
    </div>
  );
};

export default HeroSection;