"use client";

import { motion, useInView } from "framer-motion";
import TechnicalCore from "./Backgrounds/TechnicalCore";
import { useRef, useEffect, useState, useMemo } from "react";

const stats = [
  {
    value: 15000,
    suffix: "+",
    label: "Bikes Sold",
    description: "Satisfied customers worldwide",
    color: "text-fuchsia-600",
    glow: "group-hover:shadow-[0_30px_70px_-15px_rgba(192,38,211,0.25)]",
    border: "group-hover:border-fuchsia-600/30",
    tag: "bg-fuchsia-50 group-hover:bg-fuchsia-600"
  },
  {
    value: 98,
    suffix: "%",
    label: "Satisfaction",
    description: "Exceptional rider feedback",
    color: "text-cyan-600",
    glow: "group-hover:shadow-[0_30px_70px_-15px_rgba(8,145,178,0.25)]",
    border: "group-hover:border-cyan-600/30",
    tag: "bg-cyan-50 group-hover:bg-cyan-600"
  },
  {
    value: 50,
    suffix: "+",
    label: "Bike Models",
    description: "Diverse range of machines",
    color: "text-purple-600",
    glow: "group-hover:shadow-[0_30px_70px_-15px_rgba(147,51,234,0.25)]",
    border: "group-hover:border-purple-600/30",
    tag: "bg-purple-50 group-hover:bg-purple-600"
  },
  {
    value: 24,
    suffix: "/7",
    label: "Global Support",
    description: "Always here for the ride",
    color: "text-blue-600",
    glow: "group-hover:shadow-[0_30px_70px_-15px_rgba(37,99,235,0.25)]",
    border: "group-hover:border-blue-600/30",
    tag: "bg-blue-50 group-hover:bg-blue-600"
  }
];

function CountUp({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Statistics() {
  const [isMounted, setIsMounted] = useState(false);
  const [particles, setParticles] = useState([]);
  const [dataStreams, setDataStreams] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      
      // Stable random generation for particles
      const generatedParticles = [...Array(20)].map((_, i) => ({
        id: i,
        left: `${(i * 5) + Math.random() * 2}%`,
        duration: Math.random() * 8 + 4,
        delay: Math.random() * 5,
        randomX: Math.random() * 20 - 10,
        opacity: 0.1 + Math.random() * 0.4
      }));
      setParticles(generatedParticles);

      // Stable random generation for data cascades
      const generatedStreams = [...Array(15)].map((_, i) => ({
        id: i,
        margin: Math.random() * 100,
        duration: 15 + Math.random() * 10,
        delay: Math.random() * 5
      }));
      setDataStreams(generatedStreams);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-white via-zinc-50 to-white relative overflow-hidden">
      {/* Drifting Color Blobs - Spectral Nebula */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.5, 1],
            rotate: [0, 360]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [100, -100, 100],
            y: [50, -50, 50],
            scale: [1.5, 1, 1.5],
            rotate: [360, 0]
          }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[10%] w-[70%] h-[70%] bg-fuchsia-500/10 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-400/10 rounded-full blur-[180px]"
          style={{ willChange: "transform, opacity" }}
        />

        {/* Unifying Technical Core SVG */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]">
          <TechnicalCore size="1000px" rotateSpeed={40} withMatrix={true} />
        </div>
      </div>
      {/* Background Technical Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
        <svg width="100%" height="100%">
          <pattern id="grid-light-stats" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-light-stats)" />
        </svg>
      </div>

      {/* Background Elements - Spinning Universe & Signal Rings */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Pulsing Signal Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`ring-${i}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 2], opacity: [0, 0.1, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: i * 2, ease: "easeOut" }}
              className="absolute w-[40vw] h-[40vw] border-[1px] border-primary/30 rounded-full"
              style={{ willChange: "transform, opacity" }}
            />
          ))}
        </div>

        {/* Data Orbitals - 3D Depth Effect */}
        <div className="absolute inset-0 z-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`orbital-${i}`}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1px] border-dashed border-primary/5"
              style={{
                width: `${50 + i * 15}vw`,
                height: `${50 + i * 15}vw`,
                opacity: 0.1 + (i * 0.05)
              }}
            />
          ))}
        </div>

        {/* Data Cascades - Spectral Stream Effect */}
        <div className="absolute inset-0 flex justify-around opacity-30">
          {isMounted && dataStreams.map((stream) => (
            <motion.div
              key={`stream-${stream.id}`}
              animate={{ 
                y: ["-100%", "1000%"],
                filter: ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"]
              }}
              transition={{ 
                y: { duration: stream.duration, repeat: Infinity, ease: "linear", delay: stream.delay },
                filter: { duration: 10, repeat: Infinity, ease: "linear" }
              }}
              className="w-[1.5px] h-32 bg-gradient-to-b from-transparent via-primary/60 to-transparent shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"
              style={{ marginLeft: `${stream.margin}%` }}
            />
          ))}
        </div>

        {/* Animated Particles Container */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-50%] z-0"
        >
          {isMounted && particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: "110%", opacity: 0 }}
              animate={{ 
                y: "-10%", 
                opacity: [0, p.opacity, 0],
                x: [0, p.randomX, 0]
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "linear",
              }}
              className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
              style={{ 
                left: p.left,
                boxShadow: `0 0 10px rgba(var(--primary-rgb), ${p.opacity})`
              }}
            />
          ))}
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative group lg:h-[220px]"
            >
              {/* Card Container */}
              <motion.div 
                whileHover={{ y: -15, scale: 1.05 }}
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 0.5, -0.5, 0]
                }}
                transition={{
                  y: { duration: 4 + index, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 6 + index, repeat: Infinity, ease: "easeInOut" }
                }}
                className={`h-full w-full p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col justify-center items-center text-center transition-all duration-500 overflow-hidden relative ${stat.glow} ${stat.border}`}
              >
                
                {/* Reactive Technical Frame */}
                <div className="absolute top-0 right-0 p-6">
                   <div className={`w-10 h-10 rounded-tr-2xl border-t-2 border-r-2 border-zinc-100 group-hover:w-16 group-hover:h-16 transition-all duration-700 group-hover:border-current ${stat.color} opacity-20 group-hover:opacity-100`} />
                </div>
                <div className="absolute bottom-0 left-0 p-6">
                   <div className={`w-10 h-10 rounded-bl-2xl border-b-2 border-l-2 border-zinc-100 group-hover:w-16 group-hover:h-16 transition-all duration-700 group-hover:border-current ${stat.color} opacity-0 group-hover:opacity-40`} />
                </div>
                
                <motion.div 
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className={`text-6xl md:text-7xl font-black text-zinc-900 mb-2 tracking-tighter transition-colors duration-500 ${stat.color.replace('text-', 'group-hover:text-')}`}
                >
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </motion.div>
                
                <div className={`text-zinc-600 font-bold tracking-[0.4em] text-[10px] uppercase mb-4 px-4 py-1.5 rounded-full border border-zinc-100 group-hover:text-white transition-all duration-500 ${stat.tag}`}>
                   {stat.label}
                </div>
                
                <div className="text-zinc-500 text-sm font-medium leading-tight max-w-[200px] group-hover:text-zinc-700 transition-colors">
                   {stat.description}
                </div>
                
                {/* Advanced Hover Glow Overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none bg-current ${stat.color.replace('text-', 'bg-')}`} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
