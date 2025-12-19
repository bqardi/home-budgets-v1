import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getAllMonths({
  locale = navigator.language,
  format = "long",
  textFormat = "proper",
}: {
  locale?: string;
  format?: "long" | "numeric" | "2-digit" | "short" | "narrow";
  textFormat?: "proper" | "upper" | "lower";
} = {}) {
  const applyFormat = new Intl.DateTimeFormat(locale, {
    month: format,
    timeZone: "UTC",
  }).format;
  return [...Array(12).keys()].map((m) => {
    const month = applyFormat(new Date(Date.UTC(0, m))).replace(/\.$/, "");
    if (textFormat === "upper") return month.toUpperCase();
    if (textFormat === "lower") return month.toLowerCase();
    if (textFormat === "proper")
      return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
    return month;
  });
}
