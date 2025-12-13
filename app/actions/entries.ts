"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEntry(
  budgetId: string,
  categoryId: string,
  description: string,
  amount: number,
  entryDate: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("entries")
    .insert({
      user_id: user.id,
      budget_id: budgetId,
      category_id: categoryId,
      description,
      amount,
      entry_date: entryDate,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/budget/${budgetId}`);
  return data;
}

export async function updateEntry(
  entryId: string,
  budgetId: string,
  updates: {
    description?: string;
    amount?: number;
    category_id?: string;
    entry_date?: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("entries")
    .update(updates)
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
