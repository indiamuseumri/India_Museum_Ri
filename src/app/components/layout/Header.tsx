import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Calendar, MapPin, Heart } from 'lucide-react';
import { Button } from '../ui/Base';
import logoImg from 'figma:asset/87d7f23c07d2f2eaccc8ae72f4a0d95b44504454.png';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Visit', href: '#visit' },
    { name: 'Exhibitions', href: '#cultural-grid' },
    { name: 'Events', href: '#events' },
    { name: 'About', href: '#leadership' },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' 
            : 'bg-transparent py-5'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-full">
              <img 
                src={logoImg} 
                alt="India Museum and Heritage Society of Rhode Island" 
                className={`transition-all duration-300 ${
                  isScrolled ? 'h-10 md:h-12' : 'h-12 md:h-16'
                }`}
              />
            </div>
            <div className={`flex flex-col ${isScrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'} transition-opacity duration-300`}>
                <span className={`font-serif font-bold leading-tight ${isScrolled ? 'text-gray-900 text-sm md:text-base' : 'text-white md:text-gray-900 text-sm md:text-lg shadow-black/50 md:shadow-none drop-shadow-md md:drop-shadow-none'}`}>
                  India Museum
                </span>
                <span className={`text-[10px] md:text-xs tracking-wider uppercase ${isScrolled ? 'text-gray-600' : 'text-gray-100 md:text-gray-600 drop-shadow-md md:drop-shadow-none'}`}>
                  Heritage Society of RI
                </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  isScrolled ? 'text-gray-800 hover:text-[var(--color-primary)]' : 'text-white hover:text-white/80 shadow-black/50 drop-shadow-md'
                }`}
              >
                {link.name}
              </a>
            ))}
            <Button 
              size="sm" 
              className={`${isScrolled ? '' : 'bg-white text-[var(--color-primary)] hover:bg-gray-100 shadow-lg'}`}
            >
              Donate
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-current focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white drop-shadow-md'}`} />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white h-screen flex flex-col"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <span className="font-serif font-bold text-lg text-[var(--color-deep-indigo)]">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900"
                aria-label="Close Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-serif font-medium text-gray-900 hover:text-[var(--color-primary)]"
                >
                  {link.name}
                </a>
              ))}
              
              <div className="mt-8 border-t border-gray-100 pt-8 flex flex-col gap-4">
                <Button size="lg" fullWidth onClick={() => setIsMobileMenuOpen(false)}>
                  <Heart className="w-4 h-4 mr-2" /> Donate
                </Button>
                <Button variant="outline" size="lg" fullWidth onClick={() => setIsMobileMenuOpen(false)}>
                  <Calendar className="w-4 h-4 mr-2" /> Plan Your Visit
                </Button>
              </div>

              <div className="mt-auto text-sm text-gray-500">
                <p>123 Heritage Way</p>
                <p>Providence, RI 02903</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
