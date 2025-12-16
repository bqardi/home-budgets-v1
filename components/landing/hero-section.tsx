import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="py-20">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Take Control of Your Home Budget
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your household finances like a pro. Track income and
            expenses, visualize spending patterns, and plan your budget with
            ease.
          </p>
        </div>

        <div className="flex gap-6 justify-center pt-6">
          <Button
            asChild
            size="lg"
            className="text-base bg-landing-accent-blue hover:bg-landing-accent-blue/90 text-white"
          >
            <Link href="/auth/sign-up">Get Started Free</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-base border-landing-accent-blue text-landing-accent-blue hover:bg-landing-accent-blue hover:text-white"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
