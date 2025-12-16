import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface EntryAmount {
  amount: number;
}

interface Entry {
  id: string;
  entry_type: "income" | "expense";
  entry_amounts: EntryAmount[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const budgetId = (await params).id;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all entries with amounts for the budget
    const { data: entries, error: entriesError } = await supabase
      .from("entries")
      .select(
        `
        id,
        entry_type,
        entry_amounts (
          amount
        )
      `
      )
      .eq("budget_id", budgetId)
      .eq("user_id", user.id);

    if (entriesError) {
      throw new Error(entriesError.message);
    }

    // Fetch the budget's starting_balance
    const { data: budget, error: budgetError } = await supabase
      .from("budgets")
      .select("starting_balance")
      .eq("id", budgetId)
      .eq("user_id", user.id)
      .single();

    if (budgetError) {
      throw new Error(budgetError.message);
    }

    // Calculate total balance (sum of income - sum of expenses)
    let totalBalance = 0;

    entries.forEach((entry: Entry) => {
      const entryTotal = (entry.entry_amounts || []).reduce(
        (sum: number, amount: EntryAmount) => sum + amount.amount,
        0
      );

      if (entry.entry_type === "income") {
        totalBalance += entryTotal;
      } else if (entry.entry_type === "expense") {
        totalBalance -= entryTotal;
      }
    });

    return NextResponse.json({
      balance: totalBalance,
      starting_balance: budget.starting_balance || 0,
    });
  } catch (error) {
    console.error("Failed to fetch budget balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}
