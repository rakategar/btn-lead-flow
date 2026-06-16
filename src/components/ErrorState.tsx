import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = "Gagal memuat data",
  description = "Terjadi kesalahan saat mengambil data. Periksa koneksi Anda.",
  onRetry,
  className,
  compact,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-[hsl(var(--danger))]/20 bg-[hsl(var(--danger-light))]",
        compact ? "py-6 px-4" : "py-12 px-6",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className={cn(
        "rounded-full bg-[hsl(var(--danger))]/10 flex items-center justify-center mb-3",
        compact ? "h-10 w-10" : "h-16 w-16"
      )}>
        <AlertCircle className={cn("text-[hsl(var(--danger))]", compact ? "h-5 w-5" : "h-8 w-8")} />
      </div>
      <h3 className={cn("font-semibold text-[hsl(var(--danger))]", compact ? "text-sm" : "text-base")}>{title}</h3>
      {description && (
        <p className={cn("text-muted-foreground max-w-xs mt-1", compact ? "text-xs" : "text-sm")}>{description}</p>
      )}
      {onRetry && (
        <Button
          variant="outline-danger"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Coba lagi
        </Button>
      )}
    </div>
  );
}
