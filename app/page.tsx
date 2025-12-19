import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CTASection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
      <main className="w-full">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
    </div>
  );
}
