"use client";

import { BudgetTableRow } from "./BudgetTableRow";
import { CreateEntryRow } from "./CreateEntryRow";

interface EntryAmount {
  id: string;
  month: number;
  amount: number;
}

interface Entry {
  id: string;
  description: string;
  category_id: string;
  entry_amounts: EntryAmount[];
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

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function BudgetTable({
  entries,
  categories,
  budgetId,
  onRefresh,
}: BudgetTableProps) {
  // Create category map for quick lookup
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  // Calculate totals per month and per row
  const monthlyTotals: number[] = Array(12).fill(0);
  const categoryTotals: Record<string, number> = {};

  entries.forEach((entry) => {
    const catName = categoryMap[entry.category_id] || "Unknown";
    if (!categoryTotals[catName]) categoryTotals[catName] = 0;

    entry.entry_amounts.forEach((amount) => {
      monthlyTotals[amount.month - 1] += amount.amount;
      categoryTotals[catName] += amount.amount;
    });
  });

  const grandTotal = monthlyTotals.reduce((sum, m) => sum + m, 0);

  // Separate income and expenses
  let totalIncome = 0;
  let totalExpenses = 0;

  Object.values(categoryTotals).forEach((total) => {
    if (total >= 0) {
      totalIncome += total;
    } else {
      totalExpenses += Math.abs(total);
    }
  });

  return (
    <div className="space-y-6">
      {/* Monthly Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted border-b">
              <th className="p-2 text-left font-semibold border-r min-w-[200px]">
                Description
              </th>
              <th className="p-2 text-left font-semibold border-r min-w-[120px]">
                Category
              </th>
              {MONTHS.map((month) => (
                <th
                  key={month}
                  className="p-2 text-right font-semibold border-r min-w-[80px]"
                >
                  {month}
                </th>
              ))}
              <th className="p-2 text-right font-semibold border-r min-w-[80px]">
                Total
              </th>
              <th className="p-2 text-right font-semibold min-w-[60px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={15}
                  className="p-4 text-center text-muted-foreground"
                >
                  No entries yet
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
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

            {/* Monthly Totals Row */}
            {entries.length > 0 && (
              <tr className="bg-muted/50 border-t-2 border-b font-semibold">
                <td className="p-2 border-r text-left">Month Total</td>
                <td className="p-2 border-r"></td>
                {monthlyTotals.map((total, idx) => (
                  <td key={idx} className="p-2 text-right border-r">
                    <span
                      className={total >= 0 ? "text-green-600" : "text-red-600"}
                    >
                      {total > 0 ? "+" : ""}
                      {total.toFixed(0)}
                    </span>
                  </td>
                ))}
                <td className="p-2 text-right border-r">
                  <span
                    className={
                      grandTotal >= 0 ? "text-green-700" : "text-red-700"
                    }
                  >
                    {grandTotal > 0 ? "+" : ""}
                    {grandTotal.toFixed(0)}
                  </span>
                </td>
                <td className="p-2"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Entry Button */}
      <div className="flex justify-center">
        <CreateEntryRow
          budgetId={budgetId}
          categories={categories}
          onSuccess={onRefresh}
        />
      </div>

      {/* Summary Section */}
      {entries.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-700 uppercase">
                Total Income
              </p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                +{totalIncome.toFixed(0)} kr
              </p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-700 uppercase">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-700 mt-2">
                -{totalExpenses.toFixed(0)} kr
              </p>
            </div>

            <div
              className={`p-4 border rounded-lg ${
                grandTotal >= 0
                  ? "bg-blue-50 border-blue-200"
                  : "bg-orange-50 border-orange-200"
              }`}
            >
              <p
                className={`text-sm font-semibold uppercase ${
                  grandTotal >= 0 ? "text-blue-700" : "text-orange-700"
                }`}
              >
                Net Balance
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  grandTotal >= 0 ? "text-blue-700" : "text-orange-700"
                }`}
              >
                {grandTotal > 0 ? "+" : ""}
                {grandTotal.toFixed(0)} kr
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
