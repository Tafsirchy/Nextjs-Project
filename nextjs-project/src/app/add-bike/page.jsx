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
import { uploadToImgBB } from "@/lib/imgbb";
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

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image too large (max 8MB)");
      return;
    }

    setUploading(true);
    const result = await uploadToImgBB(file);
    if (result.success) {
      setFormData(prev => ({ ...prev, image: result.url }));
      toast.success("Image uploaded!");
    } else {
      toast.error(result.message);
    }
    setUploading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back Button */}
        <Link href="/bikes">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Bikes
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Add New Bike</CardTitle>
            <CardDescription>
              Fill in the details below to add a new motorcycle to the collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Bike Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Thunder Strike 3000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                      Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g., 12999"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="stock" className="text-sm font-medium">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="e.g., 10"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the bike's key features and selling points..."
                    required
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="image" className="text-sm font-medium">
                    Bike Image <span className="text-red-500">*</span>
                  </label>
                  {formData.image ? (
                     <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-slate-200">
                        <Image src={formData.image} alt="Bike Preview" fill className="object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 group z-10"
                        >
                          <X className="h-5 w-5 text-slate-500 group-hover:text-red-500" />
                        </button>
                     </div>
                  ) : (
                     <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 hover:border-purple-300 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                           <ImageIcon className="h-12 w-12 text-slate-400 mb-3" />
                           <p className="text-sm text-slate-500">
                             {uploading ? "Uploading..." : "Click to upload bike image or drag and drop"}
                           </p>
                           <p className="text-xs text-slate-400 mt-1">PNG, JPG or WEBP (MAX. 8MB)</p>
                        </div>
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

              {/* Technical Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Technical Specifications</h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="engine" className="text-sm font-medium">
                      Engine
                    </label>
                    <Input
                      id="engine"
                      name="engine"
                      value={formData.engine}
                      onChange={handleChange}
                      placeholder="e.g., 998cc Inline-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="power" className="text-sm font-medium">
                      Power
                    </label>
                    <Input
                      id="power"
                      name="power"
                      value={formData.power}
                      onChange={handleChange}
                      placeholder="e.g., 200 HP"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="topSpeed" className="text-sm font-medium">
                      Top Speed
                    </label>
                    <Input
                      id="topSpeed"
                      name="topSpeed"
                      value={formData.topSpeed}
                      onChange={handleChange}
                      placeholder="e.g., 186 mph"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="weight" className="text-sm font-medium">
                      Weight
                    </label>
                    <Input
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="e.g., 199 kg"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Details</h3>
                
                <div className="space-y-2">
                  <label htmlFor="features" className="text-sm font-medium">
                    Features
                  </label>
                  <Input
                    id="features"
                    name="features"
                    value={formData.features}
                    onChange={handleChange}
                    placeholder="e.g., ABS Braking, LED Lighting, Digital Display"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate features with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="colors" className="text-sm font-medium">
                    Available Colors
                  </label>
                  <Input
                    id="colors"
                    name="colors"
                    value={formData.colors}
                    onChange={handleChange}
                    placeholder="e.g., Black, Red, Blue"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate colors with commas
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 bike-gradient-alt text-white border-0"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Adding Bike..." : "Add Bike"}
                </Button>
                <Link href="/bikes" className="flex-1">
                  <Button type="button" variant="outline" size="lg" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
