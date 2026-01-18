"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, Search, MapPin, Bike, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import TechnicalCore from "./Backgrounds/TechnicalCore";
import { useRef } from "react";

const slides = [
  {
    id: 1,
    number: "01",
    title: "MIDNIGHT",
    subtitle: "RUNNER",
    tagline: "DOMINATE THE STREETS",
    description: "Precision engineering with a dark, urban edge—unleashed",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070&auto=format&fit=crop",
    video: null // Placeholder for video background if needed
  },
  {
    id: 2,
    number: "02",
    title: "URBAN",
    subtitle: "LEGEND",
    tagline: "OWN THE NIGHT",
    description: "A symphony of raw power and comfort. Built for the long haul.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop",
    video: null
  },
  {
    id: 3,
    number: "03",
    title: "OFF-ROAD",
    subtitle: "KING",
    tagline: "CONQUER TERRAIN",
    description: "No road? No problem. Adventure begins where pavement ends.",
    image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=2070&auto=format&fit=crop",
    video: null
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000); // Slower, more cinematic interval
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full h-[80vh] bg-black overflow-hidden group">
      {/* Main Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Digital Fog - Holographic Depth */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 z-[4] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 30% 50%, rgba(var(--primary-rgb), 0.2) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(192, 38, 211, 0.2) 0%, transparent 60%)',
              filter: 'blur(80px)'
            }}
          />

          {/* Unifying Technical Core SVG - Hero Corner Impact */}
          <div className="absolute -bottom-24 -right-24 opacity-[0.08] blur-[2px] hidden md:block">
             <TechnicalCore size="600px" rotateSpeed={20} withMatrix={true} color="primary" />
          </div>
 
          {/* Neon Streaks - High Energy Zips */}
          <div className="absolute inset-0 z-[5] overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`streak-${i}`}
                initial={{ x: "-100%", y: `${20 + i * 25}%`, opacity: 0 }}
                animate={{ 
                  x: "200%", 
                  opacity: [0, 1, 0] 
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  repeatDelay: 2 + i * 3,
                  ease: "circIn",
                  delay: i * 2
                }}
                className="absolute h-[1px] w-64 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_var(--primary)]"
              />
            ))}
          </div>

          {/* Background Image Parallax & Effects */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ 
              scale: 1,
              opacity: [0.75, 0.85, 0.75]
            }}
            transition={{ 
              scale: { duration: 8, ease: "easeOut" },
              opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-0 w-full h-full"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slides[current].image})` }}
            />
          </motion.div>
          
          {/* Scanning Beam - Digital Aura */}
          <motion.div 
            animate={{ top: ["-10%", "110%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[20%] bg-gradient-to-b from-transparent via-primary/20 to-transparent z-[5] pointer-events-none"
          />

          {/* Cinematic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-[6]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-[6]" />
          
          {/* Subtle Atmosphere Layer */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)] z-[6] opacity-60" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center">
        <div className="container mx-auto px-4 md:px-6 relative h-full flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4 max-w-3xl"
            >
              {/* Giant Typography Background Effect */}
              <h1 className="text-6xl md:text-[150px] lg:text-[180px] font-black text-white/10 absolute -top-10 left-0 md:-left-10 leading-none select-none tracking-tighter mix-blend-overlay pointer-events-none">
                {slides[current].title}
              </h1>

              {/* Tagline Badge */}
              <div className="flex items-center gap-4">
                 <span className="text-white font-bold tracking-[0.2em] text-xs md:text-sm uppercase flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_currentColor] animate-pulse"></span>
                    {slides[current].tagline}
                 </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[0.9] drop-shadow-2xl">
                {slides[current].title} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  {slides[current].subtitle}
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-300 max-w-lg font-light leading-relaxed border-l-2 border-primary/50 pl-6 settings-text">
                {slides[current].description}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-6">
                <Link href="/bikes">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 h-12 px-8 text-base font-bold tracking-wide rounded-none">
                    EXPLORE MODEL
                  </Button>
                </Link>
                <button className="flex items-center gap-3 text-white group/play hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover/play:border-primary group-hover/play:scale-110 transition-all">
                    <Play className="w-3 h-3 fill-current ml-1" />
                  </div>
                  <span className="font-semibold tracking-wider text-sm">WATCH FILM</span>
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Search Bar (Chopper Exchange Style) */}
      <div className="absolute bottom-0 left-0 w-full z-30 bg-black/80 backdrop-blur-md border-t border-white/10 hidden md:block">
        <div className="container mx-auto flex items-center">
            {/* Label */}
            <div className="bg-primary h-20 flex items-center justify-center px-8">
                <span className="text-white font-black text-base uppercase tracking-wider leading-tight text-center">
                    Quick<br/>Finder
                </span>
            </div>

            {/* Inputs */}
            <div className="flex-1 flex items-center divide-x divide-white/10 h-20">
                <div className="flex-1 px-6 flex flex-col justify-center hover:bg-white/5 cursor-pointer transition-colors group/input">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 group-hover/input:text-primary transition-colors">Type</span>
                    <div className="flex items-center justify-between text-white font-semibold text-sm">
                        <span>All Types</span>
                        <Bike className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
                <div className="flex-1 px-6 flex flex-col justify-center hover:bg-white/5 cursor-pointer transition-colors group/input">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 group-hover/input:text-primary transition-colors">Make</span>
                    <div className="flex items-center justify-between text-white font-semibold text-sm">
                        <span>Select Brand</span>
                        <Bike className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
                <div className="flex-1 px-6 flex flex-col justify-center hover:bg-white/5 cursor-pointer transition-colors group/input">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 group-hover/input:text-primary transition-colors">Location</span>
                    <div className="flex items-center justify-between text-white font-semibold text-sm">
                        <span>Enter Zip Code</span>
                        <MapPin className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
                <button className="h-full px-10 bg-white/5 hover:bg-white/10 text-white font-bold tracking-widest uppercase transition-colors flex items-center gap-2 text-sm">
                    <Search className="w-4 h-4" />
                    Search
                </button>
            </div>
        </div>
      </div>

      {/* Pagination & Controls */}
      <div className="absolute right-0 bottom-32 z-20 flex flex-col items-end px-6 md:px-12 pointer-events-none">
        <div className="flex items-center gap-6 mb-8 text-white pointer-events-auto">
            <button onClick={prevSlide} className="hover:text-primary transition-colors"><ChevronLeft className="w-6 h-6" /></button>
            <div className="font-mono text-lg tracking-widest">
                <span className="text-white font-bold">{slides[current].number}</span>
                <span className="text-gray-600 mx-2">/</span>
                <span className="text-gray-400">03</span>
            </div>
            <button onClick={nextSlide} className="hover:text-primary transition-colors"><ChevronRight className="w-6 h-6" /></button>
        </div>
      </div>

       {/* Progress Bar */}
       <div className="absolute bottom-20 right-12 left-auto w-48 h-[2px] bg-white/10 z-20 hidden md:block">
        <motion.div
          key={current}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 8, ease: "linear" }}
          className="h-full bg-primary"
        />
      </div>

    </section>
  );
}
