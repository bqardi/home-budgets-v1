import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BudgetList } from "./_components/BudgetList";
import { CreateBudgetModal } from "./_components/CreateBudgetModal";
import { Navigation } from "@/components/nav";
import { Footer } from "@/components/footer";

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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="md:max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Budget Manager</h1>
            <p className="text-muted-foreground mt-2">
              Manage your household budget
            </p>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <CreateBudgetModal />
        </div>

        <BudgetList budgets={budgets} />
      </div>

      <Footer />
    </div>
  );
}
