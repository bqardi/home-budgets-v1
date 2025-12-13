"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEntry } from "@/app/actions/entries";
import { Plus } from "lucide-react";

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
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    categoryId: "",
    entryDate: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) throw new Error("Invalid amount");

      await createEntry(
        budgetId,
        formData.categoryId,
        formData.description,
        amount,
        formData.entryDate
      );

      setFormData({
        description: "",
        amount: "",
        categoryId: "",
        entryDate: new Date().toISOString().split("T")[0],
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create entry:", error);
      alert("Failed to create entry");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <tr>
        <td colSpan={5} className="p-4 text-center">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-muted/50 border-t border-b">
      <td className="p-2">
        <Input
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={loading}
          required
          className="h-8"
        />
      </td>
      <td className="p-2">
        <Select
          value={formData.categoryId}
          onValueChange={(value) =>
            setFormData({ ...formData, categoryId: value })
          }
          disabled={loading}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-2">
        <Input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          disabled={loading}
          required
          className="h-8"
        />
      </td>
      <td className="p-2">
        <Input
          type="date"
          value={formData.entryDate}
          onChange={(e) =>
            setFormData({ ...formData, entryDate: e.target.value })
          }
          disabled={loading}
          className="h-8"
        />
      </td>
      <td className="p-2 space-x-2 flex">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={
            loading ||
            !formData.description ||
            !formData.categoryId ||
            !formData.amount
          }
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </td>
    </tr>
  );
}
