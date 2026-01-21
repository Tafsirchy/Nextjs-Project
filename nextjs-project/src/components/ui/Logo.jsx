"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Logo({ className = "h-8 w-auto", showText = true }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* Premium Logo Mark */}
      <div className="relative w-15 h-15 flex items-center justify-center">
        <img 
          src="/images/logo-premium.png" 
          alt="MotruBi Logo" 
          className="w-full h-full object-contain mix-blend-multiply"
        />
        {/* Subtle Glow Overlay for high-tech feel */}
        <motion.div 
          className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {showText && (
        <span className="text-2xl font-syncopate font-bold tracking-tighter bg-gradient-to-r from-blue-900 via-purple-700 to-purple-900 bg-clip-text text-transparent">
          MotruBi
        </span>
      )}
    </div>
  );
}
