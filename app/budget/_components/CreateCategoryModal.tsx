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
import { createCategory } from "@/app/actions/entries";
import { Plus } from "lucide-react";

interface CreateCategoryModalProps {
  onSuccess?: () => void;
  asDropdownItem?: boolean;
}

export function CreateCategoryModal({
  onSuccess,
  asDropdownItem = false,
}: CreateCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createCategory(name);
      setName("");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {asDropdownItem ? (
          <span className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </span>
        ) : (
          <Button size="md" variant="outline">
            Create Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              placeholder="e.g., Groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
