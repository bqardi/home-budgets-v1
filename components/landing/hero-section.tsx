import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex flex-col gap-10 py-20">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Take Control of Your Home Budget
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Manage your household finances like a pro. Track income and expenses,
          visualize spending patterns, and plan your budget with ease.
        </p>
        <div className="flex gap-6 justify-center pt-6">
          <Button asChild size="lg" className="text-base">
            <Link href="/auth/sign-up">Get Started Free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
