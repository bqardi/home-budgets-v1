import * as React from "react";
import { cn } from "@/lib/utils";

interface NumberDisplayContextType {
  value: number;
  locale: string;
  options: Intl.NumberFormatOptions;
}

const NumberDisplayContext = React.createContext<
  NumberDisplayContextType | undefined
>(undefined);

function useNumberDisplay() {
  const context = React.useContext(NumberDisplayContext);
  if (context === undefined) {
    throw new Error("NumberDisplay.Value must be used inside NumberDisplay");
  }
  return context;
}

export interface NumberDisplayProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  value: number;
  negativeClassName?: string;
  positiveClassName?: string;
  nilClassName?: string;
  locale?: string;
  options?: Intl.NumberFormatOptions;
}

function NumberDisplay({
  className,
  value,
  children,
  negativeClassName = "text-red-700",
  positiveClassName = "text-green-700",
  nilClassName = "text-gray-500",
  locale = "da-DK",
  options = { style: "currency", currency: "DKK" },
  ...props
}: NumberDisplayProps) {
  let classNameToUse = nilClassName;
  if (value < 0) {
    classNameToUse = negativeClassName;
  } else if (value > 0) {
    classNameToUse = positiveClassName;
  }

  return (
    <NumberDisplayContext.Provider value={{ value, locale, options }}>
      <span className={cn(classNameToUse, className)} {...props}>
        {children}
      </span>
    </NumberDisplayContext.Provider>
  );
}

function Value() {
  const { value, locale, options } = useNumberDisplay();
  const formatted = new Intl.NumberFormat(locale, options).format(value);
  return <>{formatted}</>;
}

NumberDisplay.Value = Value;

export { NumberDisplay };
