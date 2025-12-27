"use client";

"use client";

import Link from "next/link";
import { useState } from "react";
import { Budget, Entry } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getAllMonths } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BudgetData {
  budget: Budget;
  entries: Entry[];
}

interface BudgetCurrentProps {
  data: BudgetData;
}

export function BudgetCurrent({ data }: BudgetCurrentProps) {
  const { entries, budget } = data;
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const monthNames = getAllMonths({ locale: "en-US", format: "long" });

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const canGoPrev =
    selectedMonth > 1 || selectedYear > currentDate.getFullYear();
  const canGoNext =
    selectedMonth < 12 || selectedYear < currentDate.getFullYear();

  // Helper function to get entries for a specific month
  const getEntriesForMonth = (month: number) => {
    return entries
      .map((entry) => ({
        ...entry,
        entry_amounts: entry.entry_amounts.filter(
          (amount) => Number(amount.month) === month
        ),
      }))
      .filter((entry) => entry.entry_amounts.length > 0);
  };

  // Helper function to calculate balance at end of a month
  const getMonthBalance = (month: number) => {
    let total = budget.starting_balance || 0;

    // Sum all entries up to and including this month
    for (let m = 1; m <= month; m++) {
      entries.forEach((entry) => {
        entry.entry_amounts.forEach((amount) => {
          if (Number(amount.month) === m) {
            if (entry.entry_type === "income") {
              total += amount.amount;
            } else if (entry.entry_type === "expense") {
              total -= amount.amount;
            }
          }
        });
      });
    }
    return total;
  };

  // Helper function to get starting balance for a month
  const getStartingBalance = (month: number) => {
    if (month === 1) {
      return budget.starting_balance || 0;
    }
    return getMonthBalance(month - 1);
  };

  const monthEntries = getEntriesForMonth(selectedMonth);
  const startingBalance = getStartingBalance(selectedMonth);

  const incomeEntries = monthEntries.filter(
    (entry) => entry.entry_type === "income"
  );
  const expenseEntries = monthEntries.filter(
    (entry) => entry.entry_type === "expense"
  );

  const totalIncome = incomeEntries.reduce(
    (sum, entry) =>
      sum +
      entry.entry_amounts.reduce((amtSum, amount) => amtSum + amount.amount, 0),
    0
  );
  const totalExpenses = expenseEntries.reduce(
    (sum, entry) =>
      sum +
      entry.entry_amounts.reduce((amtSum, amount) => amtSum + amount.amount, 0),
    0
  );
  const monthBalance = startingBalance + totalIncome - totalExpenses;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">{budget.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{selectedYear}</p>
        </div>
        <Button asChild>
          <Link href={`/budget/${budget.id}`}>Manage Budget</Link>
        </Button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center flex-1">
          <h3 className="text-lg font-semibold">
            {monthNames[selectedMonth - 1]} {selectedYear}
          </h3>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className="h-10 w-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Starting Balance */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted rounded-lg mb-4">
        <span className="font-medium">Starting Balance</span>
        <span className="text-lg font-semibold">
          {formatCurrency(startingBalance)}
        </span>
      </div>

      {/* Accordions */}
      <Accordion type="single" collapsible className="w-full mb-4">
        {/* Income Accordion */}
        <AccordionItem value="income">
          <AccordionTrigger className="px-4 py-3 hover:bg-accent/50">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="text-sm font-semibold">Income</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3">
            {incomeEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No income entries for this month.
              </p>
            ) : (
              <ul className="space-y-2">
                {incomeEntries.map((entry) => {
                  const amount = entry.entry_amounts.reduce(
                    (sum, amt) => sum + amt.amount,
                    0
                  );
                  return (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{entry.description}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Expenses Accordion */}
        <AccordionItem value="expenses">
          <AccordionTrigger className="px-4 py-3 hover:bg-accent/50">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="text-sm font-semibold">Expenses</span>
              <span className="text-red-600 dark:text-red-400 font-semibold">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3">
            {expenseEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No expense entries for this month.
              </p>
            ) : (
              <ul className="space-y-2">
                {expenseEntries.map((entry) => {
                  const amount = entry.entry_amounts.reduce(
                    (sum, amt) => sum + amt.amount,
                    0
                  );
                  return (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{entry.description}</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {formatCurrency(amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Month Balance */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg border border-primary/20">
        <span className="font-semibold text-sm">Month Balance</span>
        <span
          className={`text-sm font-bold ${
            monthBalance >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(monthBalance)}
        </span>
      </div>
    </div>
  );
}
