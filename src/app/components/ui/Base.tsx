import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  children, 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-full select-none cursor-pointer active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-button-hover)] shadow-sm hover:shadow-md",
    secondary: "bg-[var(--color-peacock-blue)] text-white hover:opacity-90 shadow-sm",
    outline: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white bg-transparent",
    ghost: "text-[var(--color-deep-indigo)] hover:bg-black/5 hover:text-black",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "w-auto",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export function Card({ className, children, hoverEffect = true }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-[var(--radius-card)] overflow-hidden border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        hoverEffect && "transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}
