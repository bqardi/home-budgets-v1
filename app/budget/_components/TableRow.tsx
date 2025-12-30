"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  deleteEntry,
  updateEntryAmount,
  updateEntryDescription,
} from "@/app/actions/entries";
import { Trash2 } from "lucide-react";
import { EditEntryModal } from "./EditEntryModal";
import { Entry, Category, Settings } from "@/lib/types";
import { formatCurrency, handleNumber } from "@/lib/utils";

interface BudgetTableRowProps {
  entry: Entry;
  budgetId: string;
  categories: Category[];
  categoryMap: Record<string, string>;
  onDelete?: () => void;
  onUpdate?: () => void;
  settings: Settings | null;
}

export function TableRow({
  entry,
  budgetId,
  categories,
  categoryMap,
  onDelete,
  onUpdate,
  settings,
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

  const handleSaveAmount = async (amountId: string, originalAmount: number) => {
    setSaving(true);
    try {
      const newAmount = parseFloat(editingAmount || "0");
      if (isNaN(newAmount)) throw new Error("Invalid amount");

      // Only update if the value has changed
      if (newAmount !== originalAmount) {
        await updateEntryAmount(amountId, budgetId, newAmount);
        onUpdate?.();
      }

      setEditingMonth(null);
      setEditingAmount("");
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
    <tr className="hover:bg-secondary dark:hover:bg-secondary transition-colors border-b">
      {/* Description */}
      <td className="md:sticky md:left-0 md:z-10 p-2 border-r max-w-50 truncate bg-background dark:bg-background hover:bg-secondary dark:hover:bg-secondary">
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
      <td className="md:sticky md:left-50 md:z-10 p-2 border-r text-sm text-muted-foreground max-w-30 truncate bg-background dark:bg-background hover:bg-secondary dark:hover:bg-secondary">
        {categoryMap[entry.category_id]}
      </td>

      {/* Monthly Amounts */}
      {Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const amount = amountMap[month];
        const isEditing = editingMonth === month;

        return (
          <td
            key={month}
            className="p-2 text-right border-r min-w-26.25 bg-background dark:bg-background"
          >
            {isEditing && amount ? (
              <input
                type="number"
                step="0.01"
                value={editingAmount}
                onChange={(e) => setEditingAmount(e.target.value)}
                onBlur={() => handleSaveAmount(amount.id, amount.amount)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    handleSaveAmount(amount.id, amount.amount);
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
                className={`font-mono cursor-pointer hover:bg-secondary dark:hover:bg-secondary px-1 py-0.5 rounded ${handleNumber(
                  amount.amount,
                  entry.entry_type === "income"
                    ? "text-success dark:text-success"
                    : "text-destructive dark:text-destructive",
                  "text-destructive dark:text-destructive",
                  "text-muted-foreground"
                )}`}
              >
                {amount
                  ? `${formatCurrency(
                      amount.amount,
                      settings?.locale || "da-DK",
                      settings?.currency || "DKK"
                    )}`
                  : "-"}
              </div>
            )}
          </td>
        );
      })}

      {/* Row Total */}
      <td
        className={`font-mono md:sticky md:right-26.25 md:z-10 p-2 text-right border-x font-semibold min-w-26.25 bg-background dark:bg-background hover:bg-secondary dark:hover:bg-secondary ${handleNumber(
          rowTotal,
          "text-success dark:text-success",
          "text-destructive dark:text-destructive",
          "text-muted-foreground"
        )}`}
      >
        {formatCurrency(
          rowTotal,
          settings?.locale || "da-DK",
          settings?.currency || "DKK"
        )}
      </td>

      {/* Delete Button */}
      <td className="md:sticky md:right-0 md:z-10 p-2 bg-background dark:bg-background hover:bg-secondary dark:hover:bg-secondary flex gap-2">
        <EditEntryModal
          entry={entry}
          budgetId={budgetId}
          categories={categories}
          onSuccess={onUpdate}
        />
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
