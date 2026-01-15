"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";
import { Search, Map, CreditCard, Bike, CheckCircle2, Flag } from "lucide-react";
import TechnicalCore from "./Backgrounds/TechnicalCore";
import MechanicalBlueprint from "./Backgrounds/MechanicalBlueprint";
import MotorcycleHandlebars from "./Backgrounds/MotorcycleHandlebars";

const steps = [
  {
    icon: Search,
    title: "SCAN THE HORIZON",
    description: "Navigate our encrypted database of pulse-pounding machines.",
    color: "text-fuchsia-500",
    glow: "shadow-fuchsia-500/20"
  },
  {
    icon: Map,
    title: "CHART YOUR PATH",
    description: "Select your terrain. City streets, desert dunes, or mountain peaks.",
    color: "text-cyan-500",
    glow: "shadow-cyan-500/20"
  },
  {
    icon: CreditCard,
    title: "SECURE THE ASSET",
    description: "Our stealth financing ensures you own the machine without a trace.",
    color: "text-purple-500",
    glow: "shadow-purple-500/20"
  },
  {
    icon: Bike,
    title: "IGNITE THE ENGINE",
    description: "Launch into the midnight sun with your new premium artifact.",
    color: "text-blue-500",
    glow: "shadow-blue-500/20"
  }
];

export default function HowItWorks() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax and Visual effects for background layers
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.02, 0.08, 0.02]);

  const [isMounted, setIsMounted] = useState(false);
  const [shards, setShards] = useState([]);
  const [techLabels, setTechLabels] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      
      // Stable random generation for shards
      const generatedShards = [...Array(6)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 20 + i * 5,
        type: i % 2 === 0 ? 'path' : 'angle'
      }));
      setShards(generatedShards);

      // Stable random generation for technical labels
      const texts = ["_ENG_SYNC_ACTIVE", "0x7f4a_PULSE", "SYSTEM_LOCK_01", "PROTOCOL_V2", "NEURAL_LINK_UP"];
      const generatedLabels = [...Array(8)].map((_, i) => ({
        id: i,
        text: texts[i % texts.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 15 + Math.random() * 10,
        delay: Math.random() * 5
      }));
      setTechLabels(generatedLabels);
    }, 0);

    const handleScroll = () => {
      // scroll logic should be outside if it uses ref
    };

    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={containerRef} className="pt-16 pb-8 bg-zinc-50 relative overflow-hidden text-zinc-900">
      {/* Backmost Layer: Pure SVG Mechanical Blueprint Mastery - Ultra Subtle */}
      <motion.div 
        style={{ y: y1, willChange: "transform, opacity" }}
        className="absolute inset-x-[-10%] top-0 bottom-0 z-0 pointer-events-none opacity-[0.05]"
      >
        <MechanicalBlueprint />
      </motion.div>

      {/* Ghost Machine Layer: Massive TechnicalCore */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] pointer-events-none">
        <motion.div style={{ opacity: ghostOpacity }}>
          <TechnicalCore 
            size="1400px" 
            opacity={1} 
            rotateSpeed={5} 
            withMatrix={false} 
            color="primary" 
          />
        </motion.div>
      </div>

      {/* Premium Texture Overlay - Grain Noise */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-overlay z-[2]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Middle Layer: SVG Schematic Core - Technical Component */}
      <motion.div 
        style={{ y: y2, rotate: rotate1, willChange: "transform" }}
        className="absolute top-1/4 left-[-10%] z-[1] pointer-events-none"
      >
        <TechnicalCore size="800px" opacity={0.06} withMatrix={true} />
      </motion.div>

      {/* Holographic Mesh - Breathing Color Mesh */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.7, 0.5],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-[-30%] top-[-30%] h-[160%] z-[1] pointer-events-none blur-[120px]"
        style={{
          background: 'radial-gradient(circle at 10% 20%, rgba(var(--primary-rgb), 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(192, 38, 211, 0.12) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 60%)'
        }}
      />
      {/* Technical Blueprint Pattern - Scrolling Schematic & Energy Pulses */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none select-none">
        <motion.div 
          animate={{ backgroundPosition: ["0px 0px", "80px 80px"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 80 0 L 0 0 0 80' fill='none' stroke='%23333' stroke-width='0.5' /%3E%3Ccircle cx='0' cy='0' r='1.5' fill='%23333' /%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}
        />
        
        {/* Schematic Energy Pulses */}
        <div className="absolute inset-0 overflow-hidden">
           {[...Array(4)].map((_, i) => (
             <motion.div
               key={`pulse-h-${i}`}
               initial={{ x: "-100%", y: `${15 + i * 20}%`, opacity: 0 }}
               animate={{ x: "100%", opacity: [0, 0.4, 0] }}
               transition={{ duration: 4, repeat: Infinity, delay: i * 1.5, ease: "linear" }}
               className="absolute h-[1px] w-[20%] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
             />
           ))}
           {[...Array(4)].map((_, i) => (
             <motion.div
               key={`pulse-v-${i}`}
               initial={{ y: "-100%", x: `${10 + i * 25}%`, opacity: 0 }}
               animate={{ y: "100%", opacity: [0, 0.4, 0] }}
               transition={{ duration: 6, repeat: Infinity, delay: i * 2, ease: "linear" }}
               className="absolute w-[1px] h-[30%] bg-gradient-to-b from-transparent via-primary/50 to-transparent"
             />
           ))}
        </div>
      </div>
      
      {/* Repositioned Motorcycle Handlebars - Background Layer for Depth */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true }}
        className="absolute top-[20%] left-1/2 -translate-x-1/2 z-[2] pointer-events-none w-full max-w-5xl"
      >
        <MotorcycleHandlebars className="opacity-15 scale-125 mix-blend-multiply" />
      </motion.div>

      {/* Foreground Layer: Data Matrix - Drifting Technical Elements */}
      <motion.div 
        style={{ y: y3, willChange: "transform" }}
        className="absolute inset-0 z-[2] pointer-events-none select-none overflow-hidden"
      >
        {isMounted && (
          <div className="absolute inset-0 opacity-[0.03]">
             {[...Array(20)].map((_, i) => (
               <div 
                 key={`matrix-${i}`}
                 className="absolute font-mono text-[8px] whitespace-nowrap"
                 style={{ 
                   left: `${(i * 7) % 100}%`, 
                   top: `${(i * 13) % 100}%`,
                   animation: `float ${10 + i}s infinite linear`
                 }}
               >
                 0x{((i + 1) * 2048).toString(16).toUpperCase()}
               </div>
             ))}
          </div>
        )}
        
        {isMounted && shards.map((shard) => (
          <motion.div
            key={`shard-${shard.id}`}
            initial={{ 
              x: shard.x + "%", 
              y: shard.y + "%",
              opacity: 0 
            }}
            animate={{ 
              x: [null, (shard.x + 10) % 100 + "%"],
              y: [null, (shard.y + 10) % 100 + "%"],
              rotate: [0, 360],
              opacity: [0, 0.15, 0]
            }}
            transition={{ 
              duration: shard.duration, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute text-primary"
            style={{ willChange: "transform, opacity" }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40">
               {shard.type === 'path' ? (
                 <path d="M 0 20 L 40 20 M 20 0 L 20 40" stroke="currentColor" strokeWidth="1" opacity="0.5" />
               ) : (
                 <path d="M 10 10 L 30 10 L 30 30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
               )}
            </svg>
          </motion.div>
        ))}

        {isMounted && techLabels.map((label) => (
          <motion.div
            key={`label-${label.id}`}
            initial={{ opacity: 0, x: label.x + "%", y: label.y + "%" }}
            animate={{ 
              y: [label.y + "%", (label.y - 10) + "%"],
              opacity: [0, 0.1, 0]
            }}
            transition={{ 
              duration: label.duration, 
              repeat: Infinity, 
              delay: label.delay,
              ease: "linear" 
            }}
            className="absolute font-mono text-[10px] text-zinc-400 tracking-widest whitespace-nowrap"
            style={{ willChange: "transform, opacity" }}
          >
            {label.text}
          </motion.div>
        ))}
      </motion.div>

      {/* Background Ambience / Soft Radial Gradients */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full opacity-40" />
      <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-gradient-to-b from-transparent via-zinc-50 to-transparent pointer-events-none opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
           <motion.span 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className="text-primary font-bold tracking-[0.4em] text-xs uppercase mb-4 block"
           >
             The Protocol
           </motion.span>
           <h2 className="text-5xl md:text-7xl font-black text-zinc-900 leading-[0.9] tracking-tighter mb-6">
              HOW TO JOIN THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">MIDNIGHT RIDE</span>
           </h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* SVG Connection Path */}
          <div className="absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-[2px] hidden lg:block">
             <svg className="h-full w-full" viewBox="0 0 2 1000" preserveAspectRatio="none">
                <line x1="1" y1="0" x2="1" y2="1000" stroke="#333" strokeWidth="2" strokeDasharray="10 10" />
                <motion.line 
                  x1="1" y1="0" x2="1" y2="1000" 
                  stroke="var(--primary)" 
                  strokeWidth="2" 
                  style={{ pathLength }}
                />
                 
                 {/* Traveling Data Packets */}
                 {[...Array(3)].map((_, i) => (
                   <motion.circle
                     key={`packet-${i}`}
                     r="3"
                     fill="var(--primary)"
                     initial={{ cy: -10 }}
                     animate={{ cy: 1010 }}
                     transition={{
                       duration: 4,
                       repeat: Infinity,
                       delay: i * 1.5,
                       ease: "linear"
                     }}
                     className="shadow-[0_0_10px_var(--primary)]"
                   />
                 ))}
              </svg>
          </div>

          <div className="space-y-32">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  
                  {/* Step Content */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`flex-1 text-center ${isEven ? 'lg:text-right' : 'lg:text-left'} group/text`}
                  >
                     <div className={`text-6xl md:text-8xl font-black mb-4 ${step.color} opacity-20 drop-shadow-[0_0_15px_currentColor] transition-all duration-700 group-hover/text:opacity-40 group-hover/text:scale-105 italic`}>
                        0{index + 1}
                     </div>
                     <h3 className="text-4xl font-black text-zinc-900 mb-4 tracking-tighter group-hover/text:text-transparent group-hover/text:bg-clip-text group-hover/text:bg-gradient-to-r group-hover/text:from-zinc-900 group-hover/text:to-primary transition-all duration-500">
                        {step.title}
                     </h3>
                     <p className="text-zinc-500 text-lg leading-relaxed max-w-md mx-auto lg:mx-0 font-medium group-hover/text:text-zinc-700 transition-colors duration-500">
                        {step.description}
                     </p>
                  </motion.div>

                  {/* Central Node */}
                  <div className="relative z-20 group">
                     {/* Rotating Outer Ring */}
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-12px] border-2 border-dashed border-primary/20 rounded-[2.5rem] group-hover:border-primary/60 group-hover:inset-[-20px] transition-all duration-700"
                     />
                     
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.25, rotate: 0 }}
                        className={`w-20 h-20 rounded-2xl bg-white border-2 border-zinc-100 flex items-center justify-center relative rotate-45 group-hover:border-primary transition-all duration-500 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] group-hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] z-10`}
                      >
                         <div className="rotate-[-45deg] group-hover:rotate-0 transition-transform duration-500 relative z-10">
                            <Icon className={`h-8 w-8 ${step.color} group-hover:scale-135 group-hover:drop-shadow-[0_0_10px_currentColor] transition-all duration-500`} />
                         </div>
                         
                         {/* Technical Radar / Scanning Flare - High Intensity */}
                         <div className="absolute inset-0 rounded-2xl overflow-hidden">
                            <motion.div 
                               animate={{ 
                                 y: ["-100%", "200%"],
                                 opacity: [0.5, 1, 0.5]
                               }}
                               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                               className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-primary/20 to-transparent"
                            />
                         </div>

                         {/* Node Energy Pulse Overlay */}
                         <motion.div 
                           animate={{ 
                             scale: [1, 1.4, 1],
                             opacity: [0.1, 0, 0.1]
                           }}
                           transition={{ duration: 2, repeat: Infinity }}
                           className={`absolute inset-0 rounded-2xl bg-current ${step.color.replace('text-', 'bg-')} pointer-events-none`}
                         />
                      </motion.div>
                  </div>

                  {/* Placeholder for symmetry */}
                  <div className="flex-1 hidden lg:block" />
                </div>
              );
            })}
          </div>

          {/* Final Flag Node */}
          <div className="mt-32 flex justify-center">
             <motion.div 
               initial={{ opacity: 0, scale: 0 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="p-8 rounded-full bg-primary/20 border-2 border-primary shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] animate-bounce"
             >
                <Flag className="h-10 w-10 text-primary" />
             </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
