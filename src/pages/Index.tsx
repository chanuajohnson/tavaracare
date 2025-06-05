
import { Hero } from "@/components/marketing/Hero";
import { Benefits } from "@/components/marketing/Benefits";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CTA } from "@/components/marketing/CTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Benefits />
      <Testimonials />
      <CTA />
    </div>
  );
};

export default Index;
