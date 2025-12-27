import Link from "next/link";
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

interface BudgetData {
  budget: Budget;
  entries: Entry[];
}

interface BudgetCurrentProps {
  data: BudgetData;
}

export function BudgetCurrent({ data }: BudgetCurrentProps) {
  const { entries, budget } = data;
  const lastMonth = new Date().getMonth(); // 0-11
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const monthName = getAllMonths({
    locale: "en-US",
    format: "long",
  })[currentMonth - 1];

  const incomeEntries = entries.filter(
    (entry) => entry.entry_type === "income"
  );
  const expenseEntries = entries.filter(
    (entry) => entry.entry_type === "expense"
  );
  const runningTotalUpToMonth = (month: number) => {
    let total = 0;
    entries.forEach((entry) => {
      entry.entry_amounts.forEach((amount) => {
        if (Number(amount.month) <= month) {
          if (entry.entry_type === "income") {
            total += amount.amount;
          } else if (entry.entry_type === "expense") {
            total -= amount.amount;
          }
        }
      });
    });
    return total;
  };
  const endingBalanceLastMonth =
    (budget.starting_balance || 0) + runningTotalUpToMonth(lastMonth);
  const totalIncome = incomeEntries.reduce(
    (sum, entry) =>
      sum +
      (entry.entry_amounts.find(
        (amount) => Number(amount.month) === currentMonth
      )?.amount || 0),
    0
  );
  const totalExpenses = expenseEntries.reduce(
    (sum, entry) =>
      sum +
      (entry.entry_amounts.find(
        (amount) => Number(amount.month) === currentMonth
      )?.amount || 0),
    0
  );
  const currentBalance = endingBalanceLastMonth + totalIncome - totalExpenses;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">{budget.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {monthName} {budget.year}
          </p>
        </div>
        <Button asChild>
          <Link href={`/budget/${budget.id}`}>Manage Budget</Link>
        </Button>
      </div>

      {/* Starting Balance */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-medium">Starting Balance</span>
        <span className="text-sm font-semibold">
          {formatCurrency(endingBalanceLastMonth)}
        </span>
      </div>

      {/* Accordions */}
      <Accordion type="single" collapsible className="w-full">
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
                  const amount = entry.entry_amounts.find(
                    (amt) => Number(amt.month) === currentMonth
                  )?.amount;
                  if (!amount) return null;
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
        <AccordionItem value="expenses" className="">
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
                  const amount = entry.entry_amounts.find(
                    (amt) => Number(amt.month) === currentMonth
                  )?.amount;
                  if (!amount) return null;
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

      {/* Current Balance */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-semibold text-sm">Current Balance</span>
        <span
          className={`text-sm font-bold ${
            currentBalance >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(currentBalance)}
        </span>
      </div>
    </div>
  );
}
