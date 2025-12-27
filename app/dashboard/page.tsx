import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/container";
import { BudgetCurrent } from "./_components/BudgetCurrent";
import { CreateBudgetModal } from "../budget/_components/CreateBudgetModal";
import { getSettings } from "@/lib/data/settings";

async function getBudgetData() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect("/auth/login");
  }

  const currentYear = new Date().getFullYear();

  // Fetch budget (including starting_balance)
  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .select("*, starting_balance")
    .eq("year", currentYear)
    .eq("user_id", userData.user.id)
    .single();

  if (budgetError || !budget) {
    return null;
  }

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
    .eq("budget_id", budget.id)
    .eq("user_id", userData.user.id);

  return {
    budget,
    entries: entries || [],
    settings: await getSettings(),
  };
}

export default async function DashboardPage() {
  const budget = await getBudgetData();

  if (!budget) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Budget Overview</h1>
            <p className="text-muted-foreground mt-2">
              Overview of your current budget year
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
          <div>
            <h2 className="text-2xl font-semibold mb-2">No budget yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first budget for {new Date().getFullYear()} to get
              started
            </p>
          </div>
          <CreateBudgetModal />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Budget Overview</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your current budget year
          </p>
        </div>
      </div>

      <BudgetCurrent data={budget} />
    </Container>
  );
}
