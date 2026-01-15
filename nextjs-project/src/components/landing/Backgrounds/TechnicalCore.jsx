"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function TechnicalCore({ 
  className = "", 
  color = "primary", 
  opacity = 0.05, 
  size = "800px",
  rotateSpeed = 15,
  withMatrix = true
}) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative pointer-events-none select-none ${className}`} style={{ width: size, height: size }}>
      {/* Outer Glow / Pulse Environment */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 bg-${color}/10 rounded-full blur-[60px] opacity-20`}
      />

      {/* Schematic Core */}
      <svg viewBox="0 0 200 200" className={`w-full h-full text-${color}`}>
         <g opacity={opacity}>
            <motion.circle 
              cx="100" cy="100" r="90" 
              fill="none" stroke="currentColor" strokeWidth="0.2" 
              strokeDasharray="2 4" 
              animate={{ rotate: 360 }}
              transition={{ duration: rotateSpeed * 4, repeat: Infinity, ease: "linear" }}
            />
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" />
            
            {/* The Main Rotating Ring */}
            <motion.circle 
              cx="100" cy="100" r="60" 
              fill="none" stroke="currentColor" strokeWidth="1" 
              animate={{ strokeDashoffset: [0, 200], rotate: -360 }}
              transition={{ 
                strokeDashoffset: { duration: rotateSpeed, repeat: Infinity, ease: "linear" },
                rotate: { duration: rotateSpeed * 3, repeat: Infinity, ease: "linear" }
              }}
              strokeDasharray="10 10" 
            />
            
            {/* Static Grid Lines */}
            <path d="M 100 20 L 100 180 M 20 100 L 180 100" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            
            {/* Pulsing Crosshairs */}
            <motion.path 
              d="M 60 60 L 140 140 M 140 60 L 60 140" 
              stroke="currentColor" strokeWidth="0.5" 
              animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ transformOrigin: 'center' }}
            />
            
            {/* Inner Fast Ring */}
            <motion.circle 
              cx="100" cy="100" r="30" 
              fill="none" stroke="currentColor" strokeWidth="2" 
              strokeDasharray="1 15"
              animate={{ rotate: 360 }}
              transition={{ duration: rotateSpeed / 5, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Center Core Dot */}
            <motion.circle 
              cx="100" cy="100" r="3" 
              fill="currentColor"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
         </g>
      </svg>

      {/* Technical Data Stream Overlay */}
      {withMatrix && isMounted && (
        <div className="absolute inset-0 opacity-[0.2]">
           {[...Array(8)].map((_, i) => (
             <motion.div 
               key={`matrix-node-${i}`}
               initial={{ opacity: 0 }}
               animate={{ 
                 opacity: [0.1, 0.4, 0.1],
                 y: [0, -10, 0]
               }}
               transition={{ 
                 duration: 4 + i, 
                 repeat: Infinity, 
                 delay: i * 0.5 
               }}
               className="absolute font-mono text-[8px] text-zinc-400 whitespace-nowrap"
               style={{ 
                 left: `${50 + (Math.cos(i * 45 * Math.PI / 180) * 45)}%`, 
                 top: `${50 + (Math.sin(i * 45 * Math.PI / 180) * 45)}%`,
                 transform: 'translate(-50%, -50%)',
               }}
             >
               0x{(1024 + i * 512).toString(16).toUpperCase()} {/* _CORE_S0{i} */}
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
}
