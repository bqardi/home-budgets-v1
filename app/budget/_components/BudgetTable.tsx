"use client";

import { useState, useEffect } from "react";
import { BudgetTableRow } from "./BudgetTableRow";
import { CreateEntryRow } from "./CreateEntryRow";
import { TransferModal } from "./TransferModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateStartingBalance } from "@/app/actions/budget";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { MoreVertical } from "lucide-react";

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
  otherBudgets?: Array<{ id: string; name: string; year: number }>;
  initialStartingBalance?: string;
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
  const [isSaving, setIsSaving] = useState(false);

  // Debounce effect for saving starting balance
  useEffect(() => {
    const timer = setTimeout(async () => {
      const numValue = parseFloat(startingBalance) || 0;
      if (numValue !== (parseFloat(initialStartingBalance) || 0)) {
        setIsSaving(true);
        try {
          await updateStartingBalance(budgetId, numValue);
        } catch (error) {
          console.error("Failed to save starting balance:", error);
          alert("Failed to save starting balance");
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [startingBalance, budgetId, initialStartingBalance]);

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
      <div className="bg-card border rounded-lg p-4">
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase">
          Configuration
        </h3>
        <div className="flex items-end gap-x-2">
          <div className="max-w-32">
            <Label htmlFor="starting-balance" className="text-sm">
              Starting Balance
            </Label>
            <Input
              id="starting-balance"
              type="number"
              step="0.01"
              value={startingBalance}
              onChange={(e) => handleStartingBalanceChange(e.target.value)}
              placeholder="0"
              className="mt-1"
              disabled={isSaving}
            />
          </div>

          {/* Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <CreateCategoryModal asDropdownItem={true} />
              </DropdownMenuItem>
              {otherBudgets.length > 0 && (
                <DropdownMenuItem onClick={() => setIsTransferModalOpen(true)}>
                  Transfer from Another Budget
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
              {MONTHS.map((month) => (
                <th
                  key={month}
                  className="p-2 text-right font-semibold border-r min-w-[80px]"
                >
                  {month}
                </th>
              ))}
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
                      <BudgetTableRow
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
                      <BudgetTableRow
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
                  <tr className="bg-green-100 border-t border-b font-semibold">
                    <td className="md:sticky md:left-0 md:z-10 p-2 border-r text-left bg-green-100">
                      Income Total
                    </td>
                    <td className="md:sticky md:left-[200px] md:z-10 p-2 border-r bg-green-100"></td>
                    {monthlyIncome.map((total, idx) => (
                      <td
                        key={idx}
                        className={`p-2 text-right border-r ${
                          total > 0
                            ? "text-green-700 dark:text-green-400"
                            : total < 0
                            ? "text-red-700 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {total > 0 ? "+" : ""}
                        {total.toFixed(0)}
                      </td>
                    ))}
                    <td
                      className={`md:sticky md:right-[105px] md:z-10 p-2 text-right border-r font-semibold min-w-[80px] bg-background dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 ${
                        totalIncome > 0
                          ? "text-green-700 dark:text-green-400"
                          : totalIncome < 0
                          ? "text-red-700 dark:text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {totalIncome > 0 ? "+" : ""}
                      {totalIncome.toFixed(0)}
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
                        className={`p-2 text-right border-r ${
                          total > 0
                            ? "text-red-700 dark:text-red-400"
                            : total < 0
                            ? "text-green-700 dark:text-green-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {total > 0 ? "-" : ""}
                        {total.toFixed(0)}
                      </td>
                    ))}
                    <td
                      className={`md:sticky md:right-[105px] md:z-10 p-2 text-right border-r bg-red-100 dark:bg-red-950 ${
                        totalExpenses > 0
                          ? "text-red-700 dark:text-red-400"
                          : totalExpenses < 0
                          ? "text-green-700 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {totalExpenses > 0 ? "-" : ""}
                      {totalExpenses.toFixed(0)}
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
                      className={`p-2 text-right border-r ${
                        total > 0
                          ? "text-green-700 dark:text-green-400"
                          : total < 0
                          ? "text-red-700 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {total > 0 ? "+" : ""}
                      {total.toFixed(0)}
                    </td>
                  ))}
                  <td
                    className={`md:sticky md:right-[105px] md:z-10 p-2 text-right border-r bg-gray-100 dark:bg-slate-800 ${
                      grandTotal > 0
                        ? "text-green-700 dark:text-green-400"
                        : grandTotal < 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {grandTotal > 0 ? "+" : ""}
                    {grandTotal.toFixed(0)}
                  </td>
                  <td className="md:sticky md:right-0 md:z-10 p-2 min-w-[105px] bg-gray-100 dark:bg-slate-800"></td>
                </tr>

                {/* Running Balance Row */}
                <tr className="bg-purple-100 dark:bg-purple-950 border-t border-b font-semibold">
                  <td className="md:sticky md:left-0 md:z-10 p-2 border-r text-left bg-purple-100 dark:bg-purple-950">
                    Running Balance
                  </td>
                  <td className="md:sticky md:left-[200px] md:z-10 p-2 text-xs text-muted-foreground bg-purple-100 dark:bg-purple-950">
                    Start: {startBalance > 0 ? "+" : ""}
                    {startBalance.toFixed(0)}
                  </td>
                  {runningBalance.map((balance, idx) => (
                    <td
                      key={idx}
                      className={`p-2 text-right border-r ${
                        balance > 0
                          ? "text-green-700 dark:text-green-400"
                          : balance < 0
                          ? "text-red-700 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {balance > 0 ? "+" : ""}
                      {balance.toFixed(0)}
                    </td>
                  ))}
                  <td
                    className={`md:sticky md:right-[105px] md:z-10 p-2 text-right border-r bg-purple-100 dark:bg-purple-950 ${
                      runningBalance[runningBalance.length - 1] > 0
                        ? "text-green-700 dark:text-green-400"
                        : runningBalance[runningBalance.length - 1] < 0
                        ? "text-red-700 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {runningBalance[runningBalance.length - 1] > 0 ? "+" : ""}
                    {runningBalance[runningBalance.length - 1].toFixed(0)}
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
