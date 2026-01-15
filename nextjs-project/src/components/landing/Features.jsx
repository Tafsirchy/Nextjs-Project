"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Gauge, Users, Wrench, Award, ArrowRight, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "V-Twin Surge",
    description: "Experience raw acceleration with our proprietary electric-assist turbo engines.",
    size: "md:col-span-2",
    art: "https://images.unsplash.com/photo-1558981359-219d6364c9c8?q=80&w=2070&auto=format&fit=crop",
    color: "from-fuchsia-600/10 to-transparent"
  },
  {
    icon: Shield,
    title: "Iron Clad",
    description: "Aerospace-grade safety systems ensuring you stay grounded while flying.",
    size: "md:row-span-2",
    art: "/features/iron-clad.png",
    color: "from-cyan-600/20 to-transparent"
  },
  {
    icon: Gauge,
    title: "Neuro Sync",
    description: "Neural-link dashboard translates your intent to the wheels instantly.",
    size: "md:col-span-1",
    art: "https://images.unsplash.com/photo-1517520287167-4bbf64a00d66?q=80&w=2070&auto=format&fit=crop",
    color: "from-purple-600/10 to-transparent"
  },
  {
    icon: Users,
    title: "Midnight Cult",
    description: "An exclusive inner circle of riders who own the night.",
    size: "md:col-span-1",
    art: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop",
    color: "from-blue-600/10 to-transparent"
  },
  {
    icon: Award,
    title: "Apex Legacy",
    description: "Decades of engineering mastery in every single bolt.",
    size: "md:col-span-2",
    art: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=2070&auto=format&fit=crop",
    color: "from-indigo-600/10 to-transparent"
  },
  {
    icon: Sparkles,
    title: "Chroma Finish",
    description: "Bespoke refractive coatings that shift color with the moonlight.",
    size: "md:col-span-1",
    art: "https://images.unsplash.com/photo-1531327431456-837da4b1d562?q=80&w=2070&auto=format&fit=crop",
    color: "from-orange-600/10 to-transparent"
  }
];

export default function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Technical Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
        <svg width="100%" height="100%">
          <pattern id="grid-light" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-light)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-black border border-white/10 mb-6 shadow-xl"
          >
             <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
             <span className="text-white font-bold tracking-[0.3em] text-xs uppercase">Engineering Mastery</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none mb-6"
          >
            NOT JUST A BIKE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">AN ARTIFACT</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-600 text-lg md:text-xl font-light max-w-2xl leading-relaxed"
          >
            We push the boundaries of physics and aesthetics. Every feature is a testament to the pursuit of the ultimate midnight experience.
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ y: -5, scale: 1.01 }}
                className={`group relative overflow-hidden rounded-[2rem] border border-black/5 bg-gray-50 p-8 min-h-[300px] flex flex-col justify-between ${feature.size || ""}`}
              >
                {/* Background Art Layer - Breathing Animation */}
                {feature.art && (
                  <div className="absolute inset-0 opacity-25 group-hover:opacity-70 transition-opacity duration-1000 pointer-events-none overflow-hidden">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.15, 1],
                        rotate: [0, 2, -1, 0]
                      }}
                      transition={{ 
                        duration: 25 + index * 2, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="w-full h-full"
                    >
                      <img 
                        src={feature.art} 
                        alt="" 
                        className="w-full h-full object-cover grayscale brightness-110"
                      />
                    </motion.div>
                    
                    {/* Scanning Beam Effect */}
                    <motion.div 
                      animate={{ top: ["-10%", "110%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
                      className="absolute left-0 right-0 h-[30%] bg-gradient-to-b from-transparent via-primary/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    />

                    <div className={`absolute inset-0 bg-gradient-to-b ${feature.color}`} />
                  </div>
                )}
                
                {/* Glow Effect */}
                <div className="absolute -inset-24 bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-10">
                  <div className="mb-6 inline-flex p-4 rounded-2xl bg-white border border-black/5 text-primary group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] transition-all duration-500">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black text-black mb-3 tracking-tight group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed max-w-xs">
                    {feature.description}
                  </p>
                </div>

                <div className="relative z-10 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-xs font-bold tracking-widest text-primary uppercase flex items-center gap-2">
                    Discover Tech <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
