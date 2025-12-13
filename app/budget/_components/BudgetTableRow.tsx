"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { deleteEntry, updateEntry } from "@/app/actions/entries";
import { Trash2, CheckCircle2, XCircle } from "lucide-react";

interface BudgetTableRowProps {
  entry: {
    id: string;
    description: string;
    amount: number;
    category_id: string;
    entry_date: string;
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
  categories,
  categoryMap,
  onDelete,
  onUpdate,
}: BudgetTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState({
    description: entry.description,
    amount: entry.amount.toString(),
    category_id: entry.category_id,
    entry_date: entry.entry_date,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const amount = parseFloat(editData.amount);
      if (isNaN(amount)) throw new Error("Invalid amount");

      await updateEntry(entry.id, budgetId, {
        description: editData.description,
        amount,
        category_id: editData.category_id,
        entry_date: editData.entry_date,
      });

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update entry:", error);
      alert("Failed to update entry");
    } finally {
      setIsSaving(false);
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

  if (isEditing) {
    return (
      <tr className="bg-muted/50">
        <td className="p-2">
          <Input
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            disabled={isSaving}
            className="h-8"
          />
        </td>
        <td className="p-2">
          <Select
            value={editData.category_id}
            onValueChange={(value) =>
              setEditData({ ...editData, category_id: value })
            }
            disabled={isSaving}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
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
            value={editData.amount}
            onChange={(e) =>
              setEditData({ ...editData, amount: e.target.value })
            }
            disabled={isSaving}
            className="h-8"
          />
        </td>
        <td className="p-2">
          <Input
            type="date"
            value={editData.entry_date}
            onChange={(e) =>
              setEditData({ ...editData, entry_date: e.target.value })
            }
            disabled={isSaving}
            className="h-8"
          />
        </td>
        <td className="p-2 space-x-1 flex">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
          >
            <CheckCircle2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-muted/50 transition-colors border-b">
      <td className="p-2 cursor-pointer" onClick={() => setIsEditing(true)}>
        {entry.description}
      </td>
      <td className="p-2 text-sm">{categoryMap[entry.category_id]}</td>
      <td
        className="p-2 text-right cursor-pointer font-mono"
        onClick={() => setIsEditing(true)}
      >
        {entry.amount > 0 ? "+" : ""}
        {entry.amount.toFixed(2)}
      </td>
      <td className="p-2 text-sm text-muted-foreground">
        {new Date(entry.entry_date).toLocaleDateString()}
      </td>
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
