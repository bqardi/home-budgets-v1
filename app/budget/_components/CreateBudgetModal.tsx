"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransferOptions } from "@/components/transfer-options";
import { createBudget } from "@/app/actions/budgets";
import { transferRowsFromBudget } from "@/app/actions/transfers";
import { importBudgetFromCSV, ParsedCSVRow } from "@/app/actions/entries";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Budget {
  id: string;
  name: string;
  year: number;
}

interface CreateBudgetModalProps {
  budgets?: Budget[];
  csvData?: ParsedCSVRow[] | null;
  missingCategories?: string[];
  onSuccess?: () => void;
  onClose?: () => void;
}

export function CreateBudgetModal({
  budgets = [],
  csvData,
  missingCategories = [],
  onSuccess,
  onClose,
}: CreateBudgetModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(!!csvData); // Auto-open only if CSV data provided
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
  });
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [transferBalance, setTransferBalance] = useState(true);
  const [transferIncome, setTransferIncome] = useState(true);
  const [transferExpense, setTransferExpense] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the new budget first
      const newBudgetId = await createBudget(formData.name, formData.year);

      // If importing from CSV
      if (csvData && csvData.length > 0) {
        // Import CSV rows (handles category creation internally)
        await importBudgetFromCSV(newBudgetId, csvData, missingCategories);

        setOpen(false);
        onClose?.();
        router.push(`/budget/${newBudgetId}`);
        return;
      }

      // If a source budget was selected, transfer data
      if (
        selectedBudgetId &&
        (transferBalance || transferIncome || transferExpense)
      ) {
        await transferRowsFromBudget(
          newBudgetId,
          selectedBudgetId,
          transferBalance,
          transferIncome,
          transferExpense
        );
      }

      // Reset form
      setFormData({ name: "", year: new Date().getFullYear() });
      setSelectedBudgetId("");
      setTransferBalance(false);
      setTransferIncome(false);
      setTransferExpense(false);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create budget:", error);
      alert(
        "Failed to create budget: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const hasTransferSelection =
    transferBalance || transferIncome || transferExpense;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="md" variant="outline" className="max-xxs:w-full">
          <Plus className="w-4 h-4 mr-2" />
          New Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Budget Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Awesome Budget"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2100"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* CSV Import Info */}
          {csvData && csvData.length > 0 && (
            <div className="border-t pt-4 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                CSV Import
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {csvData.length} row{csvData.length !== 1 ? "s" : ""} will be
                imported with{" "}
                {missingCategories.length === 0
                  ? "existing categories"
                  : `${missingCategories.length} new categor${
                      missingCategories.length !== 1 ? "ies" : "y"
                    }`}
              </p>
            </div>
          )}

          {/* Transfer Options (if budgets exist and not importing CSV) */}
          {budgets.length > 0 && !csvData && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-4">
                Optionally copy data from another budget:
              </p>
              <TransferOptions
                selectedBudgetId={selectedBudgetId}
                onBudgetSelect={setSelectedBudgetId}
                otherBudgets={budgets}
                transferBalance={transferBalance}
                onTransferBalanceChange={setTransferBalance}
                transferIncome={transferIncome}
                onTransferIncomeChange={setTransferIncome}
                transferExpense={transferExpense}
                onTransferExpenseChange={setTransferExpense}
                disabled={loading}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.name.trim() ||
                (selectedBudgetId !== "" && !hasTransferSelection)
              }
            >
              {loading ? "Creating..." : "Create Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
