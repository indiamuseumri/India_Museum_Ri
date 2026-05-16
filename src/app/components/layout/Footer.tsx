import React from 'react';
import logoImg from 'figma:asset/87d7f23c07d2f2eaccc8ae72f4a0d95b44504454.png';
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[var(--color-deep-indigo)] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <img 
            src={logoImg} 
            alt="India Museum and Heritage Society of Rhode Island" 
            className="h-16 md:h-20 mb-4 brightness-0 invert opacity-90"
          />
          <h2 className="font-serif text-xl md:text-2xl font-bold tracking-wide">
            India Museum and Heritage Society
          </h2>
          <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-400 mt-1 block">
            of Rhode Island
          </span>
        </div>

        {/* Tagline */}
        <p className="font-serif italic text-[var(--color-gold-divider)] text-lg md:text-xl mb-10 max-w-md mx-auto">
          “India’s Heritage. America’s Home.”
        </p>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#visit" className="hover:text-white transition-colors">Visit</a>
          <a href="#events" className="hover:text-white transition-colors">Events</a>
          <a href="#leadership" className="hover:text-white transition-colors">About Us</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </nav>

        {/* Social Icons */}
        <div className="flex gap-6 mb-12">
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-saffron-primary)] transition-colors duration-300">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-rani-accent)] transition-colors duration-300">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-peacock-blue)] transition-colors duration-300">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-emerald-accent)] transition-colors duration-300">
            <Mail className="w-5 h-5" />
          </a>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 mb-8 max-w-2xl" />

        {/* Copyright */}
        <div className="text-xs text-gray-500 flex flex-col md:flex-row gap-4">
          <p>© {new Date().getFullYear()} India Museum and Heritage Society of Rhode Island. All rights reserved.</p>
          <div className="hidden md:block">|</div>
          <div className="flex gap-4 justify-center">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
