"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Budget, Entry } from "@/lib/types/database";

export async function getExistingCategories() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  return (data || []).map((cat) => cat.name);
}

export async function getBudgetDataForMonth(
  budgetId: string,
  year: number,
  month: number
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  // Check if budget exists for this year
  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .select("id, name, year, starting_balance")
    .eq("id", budgetId)
    .eq("user_id", user.id)
    .eq("year", year)
    .single();

  if (budgetError || !budget) {
    return null; // No data for this year
  }

  // Fetch entries for this month
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
    .eq("user_id", user.id);

  return {
    budget,
    entries: entries || [],
  };
}

export async function createEntry(
  budgetId: string,
  categoryId: string,
  description: string,
  monthlyAmounts: Record<number, number>, // { 1: 100, 2: 150, ... }
  entryType: "income" | "expense" = "expense"
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
      entry_type: entryType,
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

export async function updateEntryAmountsBulk(
  budgetId: string,
  updates: Array<{ id: string; amount: number }>
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  // Update all amounts in a single batch
  for (const update of updates) {
    const { error } = await supabase
      .from("entry_amounts")
      .update({ amount: update.amount })
      .eq("id", update.id);

    if (error) throw new Error(error.message);
  }

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
export async function updateEntryType(
  entryId: string,
  budgetId: string,
  entryType: "income" | "expense"
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("entries")
    .update({ entry_type: entryType })
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/budget/${budgetId}`);
  return true;
}

export async function createCategoriesBatch(names: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  if (names.length === 0) return [];

  const { data, error } = await supabase
    .from("categories")
    .insert(
      names.map((name) => ({
        user_id: user.id,
        name,
        sort_order: 0,
      }))
    )
    .select("id, name");

  if (error) throw new Error(error.message);

  return data || [];
}

export interface ParsedCSVRow {
  description: string;
  category: string;
  type: "income" | "expense";
  monthlyAmounts: Record<number, number>;
}

export async function importBudgetFromCSV(
  budgetId: string,
  csvRows: ParsedCSVRow[],
  newCategoryNames: string[] = []
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  // Get all categories (existing + newly created)
  const { data: allCategories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);

  if (categoriesError) throw new Error(categoriesError.message);

  // Build map of category name to ID (existing categories)
  const categoryIdMap: Record<string, string> = {};
  (allCategories || []).forEach((cat) => {
    categoryIdMap[cat.name] = cat.id;
  });

  // Create any missing categories
  if (newCategoryNames.length > 0) {
    const createdCategories = await createCategoriesBatch(newCategoryNames);
    createdCategories.forEach((cat) => {
      categoryIdMap[cat.name] = cat.id;
    });
  }

  for (const row of csvRows) {
    const categoryId = categoryIdMap[row.category];
    if (!categoryId) {
      throw new Error(`Category '${row.category}' not found`);
    }

    const { data: entry, error: entryError } = await supabase
      .from("entries")
      .insert({
        user_id: user.id,
        budget_id: budgetId,
        category_id: categoryId,
        description: row.description,
        entry_type: row.type,
      })
      .select("id")
      .single();

    if (entryError) throw new Error(entryError.message);

    const amounts = Array.from({ length: 12 }, (_, i) => ({
      entry_id: entry.id,
      month: i + 1,
      amount: row.monthlyAmounts[i + 1] || 0,
    }));

    const { error: amountsError } = await supabase
      .from("entry_amounts")
      .insert(amounts);

    if (amountsError) throw new Error(amountsError.message);
  }

  revalidatePath(`/budget/${budgetId}`);
}
