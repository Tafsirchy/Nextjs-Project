"use client";

import { motion } from "framer-motion";
import { Star, Quote, MessageSquare } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "SARAH JET",
    role: "SPEED HUNTER",
    image: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    content: "The machines at MotruBi aren't just vehicles; they're masterpieces. My Thunder Strike feels like it's from 2077.",
    bike: "THUNDER STRIKE V2",
    stats: "0-100: 1.8s",
    code: "ARC-77"
  },
  {
    name: "CHEN ZEN",
    role: "ADVENTURE DRIFTER",
    image: "https://i.pravatar.cc/150?img=13",
    rating: 5,
    content: "Crossing the canyons on my MotoArtifact was a religious experience. Stealth, power, and absolute beauty.",
    bike: "MOTO ARTIFACT Z",
    stats: "RANGE: 450KM",
    code: "ZEN-Z"
  },
  {
    name: "DAVIS VOID",
    role: "URBAN OPERATOR",
    image: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    content: "In the neon jungle, my Electric Pulse is the apex predator. Silent whisper, devastating speed.",
    bike: "ELECTRIC PULSE X",
    stats: "TORQUE: 240NM",
    code: "VOID-X"
  },
  {
    name: "WILSON GHOST",
    role: "STEALTH RIDER",
    image: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    content: "The level of engineering detail is obsessive. I've never seen craftsmanship this pure in the modern world.",
    bike: "GHOST STEALTH S",
    stats: "MAX: 320KM/H",
    code: "GHOST-S"
  },
  {
    name: "MARC SPEED",
    role: "TECH NOMAD",
    image: "https://i.pravatar.cc/150?img=4",
    rating: 5,
    content: "The UI integration on the handlebars is seamless. It feels like the bike is an extension of my own nervous system.",
    bike: "APEX PREDATOR",
    stats: "TORQUE: 260NM",
    code: "MARC-V5"
  },
  {
    name: "LUNA NIGHT",
    role: "VOID RUNNER",
    image: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    content: "Riding through the neon rain with the silent electric motor is pure therapy. The world just disappears.",
    bike: "NIGHT CRAWLER",
    stats: "0-100: 1.6s",
    code: "LUNA-L1"
  }
];

export default function Testimonials() {
  // Triple the array for extra safety in infinite scroll
  const scrollingTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-cover bg-fixed bg-center grayscale opacity-[0.25]"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1558980394-4c7c9299fe96?q=80&w=2070&auto=format&fit=crop')`,
            filter: 'brightness(1.1) contrast(1.3) saturate(0)'
         }}
        />
        <div className="absolute inset-0 bg-primary/[0.03] mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/20 to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_white_95%)]" />
      </div>

      {/* Large Background Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
         <span className="text-[25vw] font-black leading-none text-zinc-900 overflow-hidden whitespace-nowrap italic">
           COMMUNITIES
         </span>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 text-center mb-16">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6"
           >
              <MessageSquare className="h-6 w-6" />
           </motion.div>
           <h2 className="text-5xl md:text-7xl font-black text-zinc-900 leading-none tracking-tighter mb-6">
              VOICES FROM THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">MIDNIGHT CLUB.</span>
           </h2>
        </div>

        {/* Infinite Scroller - Edge to Edge */}
        <div className="relative overflow-hidden py-10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-40 before:bg-gradient-to-r before:from-white before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-40 after:bg-gradient-to-l after:right-0 after:from-white after:to-transparent after:z-10">
          <motion.div 
            animate={{ x: ["0%", "-33.333%"] }}
            transition={{ 
              duration: 40, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex gap-6 w-max"
          >
            {scrollingTestimonials.map((testi, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8, scale: 1.01 }}
                className="flex-shrink-0 w-[350px] group relative p-6 rounded-[2.5rem] bg-white border border-zinc-100/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(var(--primary-rgb),0.1)] transition-all duration-700 overflow-hidden flex flex-col justify-between"
              >
                 {/* ID Overlay */}
                 <div className="absolute top-0 right-0 px-6 py-2 bg-zinc-900 text-white font-mono text-[8px] tracking-[0.3em] rounded-bl-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    {testi.code}
                 </div>

                 <div className="relative z-10">
                    {/* Bike Tag */}
                    <div className="mb-5 flex items-center gap-2">
                       <div className="h-1 w-6 bg-primary/30 rounded-full group-hover:w-10 transition-all duration-500" />
                       <span className="text-[9px] font-black tracking-widest text-primary uppercase">
                         {testi.bike}
                       </span>
                    </div>

                    <p className="text-zinc-700 font-medium leading-relaxed italic text-base group-hover:text-zinc-900 transition-colors mb-6">
                        &quot;{testi.content}&quot;
                    </p>

                    <div className="flex items-center justify-between py-5 border-y border-zinc-100/50 mb-6">
                       <div className="flex gap-0.5">
                         {[...Array(testi.rating)].map((_, i) => (
                           <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                         ))}
                       </div>
                       <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-tighter">{testi.stats}</span>
                    </div>
                 </div>

                 {/* Author */}
                 <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-zinc-100 overflow-hidden shadow-lg">
                       <img 
                          src={testi.image} 
                          alt={testi.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                    <div>
                       <div className="text-zinc-900 font-black tracking-tighter text-base mb-0.5 group-hover:text-primary transition-colors">
                          {testi.name}
                       </div>
                       <div className="text-zinc-400 font-bold text-[8px] tracking-[0.2em] uppercase">
                          {testi.role}
                       </div>
                    </div>
                 </div>

                 <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
