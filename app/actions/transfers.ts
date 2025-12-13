"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface EntryWithAmounts {
  entry_type: string;
  entry_amounts: Array<{ amount: number }>;
}

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
        const newAmounts = (sourceEntry.entry_amounts || []).map((ea: { month: string; amount: number }) => ({
          entry_id: newEntry.id,
          month: ea.month,
          amount: ea.amount,
        }));

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

  // If including balance, calculate and return it (user will manually set it in the UI)
  // We don't store starting_balance in the database, it's managed client-side
  let balanceToTransfer = null;
  if (includeBalance) {
    try {
      // Fetch all entries for the source budget
      const { data: allEntries, error: entriesError } = await supabase
        .from("entries")
        .select(
          `
          id,
          entry_type,
          entry_amounts (*)
        `
        )
        .eq("budget_id", sourceBudgetId)
        .eq("user_id", user.id);

      if (entriesError) throw entriesError;

      console.log("[transfers.ts] allEntries:", allEntries);

      // Calculate balance
      let totalBalance = 0;
      allEntries?.forEach((entry: EntryWithAmounts) => {
        const entryTotal = (entry.entry_amounts || []).reduce(
          (sum: number, ea: { amount: number }) => sum + (ea.amount || 0),
          0
        );
        if (entry.entry_type === "income") {
          totalBalance += entryTotal;
        } else {
          totalBalance -= entryTotal;
        }
      });

      console.log("[transfers.ts] Calculated balanceToTransfer:", totalBalance);
      balanceToTransfer = totalBalance;
    } catch (error) {
      console.error("Failed to calculate balance:", error);
      throw new Error("Failed to calculate balance");
    }
  }

  revalidatePath(`/budget/${targetBudgetId}`);
  return { success: true, balanceToTransfer };
}
