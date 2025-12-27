import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BudgetList } from "./_components/BudgetList";
import { Container } from "@/components/container";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

async function getBudgets() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect("/auth/login");
  }

  const { data: budgets, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching budgets:", error);
    return [];
  }

  return budgets || [];
}

export default async function DashboardPage() {
  const budgets = await getBudgets();

  return (
    <Container className="relative py-8">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="absolute bottom-full">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Budget Manager</h1>
          <p className="text-muted-foreground mt-2">
            Manage your household budget
          </p>
        </div>
      </div>

      <BudgetList budgets={budgets} />
    </Container>
  );
}
