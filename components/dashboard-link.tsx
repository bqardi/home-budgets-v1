import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function DashboardLink() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return null;
  }

  return <Link href={"/dashboard"}>Dashboard</Link>;
}
