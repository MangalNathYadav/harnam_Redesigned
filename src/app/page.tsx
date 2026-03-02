import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";

const Testimonials = dynamic(() => import("@/components/Testimonials"));
const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"));
const AboutBrand = dynamic(() => import("@/components/AboutBrand"));
const ContactSection = dynamic(() => import("@/components/ContactSection"));

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50/30 overflow-x-hidden">
      <Hero />
      <FeaturedProducts />
      <Testimonials />
      <WhyChooseUs />
      <AboutBrand />
      <ContactSection />
    </main>
  );
}
