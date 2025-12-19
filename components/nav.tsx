"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="bg-background">
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg">
            Home Budget
          </Link>

          <div className="flex items-center gap-4">
            {navItems.map(({ href, label, icon: Icon }) =>
              pathname === href ? (
                <div
                  key={href}
                  className="flex items-center gap-2 text-sm font-medium text-primary cursor-default opacity-100"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary/75 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px]">
          <div className="flex flex-col gap-6 mt-8">
            <Link
              href="/"
              className="font-bold text-lg"
              onClick={() => setIsOpen(false)}
            >
              Home Budget
            </Link>
            <nav className="flex flex-col gap-3">
              {navItems.map(({ href, label, icon: Icon }) =>
                pathname === href ? (
                  <div
                    key={href}
                    className="flex items-center gap-2 text-sm font-medium text-primary cursor-default opacity-100 px-2 py-2"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary/75 transition-colors px-2 py-2 rounded-md hover:bg-muted"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                )
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
