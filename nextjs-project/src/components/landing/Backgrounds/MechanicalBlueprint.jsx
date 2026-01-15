"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function MechanicalBlueprint({ 
  className = "", 
  opacity = 1,
}) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return null;

  return (
    <div className={`relative w-full h-full pointer-events-none select-none ${className}`} style={{ opacity, willChange: "transform" }}>
      <svg viewBox="0 0 1000 1000" className="w-full h-full fill-none">
        <defs>
          <filter id="hyper-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <radialGradient id="combustion-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="heat-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Engine Housing / Frame */}
        <g stroke="var(--primary)" strokeWidth="1" opacity="0.3">
           <path d="M 50 200 L 950 200 L 980 300 L 980 700 L 20 700 L 20 300 Z" strokeWidth="3" fill="var(--primary)" fillOpacity="0.02" />
           <rect x="100" y="250" width="800" height="400" rx="20" strokeDasharray="10 10" />
        </g>

        {/* ASSEMBLY 1: Dual Overhead Camshafts (DOHC) - Top Bar */}
        <g transform="translate(100, 180)">
           {/* Timing Belt (Moving Dash) */}
           <motion.rect 
             x="0" y="-30" width="800" height="60" rx="30" 
             stroke="#a855f7" strokeWidth="2" strokeDasharray="20 40"
             animate={{ strokeDashoffset: [0, -60] }}
             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           />
           
           {/* Cam Pulleys */}
           {[50, 750].map((x) => (
             <motion.g key={`pulley-${x}`} transform={`translate(${x}, 0)`} animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <circle r="45" stroke="#a855f7" strokeWidth="2" />
                <circle r="15" fill="#a855f7" fillOpacity="0.2" />
                {[...Array(6)].map((_, i) => (
                   <line key={i} y1="-45" y2="-30" stroke="#a855f7" strokeWidth="4" transform={`rotate(${i * 60})`} />
                ))}
             </motion.g>
           ))}
        </g>

        {/* ASSEMBLY 2: The 16-Valve System */}
        {[0, 1, 2, 3].map((cylinder) => (
           <g key={`valves-${cylinder}`} transform={`translate(${200 + cylinder * 200}, 240)`}>
              {[20, 50, 80, 110].map((v, i) => (
                 <motion.g key={`v-${i}`} transform={`translate(${v - 65}, 0)`}>
                    {/* Valve Stem */}
                    <rect x="0" y="0" width="4" height="40" fill="#22d3ee" opacity="0.4" />
                    {/* Valve Spring (Bouncing) */}
                    <motion.path 
                       d="M -5 5 Q 5 10, -5 15 T -5 25 T -5 35" 
                       stroke="#22d3ee" strokeWidth="1"
                       animate={{ d: [`M -5 5 Q 5 10, -5 15 T -5 25 T -5 35`, `M -5 10 Q 5 15, -5 20 T -5 25 T -5 30`] }}
                       transition={{ duration: 0.5, delay: cylinder * 0.1 + i * 0.05, repeat: Infinity }}
                    />
                 </motion.g>
              ))}
           </g>
        ))}

        {/* ASSEMBLY 3: Main Pistons & Spark Ignition */}
        {[0, 1, 2, 3].map((cylinder) => (
           <g key={`piston-${cylinder}`} transform={`translate(${150 + cylinder * 200}, 300)`}>
              {/* Cylinder Liner */}
              <rect x="0" y="0" width="100" height="350" stroke="var(--primary)" strokeWidth="1" opacity="0.15" />
              
              <motion.g
                animate={{ y: [0, 200, 0] }}
                transition={{ duration: 1.5, delay: cylinder * 0.2, repeat: Infinity, ease: "easeInOut" }}
              >
                 {/* Piston Head (Complex Layering) */}
                 <g filter="url(#hyper-glow)">
                    <rect x="5" y="0" width="90" height="80" rx="5" fill="var(--primary)" fillOpacity="0.1" stroke="var(--primary)" strokeWidth="2" />
                    <rect x="15" y="10" width="70" height="5" fill="#f026d3" />
                    <rect x="15" y="20" width="70" height="5" fill="#f026d3" />
                 </g>
                 
                 {/* Connecting Rod (Multiple Segments) */}
                 <line x1="50" y1="80" x2="50" y2="280" stroke="#22d3ee" strokeWidth="6" opacity="0.3" />
                 <line x1="50" y1="80" x2="50" y2="150" stroke="#22d3ee" strokeWidth="10" />

                 {/* COMBUSTION SPARK EFFECT (At Top Stroke) */}
                 <motion.circle 
                    cx="50" cy="-20" r="30" 
                    fill="url(#combustion-glow)"
                    animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.2, repeat: Infinity, delay: 1.35 + cylinder * 0.2 }}
                 />
              </motion.g>
           </g>
        ))}

        {/* ASSEMBLY 4: Crankshaft & Bearings (Bottom) */}
        <g transform="translate(50, 650)">
           <line x1="0" y1="0" x2="900" y2="0" stroke="var(--primary)" strokeWidth="20" opacity="0.1" />
           {[200, 400, 600, 800].map((x, i) => (
              <motion.g key={`crank-${i}`} transform={`translate(${x}, 0)`}>
                 <motion.g
                   animate={{ rotate: 360 }}
                   transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 >
                    <circle r="40" stroke="#f026d3" strokeWidth="4" filter="url(#hyper-glow)" />
                    <rect x="-5" y="-40" width="10" height="80" fill="#f026d3" fillOpacity="0.5" />
                 </motion.g>
              </motion.g>
           ))}
        </g>

        {/* ASSEMBLY 5: Thermal Exhaust Manifold (Right Side) */}
        <g transform="translate(900, 300)" filter="url(#hyper-glow)">
           {[0, 1, 2, 3].map((i) => (
              <motion.path 
                key={`exhaust-${i}`}
                d={`M -50 ${i * 100} Q -20 ${i * 100}, 20 200`} 
                stroke="url(#heat-grad)" strokeWidth="10" strokeLinecap="round"
                animate={{ strokeDashoffset: [400, 0], opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                strokeDasharray="400"
              />
           ))}
        </g>

        {/* ASSEMBLY 6: Holographic Telemetry UI */}
        <g transform="translate(100, 100)" filter="url(#hyper-glow)">
           {/* Circular Gauge */}
           <motion.g animate={{ rotate: [0, 270, 0] }} transition={{ duration: 5, repeat: Infinity }}>
              <circle r="60" stroke="#22d3ee" strokeWidth="2" strokeDasharray="10 20" opacity="0.5" />
              <path d="M 0 -60 L 0 -40" stroke="#22d3ee" strokeWidth="4" />
           </motion.g>
           
           {/* Telemetry Text */}
           <g fontFamily="monospace" fontSize="12" fill="#22d3ee">
             <text x="80" y="-10">RPM: 8,421</text>
             <text x="80" y="10">TEMP: 92.5 °C</text>
             <text x="80" y="30" fill="#f59e0b" opacity="0.8">LOAD_FACTOR: 0.94</text>
           </g>
           
           {/* Oscilloscope Wave */}
           <motion.path 
             d="M 80 50 L 250 50" 
             stroke="#22d3ee" strokeWidth="1" opacity="0.3"
           />
           <motion.path 
             d="M 80 50 L 100 30 L 120 70 L 140 30 L 160 70 L 180 30 L 200 70 L 220 30 L 240 70" 
             stroke="#22d3ee" strokeWidth="2"
             animate={{ x: [-20, 0] }}
             transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
             clipPath="inset(0 0 0 0)"
           />
        </g>

        {/* Floating Code Fragments */}
        {[...Array(12)].map((_, i) => (
           <motion.g 
              key={`shard-${i}`}
              initial={{ opacity: 0 }}
              animate={{ 
                y: [0, -20],
                opacity: [0, 0.3, 0]
              }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
           >
              <text 
                x={100 + (i * 77) % 800}
                y={250 + (i * 111) % 400}
                fontFamily="monospace"
                fontSize="8"
                fill="#a855f7"
                opacity="1"
              >
                0x{((i+1)*4096).toString(16).toUpperCase()} {/* _PROC_ST */}
              </text>
           </motion.g>
        ))}
      </svg>
    </div>
  );
}
