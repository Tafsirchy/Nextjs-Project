"use client";

import { API_URL } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Tag } from "lucide-react";
import toast from "react-hot-toast";

export default function PromoSlider() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    async function fetchPromos() {
      try {
        const response = await fetch(`${API_URL}/api/promos/active`);
        const data = await response.json();
        if (data.success && data.promos.length > 0) {
          setPromos(data.promos);
        } else {
          setPromos([
            {
              code: "SAVE20",
              description: "20% off your entire purchase. Limited time offer!",
              type: "percentage",
              discount: 20
            },
            {
              code: "FLAT500",
              description: "$500 off your order. Command the machine.",
              type: "fixed",
              discount: 500
            },
            {
              code: "FREESHIP",
              description: "Free shipping on your order. Professional delivery included.",
              type: "fixed",
              discount: 500
            },
            {
              code: "RIDE500",
              description: "Save $500 on all Touring models. Limited time offer for adventurers.",
              type: "fixed",
              discount: 500
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch promos", error);
        setPromos([{ code: "WELCOME10", description: "Get 10% off your first ride.", discount: 10, type: "percentage" }]);
      } finally {
        setLoading(false);
      }
    }
    fetchPromos();
  }, []);

  useEffect(() => {
    if (promos.length === 0 || isHovered) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(interval);
  }, [promos.length, isHovered, paginate]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`PROMO ${code} LOCKED IN`, {
       icon: '🔥',
       style: { background: '#0f172a', color: '#fff', border: '1px solid #7c3aed' }
    });
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  if (loading || promos.length === 0) return null;

  const currentPromoIndex = ((page % promos.length) + promos.length) % promos.length;
  const currentPromo = promos[currentPromoIndex];

  return (
    <div 
      className="py-12 md:py-16 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center border-y border-white/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 text-slate-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(124,58,237,0.1),_transparent_70%)]" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        {/* Animated Particles */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <div className="relative min-h-[420px] md:min-h-[300px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) > 50;
                if (swipe) {
                  paginate(offset.x > 0 ? -1 : 1);
                }
              }}
              className="absolute w-full flex flex-col items-center"
            >
              <div className="mb-6">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-purple-600/20 text-purple-400 text-[10px] uppercase font-black tracking-[0.3em] px-4 py-1.5 rounded-full border border-purple-500/30 backdrop-blur-md"
                >
                  Limited Access Reward
                </motion.div>
              </div>

              <h2 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter text-center">
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-blue-400 drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                   {currentPromo.type === 'percentage' ? `${currentPromo.discount}% OFF` : `$${currentPromo.discount} OFF`}
                </span>
              </h2>

              <p className="text-sm md:text-lg text-slate-400 max-w-xl mx-auto mb-10 font-medium leading-relaxed text-center px-4">
                {currentPromo.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-slate-900 border border-white/10 p-1.5 rounded-xl flex items-center">
                    <div className="px-6 py-3 rounded-lg font-mono font-black text-lg text-white tracking-[0.2em] flex items-center gap-3">
                      <Tag className="h-5 w-5 text-purple-500" />
                      {currentPromo.code}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => copyToClipboard(currentPromo.code)}
                  variant="ghost" 
                  className="text-white hover:text-purple-400 gap-2 h-14 px-8 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all font-bold uppercase tracking-widest text-xs"
                >
                  <Copy className="h-4 w-4" />
                  Apply Coupon
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Slim Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 p-1 bg-white/5 rounded-full backdrop-blur-md border border-white/10">
        {promos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
               const newDirection = idx > currentPromoIndex ? 1 : -1;
               setPage([idx, newDirection]);
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentPromoIndex ? "w-8 bg-purple-500 shadow-[0_0_10px_#7c3aed]" : "w-1.5 bg-slate-700 hover:bg-slate-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
