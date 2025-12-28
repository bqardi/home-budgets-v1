import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TransferOptionsProps {
  selectedBudgetId: string;
  onBudgetSelect: (budgetId: string) => void;
  otherBudgets: Array<{ id: string; name: string; year: number }>;
  transferBalance: boolean;
  onTransferBalanceChange: (checked: boolean) => void;
  transferIncome: boolean;
  onTransferIncomeChange: (checked: boolean) => void;
  transferExpense: boolean;
  onTransferExpenseChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function TransferOptions({
  selectedBudgetId,
  onBudgetSelect,
  otherBudgets,
  transferBalance,
  onTransferBalanceChange,
  transferIncome,
  onTransferIncomeChange,
  transferExpense,
  onTransferExpenseChange,
  disabled = false,
}: TransferOptionsProps) {
  return (
    <>
      {/* Budget Selection */}
      <div className="space-y-2">
        <Label htmlFor="source-budget">Source Budget (Optional)</Label>
        <Select
          value={selectedBudgetId}
          onValueChange={onBudgetSelect}
          disabled={disabled}
        >
          <SelectTrigger id="source-budget">
            <SelectValue placeholder="Choose a budget to copy from..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
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
                onTransferBalanceChange(checked as boolean)
              }
              disabled={disabled}
            />
            <Label htmlFor="transfer-balance" className="flex-1 cursor-pointer">
              Transfer End Balance &rarr; Starting Balance
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="transfer-income"
              checked={transferIncome}
              onCheckedChange={(checked) =>
                onTransferIncomeChange(checked as boolean)
              }
              disabled={disabled}
            />
            <Label htmlFor="transfer-income" className="flex-1 cursor-pointer">
              Transfer All Income Rows
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="transfer-expense"
              checked={transferExpense}
              onCheckedChange={(checked) =>
                onTransferExpenseChange(checked as boolean)
              }
              disabled={disabled}
            />
            <Label htmlFor="transfer-expense" className="flex-1 cursor-pointer">
              Transfer All Expense Rows
            </Label>
          </div>
        </div>
      )}
    </>
  );
}
