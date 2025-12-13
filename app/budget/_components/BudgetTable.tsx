"use client";

import { BudgetTableRow } from "./BudgetTableRow";
import { CreateEntryRow } from "./CreateEntryRow";

interface Entry {
  id: string;
  description: string;
  amount: number;
  category_id: string;
  entry_date: string;
}

interface Category {
  id: string;
  name: string;
}

interface BudgetTableProps {
  entries: Entry[];
  categories: Category[];
  budgetId: string;
  onRefresh?: () => void;
}

export function BudgetTable({
  entries,
  categories,
  budgetId,
  onRefresh,
}: BudgetTableProps) {
  // Create category map for quick lookup
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  // Group entries by category for summary
  const categoryTotals: Record<string, number> = {};
  entries.forEach((entry) => {
    const catName = categoryMap[entry.category_id] || "Unknown";
    categoryTotals[catName] = (categoryTotals[catName] || 0) + entry.amount;
  });

  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);

  // Sort entries by date descending
  const sortedEntries = [...entries].sort(
    (a, b) =>
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted border-b">
            <th className="p-2 text-left font-semibold">Description</th>
            <th className="p-2 text-left font-semibold">Category</th>
            <th className="p-2 text-right font-semibold">Amount</th>
            <th className="p-2 text-left font-semibold">Date</th>
            <th className="p-2 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-muted-foreground">
                No entries yet
              </td>
            </tr>
          ) : (
            sortedEntries.map((entry) => (
              <BudgetTableRow
                key={entry.id}
                entry={entry}
                budgetId={budgetId}
                categories={categories}
                categoryMap={categoryMap}
                onUpdate={onRefresh}
                onDelete={onRefresh}
              />
            ))
          )}
          <CreateEntryRow
            budgetId={budgetId}
            categories={categories}
            onSuccess={onRefresh}
          />
        </tbody>
      </table>

      {/* Summary section */}
      {entries.length > 0 && (
        <div className="bg-muted/50 border-t p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Total Balance
              </p>
              <p
                className={`text-xl font-bold mt-1 ${
                  totalAmount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {totalAmount > 0 ? "+" : ""}
                {totalAmount.toFixed(2)} kr
              </p>
            </div>

            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  {category}
                </p>
                <p
                  className={`text-lg font-semibold mt-1 ${
                    total >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {total > 0 ? "+" : ""}
                  {total.toFixed(2)} kr
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
