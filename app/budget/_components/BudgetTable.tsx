"use client";

import { useState } from "react";
import { BudgetTableRow } from "./BudgetTableRow";
import { CreateEntryRow } from "./CreateEntryRow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EntryAmount {
  id: string;
  month: number;
  amount: number;
}

interface Entry {
  id: string;
  description: string;
  category_id: string;
  entry_type: "income" | "expense";
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
  const [startingBalance, setStartingBalance] = useState<string>("0");

  // Create category map for quick lookup
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  // Separate income and expenses
  const incomeEntries = entries.filter((e) => e.entry_type === "income");
  const expenseEntries = entries.filter((e) => e.entry_type === "expense");

  // Calculate totals per month
  const monthlyTotals: number[] = Array(12).fill(0);
  const monthlyIncome: number[] = Array(12).fill(0);
  const monthlyExpenses: number[] = Array(12).fill(0);

  // Process income (positive)
  incomeEntries.forEach((entry) => {
    entry.entry_amounts.forEach((amount) => {
      monthlyIncome[amount.month - 1] += amount.amount;
      monthlyTotals[amount.month - 1] += amount.amount;
    });
  });

  // Process expenses (subtract)
  expenseEntries.forEach((entry) => {
    entry.entry_amounts.forEach((amount) => {
      monthlyExpenses[amount.month - 1] += amount.amount;
      monthlyTotals[amount.month - 1] -= amount.amount;
    });
  });

  const grandTotal = monthlyTotals.reduce((sum, m) => sum + m, 0);
  const totalIncome = monthlyIncome.reduce((sum, m) => sum + m, 0);
  const totalExpenses = monthlyExpenses.reduce((sum, m) => sum + m, 0);

  // Calculate running balance from starting balance
  const startBalance = parseFloat(startingBalance) || 0;
  const runningBalance: number[] = [];
  let currentBalance = startBalance;
  for (let i = 0; i < 12; i++) {
    currentBalance += monthlyTotals[i];
    runningBalance.push(currentBalance);
  }

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase">
          Configuration
        </h3>
        <div className="max-w-xs">
          <Label htmlFor="starting-balance" className="text-sm">
            Starting Balance
          </Label>
          <Input
            id="starting-balance"
            type="number"
            step="0.01"
            value={startingBalance}
            onChange={(e) => setStartingBalance(e.target.value)}
            placeholder="0"
            className="mt-1"
          />
        </div>
      </div>

      {/* Monthly Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted border-b">
              <th className="sticky left-0 z-20 p-2 text-left font-semibold border-r min-w-[200px] bg-muted">
                Description
              </th>
              <th className="sticky left-[200px] z-20 p-2 text-left font-semibold border-r min-w-[120px] bg-muted">
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
              <th className="sticky right-[60px] z-20 p-2 text-right font-semibold border-r min-w-[80px] bg-muted">
                Total
              </th>
              <th className="sticky right-0 z-20 p-2 text-right font-semibold min-w-[60px] bg-muted">
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
              <>
                {/* Income Entries */}
                {incomeEntries.length > 0 && (
                  <>
                    {incomeEntries.map((entry) => (
                      <BudgetTableRow
                        key={entry.id}
                        entry={entry}
                        budgetId={budgetId}
                        categories={categories}
                        categoryMap={categoryMap}
                        onUpdate={onRefresh}
                        onDelete={onRefresh}
                      />
                    ))}
                  </>
                )}

                {/* Expense Entries */}
                {expenseEntries.length > 0 && (
                  <>
                    {expenseEntries.map((entry) => (
                      <BudgetTableRow
                        key={entry.id}
                        entry={entry}
                        budgetId={budgetId}
                        categories={categories}
                        categoryMap={categoryMap}
                        onUpdate={onRefresh}
                        onDelete={onRefresh}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {/* Monthly Totals Row */}
            {entries.length > 0 && (
              <>
                {/* Income Total Row */}
                {incomeEntries.length > 0 && (
                  <tr className="bg-green-100 border-t border-b font-semibold">
                    <td className="sticky left-0 z-10 p-2 border-r text-left bg-green-100">
                      Income Total
                    </td>
                    <td className="sticky left-[200px] z-10 p-2 border-r bg-green-100"></td>
                    {monthlyIncome.map((total, idx) => (
                      <td
                        key={idx}
                        className={`p-2 text-right border-r ${
                          total > 0
                            ? "text-green-700"
                            : total < 0
                            ? "text-red-700"
                            : "text-gray-500"
                        }`}
                      >
                        {total > 0 ? "+" : ""}
                        {total.toFixed(0)}
                      </td>
                    ))}
                    <td
                      className={`sticky right-[60px] z-10 p-2 text-right border-r bg-green-100 ${
                        totalIncome > 0
                          ? "text-green-700"
                          : totalIncome < 0
                          ? "text-red-700"
                          : "text-gray-500"
                      }`}
                    >
                      {totalIncome > 0 ? "+" : ""}
                      {totalIncome.toFixed(0)}
                    </td>
                    <td className="sticky right-0 z-10 p-2 bg-green-100"></td>
                  </tr>
                )}

                {/* Expense Total Row */}
                {expenseEntries.length > 0 && (
                  <tr className="bg-red-100 border-t border-b font-semibold">
                    <td className="sticky left-0 z-10 p-2 border-r text-left bg-red-100">
                      Expense Total
                    </td>
                    <td className="sticky left-[200px] z-10 p-2 border-r bg-red-100"></td>
                    {monthlyExpenses.map((total, idx) => (
                      <td
                        key={idx}
                        className={`p-2 text-right border-r ${
                          total > 0
                            ? "text-red-700"
                            : total < 0
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        {total > 0 ? "-" : ""}
                        {total.toFixed(0)}
                      </td>
                    ))}
                    <td
                      className={`sticky right-[60px] z-10 p-2 text-right border-r bg-red-100 ${
                        totalExpenses > 0
                          ? "text-red-700"
                          : totalExpenses < 0
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      {totalExpenses > 0 ? "-" : ""}
                      {totalExpenses.toFixed(0)}
                    </td>
                    <td className="sticky right-0 z-10 p-2 bg-red-100"></td>
                  </tr>
                )}

                {/* Net Total Row */}
                <tr className="bg-gray-100 border-t-2 border-b font-semibold">
                  <td className="sticky left-0 z-10 p-2 border-r text-left bg-gray-100">
                    Net Balance
                  </td>
                  <td className="sticky left-[200px] z-10 p-2 border-r bg-gray-100"></td>
                  {monthlyTotals.map((total, idx) => (
                    <td
                      key={idx}
                      className={`p-2 text-right border-r ${
                        total > 0
                          ? "text-green-700"
                          : total < 0
                          ? "text-red-700"
                          : "text-gray-500"
                      }`}
                    >
                      {total > 0 ? "+" : ""}
                      {total.toFixed(0)}
                    </td>
                  ))}
                  <td
                    className={`sticky right-[60px] z-10 p-2 text-right border-r bg-gray-100 ${
                      grandTotal > 0
                        ? "text-green-700"
                        : grandTotal < 0
                        ? "text-red-700"
                        : "text-gray-500"
                    }`}
                  >
                    {grandTotal > 0 ? "+" : ""}
                    {grandTotal.toFixed(0)}
                  </td>
                  <td className="sticky right-0 z-10 p-2 bg-gray-100"></td>
                </tr>

                {/* Running Balance Row */}
                <tr className="bg-purple-100 border-t border-b font-semibold">
                  <td className="sticky left-0 z-10 p-2 border-r text-left bg-purple-100">
                    Running Balance
                  </td>
                  <td className="sticky left-[200px] z-10 p-2 border-r text-xs text-muted-foreground bg-purple-100">
                    Start: {startBalance > 0 ? "+" : ""}
                    {startBalance.toFixed(0)}
                  </td>
                  {runningBalance.map((balance, idx) => (
                    <td
                      key={idx}
                      className={`p-2 text-right border-r ${
                        balance > 0
                          ? "text-green-700"
                          : balance < 0
                          ? "text-red-700"
                          : "text-gray-500"
                      }`}
                    >
                      {balance > 0 ? "+" : ""}
                      {balance.toFixed(0)}
                    </td>
                  ))}
                  <td
                    className={`sticky right-[60px] z-10 p-2 text-right border-r bg-purple-100 ${
                      runningBalance[11] > 0
                        ? "text-green-700"
                        : runningBalance[11] < 0
                        ? "text-red-700"
                        : "text-gray-500"
                    }`}
                  >
                    {runningBalance[11] > 0 ? "+" : ""}
                    {runningBalance[11].toFixed(0)}
                  </td>
                  <td className="sticky right-0 z-10 p-2 bg-purple-100"></td>
                </tr>
              </>
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
                grandTotal > 0
                  ? "bg-green-100 border-green-200"
                  : grandTotal < 0
                  ? "bg-red-100 border-red-200"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <p className="text-sm font-semibold uppercase text-gray-700">
                Net Balance
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${
                  grandTotal > 0
                    ? "text-green-700"
                    : grandTotal < 0
                    ? "text-red-700"
                    : "text-gray-500"
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
