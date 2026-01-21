"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchBikes } from "@/lib/api";
import BikeCard from "@/components/BikeCard";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import DualRangeSlider from "@/components/ui/DualRangeSlider";
import FilterPill from "@/components/ui/FilterPill";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("featured");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const MIN_PRICE_LIMIT = 0;
  const MAX_PRICE_LIMIT = 50000;

  const handleSliderChange = ({ min, max }) => {
    // Updates inputs effectively
    if (min !== minPrice) setMinPrice(min);
    if (max !== maxPrice) setMaxPrice(max);
    setCurrentPage(1);
  };

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
      filters.page = currentPage;
      filters.limit = 9;
      filters.sort = sortBy;
      
      const data = await fetchBikes(filters);
      if (data.pagination) {
        setBikes(data.bikes || []);
        setTotalPages(data.pagination.totalPages);
      } else {
        setBikes(data.bikes || []);
      }
      setError(null);
    } catch (err) {
      console.error("Error loading bikes:", err);
      setError("Failed to load bikes. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, showFeaturedOnly, onSale, inStock, minPrice, maxPrice, searchTerm, currentPage, sortBy]);

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
    setCurrentPage(1);
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
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 sticky top-28 self-start z-30 overflow-y-auto custom-scrollbar transition-all duration-300">
              {/* Sidebar Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <h3 className="font-extrabold text-sm tracking-wider text-slate-800 flex items-center gap-2 uppercase">
                  <Filter className="h-4 w-4 text-[#000080]" />
                  Filters
                </h3>
                <button 
                  onClick={clearFilters}
                  className="text-[10px] font-bold uppercase tracking-wider text-purple-600 hover:text-purple-800 transition-colors border border-purple-100 px-2 py-1 rounded hover:bg-purple-50"
                >
                  Reset
                </button>
              </div>

              <div className="p-5 space-y-8">
                {/* Search */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Keyword Search</label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#000080] transition-colors" />
                    <input
                      type="text"
                      placeholder="Model, brand..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-[#000080] focus:border-[#000080] transition-all text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Price Budget</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                        className="w-full py-2 pl-6 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:ring-1 focus:ring-[#000080] focus:border-[#000080] outline-none transition-all"
                      />
                    </div>
                    <span className="text-slate-300 font-light">—</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                        className="w-full py-2 pl-6 pr-3 rounded-lg border border-slate-200 bg-slate-50/50 text-sm focus:ring-1 focus:ring-[#000080] focus:border-[#000080] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="px-1 mt-4">
                    <DualRangeSlider
                      min={MIN_PRICE_LIMIT}
                      max={MAX_PRICE_LIMIT}
                      onChange={handleSliderChange}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Categories</label>
                  <div className="space-y-0.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between group ${
                          selectedCategory === cat 
                            ? "bg-[#000080] text-white font-medium shadow-md shadow-blue-900/10" 
                            : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span className="capitalize">{cat === "all" ? "All Models" : cat}</span>
                        {selectedCategory === cat && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div>
                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Preferences</label>
                   <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {[
                      { id: 'feat', label: 'Featured', checked: showFeaturedOnly, setter: setShowFeaturedOnly },
                      { id: 'sale', label: 'Special Deals', checked: onSale, setter: setOnSale },
                      { id: 'stock', label: 'In Stock Only', checked: inStock, setter: setInStock }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between cursor-pointer group" onClick={() => { item.setter(!item.checked); setCurrentPage(1); }}>
                        <label className="text-sm font-medium text-slate-600 group-hover:text-slate-900 cursor-pointer select-none">{item.label}</label>
                        <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out ${item.checked ? 'bg-[#000080]' : 'bg-slate-200'}`}>
                          <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-200 ${item.checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                    ))}
                   </div>
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
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span>
                    {sortBy === "featured" && "Featured"}
                    {sortBy === "price-asc" && "Price: Low to High"}
                    {sortBy === "price-desc" && "Price: High to Low"}
                    {sortBy === "newest" && "Newest First"}
                  </span>
                  <ChevronRight className="h-3 w-3 rotate-90" />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    {[
                      { value: "featured", label: "Featured" },
                      { value: "price-asc", label: "Price: Low to High" },
                      { value: "price-desc", label: "Price: High to Low" },
                      { value: "newest", label: "Newest First" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setCurrentPage(1);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === option.value
                            ? "bg-[#000080] text-white font-medium"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filter Pills */}
            {(() => {
              const activeFilters = [];
              if (selectedCategory !== "all") activeFilters.push({ key: 'category', label: selectedCategory, remove: () => setSelectedCategory("all") });
              if (showFeaturedOnly) activeFilters.push({ key: 'featured', label: 'Featured', remove: () => setShowFeaturedOnly(false) });
              if (onSale) activeFilters.push({ key: 'onSale', label: 'Special Deals', remove: () => setOnSale(false) });
              if (inStock) activeFilters.push({ key: 'inStock', label: 'In Stock', remove: () => setInStock(false) });
              if (minPrice) activeFilters.push({ key: 'minPrice', label: `Min: $${minPrice}`, remove: () => setMinPrice("") });
              if (maxPrice) activeFilters.push({ key: 'maxPrice', label: `Max: $${maxPrice}`, remove: () => setMaxPrice("") });
              if (searchTerm) activeFilters.push({ key: 'search', label: `"${searchTerm}"`, remove: () => setSearchTerm("") });
              
              return activeFilters.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Filters:</span>
                  {activeFilters.map(filter => (
                    <FilterPill key={filter.key} label={filter.label} onRemove={filter.remove} />
                  ))}
                  {activeFilters.length > 1 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-800 underline transition-colors ml-2"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              ) : null;
            })()}

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
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bikes.map((bike) => (
                      <BikeCard key={bike.id} bike={bike} />
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>
                      <span className="text-sm font-medium text-slate-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
