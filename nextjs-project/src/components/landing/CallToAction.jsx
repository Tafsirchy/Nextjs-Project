"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* The Portal Background */}
      <div className="absolute inset-0 z-0">
         {/* Concentric Pulse Rings */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 2, 3],
                  opacity: [0.3, 0.1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 1.3,
                  ease: "easeOut",
                }}
                className="absolute w-[30vw] h-[30vw] border-4 border-primary/20 rounded-full blur-md"
              />
            ))}
         </div>

          {/* Artistic Image Overlay - Maximized Visibility */}
          <div className="absolute inset-0">
             <motion.img 
               animate={{ scale: [1.1, 1.15, 1.1] }}
               transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
               src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070&auto=format&fit=crop" 
               alt="Midnight Portal" 
               className="w-full h-full object-cover opacity-85 grayscale-[0.2] brightness-90 transition-transform duration-[10s]"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)]" />
             
             {/* Secondary Glow Layer */}
             <div className="absolute inset-0 bg-primary/10 mix-blend-color-dodge opacity-40" />
          </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 border border-white/20 text-white font-black tracking-[0.4em] text-xs uppercase backdrop-blur-xl shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
             <Zap className="h-4 w-4 animate-pulse text-primary" />
             The Event Horizon
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-6xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter"
          >
            READY TO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">OWN THE NIGHT?</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Join an exclusive bloodline of riders who demand absolute performance and unparalleled aesthetics.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-10"
          >
            <Link href="/bikes">
              <Button size="lg" className="h-20 px-12 bg-primary hover:bg-primary/90 text-black font-black text-xl rounded-2xl shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)] transition-all hover:scale-105 group">
                ENTER SHOWROOM
                <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="h-20 px-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xl rounded-2xl backdrop-blur-xl transition-all">
                JOIN THE CULT
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Corner Accents */}
      <div className="absolute top-0 right-0 p-12 opacity-20 hidden lg:block">
         <div className="w-32 h-32 border-t-2 border-r-2 border-primary rounded-tr-[3rem]" />
      </div>
      <div className="absolute bottom-0 left-0 p-12 opacity-20 hidden lg:block">
         <div className="w-32 h-32 border-b-2 border-l-2 border-primary rounded-bl-[3rem]" />
      </div>
    </section>
  );
}
