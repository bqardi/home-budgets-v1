"use client";

import { useState } from "react";
import { BudgetTable } from "./BudgetTable";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { refetchCategories } from "../_actions/categories";
import { Entry, Category, BudgetTransfer } from "@/lib/types";

interface BudgetContentWrapperProps {
  entries: Entry[];
  categories: Category[];
  budgetId: string;
  otherBudgets: BudgetTransfer[];
  initialStartingBalance: string;
}

export function BudgetContentWrapper({
  entries,
  categories: initialCategories,
  budgetId,
  otherBudgets,
  initialStartingBalance,
}: BudgetContentWrapperProps) {
  const [categories, setCategories] = useState(initialCategories);

  const handleCategoryCreated = async () => {
    // Refetch categories from the database
    const updatedCategories = await refetchCategories();
    if (updatedCategories) {
      setCategories(updatedCategories);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950/25 border border-blue-200 dark:border-blue-950 rounded-lg p-8 text-center">
        <p className="text-blue-900 dark:text-blue-50 font-medium mb-2">
          No categories yet. Create one to get started!
        </p>
        <p className="text-blue-700 dark:text-blue-200 text-sm mb-8">
          Categories help you organize your budget entries.
        </p>
        <CreateCategoryModal onSuccess={handleCategoryCreated} />
      </div>
    );
  }

  return (
    <BudgetTable
      entries={entries}
      categories={categories}
      budgetId={budgetId}
      otherBudgets={otherBudgets}
      initialStartingBalance={initialStartingBalance}
    />
  );
}
