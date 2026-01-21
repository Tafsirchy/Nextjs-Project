import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter, Syncopate } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syncopate = Syncopate({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-syncopate",
  display: "swap",
});

export const metadata = {
  title: "MotruBi - Premium Motorcycles",
  description: "Discover premium motorcycles for every adventure. From sport bikes to cruisers, find your perfect ride.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${syncopate.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <SmoothScroll>
          <Providers>
            <Navbar />
            <div className="flex-1 flex flex-col pt-16">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  );
}
