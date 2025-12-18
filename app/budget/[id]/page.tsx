import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BudgetTable } from "../_components/BudgetTable";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { Navigation } from "@/components/nav";
import { Footer } from "@/components/footer";

async function getBudgetData(budgetId: string) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect("/auth/login");
  }

  // Fetch budget (including starting_balance)
  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .select("*, starting_balance")
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
    .select(
      `
      id,
      description,
      category_id,
      entry_type,
      created_at,
      entry_amounts (
        id,
        month,
        amount
      )
    `
    )
    .eq("budget_id", budgetId)
    .eq("user_id", userData.user.id);

  // Fetch all budgets for balance transfer
  const { data: allBudgets = [] } = await supabase
    .from("budgets")
    .select("id, name, year")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  return {
    budget,
    categories: categories || [],
    entries: entries || [],
    allBudgets: allBudgets || [],
  };
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
  const { budget, categories, entries, allBudgets } = await getBudgetData(id);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Budgets
          </Button>
        </Link>

        <div className="mb-2 mr-12">
          <h1 className="inline text-3xl font-bold">{budget.name}</h1>
          <p className="inline text-muted-foreground ml-2"> ({budget.year})</p>
        </div>

        {categories.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-900 font-medium mb-2">
              No categories yet. Create one to get started!
            </p>
            <p className="text-blue-700 text-sm">
              Categories help you organize your budget entries.
            </p>
          </div>
        ) : (
          <BudgetTable
            entries={entries}
            categories={categories}
            budgetId={id}
            otherBudgets={allBudgets.filter((b) => b.id !== id)}
            initialStartingBalance={(budget.starting_balance || 0).toString()}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
