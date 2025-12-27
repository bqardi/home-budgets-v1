"use client";

import Link from "next/link";
import { useState } from "react";
import { Budget, Entry, Settings } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTriggerRaw,
} from "@/components/ui/accordion";
import { getAllMonths } from "@/lib/utils";
import { ChevronDownIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { CurrencyDisplay } from "./CurrencyDisplay";
import { Card } from "@/components/ui/card";

interface BudgetData {
  budget: Budget;
  entries: Entry[];
  settings: Settings | null;
}

interface BudgetCurrentProps {
  data: BudgetData;
}

export function BudgetCurrent({ data }: BudgetCurrentProps) {
  const { entries, budget, settings } = data;
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const monthNames = getAllMonths({
    locale: settings?.locale || "da-DK",
    format: "long",
  });
  const currencyDisplayOptions = {
    currency: settings?.currency || "DKK",
    locale: settings?.locale || "da-DK",
  };

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
  const hasLastMonth = selectedMonth > 1;

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
      entry.entry_amounts.reduce((amtSum, amount) => amtSum - amount.amount, 0),
    0
  );
  const monthBalance = startingBalance + totalIncome + totalExpenses;

  return (
    <div className="text-sm md:text-lg">
      {/* Month Navigation */}
      <div className="grid grid-cols-[40px_200px_40px] items-center mb-6 gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h3 className="font-semibold">
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

      <Card>
        {/* Starting Balance */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-medium">
            {hasLastMonth ? "From last month" : "Starting Balance"}
          </span>
          <CurrencyDisplay
            balance={startingBalance}
            options={currencyDisplayOptions}
          />
        </div>

        {/* Accordions */}
        <Accordion type="single" collapsible className="w-full border-y">
          {/* Income Accordion */}
          <AccordionItem value="income">
            <AccordionTriggerRaw className="text-sm md:text-lg font-semibold px-4 py-3 hover:bg-accent/50 justify-start">
              Income
              <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
              <CurrencyDisplay
                className="ml-auto"
                balance={totalIncome}
                options={currencyDisplayOptions}
              />
            </AccordionTriggerRaw>
            <AccordionContent className="text-xs md:text-base px-4">
              {incomeEntries.length === 0 ? (
                <p className="text-muted-foreground">
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
                        className="flex items-center justify-between"
                      >
                        <span>{entry.description}</span>
                        <CurrencyDisplay
                          balance={amount}
                          options={currencyDisplayOptions}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Expenses Accordion */}
          <AccordionItem value="expenses">
            <AccordionTriggerRaw className="text-sm md:text-lg font-semibold px-4 py-3 hover:bg-accent/50 justify-start">
              Expenses
              <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
              <CurrencyDisplay
                className="ml-auto"
                balance={totalExpenses}
                options={currencyDisplayOptions}
              />
            </AccordionTriggerRaw>
            <AccordionContent className="text-xs md:text-base px-4 py-3">
              {expenseEntries.length === 0 ? (
                <p className="text-muted-foreground">
                  No expense entries for this month.
                </p>
              ) : (
                <ul className="space-y-2">
                  {expenseEntries.map((entry) => {
                    const amount = entry.entry_amounts.reduce(
                      (sum, amt) => sum - amt.amount,
                      0
                    );
                    return (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between"
                      >
                        <span>{entry.description}</span>
                        <CurrencyDisplay
                          balance={amount}
                          options={currencyDisplayOptions}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Month Balance */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm md:text-lg font-semibold">
            Month Balance
          </span>
          <CurrencyDisplay
            balance={monthBalance}
            options={currencyDisplayOptions}
          />
        </div>
      </Card>

      {/* Budget Navigation */}
      <div className="flex justify-end gap-x-2 mt-8">
        <Button className="max-xs:w-full" variant="outline" asChild>
          <Link href="/budget">Budget Years</Link>
        </Button>
        <Button className="max-xs:w-full" asChild>
          <Link href={`/budget/${budget.id}`}>Manage Budget</Link>
        </Button>
      </div>
    </div>
  );
}
