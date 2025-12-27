import { cn } from "@/lib/utils";

type NavLogoProps = {
  className?: string;
};

export function Logo({ className }: NavLogoProps) {
  return (
    <svg
      className={cn("size-8", className)}
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40,0 L74.64,20 L74.64,32 L40,12 L16.36,26 L16.36,32 L50.81,52.25 L40.31,58.5 L5.36,38 L5.36,20 Z"
        fill="currentColor"
      />
      <path
        d="M40,23 L74.64,43 L74.64,60 L40,80 L5.36,60 L5.36,48 L40,68.5 L63.64,54.75 L63.64,49 L29.64,29 Z"
        fill="currentColor"
      />
    </svg>
  );
}
