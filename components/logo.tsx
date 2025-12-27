import { cn } from "@/lib/utils";
import Image from "next/image";

type NavLogoProps = {
  className?: string;
};

export function Logo({ className }: NavLogoProps) {
  return (
    <Image
      src="/icon0.svg"
      alt="Budget Manager"
      width={32}
      height={32}
      className={cn("h-8 w-8", className)}
    />
  );
}
