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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEntry } from "@/app/actions/entries";
import { Plus } from "lucide-react";

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

interface CreateEntryRowProps {
  budgetId: string;
  categories: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function CreateEntryRow({
  budgetId,
  categories,
  onSuccess,
}: CreateEntryRowProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pattern, setPattern] = useState<
    "custom" | "monthly" | "quarterly" | "half-yearly" | "yearly"
  >("custom");
  const [repeatingAmount, setRepeatingAmount] = useState("");
  const [monthlyAmounts, setMonthlyAmounts] = useState<Record<number, number>>(
    Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 0]))
  );

  const handleMonthChange = (month: number, value: string) => {
    const amount = parseFloat(value) || 0;
    setMonthlyAmounts({
      ...monthlyAmounts,
      [month]: amount,
    });
  };

  const applyPattern = (pattern: string, amount: number) => {
    const newAmounts = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [i + 1, 0])
    );

    switch (pattern) {
      case "monthly":
        // Apply to all months
        for (let i = 1; i <= 12; i++) {
          newAmounts[i] = amount;
        }
        break;
      case "quarterly":
        // Jan, Apr, Jul, Oct
        newAmounts[1] = amount;
        newAmounts[4] = amount;
        newAmounts[7] = amount;
        newAmounts[10] = amount;
        break;
      case "half-yearly":
        // Jan, Jul
        newAmounts[1] = amount;
        newAmounts[7] = amount;
        break;
      case "yearly":
        // Jan only
        newAmounts[1] = amount;
        break;
    }

    setMonthlyAmounts(newAmounts);
  };

  const handlePatternChange = (newPattern: string) => {
    setPattern(newPattern as "custom" | "monthly" | "quarterly" | "half-yearly" | "yearly");
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

      if (pattern === "custom") {
        const hasAmount = Object.values(monthlyAmounts).some((v) => v !== 0);
        if (!hasAmount)
          throw new Error("At least one monthly amount is required");
      } else {
        if (!repeatingAmount || parseFloat(repeatingAmount) === 0)
          throw new Error("Amount is required");
      }

      await createEntry(budgetId, categoryId, description, monthlyAmounts);

      setDescription("");
      setCategoryId("");
      setPattern("custom");
      setRepeatingAmount("");
      setMonthlyAmounts(
        Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 0]))
      );
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create entry:", error);
      alert("Failed to create entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description and Category */}
          <div className="grid grid-cols-2 gap-4">
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
              {loading ? "Creating..." : "Create Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
