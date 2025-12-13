"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateStartingBalance(
  budgetId: string,
  startingBalance: number
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("budgets")
    .update({ starting_balance: startingBalance })
    .eq("id", budgetId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/budget/${budgetId}`);
  return true;
}
