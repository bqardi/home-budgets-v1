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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!description.trim()) throw new Error("Description is required");
      if (!categoryId) throw new Error("Category is required");

      await createEntry(budgetId, categoryId, description, monthlyAmounts);

      setDescription("");
      setCategoryId("");
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
          <div className="space-y-2">
            <Label>Monthly Amounts</Label>
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
                    onChange={(e) => handleMonthChange(idx + 1, e.target.value)}
                    disabled={loading}
                    className="h-8"
                  />
                </div>
              ))}
            </div>
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
                Object.values(monthlyAmounts).every((v) => v === 0)
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
