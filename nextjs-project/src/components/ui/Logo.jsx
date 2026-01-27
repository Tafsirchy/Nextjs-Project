"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Logo({ className = "h-8 w-auto" }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* Premium Logo Mark - Sized to fit navbar height */}
      <div className="relative w-24 h-24 flex items-center justify-center -ml-2">
        <img 
          src="/images/logo-premium.png" 
          alt="MotruBi Logo" 
          className="w-full h-full object-contain mix-blend-multiply"
        />
        {/* Subtle Glow Overlay for high-tech feel */}
        <motion.div 
          className="absolute inset-0 bg-cyan-400/10 rounded-full blur-xl"
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
