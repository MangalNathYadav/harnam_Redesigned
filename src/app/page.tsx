import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Testimonials from "@/components/Testimonials";
import WhyChooseUs from "@/components/WhyChooseUs";
import AboutBrand from "@/components/AboutBrand";
import ContactSection from "@/components/ContactSection";

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
