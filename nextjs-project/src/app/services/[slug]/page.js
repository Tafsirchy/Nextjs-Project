"use client";

import { motion } from "framer-motion";
import { 
  Bike, Package, Truck, Wrench, ArrowLeft, 
  ShieldCheck, Globe, Zap, CheckCircle2, Star, MapPin,
  Clock, Users, Award, TrendingUp, BarChart3, Settings
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const serviceData = {
  "global-showroom": {
    title: "Global Showroom",
    subtitle: "Discover Premium Collections Worldwide",
    icon: Bike,
    lightBg: "bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50",
    accentColor: "fuchsia",
    accentClass: "text-fuchsia-600",
    bgAccent: "bg-fuchsia-600",
    borderAccent: "border-fuchsia-200",
    layout: "grid", // Grid-based catalog layout
    hero: {
      tagline: "Curated Excellence",
      description: "Browse the world's finest motorcycles from verified dealers and private collections. Every bike comes with complete documentation and authenticity guarantee.",
    },
    stats: [
      { icon: Bike, value: "5,000+", label: "Premium Bikes" },
      { icon: MapPin, value: "120+", label: "Countries" },
      { icon: Award, value: "98%", label: "Customer Satisfaction" },
      { icon: TrendingUp, value: "$2.5M", label: "Average Value" }
    ],
    showcaseItems: [
      { title: "Vintage Classics", desc: "Rare collectibles from 1950-1990", highlight: true },
      { title: "Modern Superbikes", desc: "Latest high-performance machines" },
      { title: "Custom Builds", desc: "One-of-a-kind creations" },
      { title: "Electric Revolution", desc: "Cutting-edge electric models" },
      { title: "Racing Heritage", desc: "Championship-winning bikes" },
      { title: "Limited Editions", desc: "Exclusive numbered releases" }
    ]
  },
  "artifact-custody": {
    title: "Artifact Custody",
    subtitle: "Secure Parts Storage & Authentication",
    icon: Package,
    lightBg: "bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50",
    accentColor: "cyan",
    accentClass: "text-cyan-600",
    bgAccent: "bg-cyan-600",
    borderAccent: "border-cyan-200",
    layout: "timeline", // Timeline-based process layout
    hero: {
      tagline: "Trust Through Transparency",
      description: "Professional cataloging, storage, and verification services for vintage and high-value motorcycle components. Each part tracked with precision.",
    },
    process: [
      { 
        step: "01", 
        title: "Intake & Documentation", 
        desc: "Professional photography, measurements, and condition assessment",
        icon: CheckCircle2 
      },
      { 
        step: "02", 
        title: "Authentication", 
        desc: "Expert verification against manufacturer records and databases",
        icon: ShieldCheck 
      },
      { 
        step: "03", 
        title: "Climate Storage", 
        desc: "Temperature-controlled facilities with 24/7 monitoring",
        icon: Package 
      },
      { 
        step: "04", 
        title: "Secure Delivery", 
        desc: "Insured shipping with signature confirmation and tracking",
        icon: Truck 
      }
    ],
    features: [
      "Blockchain-verified provenance records",
      "Climate-controlled vault storage",
      "Professional restoration coordination",
      "Insurance valuation services"
    ]
  },
  "titanium-forge": {
    title: "Titanium Forge",
    subtitle: "Master Craftsman Workshop Services",
    icon: Wrench,
    lightBg: "bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50",
    accentColor: "purple",
    accentClass: "text-purple-600",
    bgAccent: "bg-purple-600",
    borderAccent: "border-purple-200",
    layout: "workshop", // Workshop sections layout
    hero: {
      tagline: "Engineering Excellence",
      description: "Award-winning modification and restoration services by certified master technicians. Transform your vision into reality with precision craftsmanship.",
    },
    workshops: [
      {
        name: "Performance Division",
        icon: Zap,
        services: ["ECU Tuning & Remapping", "Suspension Upgrades", "Exhaust Systems", "Turbo & Supercharger"],
        highlight: "20+ years experience"
      },
      {
        name: "Restoration Studio",
        icon: Award,
        services: ["Frame-up Restorations", "Paint & Bodywork", "Engine Rebuilds", "Historical Accuracy"],
        highlight: "Concours-winning results"
      },
      {
        name: "Custom Fabrication",
        icon: Settings,
        services: ["Custom Frames", "One-off Parts", "3D Printing", "Carbon Fiber Work"],
        highlight: "Unlimited possibilities"
      }
    ],
    certifications: ["ASE Master Certified", "Manufacturer Trained", "Dyno Testing Facility", "Insurance Approved"]
  },
  "stealth-logistics": {
    title: "Stealth Logistics",
    subtitle: "Global Motorcycle Transport Solutions",
    icon: Truck,
    lightBg: "bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50",
    accentColor: "blue",
    accentClass: "text-blue-600",
    bgAccent: "bg-blue-600",
    borderAccent: "border-blue-200",
    layout: "routes", // Route/map-based layout
    hero: {
      tagline: "Worldwide Delivery Network",
      description: "Professional motorcycle transport with real-time tracking, insurance coverage, and white-glove handling. Door-to-door service across 150+ countries.",
    },
    routes: [
      { from: "North America", to: "Europe", duration: "5-7 days", icon: Globe },
      { from: "Asia Pacific", to: "Americas", duration: "10-14 days", icon: Globe },
      { from: "Europe", to: "Middle East", duration: "3-5 days", icon: Globe },
      { from: "Domestic USA", to: "Same Country", duration: "2-4 days", icon: MapPin }
    ],
    services: [
      { title: "Enclosed Transport", icon: ShieldCheck, desc: "Climate-controlled trailers" },
      { title: "Real-Time GPS", icon: MapPin, desc: "Track your shipment 24/7" },
      { title: "Full Insurance", icon: Award, desc: "Up to $500k coverage" },
      { title: "Customs Handling", icon: CheckCircle2, desc: "Complete documentation" }
    ],
    guarantee: "On-time delivery or your money back"
  }
};

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    if (slug && serviceData[slug]) {
      setActiveService(serviceData[slug]);
    }
  }, [slug]);

  if (!activeService) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-900 text-xl font-semibold">Loading...</div>
    </div>
  );

  const Icon = activeService.icon;

  // Render different layouts based on service type
  const renderLayout = () => {
    switch(activeService.layout) {
      case "grid":
        return <GridLayout service={activeService} Icon={Icon} />;
      case "timeline":
        return <TimelineLayout service={activeService} Icon={Icon} />;
      case "workshop":
        return <WorkshopLayout service={activeService} Icon={Icon} />;
      case "routes":
        return <RoutesLayout service={activeService} Icon={Icon} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${activeService.lightBg} text-gray-900`}>
      {/* Header */}
      <header className="relative pt-24 pb-16 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">Back to Home</span>
          </Link>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className={`p-3 rounded-2xl ${activeService.bgAccent} text-white`}>
                <Icon className="h-8 w-8" />
              </div>
              <div className={`px-4 py-1 rounded-full border-2 ${activeService.borderAccent} ${activeService.accentClass} text-xs font-bold uppercase tracking-wider`}>
                {activeService.hero.tagline}
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight mb-4"
            >
              {activeService.title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed"
            >
              {activeService.subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-700 mt-6 leading-relaxed max-w-3xl"
            >
              {activeService.hero.description}
            </motion.p>
          </div>
        </div>
      </header>

      {/* Main Content - Dynamic Layout */}
      <main className="relative">
        {renderLayout()}
      </main>

      {/* CTA Footer */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our complete inventory and discover the perfect motorcycle for you.
          </p>
          <Link href="/bikes" className={`inline-flex items-center gap-3 ${activeService.bgAccent} text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}>
            Browse Collection
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// Grid Layout for Global Showroom
function GridLayout({ service, Icon }) {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {service.stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-6 text-center shadow-lg border-2 border-gray-100"
              >
                <StatIcon className={`h-8 w-8 ${service.accentClass} mx-auto mb-3`} />
                <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Showcase Grid */}
        <h3 className="text-3xl font-black mb-10 text-gray-900">Our Collections</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {service.showcaseItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className={`relative p-8 rounded-3xl ${item.highlight ? `${service.bgAccent} text-white` : 'bg-white border-2 border-gray-100'} shadow-lg hover:shadow-2xl transition-all group cursor-pointer`}
            >
              <Star className={`h-6 w-6 mb-4 ${item.highlight ? 'text-white' : service.accentClass}`} />
              <h4 className={`text-xl font-bold mb-2 ${item.highlight ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
              <p className={`text-sm ${item.highlight ? 'text-white/90' : 'text-gray-600'}`}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Timeline Layout for Artifact Custody
function TimelineLayout({ service, Icon }) {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-black mb-16 text-center text-gray-900">Our Process</h3>
        
        {/* Vertical Timeline */}
        <div className="max-w-4xl mx-auto">
          {service.process.map((item, idx) => {
            const StepIcon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="relative flex gap-8 mb-12 last:mb-0"
              >
                {/* Timeline Line */}
                {idx !== service.process.length - 1 && (
                  <div className={`absolute left-[52px] top-[80px] w-0.5 h-full ${service.bgAccent} opacity-20`} />
                )}
                
                {/* Step Number Circle */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-24 h-24 rounded-full ${service.bgAccent} text-white flex items-center justify-center text-2xl font-black shadow-lg`}>
                    {item.step}
                  </div>
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:shadow-2xl transition-shadow">
                  <StepIcon className={`h-8 w-8 ${service.accentClass} mb-4`} />
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Features List */}
        <div className="mt-20 max-w-3xl mx-auto bg-white rounded-3xl p-10 shadow-lg border-2 border-gray-100">
          <h4 className="text-2xl font-black mb-6 text-gray-900">Included Services</h4>
          <ul className="space-y-4">
            {service.features.map((feature, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className={`h-6 w-6 ${service.accentClass} flex-shrink-0 mt-0.5`} />
                <span className="text-gray-700 text-lg">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Workshop Layout for Titanium Forge
function WorkshopLayout({ service, Icon }) {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-black mb-16 text-center text-gray-900">Our Workshops</h3>
        
        {/* Workshop Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {service.workshops.map((workshop, idx) => {
            const WorkshopIcon = workshop.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:shadow-2xl transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl ${service.bgAccent} text-white flex items-center justify-center mb-6`}>
                  <WorkshopIcon className="h-8 w-8" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">{workshop.name}</h4>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${service.accentClass} bg-gray-50 mb-6`}>
                  {workshop.highlight}
                </div>
                <ul className="space-y-3">
                  {workshop.services.map((svc, sidx) => (
                    <li key={sidx} className="flex items-start gap-2">
                      <CheckCircle2 className={`h-5 w-5 ${service.accentClass} flex-shrink-0 mt-0.5`} />
                      <span className="text-gray-600">{svc}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Certifications */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 shadow-lg border-2 border-gray-100">
          <h4 className="text-2xl font-black mb-6 text-gray-900 text-center">Certifications & Standards</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {service.certifications.map((cert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm"
              >
                <Award className={`h-6 w-6 ${service.accentClass}`} />
                <span className="font-semibold text-gray-700">{cert}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Routes Layout for Stealth Logistics
function RoutesLayout({ service, Icon }) {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Popular Routes */}
        <h3 className="text-3xl font-black mb-12 text-center text-gray-900">Popular Shipping Routes</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-20 max-w-5xl mx-auto">
          {service.routes.map((route, idx) => {
            const RouteIcon = route.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:shadow-2xl transition-all"
              >
                <RouteIcon className={`h-10 w-10 ${service.accentClass} mb-4`} />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-gray-900">{route.from}</span>
                  <ArrowLeft className={`h-5 w-5 ${service.accentClass} rotate-180`} />
                  <span className="text-lg font-bold text-gray-900">{route.to}</span>
                </div>
                <div className={`text-sm font-semibold ${service.accentClass} flex items-center gap-2`}>
                  <Clock className="h-4 w-4" />
                  {route.duration}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Services Grid */}
        <h3 className="text-3xl font-black mb-12 text-center text-gray-900">Service Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {service.services.map((svc, idx) => {
            const SvcIcon = svc.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 text-center"
              >
                <div className={`w-14 h-14 rounded-full ${service.bgAccent} text-white flex items-center justify-center mx-auto mb-4`}>
                  <SvcIcon className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{svc.title}</h4>
                <p className="text-sm text-gray-600">{svc.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className={`${service.bgAccent} text-white rounded-3xl p-10 text-center shadow-2xl max-w-3xl mx-auto`}>
          <ShieldCheck className="h-16 w-16 mx-auto mb-4" />
          <h4 className="text-3xl font-black mb-3">Our Guarantee</h4>
          <p className="text-xl font-medium opacity-95">{service.guarantee}</p>
        </div>
      </div>
    </div>
  );
}
