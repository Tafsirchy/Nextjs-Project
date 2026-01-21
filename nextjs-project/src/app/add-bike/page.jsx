"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createBike } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { uploadToImgBB } from "@/lib/imgbb";
import { compressImage } from "@/lib/imageCompression";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";

export default function AddBikePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Sport",
    price: "",
    description: "",
    image: "",
    stock: "",
    engine: "",
    power: "",
    topSpeed: "",
    weight: "",
    features: "",
    colors: ""
  });

  const categories = ["Sport", "Cruiser", "Adventure", "Naked", "Classic", "Electric", "Scrambler", "Touring"];

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Step 1: Compress for speed
      const compressedFile = await compressImage(file, { maxWidth: 1024, quality: 0.8 });
      
      console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

      // Step 2: Upload optimized payload
      const result = await uploadToImgBB(compressedFile);
      if (result.success) {
        setFormData(prev => ({ ...prev, image: result.url }));
        toast.success("Telemetry Initialized!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to transmit image data");
    } finally {
      setUploading(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data
      const bikeData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        features: formData.features ? formData.features.split(",").map(f => f.trim()) : [],
        colors: formData.colors ? formData.colors.split(",").map(c => c.trim()) : ["Black"]
      };

      const result = await createBike(bikeData, session?.user?.email);

      if (result.success) {
        toast.success("Bike added successfully!");
        router.push("/bikes");
      } else {
        toast.error(result.message || "Failed to add bike");
      }
    } catch (error) {
      console.error("Error adding bike:", error);
      toast.error(error.message || "An error occurred while adding the bike");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Role Protection
  const allowedRoles = ['admin', 'merchandiser', 'dealer'];
  if (status === "unauthenticated" || (session?.user && !allowedRoles.includes(session.user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="bg-red-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl mb-2">Access Denied</CardTitle>
          <CardDescription className="mb-6">
            You do not have the required permissions to access this protocol. 
            This area is reserved for Administrators, Merchandisers, and Dealers.
          </CardDescription>
          <Link href="/">
            <Button className="w-full">Return to Intelligence Hub</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center py-20 px-4 overflow-hidden bg-white">
      {/* Subtle Light Tactical Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/50 via-white to-blue-50/50" />
        <div 
          className="absolute inset-0 opacity-[0.03] grayscale"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1558981403-c5f91bbde3c0?w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Animated Glows - Softened for Light Mode */}
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 -right-[10%] w-[500px] h-[500px] bg-cyan-100/50 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ opacity: [0.3, 0.4, 0.3], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 -left-[10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/bikes" className="group flex items-center text-cyan-600/80 hover:text-cyan-700 transition-colors mb-4">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Return to Hangar</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              INITIALIZE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">ASSET</span>
            </h1>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <div className="bg-cyan-50/50 border border-cyan-200 rounded-full px-4 py-1 flex items-center gap-2 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest">Protocol Active</span>
            </div>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-xl border-slate-200 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Section 1: Core Logistics */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 text-xs font-bold border border-cyan-200">01</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Core Logistics</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset Designation</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., PHANTOM GT-X"
                      required
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 h-12 text-lg focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 rounded-xl transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fleet Category</label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 appearance-none transition-all"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat} className="bg-white">{cat}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                        <ArrowLeft className="h-4 w-4 rotate-[270deg] text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Valuation</label>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Pricing"
                      required
                      className="bg-slate-50 border-slate-200 text-slate-900 h-12 focus:border-cyan-500/50 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reserve Units</label>
                    <Input
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="Stock"
                      required
                      className="bg-slate-50 border-slate-200 text-slate-900 h-12 focus:border-cyan-500/50 rounded-xl"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset Synopsis</label>
                    <Input
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tactical summary of the asset..."
                      required
                      className="bg-slate-50 border-slate-200 text-slate-900 h-12 focus:border-cyan-500/50 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Visual Telemetry */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 text-xs font-bold border border-blue-200">02</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Visual Telemetry</h3>
                </div>

                <div className="relative group">
                  {formData.image ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-xl"
                    >
                      <Image src={formData.image} alt="Telemetry" fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full p-2 hover:bg-red-50 hover:border-red-200 transition-all group shadow-lg"
                      >
                        <X className="h-5 w-5 text-slate-600 group-hover:text-red-600 transition-colors" />
                      </button>
                      <div className="absolute bottom-6 left-6">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-cyan-600/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">Telemetry Verified</span>
                      </div>
                    </motion.div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-80 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-white hover:border-cyan-500/50 transition-all duration-500 group shadow-inner">
                      <div className="p-6 rounded-2xl bg-white mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                        <ImageIcon className="h-10 w-10 text-cyan-500/50 group-hover:text-cyan-600 transition-colors" />
                      </div>
                      <p className="text-sm text-slate-600 font-bold">
                        {uploading ? "Uploading Data Stream..." : "Deploy Image Payload"}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-2">Maximum Weight: 8MB</p>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                  <input type="hidden" name="image" value={formData.image} required />
                </div>
              </div>

              {/* Section 3: Performance Matrix */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600 text-xs font-bold border border-purple-200">03</span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Performance Matrix</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Propulsion", name: "engine", placeholder: "e.g., 998cc V4" },
                    { label: "Output", name: "power", placeholder: "e.g., 215 HP" },
                    { label: "Velocity Max", name: "topSpeed", placeholder: "e.g., 320 KM/H" },
                    { label: "Mass", name: "weight", placeholder: "e.g., 185 KG" }
                  ].map((spec) => (
                    <div key={spec.name} className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{spec.label}</label>
                      <Input
                        name={spec.name}
                        value={formData[spec.name]}
                        onChange={handleChange}
                        placeholder={spec.placeholder}
                        className="bg-slate-50 border-slate-200 text-slate-900 h-10 focus:border-purple-500/50 rounded-xl placeholder:text-slate-300 text-xs"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Integrated Systems (Features)</label>
                    <Input
                      name="features"
                      value={formData.features}
                      onChange={handleChange}
                      placeholder="ABS, Traction Control, Quickshifter..."
                      className="bg-slate-50 border-slate-200 text-slate-900 h-12 focus:border-purple-500/50 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Chroma Options (Colors)</label>
                    <Input
                      name="colors"
                      value={formData.colors}
                      onChange={handleChange}
                      placeholder="Obsidian, Crimson, Cobalt..."
                      className="bg-slate-50 border-slate-200 text-slate-900 h-12 focus:border-purple-500/50 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Array */}
              <div className="flex flex-col md:flex-row gap-4 pt-12 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg tracking-widest uppercase rounded-2xl shadow-xl shadow-cyan-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmitting...</span>
                    </div>
                  ) : uploading ? (
                    "Uploading..."
                  ) : "Initialize Asset"}
                </Button>
                <Link href="/bikes" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-14 bg-white border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-900 text-lg font-bold uppercase tracking-widest rounded-2xl transition-all shadow-sm">
                    Abort Procedure
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Debug/Status Footer */}
        <div className="mt-8 flex justify-center gap-8">
           <div className="flex items-center gap-2 opacity-20 hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em]">Encrypted Channel</span>
           </div>
           <div className="flex items-center gap-2 opacity-20 hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em]">Hangar Rev 3.5</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
