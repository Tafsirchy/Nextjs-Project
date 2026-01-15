"use client";

import { API_URL } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, Lock, Mail, User, UserPlus, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer"  // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Access keys do not match!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Access key must be at least 6 characters!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account initialized! Welcome to the squad.");
        router.push("/login");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-neutral-950">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-neutral-950 to-purple-900/30" />
        <div 
          className="absolute inset-0 opacity-20 grayscale scale-110"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1558981403-c5f91bbde3c0?w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[2px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-4 group">
            <motion.div 
              whileHover={{ rotate: -10, scale: 1.1 }}
              className="rounded-2xl bg-white/10 backdrop-blur-xl p-3 border border-white/20 shadow-2xl"
            >
              <Bike className="h-8 w-8 text-blue-400" />
            </motion.div>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Join the Fleet</h1>
          <p className="text-neutral-400 text-lg">Secure your spot in the MotruBi community</p>
        </div>

        {/* Signup Card */}
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
              Registration <UserPlus className="h-5 w-5 text-blue-400" />
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Provide your details to initialize your profile
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">
                    Operative Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Ghost Rider"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-blue-500/50 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">
                    Comm Channel (Email)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="pilot@motrubi.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-blue-500/50 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">
                  Designation Type
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 appearance-none"
                  >
                    <option value="customer" className="bg-neutral-900 text-white">Customer (Standard Access)</option>
                    <option value="dealer" className="bg-neutral-900 text-white">Dealer (Bulk Privileges)</option>
                    <option value="merchandiser" className="bg-neutral-900 text-white">Merchandiser (Asset Manager)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ArrowRight className="h-4 w-4 text-neutral-500 rotate-90" />
                  </div>
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={formData.role}
                  className="px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-lg"
                >
                  <p className="text-xs text-blue-400 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    {formData.role === 'dealer' && 'Wholesale status enabled: 10-25% tier discounts.'}
                    {formData.role === 'customer' && 'Retail access: Instant checkout on all stock.'}
                    {formData.role === 'merchandiser' && 'Management: Control over bike specs and pricing.'}
                  </p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">
                    Access Key
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-blue-500/50 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-blue-400 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">
                    Confirm Key
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-blue-500/50 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-blue-400 transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 transition-all font-bold text-lg rounded-xl flex items-center justify-center gap-2 group mt-2" 
                disabled={loading}
              >
                {loading ? "Initializing..." : "Register Profile"}
                {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <div className="text-sm text-center text-neutral-400">
              Already have an operative account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-bold">
                Login here
              </Link>
            </div>
            <div className="text-xs text-center">
              <Link href="/" className="text-neutral-600 hover:text-neutral-400 transition-colors">
                Cancel Registration and Return
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Decorative Shards */}
      <div className="absolute top-1/4 -right-[5%] w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-[5%] w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
