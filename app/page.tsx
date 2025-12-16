import { MainHeader } from "@/components/main-header";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <MainHeader />
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <main className="w-full">
            <HeroSection />
            <FeaturesSection />
            <CTASection />
          </main>
        </div>

        <Footer />
      </div>
    </main>
  );
}
