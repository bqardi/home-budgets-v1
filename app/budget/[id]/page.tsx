import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { ContentWrapper } from "../_components/ContentWrapper";
import { Container } from "@/components/container";
import { LoadingSpinner } from "@/components/loading-spinner";

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
    <Suspense fallback={<LoadingSpinner message="Loading budget..." />}>
      <BudgetPageContent id={id} />
    </Suspense>
  );
}

async function BudgetPageContent({ id }: { id: string }) {
  const { budget, categories, entries, allBudgets } = await getBudgetData(id);

  return (
    <Container className="relative py-8">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="absolute bottom-full">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Budgets
        </Button>
      </Link>

      <div className="mb-2 mr-12">
        <h1 className="inline text-3xl font-bold">{budget.name}</h1>
        <p className="inline text-muted-foreground ml-2"> ({budget.year})</p>
      </div>

      <ContentWrapper
        entries={entries}
        categories={categories}
        budgetId={id}
        otherBudgets={allBudgets.filter((b) => b.id !== id)}
        initialStartingBalance={(budget.starting_balance || 0).toString()}
      />
    </Container>
  );
}
