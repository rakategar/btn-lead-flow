import { cn } from "@/lib/utils";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function ActLogo({ size = "md", className }: Props) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-lg bg-navy text-gold font-extrabold tracking-tight shadow-sm",
        "ring-1 ring-gold/40",
        sizes[size],
        className
      )}
      aria-label="A.C.T"
    >
      <span className="leading-none">A.C.T</span>
      <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-gold" />
    </div>
  );
}
