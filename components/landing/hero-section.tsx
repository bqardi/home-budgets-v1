import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAuthUserClaims } from "@/lib/auth/getUser";
import { LayoutDashboard } from "lucide-react";

export async function HeroSection() {
  const user = await getAuthUserClaims();
  const isLoggedIn = !!user;

  return (
    <section className="pb-12">
      {isLoggedIn ? (
        <div className="text-center space-y-8">
          <div className="flex justify-center items-center gap-4 pb-8">
            <span className="md:hidden text-xl">Hey, {user.email}!</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              Take Control of Your Home Budget
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your household finances like a pro. Track income and
              expenses, visualize spending patterns, and plan your budget with
              ease.
            </p>
            <div className="flex justify-center items-center gap-4">
              <Link href="/dashboard">
                <Button variant="default" size="lg" className="mb-6">
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Go to your dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </section>
  );
}
