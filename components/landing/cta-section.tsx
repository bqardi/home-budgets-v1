import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 border-t">
      <div className="text-center space-y-8">
        <h2 className="text-3xl font-bold">Start Managing Your Budget Today</h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Join thousands of families taking control of their finances. Create
          your free account and start budgeting in minutes.
        </p>
        <Button asChild size="lg" className="text-base">
          <Link href="/auth/sign-up">Create Free Account</Link>
        </Button>
      </div>
    </section>
  );
}
