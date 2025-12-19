"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteBudget } from "@/app/actions/budgets";
import { Edit, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { CreateBudgetModal } from "./CreateBudgetModal";
import { BalanceDisplay } from "./BalanceDisplay";

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
  const [enableActions, setEnableActions] = useState(false);

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
      <div className="flex justify-end gap-2 mb-6">
        <CreateBudgetModal budgets={budgets} />
        <Button
          size="md"
          variant={enableActions ? "outline" : "destructive"}
          onClick={() => setEnableActions((prev) => !prev)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Toggle actions
        </Button>
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
                    />
                    <div className="text-muted-foreground">→</div>
                    <BalanceDisplay
                      balance={budget.end_balance}
                      label="End balance"
                    />
                  </div>
                </div>
                {enableActions && (
                  <div className="flex items-center gap-2 relative z-10">
                    {/* TODO: Add edit budget functionality */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        console.warn("Add edit budget functionality", budget.id)
                      }
                      title="Edit budget"
                      className="edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(budget.id)}
                      disabled={deleting === budget.id}
                      title="Delete budget"
                      className="delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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
