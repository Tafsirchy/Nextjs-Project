"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials. Try: demo@example.com / password123");
      } else {
        toast.success("Welcome back to the ride!");
        router.push("/bikes");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-neutral-950">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-neutral-950 to-blue-900/30" />
        <div 
          className="absolute inset-0 opacity-20 grayscale"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[2px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Branding */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-6 group">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="rounded-2xl bg-white/10 backdrop-blur-xl p-4 border border-white/20 shadow-2xl"
            >
              <Bike className="h-10 w-10 text-purple-400" />
            </motion.div>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Access Your Hangar</h1>
          <p className="text-neutral-400 text-lg">Ignite your journey with MotruBi</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
          
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Identity verification required to access inventory
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-neutral-300 ml-1">
                  Secure Entry Identifier (Email)
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="pilot@motrubi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-neutral-300 ml-1">
                  Access Key (Password)
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-purple-400 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bike-gradient text-white border-0 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all font-bold text-lg rounded-xl flex items-center justify-center gap-2 group" 
                disabled={loading}
              >
                {loading ? (
                  "Verifying Access..."
                ) : (
                  <>
                    Initialize Session <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-6 pt-2 pb-8">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl w-full">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-purple-400 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-purple-300">Demo Testing Protocol</p>
                  <p className="text-neutral-400">UID: demo@example.com</p>
                  <p className="text-neutral-400">KEY: password123</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-center flex items-center justify-center gap-4 w-full">
              <Link href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                New Pilot? Register Here
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <Link href="/" className="text-neutral-500 hover:text-white transition-colors">
                Return to Surface
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Background Decorative Circles */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
