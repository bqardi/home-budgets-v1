import Link from "next/link";
import { BarChart3, PieChart, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="flex flex-col gap-10 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            Take Control of Your Home Budget
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your household finances like a pro. Track income and
            expenses, visualize spending patterns, and plan your budget with
            ease.
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

      {/* Features Section */}
      <section className="py-24 border-t">
        <h2 className="text-3xl font-bold text-center mb-16">
          Powerful Features for Smart Budgeting
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Feature 1 */}
          <div className="flex gap-6">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Excel-Like Interface</h3>
              <p className="text-muted-foreground">
                Familiar spreadsheet view for your monthly budget. Quickly see
                all your income and expenses in one place.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-6">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Smart Categorization</h3>
              <p className="text-muted-foreground">
                Organize your budget with custom categories. See exactly where
                your money goes each month.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-6">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Recurring Patterns</h3>
              <p className="text-muted-foreground">
                Set up monthly, quarterly, or yearly expenses. Automatically
                distribute amounts across months.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex gap-6">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your data is encrypted and only accessible to you. No ads, no
                tracking, just your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold">
            Start Managing Your Budget Today
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join thousands of families taking control of their finances. Create
            your free account and start budgeting in minutes.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link href="/auth/sign-up">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
