"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { revalidateAuthLayout } from "@/app/actions/auth";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await revalidateAuthLayout();
    router.push("/auth/login");
  };

  return (
    <Button variant="outline" onClick={logout}>
      <LogOut className="h-4 w-4" />
      <span className="ml-2 max-md:sr-only">Logout</span>
    </Button>
  );
}
