import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical } from "lucide-react";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { useEffect, useState } from "react";
import { updateStartingBalance } from "@/app/actions/budget";

interface ConfigurationSectionProps {
  budgetId: string;
  startingBalance: string;
  initialStartingBalance: string;
  handleStartingBalanceChange: (value: string) => void;
  otherBudgets: Array<{ id: string; name: string }>;
  setIsTransferModalOpen: (isOpen: boolean) => void;
}

export function ConfigurationSection({
  budgetId,
  startingBalance,
  initialStartingBalance,
  handleStartingBalanceChange,
  otherBudgets,
  setIsTransferModalOpen,
}: ConfigurationSectionProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Debounce effect for saving starting balance
  useEffect(() => {
    const timer = setTimeout(async () => {
      const numValue = parseFloat(startingBalance) || 0;
      if (numValue !== (parseFloat(initialStartingBalance) || 0)) {
        setIsSaving(true);
        try {
          await updateStartingBalance(budgetId, numValue);
        } catch (error) {
          console.error("Failed to save starting balance:", error);
          alert("Failed to save starting balance");
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [startingBalance, budgetId, initialStartingBalance]);

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase">
        Configuration
      </h3>
      <div className="flex items-end gap-x-2">
        <div className="max-w-32">
          <Label htmlFor="starting-balance" className="text-sm">
            Starting Balance
          </Label>
          <Input
            id="starting-balance"
            type="number"
            step="0.01"
            value={startingBalance}
            onChange={(e) => handleStartingBalanceChange(e.target.value)}
            placeholder="0"
            className="mt-1"
            disabled={isSaving}
          />
        </div>

        {/* Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <CreateCategoryModal asDropdownItem={true} />
            </DropdownMenuItem>
            {otherBudgets.length > 0 && (
              <DropdownMenuItem onClick={() => setIsTransferModalOpen(true)}>
                Transfer from Another Budget
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
