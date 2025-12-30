"use client";

import { useState } from "react";
import { TableRow } from "./TableRow";
import { CreateEntryRow } from "./CreateEntryModal";
import { TransferModal } from "./TransferModal";
import { ConfigurationDropdown } from "./ConfigurationDropdown";
import { formatCurrency, getAllMonths, handleNumber } from "@/lib/utils";
import { Entry, Category, BudgetTransfer, Settings } from "@/lib/types";

interface BudgetTableProps {
  entries: Entry[];
  categories: Category[];
  budgetId: string;
  onRefresh?: () => void;
  otherBudgets?: BudgetTransfer[];
  initialStartingBalance?: string;
  settings: Settings | null;
}

export function Table({
  entries: initialEntries,
  categories,
  budgetId,
  otherBudgets = [],
  initialStartingBalance = "0",
  settings,
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
            <tr className="bg-muted border-b">
              <th className="md:sticky md:left-0 md:z-20 p-2 text-left font-semibold border-r md:min-w-50 bg-muted">
                Description
              </th>
              <th className="md:sticky md:left-50 md:z-20 p-2 text-left font-semibold border-r md:min-w-30 bg-muted">
                Category
              </th>
              {getAllMonths({ locale: "da-DK", format: "short" }).map(
                (month) => (
                  <th
                    key={month}
                    className="p-2 text-right font-semibold border-r min-w-20"
                  >
                    {month}
                  </th>
                )
              )}
              <th className="md:sticky md:right-26.25 md:z-20 p-2 text-right font-semibold border-r min-w-20 bg-muted">
                Total
              </th>
              <th className="md:sticky md:right-0 md:z-20 p-2 text-right font-semibold min-w-26.25 bg-muted">
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
                        settings={settings}
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
                        settings={settings}
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
                  <tr className="bg-secondary border-t border-b font-semibold">
                    <td className="md:sticky md:left-0 md:z-10 p-2 border-r text-left bg-secondary">
                      Income Total
                    </td>
                    <td className="md:sticky md:left-50 md:z-10 p-2 border-r bg-secondary"></td>
                    {monthlyIncome.map((total, idx) => (
                      <td
                        key={idx}
                        className={`font-mono p-2 text-right border-r ${handleNumber(
                          total,
                          "text-success dark:text-success",
                          "text-destructive dark:text-destructive",
                          "text-muted-foreground dark:text-muted-foreground"
                        )}`}
                      >
                        {formatCurrency(
                          total,
                          settings?.locale || "da-DK",
                          settings?.currency || "DKK"
                        )}
                      </td>
                    ))}
                    <td
                      className={`font-mono md:sticky md:right-26.25 md:z-10 p-2 text-right border-r font-semibold min-w-20 bg-secondary ${handleNumber(
                        totalIncome,
                        "text-success dark:text-success",
                        "text-destructive dark:text-destructive",
                        "text-muted-foreground"
                      )}`}
                    >
                      {formatCurrency(
                        totalIncome,
                        settings?.locale || "da-DK",
                        settings?.currency || "DKK"
                      )}
                    </td>
                    <td className="md:sticky md:right-0 md:z-10 p-2 min-w-26.25 bg-secondary"></td>
                  </tr>
                )}

                {/* Expense Total Row */}
                {expenseEntries.length > 0 && (
                  <tr className="bg-secondary border-t border-b font-semibold">
                    <td className="md:sticky md:left-0 md:z-10 p-2 border-r text-left bg-secondary">
                      Expense Total
                    </td>
                    <td className="md:sticky md:left-50 md:z-10 p-2 border-r bg-secondary"></td>
                    {monthlyExpenses.map((total, idx) => (
                      <td
                        key={idx}
                        className={`font-mono p-2 text-right border-r ${handleNumber(
                          total,
                          "text-destructive dark:text-destructive",
                          "text-success dark:text-success",
                          "text-muted-foreground dark:text-muted-foreground"
                        )}`}
                      >
                        {formatCurrency(
                          total,
                          settings?.locale || "da-DK",
                          settings?.currency || "DKK"
                        )}
                      </td>
                    ))}
                    <td
                      className={`font-mono md:sticky md:right-26.25 md:z-10 p-2 text-right border-r bg-secondary ${handleNumber(
                        totalExpenses,
                        "text-destructive dark:text-destructive",
                        "text-success dark:text-success",
                        "text-muted-foreground dark:text-muted-foreground"
                      )}`}
                    >
                      {formatCurrency(
                        totalExpenses,
                        settings?.locale || "da-DK",
                        settings?.currency || "DKK"
                      )}
                    </td>
                    <td className="md:sticky md:right-0 md:z-10 p-2 min-w-26.25 bg-secondary"></td>
                  </tr>
                )}

                {/* Net Total Row */}
                <tr className="bg-background border-t-2 border-b font-semibold">
                  <td className="md:sticky md:left-0 md:z-10 p-2 border-r text-left bg-background">
                    Net Balance
                  </td>
                  <td className="md:sticky md:left-50 md:z-10 p-2 border-r bg-background"></td>
                  {monthlyTotals.map((total, idx) => (
                    <td
                      key={idx}
                      className={`font-mono p-2 text-right border-r ${handleNumber(
                        total,
                        "text-success dark:text-success",
                        "text-destructive dark:text-destructive",
                        "text-muted-foreground dark:text-muted-foreground"
                      )}`}
                    >
                      {formatCurrency(
                        total,
                        settings?.locale || "da-DK",
                        settings?.currency || "DKK"
                      )}
                    </td>
                  ))}
                  <td
                    className={`font-mono md:sticky md:right-26.25 md:z-10 p-2 text-right border-r bg-background ${handleNumber(
                      grandTotal,
                      "text-success dark:text-success",
                      "text-destructive dark:text-destructive",
                      "text-muted-foreground dark:text-muted-foreground"
                    )}`}
                  >
                    {formatCurrency(
                      grandTotal,
                      settings?.locale || "da-DK",
                      settings?.currency || "DKK"
                    )}
                  </td>
                  <td className="md:sticky md:right-0 md:z-10 p-2 min-w-26.25 bg-background"></td>
                </tr>

                {/* Running Balance Row */}
                <tr className="bg-background border-t border-b font-semibold">
                  <td className="md:sticky md:left-0 md:z-10 p-2 border-r text-left bg-background">
                    Running Balance
                  </td>
                  <td className="font-mono md:sticky md:left-50 md:z-10 p-2 text-xs text-muted-foreground bg-background whitespace-nowrap">
                    Start:{" "}
                    {formatCurrency(
                      startBalance,
                      settings?.locale || "da-DK",
                      settings?.currency || "DKK"
                    )}
                  </td>
                  {runningBalance.map((balance, idx) => (
                    <td
                      key={idx}
                      className={`font-mono p-2 text-right border-r ${handleNumber(
                        balance,
                        "text-success dark:text-success",
                        "text-destructive dark:text-destructive",
                        "text-muted-foreground dark:text-muted-foreground"
                      )}`}
                    >
                      {formatCurrency(
                        balance,
                        settings?.locale || "da-DK",
                        settings?.currency || "DKK"
                      )}
                    </td>
                  ))}
                  <td
                    className={`font-mono md:sticky md:right-26.25 md:z-10 p-2 text-right border-r bg-background ${handleNumber(
                      runningBalance[runningBalance.length - 1],
                      "text-success dark:text-success",
                      "text-destructive dark:text-destructive",
                      "text-muted-foreground dark:text-muted-foreground"
                    )}`}
                  >
                    {formatCurrency(
                      runningBalance[runningBalance.length - 1],
                      settings?.locale || "da-DK",
                      settings?.currency || "DKK"
                    )}
                  </td>
                  <td className="md:sticky md:right-0 md:z-10 p-2 min-w-26.25 bg-background"></td>
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
            <div className="p-4 bg-secondary border border-border rounded-lg">
              <p className="text-sm font-semibold text-success uppercase">
                Total Income
              </p>
              <p className="font-mono text-2xl font-bold text-success mt-2">
                {formatCurrency(
                  totalIncome,
                  settings?.locale || "da-DK",
                  settings?.currency || "DKK"
                )}
              </p>
            </div>

            <div className="p-4 bg-secondary border border-border rounded-lg">
              <p className="text-sm font-semibold text-destructive uppercase">
                Total Expenses
              </p>
              <p className="font-mono text-2xl font-bold text-destructive mt-2">
                {formatCurrency(
                  totalExpenses,
                  settings?.locale || "da-DK",
                  settings?.currency || "DKK"
                )}
              </p>
            </div>

            <div
              className={`p-4 border rounded-lg ${handleNumber(
                grandTotal,
                "bg-secondary border-border",
                "bg-secondary border-border",
                "bg-secondary border-border"
              )}`}
            >
              <p
                className={`font-mono text-sm font-semibold uppercase ${handleNumber(
                  grandTotal,
                  "text-green-700 dark:text-green-400",
                  "text-red-700 dark:text-red-400",
                  "text-gray-700 dark:text-gray-300"
                )}`}
              >
                Net Balance
              </p>
              <p
                className={`font-mono text-2xl font-bold mt-2 ${handleNumber(
                  grandTotal,
                  "text-success",
                  "text-destructive",
                  "text-muted-foreground"
                )}`}
              >
                {formatCurrency(
                  grandTotal,
                  settings?.locale || "da-DK",
                  settings?.currency || "DKK"
                )}
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
