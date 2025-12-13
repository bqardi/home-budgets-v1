"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEntry(
  budgetId: string,
  categoryId: string,
  description: string,
  monthlyAmounts: Record<number, number> // { 1: 100, 2: 150, ... }
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  // Create the entry first
  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({
      user_id: user.id,
      budget_id: budgetId,
      category_id: categoryId,
      description,
    })
    .select("id")
    .single();

  if (entryError) throw new Error(entryError.message);

  // Insert monthly amounts (12 rows)
  const amounts = Array.from({ length: 12 }, (_, i) => ({
    entry_id: entry.id,
    month: i + 1,
    amount: monthlyAmounts[i + 1] || 0,
  }));

  const { error: amountsError } = await supabase
    .from("entry_amounts")
    .insert(amounts);

  if (amountsError) throw new Error(amountsError.message);

  revalidatePath(`/budget/${budgetId}`);
  return entry;
}

export async function updateEntryAmount(
  entryAmountId: string,
  budgetId: string,
  amount: number
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("entry_amounts")
    .update({ amount })
    .eq("id", entryAmountId);

  if (error) throw new Error(error.message);

  revalidatePath(`/budget/${budgetId}`);
}

export async function updateEntryDescription(
  entryId: string,
  budgetId: string,
  description: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("entries")
    .update({ description })
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/budget/${budgetId}`);
}

export async function deleteEntry(entryId: string, budgetId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/budget/${budgetId}`);
}

export async function createCategory(name: string, sortOrder?: number) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name,
      sort_order: sortOrder || 0,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return data;
}
