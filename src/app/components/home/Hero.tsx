import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { Button } from '../ui/Base';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const HERO_IMAGE = "https://images.unsplash.com/photo-1758172948668-52fbabc52a7c?q=80&w=2070&auto=format&fit=crop";

export function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={HERO_IMAGE}
          alt="Museum Interior"
          className="w-full h-full object-cover transition-transform duration-[20s] ease-in-out scale-105 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 drop-shadow-lg tracking-tight">
            India’s Heritage.<br />
            <span className="text-[var(--color-saffron-primary)]">America’s Home.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-xl lg:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md"
        >
          Experience the vibrant culture, art, and history of India right here in Rhode Island.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button size="lg" className="w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-[var(--color-saffron-primary)] border-none text-white font-semibold tracking-wide">
            Plan Your Visit
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[var(--color-deep-indigo)] font-semibold tracking-wide backdrop-blur-sm">
            Explore Exhibitions
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 1, duration: 1 },
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/80"
      >
        <span className="sr-only">Scroll down</span>
        <ArrowDown className="w-8 h-8 drop-shadow-md" />
      </motion.div>
    </section>
  );
}
