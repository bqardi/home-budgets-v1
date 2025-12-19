import { NumberDisplay } from "@/components/ui/number-display";

type BalanceDisplayProps = {
  balance?: number | null;
  label?: string;
};

export function BalanceDisplay({ balance, label }: BalanceDisplayProps) {
  return (
    <p className="text-sm text-muted-foreground">
      {label && <span className="block text-xs mb-0.5">{label}</span>}
      <NumberDisplay
        className="block"
        positiveClassName="bg-green-100 text-green-700 py-0.5 px-2 rounded-sm"
        negativeClassName="bg-red-100 text-red-700 py-0.5 px-2 rounded-sm"
        nilClassName="bg-gray-200 text-gray-800 py-0.5 px-2 rounded-sm"
        value={balance || 0}
      >
        <NumberDisplay.Value />
      </NumberDisplay>
    </p>
  );
}
