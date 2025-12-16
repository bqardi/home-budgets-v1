"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransferOptions } from "@/components/transfer-options";
import { transferRowsFromBudget } from "@/app/actions/transfers";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId: string;
  otherBudgets: Array<{ id: string; name: string; year: number }>;
  onTransferComplete: () => void;
}

export function TransferModal({
  isOpen,
  onClose,
  budgetId,
  otherBudgets,
  onTransferComplete,
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
      await transferRowsFromBudget(
        budgetId,
        selectedBudgetId,
        transferBalance,
        transferIncome,
        transferExpense
      );

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
          <TransferOptions
            selectedBudgetId={selectedBudgetId}
            onBudgetSelect={setSelectedBudgetId}
            otherBudgets={otherBudgets}
            transferBalance={transferBalance}
            onTransferBalanceChange={setTransferBalance}
            transferIncome={transferIncome}
            onTransferIncomeChange={setTransferIncome}
            transferExpense={transferExpense}
            onTransferExpenseChange={setTransferExpense}
            disabled={isTransferring}
          />

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
