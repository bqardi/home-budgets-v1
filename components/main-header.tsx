import { AuthButton } from "@/components/auth-button";
import { DashboardLink } from "@/components/dashboard-link";
import Link from "next/link";
import { Suspense } from "react";

export function MainHeader() {
  return (
    <header className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"}>Home</Link>
          <Suspense>
            <DashboardLink />
          </Suspense>
        </div>
        <Suspense>
          <AuthButton />
        </Suspense>
      </div>
    </header>
  );
}
