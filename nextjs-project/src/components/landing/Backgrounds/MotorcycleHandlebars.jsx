"use client";

import { motion } from "framer-motion";

export default function MotorcycleHandlebars({ className = "" }) {
  return (
    <div className={`relative w-full max-w-5xl mx-auto pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 800 600" className="w-full h-full fill-none">
        <defs>
          <filter id="hyper-glow-hb" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="chrome-grad-v2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <radialGradient id="optic-iris-v2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="70%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Triple Clamps & Fork Nuts (Top View Depth) */}
        <g transform="translate(400, 450)" stroke="url(#chrome-grad-v2)" strokeWidth="2">
           <path d="M -120 0 L 120 0 L 140 40 L -140 40 Z" fill="var(--primary)" fillOpacity="0.05" />
           {/* Fork Adjuster Nuts */}
           <g transform="translate(-100, 10)">
              <rect x="-15" y="-15" width="30" height="30" rx="2" />
              <circle r="8" stroke="#fbbf24" strokeWidth="1" />
           </g>
           <g transform="translate(100, 10)">
              <rect x="-15" y="-15" width="30" height="30" rx="2" />
              <circle r="8" stroke="#fbbf24" strokeWidth="1" />
           </g>
        </g>

        {/* Headlight: Full Optics Assembly */}
        <g transform="translate(400, 420)">
           <circle r="85" stroke="var(--primary)" strokeWidth="5" opacity="0.3" />
           <motion.circle 
             r="90" stroke="#f026d3" strokeWidth="1" strokeDasharray="5 15" 
             animate={{ rotate: -360 }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           />
           
           <g filter="url(#hyper-glow-hb)">
              <circle r="75" stroke="var(--primary)" strokeWidth="3" />
              <circle r="65" fill="url(#optic-iris-v2)" stroke="var(--primary)" strokeWidth="0.5" />
              
              {/* Internal LED Projectors */}
              <circle cx="0" cy="0" r="15" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="0.5" />
              <rect x="-30" y="-2" width="60" height="4" fill="#22d3ee" opacity="0.4" />
              
              <motion.circle 
                r="10" fill="white" 
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
           </g>
        </g>

        {/* Main Handlebar Structure: The Apes */}
        <g stroke="url(#chrome-grad-v2)" strokeWidth="20" strokeLinecap="round">
           {/* Left Upright */}
           <path d="M 300 450 Q 300 300, 200 280 T 50 350" fill="none" />
           {/* Right Upright */}
           <path d="M 500 450 Q 500 300, 600 280 T 750 350" fill="none" />
        </g>

        {/* Wiring Harness (Intricate Detail) */}
        <g strokeWidth="1.5">
           {[...Array(3)].map((_, i) => (
             <motion.path 
               key={`wire-l-${i}`}
               d={`M 310 ${440 + i * 5} Q 310 310, 210 290 T 70 340`}
               stroke={i === 0 ? "#22d3ee" : i === 1 ? "#f026d3" : "#fbbf24"}
               strokeDasharray="10 20"
               animate={{ strokeDashoffset: [0, -60] }}
               transition={{ duration: 2 + i, repeat: Infinity, ease: "linear" }}
             />
           ))}
           {[...Array(3)].map((_, i) => (
             <motion.path 
               key={`wire-r-${i}`}
               d={`M 490 ${440 + i * 5} Q 490 310, 590 290 T 730 340`}
               stroke={i === 0 ? "#22d3ee" : i === 1 ? "#f026d3" : "#fbbf24"}
               strokeDasharray="10 20"
               animate={{ strokeDashoffset: [0, -60] }}
               transition={{ duration: 2 + i, repeat: Infinity, ease: "linear" }}
             />
           ))}
        </g>

        {/* Digital Command Cluster */}
        <g transform="translate(400, 320)">
           {/* Center Touch Display */}
           <rect x="-60" y="-40" width="120" height="60" rx="10" fill="#0f172a" stroke="var(--primary)" strokeWidth="2" />
           <motion.g
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
           >
              <text 
                x="0" y="-10" 
                textAnchor="middle" 
                fill="#22d3ee" 
                fontFamily="monospace" 
                fontSize="12"
              >
                PROT_ACTIVE
              </text>
           </motion.g>
           <text x="0" y="5" textAnchor="middle" fill="white" fontFamily="monospace" fontSize="8" opacity="0.6">SYNC: 100%</text>

           {/* Precision Gauges (Side Spheres) */}
           <g transform="translate(-100, -30)">
              <circle r="40" stroke="url(#chrome-grad-v2)" strokeWidth="2" fill="var(--primary)" fillOpacity="0.05" />
              <motion.circle r="35" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 10" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
              <text x="0" y="5" textAnchor="middle" fill="#22d3ee" fontFamily="monospace" fontSize="10">84.2</text>
              <text x="0" y="15" textAnchor="middle" fill="#22d3ee" fontFamily="monospace" fontSize="6" opacity="0.5">PSI</text>
           </g>

           <g transform="translate(100, -30)">
              <circle r="40" stroke="url(#chrome-grad-v2)" strokeWidth="2" fill="var(--primary)" fillOpacity="0.05" />
              <motion.circle r="35" stroke="#f026d3" strokeWidth="1" strokeDasharray="2 10" animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
              <text x="0" y="5" textAnchor="middle" fill="#f026d3" fontFamily="monospace" fontSize="10">185</text>
              <text x="0" y="15" textAnchor="middle" fill="#f026d3" fontFamily="monospace" fontSize="6" opacity="0.5">KM/H</text>
           </g>
        </g>

        {/* Grips, Levers & Switchgear */}
        <g>
           {/* Left Grip Module */}
           <g transform="translate(50, 350) rotate(35)">
              <rect x="-10" y="-25" width="70" height="50" rx="10" fill="#1e293b" />
              {[...Array(8)].map((_, i) => (
                 <rect key={i} x={0 + i * 8} y="-25" width="2" height="50" fill="white" opacity="0.05" />
              ))}
              {/* Levers */}
              <motion.path d="M 60 10 Q 120 10, 120 40" stroke="url(#chrome-grad-v2)" strokeWidth="8" strokeLinecap="round" animate={{ rotate: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity }} />
           </g>

           {/* Right Grip Module */}
           <g transform="translate(750, 350) rotate(-35)">
              <rect x="-60" y="-25" width="70" height="50" rx="10" fill="#1e293b" />
              <motion.path d="M -60 10 Q -120 10, -120 40" stroke="url(#chrome-grad-v2)" strokeWidth="8" strokeLinecap="round" animate={{ rotate: [0, 4, 0] }} transition={{ duration: 4, repeat: Infinity }} />
           </g>
        </g>

        {/* Chrome Glints (Sparkle Details) */}
        {[
           { x: 300, y: 300, d: 0 },
           { x: 500, y: 280, d: 1 },
           { x: 150, y: 280, d: 2 },
           { x: 650, y: 280, d: 3 },
           { x: 400, y: 340, d: 4 },
        ].map((g, i) => (
           <motion.g 
             key={`glint-${i}`} 
             transform={`translate(${g.x}, ${g.y})`}
             animate={{ 
               scale: [0, 1, 0],
               rotate: [0, 90, 180],
               opacity: [0, 1, 0]
             }}
             transition={{ duration: 2, delay: g.d, repeat: Infinity }}
           >
              <path d="M -5 0 L 5 0 M 0 -5 L 0 5" stroke="white" strokeWidth="0.5" />
           </motion.g>
        ))}

        {/* Panoramic Mirrors with Digital Overlays */}
        <g transform="translate(50, 150)" filter="url(#hyper-glow-hb)">
           <line x1="20" y1="180" x2="0" y2="0" stroke="url(#chrome-grad-v2)" strokeWidth="6" />
           <rect x="-60" y="-35" width="120" height="70" rx="25" fill="var(--primary)" fillOpacity="0.05" stroke="url(#chrome-grad-v2)" strokeWidth="2" />
           {/* Digital Mirror UI */}
           <motion.path 
             d="M -40 0 L 40 0" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 5"
             animate={{ opacity: [0.2, 0.5, 0.2] }}
             transition={{ duration: 3, repeat: Infinity }}
           />
        </g>

        <g transform="translate(750, 150)" filter="url(#hyper-glow-hb)">
           <line x1="-20" y1="180" x2="0" y2="0" stroke="url(#chrome-grad-v2)" strokeWidth="6" />
           <rect x="-60" y="-35" width="120" height="70" rx="25" fill="var(--primary)" fillOpacity="0.05" stroke="url(#chrome-grad-v2)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
