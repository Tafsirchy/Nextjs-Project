"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "./ui/button";
import { Menu, X, Bike, LogIn, LogOut, ShoppingCart, Heart, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import { Logo } from "./ui/Logo";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/bikes", label: "Bikes" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all relative py-1 px-1 ${
                  isActive(link.href)
                    ? "text-purple-600"
                    : "text-[#000080] hover:text-blue-700"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.8)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            ))}
            
            {session ? (
              <>
                {['admin', 'merchandiser', 'dealer'].includes(session.user.role) && (
                  <Link
                    href="/add-bike"
                    className={`text-sm font-medium transition-all relative py-1 px-1 ${
                      isActive("/add-bike")
                        ? "text-purple-600"
                        : "text-[#000080] hover:text-blue-700"
                    }`}
                  >
                    Add Bike
                    {isActive("/add-bike") && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                      />
                    )}
                  </Link>
                )}

                <Link
                  href="/my-orders"
                  className={`text-sm font-medium transition-all relative py-1 px-1 ${
                    isActive("/my-orders")
                      ? "text-purple-600"
                      : "text-[#000080] hover:text-blue-700"
                  }`}
                >
                  My Orders
                  {isActive("/my-orders") && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                    />
                  )}
                </Link>

                <div className="flex items-center space-x-4">
                  <Link
                    href="/wishlist"
                    className={`relative py-1 px-1 transition-all ${
                      isActive('/wishlist')
                        ? "text-purple-600"
                        : "text-[#000030] hover:text-blue-700"
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                    {isActive('/wishlist') && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                      />
                    )}
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/cart"
                    className={`relative py-1 px-1 transition-all ${
                      isActive('/cart')
                        ? "text-purple-600"
                        : "text-[#000080] hover:text-blue-700"
                    }`}
                    title="Shopping Cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {isActive('/cart') && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                      />
                    )}
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold border border-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/dashboard"
                    className={`relative py-1 px-1 transition-all ${
                      isActive('/dashboard')
                        ? "text-purple-600"
                        : "text-[#000080] hover:text-blue-700"
                    }`}
                    title="Dashboard"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    {isActive('/dashboard') && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                      />
                    )}
                  </Link>
                </div>
                
                <div className="flex items-center space-x-3 border-l pl-4 ml-2">
                  <span className="text-sm text-[#000080] font-medium">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="gap-2 border-[#000080] text-[#000080] hover:bg-[#000080] hover:text-white font-medium text-xs transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/signup">
                  <Button variant="link" size="sm" className="text-[#000080] hover:text-blue-700 font-medium text-xs p-0 mr-2">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="link" size="sm" className="gap-2 text-[#000080] hover:text-blue-700 font-medium text-xs p-0">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-[#000080]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-16 right-4 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-purple-50 text-purple-700 font-bold"
                    : "text-[#000080] hover:bg-gray-100 hover:text-blue-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {session ? (
              <>
                {['admin', 'merchandiser', 'dealer'].includes(session.user.role) && (
                  <Link
                    href="/add-bike"
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive("/add-bike")
                        ? "bg-purple-50 text-purple-700 font-bold"
                        : "text-[#000080] hover:bg-gray-100 hover:text-blue-700"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Add Bike
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "bg-purple-50 text-purple-700 font-bold"
                      : "text-[#000080] hover:bg-gray-100 hover:text-blue-700"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/wishlist"
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/wishlist")
                      ? "bg-purple-50 text-purple-700 font-bold"
                      : "text-[#000080] hover:bg-gray-100 hover:text-blue-700"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist ({wishlistCount})
                </Link>
                <Link
                  href="/cart"
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/cart")
                      ? "bg-purple-50 text-purple-700 font-bold"
                      : "text-[#000080] hover:bg-gray-100 hover:text-blue-700"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shopping Cart ({cartCount})
                </Link>
                <div className="pt-2 space-y-2">
                  <p className="px-3 text-xs text-gray-500 font-medium truncate">
                    {session.user?.email}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full gap-2 border-white/20 text-[#000080] hover:bg-blue-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-white/20 text-[#000080] hover:bg-blue-50">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full gap-2 bg-[#000080] text-white hover:bg-blue-900">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
