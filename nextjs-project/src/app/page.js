import Hero from "@/components/landing/Hero";
import PromoSlider from "@/components/landing/PromoSlider";
import Features from "@/components/landing/Features";
import Services from "@/components/landing/Services";
import Statistics from "@/components/landing/Statistics";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CallToAction from "@/components/landing/CallToAction";

export default function Home() {
  return (
    <div>
      <Hero />
      <PromoSlider />
      <Features />
      <Services />
      <Statistics />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
