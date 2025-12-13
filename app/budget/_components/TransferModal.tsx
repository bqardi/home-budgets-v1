"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { transferRowsFromBudget } from "@/app/actions/transfers";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
  otherBudgets: Array<{ id: string; name: string; year: number }>;
  onTransferComplete: () => void;
  onBalanceTransfer?: (balance: number) => void;
}

export function TransferModal({
  isOpen,
  onClose,
  budgetId,
  otherBudgets,
  onTransferComplete,
  onBalanceTransfer,
}: TransferModalProps) {
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [transferBalance, setTransferBalance] = useState(false);
  const [transferIncome, setTransferIncome] = useState(false);
  const [transferExpense, setTransferExpense] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!selectedBudgetId) return;
    if (!transferBalance && !transferIncome && !transferExpense) return;

    setIsTransferring(true);
    try {
      const result = await transferRowsFromBudget(
        budgetId,
        selectedBudgetId,
        transferBalance,
        transferIncome,
        transferExpense
      );

      console.log("[TransferModal] Transfer result:", result);

      // If balance was transferred, notify parent component
      if (
        transferBalance &&
        result?.balanceToTransfer !== null &&
        result?.balanceToTransfer !== undefined &&
        onBalanceTransfer
      ) {
        console.log(
          "[TransferModal] Applying balance transfer:",
          result.balanceToTransfer
        );
        onBalanceTransfer(result.balanceToTransfer);
      }

      // Reset modal state
      setSelectedBudgetId("");
      setTransferBalance(false);
      setTransferIncome(false);
      setTransferExpense(false);

      onTransferComplete();
      onClose();
    } catch (error) {
      console.error("[TransferModal] Failed to transfer:", error);
      alert(
        "Failed to transfer data: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsTransferring(false);
    }
  };

  const hasSelection = transferBalance || transferIncome || transferExpense;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer from Another Budget</DialogTitle>
          <DialogDescription>
            Select a source budget and choose what to transfer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Selection */}
          <div className="space-y-2">
            <Label htmlFor="source-budget">Source Budget</Label>
            <Select
              value={selectedBudgetId}
              onValueChange={setSelectedBudgetId}
              disabled={isTransferring}
            >
              <SelectTrigger id="source-budget">
                <SelectValue placeholder="Choose a budget..." />
              </SelectTrigger>
              <SelectContent>
                {otherBudgets.map((budget) => (
                  <SelectItem key={budget.id} value={budget.id}>
                    {budget.name} ({budget.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transfer Options */}
          {selectedBudgetId && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="transfer-balance"
                  checked={transferBalance}
                  onCheckedChange={(checked) =>
                    setTransferBalance(checked as boolean)
                  }
                  disabled={isTransferring}
                />
                <Label
                  htmlFor="transfer-balance"
                  className="flex-1 cursor-pointer"
                >
                  Transfer Starting Balance
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="transfer-income"
                  checked={transferIncome}
                  onCheckedChange={(checked) =>
                    setTransferIncome(checked as boolean)
                  }
                  disabled={isTransferring}
                />
                <Label
                  htmlFor="transfer-income"
                  className="flex-1 cursor-pointer"
                >
                  Transfer All Income Rows
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="transfer-expense"
                  checked={transferExpense}
                  onCheckedChange={(checked) =>
                    setTransferExpense(checked as boolean)
                  }
                  disabled={isTransferring}
                />
                <Label
                  htmlFor="transfer-expense"
                  className="flex-1 cursor-pointer"
                >
                  Transfer All Expense Rows
                </Label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isTransferring}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!selectedBudgetId || !hasSelection || isTransferring}
            >
              {isTransferring ? "Transferring..." : "Transfer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
