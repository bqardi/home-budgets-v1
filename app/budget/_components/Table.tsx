"use client";

import { useState } from "react";
import { TableRow } from "./TableRow";
import { CreateEntryRow } from "./CreateEntryModal";
import { TransferModal } from "./TransferModal";
import { ConfigurationDropdown } from "./ConfigurationDropdown";
import { formatCurrency, getAllMonths, handleNumber } from "@/lib/utils";
import { Entry, Category, BudgetTransfer } from "@/lib/types";

interface BudgetTableProps {
  entries: Entry[];
  categories: Category[];
  budgetId: string;
  onRefresh?: () => void;
  otherBudgets?: BudgetTransfer[];
  initialStartingBalance?: string;
}

export function Table({
  entries: initialEntries,
  categories,
  budgetId,
  otherBudgets = [],
  initialStartingBalance = "0",
}: BudgetTableProps) {
  const [startingBalance, setStartingBalance] = useState<string>(
    initialStartingBalance
  );
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [entries, setEntries] = useState(initialEntries);

  const handleRefresh = async () => {
    try {
      // Fetch entries
      const entriesResponse = await fetch(
        `/api/budget/${budgetId}/entries-list`
      );
      if (entriesResponse.ok) {
        const data = await entriesResponse.json();
        setEntries(data.entries || []);
      }

      // Fetch updated budget data (including starting_balance after transfer)
      const budgetResponse = await fetch(`/api/budget/${budgetId}/balance`);
      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json();
        if (budgetData.starting_balance !== undefined) {
          setStartingBalance(budgetData.starting_balance.toString());
        }
      }
    } catch (error) {
      console.error("Failed to refresh budget data:", error);
    }
  };

  const handleStartingBalanceChange = (value: string) => {
    setStartingBalance(value);
    // The useEffect will handle saving with debouncing
  };

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
      const monthIndex = Number(amount.month) - 1;
      monthlyIncome[monthIndex] += amount.amount;
      monthlyTotals[monthIndex] += amount.amount;
    });
  });

  // Process expenses (subtract)
  expenseEntries.forEach((entry) => {
    entry.entry_amounts.forEach((amount) => {
      const monthIndex = Number(amount.month) - 1;
      monthlyExpenses[monthIndex] += amount.amount;
      monthlyTotals[monthIndex] -= amount.amount;
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
    <div className="relative space-y-6">
      {/* Configuration Dropdown */}
      <div className="absolute bottom-full right-0 pb-6">
        <ConfigurationDropdown
          budgetId={budgetId}
          startingBalance={startingBalance}
          initialStartingBalance={initialStartingBalance}
          handleStartingBalanceChange={handleStartingBalanceChange}
          otherBudgets={otherBudgets}
          setIsTransferModalOpen={setIsTransferModalOpen}
        />
      </div>

      {/* Monthly Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted dark:bg-slate-800 border-b">
              <th className="md:sticky md:left-0 md:z-20 p-2 text-left font-semibold border-r md:min-w-[200px] bg-muted dark:bg-slate-800">
                Description
              </th>
              <th className="md:sticky md:left-[200px] md:z-20 p-2 text-left font-semibold border-r md:min-w-[120px] bg-muted dark:bg-slate-800">
                Category
              </th>
              {getAllMonths({ locale: "da-DK", format: "short" }).map(
                (month) => (
                  <th
                    key={month}
                    className="p-2 text-right font-semibold border-r min-w-[80px]"
                  >
                    {month}
                  </th>
                )
              )}
              <th className="md:sticky md:right-[105px] md:z-20 p-2 text-right font-semibold border-r min-w-[80px] bg-muted dark:bg-slate-800">
                Total
              </th>
              <th className="md:sticky md:right-0 md:z-20 p-2 text-right font-semibold min-w-[105px] bg-muted dark:bg-slate-800">
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
                      <TableRow
                        key={entry.id}
                        entry={entry}
                        budgetId={budgetId}
                        categories={categories}
                        categoryMap={categoryMap}
                        onUpdate={handleRefresh}
                        onDelete={handleRefresh}
                      />
                    ))}
                  </>
                )}

                {/* Expense Entries */}
                {expenseEntries.length > 0 && (
                  <>
                    {expenseEntries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        entry={entry}
                        budgetId={budgetId}
                        categories={categories}
                        categoryMap={categoryMap}
                        onUpdate={handleRefresh}
                        onDelete={handleRefresh}
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
                  <tr className="bg-green-100 dark:bg-green-950 border-t border-b font-semibold">
                    <td className="md:sticky md:left-0 md:z-10 p-2 border-r text-left bg-green-100 dark:bg-green-950">
                      Income Total
                    </td>
                    <td className="md:sticky md:left-[200px] md:z-10 p-2 border-r bg-green-100 dark:bg-green-950"></td>
                    {monthlyIncome.map((total, idx) => (
                      <td
                        key={idx}
                        className={`p-2 text-right border-r ${handleNumber(
                          total,
                          "text-green-700 dark:text-green-400",
                          "text-red-700 dark:text-red-400",
                          "text-gray-500 dark:text-gray-400"
                        )}`}
                      >
                        {formatCurrency(total)}
                      </td>
                    ))}
                    <td
                      className={`md:sticky md:right-[105px] md:z-10 p-2 text-right border-r font-semibold min-w-[80px] bg-green-100 dark:bg-green-950 ${handleNumber(
                        totalIncome,
                        "text-green-700 dark:text-green-400",
                        "text-red-700 dark:text-red-400",
                        "text-muted-foreground"
                      )}`}
                    >
                      {formatCurrency(totalIncome)}
                    </td>
                    <td className="md:sticky md:right-0 md:z-10 p-2 min-w-[105px] bg-green-100 dark:bg-green-950"></td>
                  </tr>
                )}

                {/* Expense Total Row */}
                {expenseEntries.length > 0 && (
                  <tr className="bg-red-100 dark:bg-red-950 border-t border-b font-semibold">
                    <td className="md:sticky md:left-0 md:z-10 p-2 border-r text-left bg-red-100 dark:bg-red-950">
                      Expense Total
                    </td>
                    <td className="md:sticky md:left-[200px] md:z-10 p-2 border-r bg-red-100 dark:bg-red-950"></td>
                    {monthlyExpenses.map((total, idx) => (
                      <td
                        key={idx}
                        className={`p-2 text-right border-r ${handleNumber(
                          total,
                          "text-red-700 dark:text-red-400",
                          "text-green-700 dark:text-green-400",
                          "text-gray-500 dark:text-gray-400"
                        )}`}
                      >
                        {formatCurrency(total)}
                      </td>
                    ))}
                    <td
                      className={`md:sticky md:right-[105px] md:z-10 p-2 text-right border-r bg-red-100 dark:bg-red-950 ${handleNumber(
                        totalExpenses,
                        "text-red-700 dark:text-red-400",
                        "text-green-700 dark:text-green-400",
                        "text-gray-500 dark:text-gray-400"
                      )}`}
                    >
                      {formatCurrency(totalExpenses)}
                    </td>
                    <td className="md:sticky md:right-0 md:z-10 p-2 min-w-[105px] bg-red-100 dark:bg-red-950"></td>
                  </tr>
                )}

                {/* Net Total Row */}
                <tr className="bg-gray-100 dark:bg-slate-800 border-t-2 border-b font-semibold">
                  <td className="md:sticky md:left-0 md:z-10 p-2 border-r text-left bg-gray-100 dark:bg-slate-800">
                    Net Balance
                  </td>
                  <td className="md:sticky md:left-[200px] md:z-10 p-2 border-r bg-gray-100 dark:bg-slate-800"></td>
                  {monthlyTotals.map((total, idx) => (
                    <td
                      key={idx}
                      className={`p-2 text-right border-r ${handleNumber(
                        total,
                        "text-green-700 dark:text-green-400",
                        "text-red-700 dark:text-red-400",
                        "text-gray-500 dark:text-gray-400"
                      )}`}
                    >
                      {formatCurrency(total)}
                    </td>
                  ))}
                  <td
                    className={`md:sticky md:right-[105px] md:z-10 p-2 text-right border-r bg-gray-100 dark:bg-slate-800 ${handleNumber(
                      grandTotal,
                      "text-green-700 dark:text-green-400",
                      "text-red-700 dark:text-red-400",
                      "text-gray-500 dark:text-gray-400"
                    )}`}
                  >
                    {formatCurrency(grandTotal)}
                  </td>
                  <td className="md:sticky md:right-0 md:z-10 p-2 min-w-[105px] bg-gray-100 dark:bg-slate-800"></td>
                </tr>

                {/* Running Balance Row */}
                <tr className="bg-purple-100 dark:bg-purple-950 border-t border-b font-semibold">
                  <td className="md:sticky md:left-0 md:z-10 p-2 border-r text-left bg-purple-100 dark:bg-purple-950">
                    Running Balance
                  </td>
                  <td className="md:sticky md:left-[200px] md:z-10 p-2 text-xs text-muted-foreground bg-purple-100 dark:bg-purple-950">
                    Start: {formatCurrency(startBalance)}
                  </td>
                  {runningBalance.map((balance, idx) => (
                    <td
                      key={idx}
                      className={`p-2 text-right border-r ${handleNumber(
                        balance,
                        "text-green-700 dark:text-green-400",
                        "text-red-700 dark:text-red-400",
                        "text-gray-500 dark:text-gray-400"
                      )}`}
                    >
                      {formatCurrency(balance)}
                    </td>
                  ))}
                  <td
                    className={`md:sticky md:right-[105px] md:z-10 p-2 text-right border-r bg-purple-100 dark:bg-purple-950 ${handleNumber(
                      runningBalance[runningBalance.length - 1],
                      "text-green-700 dark:text-green-400",
                      "text-red-700 dark:text-red-400",
                      "text-gray-500 dark:text-gray-400"
                    )}`}
                  >
                    {formatCurrency(runningBalance[runningBalance.length - 1])}
                  </td>
                  <td className="md:sticky md:right-0 md:z-10 p-2 min-w-[105px] bg-purple-100 dark:bg-purple-950"></td>
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
          onSuccess={handleRefresh}
        />
      </div>

      {/* Summary Section */}
      {entries.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase">
                Total Income
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-2">
                {formatCurrency(totalIncome)}
              </p>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-2">
                {formatCurrency(totalExpenses)}
              </p>
            </div>

            <div
              className={`p-4 border rounded-lg ${handleNumber(
                grandTotal,
                "bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-900",
                "bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-900",
                "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
              )}`}
            >
              <p
                className={`text-sm font-semibold uppercase ${handleNumber(
                  grandTotal,
                  "text-green-700 dark:text-green-400",
                  "text-red-700 dark:text-red-400",
                  "text-gray-700 dark:text-gray-300"
                )}`}
              >
                Net Balance
              </p>
              <p
                className={`text-2xl font-bold mt-2 ${handleNumber(
                  grandTotal,
                  "text-green-700 dark:text-green-400",
                  "text-red-700 dark:text-red-400",
                  "text-gray-700 dark:text-gray-300"
                )}`}
              >
                {formatCurrency(grandTotal)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {otherBudgets.length > 0 && (
        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          budgetId={budgetId}
          otherBudgets={otherBudgets}
          onTransferComplete={handleRefresh}
        />
      )}
    </div>
  );
}
