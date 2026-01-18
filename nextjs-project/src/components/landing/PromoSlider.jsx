"use client";

import { API_URL } from "@/lib/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Tag } from "lucide-react";
import toast from "react-hot-toast";

export default function PromoSlider() {
  const [promos, setPromos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPromos() {
      try {
        const response = await fetch(`${API_URL}/api/promos/active`);
        const data = await response.json();
        if (data.success && data.promos.length > 0) {
          setPromos(data.promos);
        } else {
          // Fallback if no promos from API
          setPromos([
            {
              code: "WELCOME10",
              description: "Get 10% off your first premium ride. Join the elite club today.",
              type: "percentage",
              discount: 10
            },
            {
              code: "SAVE20",
              description: "20% off your entire purchase. Limited time offer!",
              type: "percentage",
              discount: 20
            },
            {
              code: "RIDE500",
              description: "Save $500 on all Touring models. Limited time offer for adventurers.",
              type: "fixed",
              discount: 500
            },
            {
              code: "FLAT500",
              description: "$500 off your next premium ride.",
              type: "fixed",
              discount: 500
            },
            {
              code: "FREESHIP",
              description: "Free shipping on your order. Professional delivery included.",
              type: "fixed",
              discount: 500
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch promos", error);
        // Fallback
        setPromos([
          {
            code: "WELCOME10",
            description: "Get 10% off your first premium ride.",
            discount: 10,
            type: "percentage"
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPromos();
  }, []);

  useEffect(() => {
    if (promos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promos.length]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copied!`);
  };

  if (loading || promos.length === 0) return null;

  const currentPromo = promos[currentIndex];

  return (
    <div className="h-[300px] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
      
      {/* Content Container */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="inline-block mb-4 animate-bounce">
           <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-lg shadow-amber-500/20">
             Limited Time Offer
           </span>
        </div>

        <div className="transition-all duration-500 ease-in-out transform">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
               {currentPromo.type === 'percentage' ? `${currentPromo.discount}% OFF` : `$${currentPromo.discount} DISCOUNT`}
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            {currentPromo.description}
          </p>

          <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-sm p-2 pr-6 rounded-full border border-white/10 hover:border-purple-500/50 transition-colors group">
            <div className="bg-slate-800 text-white px-4 py-2 rounded-full font-mono font-bold tracking-wider flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-400" />
              {currentPromo.code}
            </div>
            <button 
              onClick={() => copyToClipboard(currentPromo.code)}
              className="text-sm font-semibold text-white flex items-center gap-2 hover:text-purple-400 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>Copy Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slider Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {promos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-8 bg-purple-500" : "w-2 bg-slate-600 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
