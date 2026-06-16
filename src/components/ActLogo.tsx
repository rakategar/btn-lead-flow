import { cn } from "@/lib/utils";
// import btnLogo from "@/assets/btn-logo.png"; // TEMPORARY: logo disembunyikan sementara

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 p-1",
  md: "h-10 w-10 p-1.5",
  lg: "h-12 w-12 p-2",
};

export function ActLogo({ size = "md", className }: Props) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-lg bg-white ring-1 ring-border shadow-sm",
        sizes[size],
        className
      )}
      aria-label="Bank BTN"
    >
      {/* <img src={btnLogo} alt="Bank BTN" className="h-full w-full object-contain" /> TEMPORARY: logo disembunyikan sementara */}
    </div>
  );
}
