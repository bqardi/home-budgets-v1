"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteBudget } from "@/app/actions/budgets";
import { Trash2 } from "lucide-react";
import { useState } from "react";

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
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Create your first budget to get started managing your household
            finances.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {budgets.map((budget) => (
        <Card key={budget.id} className="hover:bg-accent transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{budget.name}</CardTitle>
                <div className="flex items-center gap-x-2 mt-1">
                  <p className="text-sm text-muted-foreground">{budget.year}</p>
                  <div className="text-muted-foreground">|</div>
                  <p className="text-sm text-muted-foreground">
                    Start balance {(budget.starting_balance || 0).toFixed(0)} kr
                  </p>
                  <div className="text-muted-foreground">→</div>
                  <p className="text-sm text-muted-foreground">
                    End balance {(budget.end_balance || 0).toFixed(0)} kr
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/budget/${budget.id}`}>
                  <Button variant="default" size="sm">
                    View
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(budget.id)}
                  disabled={deleting === budget.id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
