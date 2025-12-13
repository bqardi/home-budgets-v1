import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BudgetTable } from "../_components/BudgetTable";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

async function getBudgetData(budgetId: string) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect("/auth/login");
  }

  // Fetch budget
  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", budgetId)
    .eq("user_id", userData.user.id)
    .single();

  if (budgetError || !budget) {
    redirect("/dashboard");
  }

  // Fetch categories
  const { data: categories = [] } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("sort_order");

  // Fetch entries
  const { data: entries = [] } = await supabase
    .from("entries")
    .select("*")
    .eq("budget_id", budgetId)
    .eq("user_id", userData.user.id);

  return { budget, categories: categories || [], entries: entries || [] };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BudgetPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BudgetPageContent id={id} />
    </Suspense>
  );
}

async function BudgetPageContent({ id }: { id: string }) {
  const { budget, categories, entries } = await getBudgetData(id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Budgets
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">{budget.name}</h1>
          {budget.start_date && budget.end_date && (
            <p className="text-muted-foreground mt-2">
              {new Date(budget.start_date).toLocaleDateString()} –{" "}
              {new Date(budget.end_date).toLocaleDateString()}
            </p>
          )}
        </div>

        <BudgetTable entries={entries} categories={categories} budgetId={id} />
      </div>
    </div>
  );
}
