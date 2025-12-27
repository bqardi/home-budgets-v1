"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteBudget } from "@/app/actions/budgets";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { CreateBudgetModal } from "./CreateBudgetModal";
import { ImportCSVModal } from "./ImportCSVModal";
import { BalanceDisplay } from "./BalanceDisplay";
import { parseCSVFile } from "@/lib/csv/parse";
import { ParsedCSVRow, getExistingCategories } from "@/app/actions/entries";

interface Budget {
  id: string;
  name: string;
  year: number;
  created_at: string;
  starting_balance?: number;
  end_balance?: number;
}

interface BudgetListProps {
  budgets: Budget[];
}

export function BudgetList({ budgets }: BudgetListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [csvModalOpen, setCSVModalOpen] = useState(false);
  const [csvData, setCSVData] = useState<Record<string, string | number>[]>([]);
  const [validatedCSVData, setValidatedCSVData] = useState<
    ParsedCSVRow[] | null
  >(null);
  const [missingCategories, setMissingCategories] = useState<string[]>([]);
  const [showCreateBudgetModal, setShowCreateBudgetModal] = useState(false);
  const [existingCategoryNames, setExistingCategoryNames] = useState<string[]>(
    []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getExistingCategories();
        setExistingCategoryNames(categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    setDeleting(id);
    try {
      await deleteBudget(id);
    } catch (error) {
      console.error("Failed to delete budget:", error);
      alert("Failed to delete budget");
    } finally {
      setDeleting(null);
    }
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseCSVFile(file);
      setCSVData(data);
      setCSVModalOpen(true);
    } catch (error) {
      alert(
        "Failed to parse CSV: " +
          (error instanceof Error ? error.message : String(error))
      );
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCSVConfirm = (
    validRows: ParsedCSVRow[] | null,
    missingCats: string[]
  ) => {
    setValidatedCSVData(validRows);
    setMissingCategories(missingCats);
    setShowCreateBudgetModal(true);
  };

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No budgets yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-12">
            Create your first budget to get started managing your household
            finances.
          </p>
          <CreateBudgetModal budgets={budgets} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      {showCreateBudgetModal && (
        <CreateBudgetModal
          csvData={validatedCSVData}
          missingCategories={missingCategories}
          onClose={() => {
            setShowCreateBudgetModal(false);
            setValidatedCSVData(null);
            setMissingCategories([]);
          }}
        />
      )}
      <ImportCSVModal
        open={csvModalOpen}
        onOpenChange={setCSVModalOpen}
        rawCSVData={csvData}
        onConfirm={handleCSVConfirm}
        existingCategoryNames={existingCategoryNames}
      />
      <div className="flex justify-end flex-wrap gap-2 mb-6">
        <CreateBudgetModal budgets={budgets} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleImportCSV}>
              Import CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid gap-2.5">
        {budgets.map((budget) => (
          <Card
            key={budget.id}
            className="relative isolate has-[button.delete:hover]:bg-red-950/25 has-[button.edit:hover]:bg-blue-950/25 hover:bg-accent/25 transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-x-8 gap-y-4">
                <div className="flex-1 flex items-center justify-between flex-wrap gap-y-2 gap-x-8">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ({budget.year})
                    </p>
                  </div>
                  <div className="flex items-end gap-x-3">
                    <BalanceDisplay
                      balance={budget.starting_balance || 0}
                      label="Start balance"
                      options={{ locale: "da-DK", currency: "DKK" }}
                    />
                    <div className="text-muted-foreground">→</div>
                    <BalanceDisplay
                      balance={budget.end_balance || 0}
                      label="End balance"
                      options={{ locale: "da-DK", currency: "DKK" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={deleting === budget.id}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* TODO: Add edit budget functionality */}
                      <DropdownMenuItem
                        onSelect={() => {
                          console.warn(
                            "Add edit budget functionality",
                            budget.id
                          );
                        }}
                      >
                        <Edit className="w-4 h-4" /> Edit budget
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          handleDelete(budget.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" /> Delete budget
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <Link
              className="absolute inset-0"
              href={`/budget/${budget.id}`}
            ></Link>
          </Card>
        ))}
      </div>
    </>
  );
}
