import { AuthButton } from "@/components/auth-button";
import { Suspense } from "react";
import { Navigation } from "./nav";
import { Container } from "./container";
import { getAuthUserClaims } from "@/lib/auth/getUser";
import { Logo } from "./logo";
import Link from "next/link";

export async function Header() {
  const claims = await getAuthUserClaims();
  const isLoggedIn = !!claims;

  return (
    <header className="w-full flex justify-center gap-8 border-b border-b-foreground/10 h-16 bg-background sticky top-0 z-50">
      <Container className="grid grid-cols-[1fr_2fr_1fr] md:flex md:justify-between items-center px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Suspense>
            <Navigation isLoggedIn={isLoggedIn} />
          </Suspense>
        </div>
        <Link
          href="/"
          className="justify-self-center flex gap-2 items-center text-lg font-semibold md:hidden"
        >
          <Logo />
          <span className="max-xxs:hidden">Home Budget</span>
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
