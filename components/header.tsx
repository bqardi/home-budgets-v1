import { AuthButton } from "@/components/auth-button";
import { Suspense } from "react";
import { Navigation } from "./nav";
import { Container } from "./container";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full flex justify-center gap-8 border-b border-b-foreground/10 h-16 bg-background sticky top-0 z-50">
      <Container className="grid grid-cols-[1fr_2fr_1fr] md:flex md:justify-between items-center px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Suspense>
            <Navigation />
          </Suspense>
        </div>
        <Link
          href="/"
          className="justify-self-center md:hidden font-bold text-lg"
        >
          Home Budget
        </Link>
        <div className="justify-self-end">
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
