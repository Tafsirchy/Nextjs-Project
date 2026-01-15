"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { Logo } from "./ui/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/40 backdrop-blur-2xl border-t border-white/20 text-slate-900 mt-20">
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Link href="/" className="flex items-center mb-4 text-slate-900">
              <Logo />
            </Link>
            <p className="text-slate-600 text-sm mb-4">
              Premium motorcycles for the thrill seekers. Experience the freedom of the open road.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" }
              ].map((social, i) => (
                <motion.a 
                  key={i}
                  href={social.href} 
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="text-slate-400 hover:text-purple-600 transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h3 className="font-bold text-slate-800 text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: "Browse Bikes", href: "/bikes" },
                { label: "Login", href: "/login" },
                { label: "Add Bike", href: "/add-bike" },
                { label: "About Us", href: "#" }
              ].map((link, i) => (
                <li key={i}>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link 
                      href={link.href}
                      className="text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium inline-block"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h3 className="font-bold text-slate-800 text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              {["Sport Bikes", "Cruisers", "Adventure", "Electric"].map((cat, i) => (
                <li key={i}>
                  <motion.div whileHover={{ x: 5 }}>
                    <a 
                      href="#" 
                      className="text-slate-600 hover:text-purple-600 transition-colors text-sm font-medium inline-block"
                    >
                      {cat}
                    </a>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <h3 className="font-bold text-slate-800 text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: "123 Bike Street, Motor City, MC 12345" },
                { icon: Phone, text: "+1 (555) 123-4567" },
                { icon: Mail, text: "info@motrubi.com" }
              ].map((item, i) => (
                <motion.li 
                  key={i} 
                  whileHover={{ x: 3 }}
                  className="flex items-start space-x-2 text-sm text-slate-600 cursor-default"
                >
                  <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-purple-600" />
                  <span>{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {currentYear} MotruBi. All rights reserved. Built with Next.js 16</p>
        </div>
      </div>
    </footer>
  );
}
