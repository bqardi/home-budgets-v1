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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateEntryDescription,
  updateEntryAmount,
  updateEntryType,
} from "@/app/actions/entries";
import { Edit2 } from "lucide-react";

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

interface EntryAmount {
  id: string;
  month: number;
  amount: number;
}

interface EditEntryModalProps {
  entry: {
    id: string;
    description: string;
    category_id: string;
    entry_type: "income" | "expense";
    entry_amounts: EntryAmount[];
  };
  budgetId: string;
  categories: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function EditEntryModal({
  entry,
  budgetId,
  categories,
  onSuccess,
}: EditEntryModalProps) {
  const detectPattern = ():
    | "custom"
    | "monthly"
    | "quarterly"
    | "half-yearly"
    | "yearly" => {
    const amounts = Object.fromEntries(
      entry.entry_amounts.map((ea) => [ea.month, ea.amount])
    );

    // Check monthly: all months have same non-zero value
    const allMonthsValues = Object.values(amounts);
    const allSame =
      allMonthsValues.every((v) => v === allMonthsValues[0]) &&
      allMonthsValues[0] !== 0;
    if (allSame) return "monthly";

    // Check quarterly: months 1, 4, 7, 10 have same value, others are 0
    const quarterlyMonths = [1, 4, 7, 10];
    const otherMonths = Array.from({ length: 12 }, (_, i) => i + 1).filter(
      (m) => !quarterlyMonths.includes(m)
    );
    const quarterlyValue = amounts[1];
    if (
      quarterlyMonths.every(
        (m) => amounts[m] === quarterlyValue && quarterlyValue !== 0
      ) &&
      otherMonths.every((m) => amounts[m] === 0)
    ) {
      return "quarterly";
    }

    // Check half-yearly: months 1, 7 have same value, others are 0
    const halfYearlyValue = amounts[1];
    if (
      amounts[1] === halfYearlyValue &&
      amounts[7] === halfYearlyValue &&
      halfYearlyValue !== 0 &&
      Array.from({ length: 12 }, (_, i) => i + 1)
        .filter((m) => m !== 1 && m !== 7)
        .every((m) => amounts[m] === 0)
    ) {
      return "half-yearly";
    }

    // Check yearly: month 1 has value, others are 0
    if (
      amounts[1] !== 0 &&
      Array.from({ length: 12 }, (_, i) => i + 1)
        .slice(1)
        .every((m) => amounts[m] === 0)
    ) {
      return "yearly";
    }

    return "custom";
  };

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(entry.description);
  const [categoryId, setCategoryId] = useState(entry.category_id);
  const [entryType, setEntryType] = useState<"income" | "expense">(
    entry.entry_type
  );
  const detectedPattern = detectPattern();
  const [pattern, setPattern] = useState<
    "custom" | "monthly" | "quarterly" | "half-yearly" | "yearly"
  >(detectedPattern);
  const [monthlyAmounts, setMonthlyAmounts] = useState<Record<number, number>>(
    Object.fromEntries(entry.entry_amounts.map((ea) => [ea.month, ea.amount]))
  );

  // Get the repeating amount based on detected pattern
  const getRepeatingAmountFromPattern = () => {
    const amounts = monthlyAmounts;
    if (detectedPattern === "monthly") return amounts[1]?.toString() || "";
    if (detectedPattern === "quarterly") return amounts[1]?.toString() || "";
    if (detectedPattern === "half-yearly") return amounts[1]?.toString() || "";
    if (detectedPattern === "yearly") return amounts[1]?.toString() || "";
    return "";
  };

  const [repeatingAmount, setRepeatingAmount] = useState(
    getRepeatingAmountFromPattern()
  );

  const handleMonthChange = (month: number, value: string) => {
    const amount = parseFloat(value) || 0;
    setMonthlyAmounts({
      ...monthlyAmounts,
      [month]: amount,
    });
  };

  const applyPattern = (pattern: string, amount: number) => {
    const newAmounts = { ...monthlyAmounts };

    switch (pattern) {
      case "monthly":
        for (let i = 1; i <= 12; i++) {
          newAmounts[i] = amount;
        }
        break;
      case "quarterly":
        newAmounts[1] = amount;
        newAmounts[4] = amount;
        newAmounts[7] = amount;
        newAmounts[10] = amount;
        break;
      case "half-yearly":
        newAmounts[1] = amount;
        newAmounts[7] = amount;
        break;
      case "yearly":
        newAmounts[1] = amount;
        break;
    }

    setMonthlyAmounts(newAmounts);
  };

  const handlePatternChange = (newPattern: string) => {
    setPattern(
      newPattern as
        | "custom"
        | "monthly"
        | "quarterly"
        | "half-yearly"
        | "yearly"
    );
    if (newPattern !== "custom" && repeatingAmount) {
      applyPattern(newPattern, parseFloat(repeatingAmount) || 0);
    }
  };

  const handleRepeatingAmountChange = (value: string) => {
    setRepeatingAmount(value);
    if (pattern !== "custom") {
      applyPattern(pattern, parseFloat(value) || 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!description.trim()) throw new Error("Description is required");
      if (!categoryId) throw new Error("Category is required");

      // Update description
      await updateEntryDescription(entry.id, budgetId, description);

      // Update entry type if changed
      if (entryType !== entry.entry_type) {
        await updateEntryType(entry.id, budgetId, entryType);
      }

      // Update amounts
      for (const [month, amount] of Object.entries(monthlyAmounts)) {
        const monthNum = parseInt(month);
        const oldAmount = entry.entry_amounts.find(
          (ea) => ea.month === monthNum
        );
        if (oldAmount && oldAmount.amount !== amount) {
          await updateEntryAmount(oldAmount.id, budgetId, amount);
        }
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update entry:", error);
      alert("Failed to update entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        title="Edit entry"
      >
        <Edit2 className="w-4 h-4" />
      </Button>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description, Category, and Type */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Husleje"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={loading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={entryType}
                onValueChange={(val) =>
                  setEntryType(val as "income" | "expense")
                }
                disabled={loading}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Monthly Amounts */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Pattern
              </Label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: "custom", label: "Custom" },
                  { value: "monthly", label: "Monthly (all 12)" },
                  {
                    value: "quarterly",
                    label: "Quarterly (Jan, Apr, Jul, Oct)",
                  },
                  { value: "half-yearly", label: "Half-yearly (Jan, Jul)" },
                  { value: "yearly", label: "Yearly (Jan only)" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="pattern"
                      value={option.value}
                      checked={pattern === option.value}
                      onChange={(e) => handlePatternChange(e.target.value)}
                      disabled={loading}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Repeating Amount (for non-custom patterns) */}
            {pattern !== "custom" && (
              <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Label htmlFor="repeating">Amount</Label>
                <Input
                  id="repeating"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={repeatingAmount}
                  onChange={(e) => handleRepeatingAmountChange(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-blue-700 mt-2">
                  This amount will be applied to:{" "}
                  {pattern === "monthly"
                    ? "all 12 months"
                    : pattern === "quarterly"
                    ? "Jan, Apr, Jul, Oct"
                    : pattern === "half-yearly"
                    ? "Jan, Jul"
                    : "Jan"}
                </p>
              </div>
            )}

            {/* Custom Monthly Amounts Grid */}
            {pattern === "custom" && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                {MONTHS.map((month, idx) => (
                  <div key={month} className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {month}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={monthlyAmounts[idx + 1]}
                      onChange={(e) =>
                        handleMonthChange(idx + 1, e.target.value)
                      }
                      disabled={loading}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
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
                !description.trim() ||
                !categoryId ||
                (pattern === "custom"
                  ? Object.values(monthlyAmounts).every((v) => v === 0)
                  : !repeatingAmount || parseFloat(repeatingAmount) === 0)
              }
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
