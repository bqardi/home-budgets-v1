"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  deleteEntry,
  updateEntryAmount,
  updateEntryDescription,
} from "@/app/actions/entries";
import { Trash2 } from "lucide-react";

interface EntryAmount {
  id: string;
  month: number;
  amount: number;
}

interface BudgetTableRowProps {
  entry: {
    id: string;
    description: string;
    category_id: string;
    entry_type: "income" | "expense";
    entry_amounts: EntryAmount[];
  };
  budgetId: string;
  categories: Array<{ id: string; name: string }>;
  categoryMap: Record<string, string>;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export function BudgetTableRow({
  entry,
  budgetId,
  categoryMap,
  onDelete,
  onUpdate,
}: BudgetTableRowProps) {
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(entry.description);
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [editingAmount, setEditingAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create a map of month -> entry_amount for quick lookup
  const amountMap = Object.fromEntries(
    entry.entry_amounts.map((ea) => [ea.month, ea])
  );

  // Calculate row total (apply negative sign for expenses)
  const baseTotal = entry.entry_amounts.reduce((sum, ea) => sum + ea.amount, 0);
  const rowTotal = entry.entry_type === "expense" ? -baseTotal : baseTotal;

  const handleSaveDescription = async () => {
    if (descriptionValue === entry.description) {
      setEditingDescription(false);
      return;
    }

    setSaving(true);
    try {
      await updateEntryDescription(entry.id, budgetId, descriptionValue);
      setEditingDescription(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update description:", error);
      alert("Failed to update description");
      setDescriptionValue(entry.description);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAmount = async (amountId: string) => {
    setSaving(true);
    try {
      const amount = parseFloat(editingAmount || "0");
      if (isNaN(amount)) throw new Error("Invalid amount");

      await updateEntryAmount(amountId, budgetId, amount);
      setEditingMonth(null);
      setEditingAmount("");
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update amount:", error);
      alert("Failed to update amount");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entry?")) return;
    setIsDeleting(true);
    try {
      await deleteEntry(entry.id, budgetId);
      onDelete?.();
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert("Failed to delete entry");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <tr className="hover:bg-muted/30 transition-colors border-b">
      {/* Description */}
      <td className="p-2 border-r max-w-[200px] truncate">
        {editingDescription ? (
          <input
            type="text"
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            onBlur={handleSaveDescription}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveDescription();
              if (e.key === "Escape") {
                setEditingDescription(false);
                setDescriptionValue(entry.description);
              }
            }}
            autoFocus
            disabled={saving}
            className="w-full px-1 py-0.5 border rounded text-sm"
          />
        ) : (
          <div
            onClick={() => setEditingDescription(true)}
            className="cursor-pointer hover:bg-accent px-1 py-0.5 rounded"
          >
            {entry.description}
          </div>
        )}
      </td>

      {/* Category */}
      <td className="p-2 border-r text-sm text-muted-foreground max-w-[120px] truncate">
        {categoryMap[entry.category_id]}
      </td>

      {/* Monthly Amounts */}
      {Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const amount = amountMap[month];
        const isEditing = editingMonth === month;

        return (
          <td key={month} className="p-2 text-right border-r min-w-[80px]">
            {isEditing && amount ? (
              <input
                type="number"
                step="0.01"
                value={editingAmount}
                onChange={(e) => setEditingAmount(e.target.value)}
                onBlur={() => handleSaveAmount(amount.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveAmount(amount.id);
                  if (e.key === "Escape") {
                    setEditingMonth(null);
                    setEditingAmount("");
                  }
                }}
                autoFocus
                disabled={saving}
                className="w-full px-1 py-0.5 border rounded text-right text-sm"
              />
            ) : (
              <div
                onClick={() => {
                  if (amount) {
                    setEditingMonth(month);
                    setEditingAmount(amount.amount.toString());
                  }
                }}
                className={`cursor-pointer hover:bg-accent px-1 py-0.5 rounded ${
                  amount && amount.amount > 0
                    ? entry.entry_type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                    : amount && amount.amount < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                {amount
                  ? `${
                      entry.entry_type === "expense"
                        ? "-"
                        : amount.amount > 0
                        ? "+"
                        : ""
                    }${amount.amount.toFixed(0)}`
                  : "-"}
              </div>
            )}
          </td>
        );
      })}

      {/* Row Total */}
      <td
        className={`p-2 text-right border-r font-semibold min-w-[80px] ${
          rowTotal > 0
            ? "text-green-700"
            : rowTotal < 0
            ? "text-red-700"
            : "text-muted-foreground"
        }`}
      >
        {rowTotal > 0 ? "+" : ""}
        {rowTotal.toFixed(0)}
      </td>

      {/* Delete Button */}
      <td className="p-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}
