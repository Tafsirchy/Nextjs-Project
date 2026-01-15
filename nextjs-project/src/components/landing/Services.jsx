"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, Package, Truck, Wrench, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

const services = [
  {
    id: 1,
    icon: Bike,
    title: "Global Showroom",
    description: "Access our entire digital inventory featuring the world's most exclusive electric and ICE motorcycles.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop",
    accent: "bg-fuchsia-500"
  },
  {
    id: 2,
    icon: Package,
    title: "Artifact Custody",
    description: "White-glove parts procurement with authenticated blockchain tracking for every component.",
    image: "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=1974&auto=format&fit=crop",
    accent: "bg-cyan-500"
  },
  {
    id: 3,
    icon: Wrench,
    title: "Titanium Forge",
    description: "Certified masters providing bespoke modifications and deep-cycle maintenance for high-performance builds.",
    image: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=1966&auto=format&fit=crop",
    accent: "bg-purple-500"
  },
  {
    id: 4,
    icon: Truck,
    title: "Stealth Logistics",
    description: "Encrypted, climate-controlled delivery to your specific GPS coordinates across the globe.",
    image: "https://images.unsplash.com/photo-1531327431456-837da4b1d562?q=80&w=2070&auto=format&fit=crop",
    accent: "bg-blue-500"
  }
];

export default function Services() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-24 bg-black relative">
       {/* Background Decoration - Animated Blobs */}
       <motion.div 
         animate={{ 
           scale: [1, 1.2, 1],
           rotate: [0, 90, 180, 270, 360]
         }}
         transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
         className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary/[0.07] blur-[150px] rounded-full" 
       />
       <motion.div 
         animate={{ 
           scale: [1.2, 1, 1.2],
           x: [0, 50, 0],
           y: [0, -50, 0]
         }}
         transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
         className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-purple-900/[0.07] blur-[150px] rounded-full" 
       />

       <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
             
             {/* Left Column: Interactive Image Gallery */}
             <div className="w-full lg:w-1/2 sticky top-24">
                <div className="rounded-[3rem] overflow-hidden aspect-[4/5] relative border border-white/10 shadow-2xl">
                   <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="absolute inset-0"
                      >
                         <motion.div
                            animate={{ 
                               y: [0, -15, 0],
                               scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full"
                         >
                            <img 
                              src={services[activeTab].image} 
                              alt={services[activeTab].title}
                              className="w-full h-full object-cover"
                            />
                         </motion.div>
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                         
                         {/* Technical Scan Pulse for Active Image */}
                         <motion.div 
                           key={`scan-${activeTab}`}
                           initial={{ opacity: 0, scale: 0.5 }}
                           animate={{ 
                             opacity: [0, 0.4, 0],
                             scale: [0.5, 1.5]
                           }}
                           transition={{ duration: 2, repeat: Infinity }}
                           className="absolute inset-0 bg-primary/20 blur-3xl rounded-full z-[5] pointer-events-none"
                         />
                      </motion.div>
                   </AnimatePresence>

                   {/* Floating Art Badge */}
                   <motion.div 
                     animate={{ y: [0, -10, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute top-8 left-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 z-20"
                   >
                      <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                   </motion.div>

                   <div className="absolute bottom-12 left-12 right-12 z-20">
                      <motion.h4 
                        key={`title-${activeTab}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-white text-3xl font-black mb-2 tracking-tighter"
                      >
                        {services[activeTab].title}
                      </motion.h4>
                      <div className="h-1 w-24 bg-primary rounded-full" />
                   </div>
                </div>
             </div>

             {/* Right Column: Service Steps */}
             <div className="w-full lg:w-1/2 pt-10">
                <div className="mb-12">
                   <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4 mb-4"
                   >
                      <div className="h-[2px] w-12 bg-primary"></div>
                      <span className="text-white font-bold tracking-[0.4em] text-sm uppercase">Core Operations</span>
                   </motion.div>
                   <h2 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter mb-6">
                      BEYOND THE <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 font-outline-xs">STANDARD</span>
                   </h2>
                   <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                      We offer a suite of elite services designed for the most discerning riders on the planet.
                   </p>
                </div>

                <div className="space-y-4">
                   {services.map((service, index) => {
                     const Icon = service.icon;
                     const isActive = activeTab === index;

                     return (
                       <motion.div
                         key={index}
                         onMouseEnter={() => setActiveTab(index)}
                         className={`group relative p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer ${
                           isActive 
                           ? "bg-white/5 border-primary/50 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]" 
                           : "bg-transparent border-white/10 hover:border-white/30"
                         }`}
                       >
                          <div className="flex items-start gap-6">
                             <div className={`p-4 rounded-2xl transition-all duration-500 ${
                               isActive ? "bg-primary text-black" : "bg-white/5 text-gray-400 group-hover:text-white"
                             }`}>
                                <Icon className="h-6 w-6" />
                             </div>
                             
                             <div className="flex-1">
                                <h3 className={`text-xl font-bold mb-2 transition-colors duration-500 ${
                                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                                }`}>
                                   {service.title}
                                </h3>
                                <p className={`text-sm leading-relaxed transition-colors duration-500 ${
                                  isActive ? "text-gray-300" : "text-gray-500 group-hover:text-gray-400"
                                }`}>
                                   {service.description}
                                </p>
                             </div>

                             <div className={`mt-2 transition-transform duration-500 ${isActive ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}>
                                <ArrowRight className="h-5 w-5 text-primary" />
                             </div>
                          </div>
                       </motion.div>
                     );
                   })}
                </div>
             </div>

          </div>
       </div>
    </section>
  );
}
