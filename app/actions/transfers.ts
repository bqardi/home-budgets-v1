"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function transferRowsFromBudget(
  targetBudgetId: string,
  sourceBudgetId: string,
  includeBalance: boolean,
  includeIncome: boolean,
  includeExpense: boolean
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  // Transfer entries by type
  if (includeIncome || includeExpense) {
    try {
      // Build query based on what types to transfer
      let query = supabase
        .from("entries")
        .select(
          `
          id,
          description,
          category_id,
          entry_type,
          entry_amounts (*)
        `
        )
        .eq("budget_id", sourceBudgetId)
        .eq("user_id", user.id);

      // Filter by entry types
      if (includeIncome && !includeExpense) {
        query = query.eq("entry_type", "income");
      } else if (includeExpense && !includeIncome) {
        query = query.eq("entry_type", "expense");
      }

      const { data: entriesToCopy, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Create new entries in target budget
      for (const sourceEntry of entriesToCopy || []) {
        const { data: newEntry, error: createError } = await supabase
          .from("entries")
          .insert({
            user_id: user.id,
            budget_id: targetBudgetId,
            category_id: sourceEntry.category_id,
            description: sourceEntry.description,
            entry_type: sourceEntry.entry_type,
          })
          .select("id")
          .single();

        if (createError) throw createError;

        // Copy entry amounts
        const newAmounts = (sourceEntry.entry_amounts || []).map(
          (ea: { month: string; amount: number }) => ({
            entry_id: newEntry.id,
            month: ea.month,
            amount: ea.amount,
          })
        );

        if (newAmounts.length > 0) {
          const { error: amountsError } = await supabase
            .from("entry_amounts")
            .insert(newAmounts);

          if (amountsError) throw amountsError;
        }
      }
    } catch (error) {
      console.error("Failed to transfer rows:", error);
      throw new Error("Failed to transfer rows");
    }
  }

  // If including balance, transfer the source budget's end_balance as the target's starting_balance
  if (includeBalance) {
    try {
      // Fetch the source budget's end_balance
      const { data: sourceBudget, error: budgetError } = await supabase
        .from("budgets")
        .select("end_balance")
        .eq("id", sourceBudgetId)
        .eq("user_id", user.id)
        .single();

      if (budgetError) throw budgetError;

      // Update the target budget's starting_balance with source's end_balance
      const { error: updateError } = await supabase
        .from("budgets")
        .update({ starting_balance: sourceBudget.end_balance || 0 })
        .eq("id", targetBudgetId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Failed to transfer balance:", error);
      throw new Error("Failed to transfer balance");
    }
  }

  revalidatePath(`/budget/${targetBudgetId}`);
  return { success: true };
}
