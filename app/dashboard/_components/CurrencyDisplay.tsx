import { cn, formatCurrency, handleNumber } from "@/lib/utils";

type CurrencyDisplayProps = {
  balance: number;
  className?: string;
  options?: { locale?: string; currency?: string };
};

export function CurrencyDisplay({
  balance,
  className,
  options,
}: CurrencyDisplayProps) {
  return (
    <span
      className={cn(
        "font-semibold font-mono",
        handleNumber(
          balance,
          "text-green-600 dark:text-green-400",
          "text-red-600 dark:text-red-400",
          "text-gray-300 dark:text-gray-700"
        ),
        className
      )}
    >
      {formatCurrency(balance, options?.locale, options?.currency)}
    </span>
  );
}
