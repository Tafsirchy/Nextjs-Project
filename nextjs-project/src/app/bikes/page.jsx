"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchBikes } from "@/lib/api";
import BikeCard from "@/components/BikeCard";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

export default function BikesPage() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onSale, setOnSale] = useState(false);
  const [inStock, setInStock] = useState(false);

  const categories = ["all", "Sport", "Cruiser", "Adventure", "Naked", "Classic", "Electric", "Scrambler", "Touring"];

  const loadBikes = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (selectedCategory !== "all") filters.category = selectedCategory;
      if (showFeaturedOnly) filters.featured = true;
      if (onSale) filters.onSale = true;
      if (inStock) filters.inStock = true;
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;
      if (searchTerm) filters.search = searchTerm;
      
      const data = await fetchBikes(filters);
      setBikes(data.bikes || []);
      setError(null);
    } catch (err) {
      console.error("Error loading bikes:", err);
      setError("Failed to load bikes. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, showFeaturedOnly, onSale, inStock, minPrice, maxPrice, searchTerm]);

  useEffect(() => {
    // Debounce search to avoid too many requests
    const handler = setTimeout(() => {
      loadBikes();
    }, 300);
    return () => clearTimeout(handler);
  }, [loadBikes]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setShowFeaturedOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setOnSale(false);
    setInStock(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white py-20 relative overflow-hidden">
        {/* Background Branded Identity - Glassmorphic Effect */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none bg-white/20 backdrop-blur-xl border-b border-white/10">
          <img 
            src="/images/logo-premium.png" 
            alt="MotruBi Logo Pattern" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay filter blur-[1px]"
          />
        </div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Inventory</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light">
            Each machine in our collection is hand-picked for enthusiasts who demand nothing but absolute perfection.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-purple-600" />
                  Filters
                </h3>
                <button 
                  onClick={clearFilters}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Reset All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Search By Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Price Range ($)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCategory === cat 
                          ? "bg-purple-600 text-white font-semibold" 
                          : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      {cat === "all" ? "All Categories" : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Toggles */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 cursor-pointer" htmlFor="feat">Featured</label>
                  <input
                    type="checkbox"
                    id="feat"
                    checked={showFeaturedOnly}
                    onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 cursor-pointer" htmlFor="sale">Special Deals</label>
                  <input
                    type="checkbox"
                    id="sale"
                    checked={onSale}
                    onChange={(e) => setOnSale(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 cursor-pointer" htmlFor="stock">In Stock</label>
                  <input
                    type="checkbox"
                    id="stock"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Available Motorcycles</h2>
                <p className="text-slate-500 text-sm">Showing {bikes.length} exquisite models</p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                <p className="mt-4 text-slate-500 font-medium tracking-wide">Scouting the best rides...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-red-600 text-lg mb-4 font-medium">{error}</div>
                <Button onClick={loadBikes} className="bike-gradient-alt text-white">Try Again</Button>
              </div>
            )}

            {/* Bikes Grid */}
            {!loading && !error && (
              <>
                {bikes.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Filter className="h-16 w-16 mx-auto text-slate-200 mb-4" />
                    <p className="text-xl font-bold text-slate-800 mb-2">No Matches Found</p>
                    <p className="text-sm text-slate-500">Try adjusting your filters or searching for something else</p>
                    <Button onClick={clearFilters} variant="outline" className="mt-6">Clear All Filters</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bikes.map((bike) => (
                      <BikeCard key={bike.id} bike={bike} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
