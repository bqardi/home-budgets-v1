import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 border-t">
      <div className="rounded-2xl p-12 border border-landing-accent-blue/20 bg-landing-accent-blue/5 dark:bg-landing-accent-blue/10">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold text-foreground">
            Start Managing Your Budget Today
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join thousands of families taking control of their finances. Create
            your free account and start budgeting in minutes.
          </p>
          <Button
            asChild
            size="lg"
            className="text-base bg-landing-accent-blue hover:bg-landing-accent-blue/90 text-white font-semibold"
          >
            <Link href="/auth/sign-up">Create Free Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
