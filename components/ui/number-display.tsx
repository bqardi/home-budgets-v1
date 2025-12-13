import * as React from "react";
import { cn } from "@/lib/utils";

interface NumberDisplayContextType {
  value: number;
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
}

function NumberDisplay({
  className,
  value,
  children,
  negativeClassName = "text-red-700",
  positiveClassName = "text-green-700",
  nilClassName = "text-gray-500",
  ...props
}: NumberDisplayProps) {
  let classNameToUse = nilClassName;
  if (value < 0) {
    classNameToUse = negativeClassName;
  } else if (value > 0) {
    classNameToUse = positiveClassName;
  }

  console.log(classNameToUse);

  return (
    <NumberDisplayContext.Provider value={{ value }}>
      <span className={cn(classNameToUse, className)} {...props}>
        {children}
      </span>
    </NumberDisplayContext.Provider>
  );
}

function Value() {
  const { value } = useNumberDisplay();
  return <>{value}</>;
}

NumberDisplay.Value = Value;

export { NumberDisplay };
