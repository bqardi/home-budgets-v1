import { cn, formatCurrency, handleNumber } from "@/lib/utils";

type BalanceDisplayProps = {
  balance: number;
  label?: string;
  options?: { locale?: string; currency?: string };
};

export function BalanceDisplay({
  balance,
  label,
  options,
}: BalanceDisplayProps) {
  return (
    <p className="text-xs text-muted-foreground">
      {label && <span className="block text-xs mb-px">{label}</span>}
      <span
        className={cn(
          "block py-0.5 px-2 rounded-sm",
          handleNumber(
            balance,
            "bg-green-100 text-green-700",
            "bg-red-100 text-red-700",
            "bg-gray-200 text-gray-800"
          )
        )}
      >
        {formatCurrency(balance, options?.locale, options?.currency)}
      </span>
    </p>
  );
}
