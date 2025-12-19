/**
 * Centralized database and domain types
 * All shared types should be defined here to avoid duplication
 */

// ============================================================================
// Categories
// ============================================================================

export interface Category {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Budget
// ============================================================================

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  year: number;
  starting_balance?: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetTransfer {
  id: string;
  name: string;
  year: number;
}

// ============================================================================
// Entries & Amounts
// ============================================================================

export interface EntryAmount {
  id: string;
  month: string | number;
  amount: number;
}

export interface Entry {
  id: string;
  user_id?: string;
  budget_id?: string;
  description: string;
  category_id: string;
  entry_type: "income" | "expense";
  created_at?: string;
  updated_at?: string;
  entry_amounts: EntryAmount[];
}

// ============================================================================
// Settings
// ============================================================================

export interface Settings {
  id: string;
  user_id: string;
  currency: string;
  locale: string;
  created_at: string;
  updated_at: string;
}
