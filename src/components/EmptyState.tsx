import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, secondaryAction, className, compact }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-16 px-6",
        className
      )}
      role="region"
      aria-label={title}
    >
      <div className={cn(
        "rounded-full bg-muted flex items-center justify-center mb-4",
        compact ? "h-12 w-12" : "h-20 w-20"
      )}>
        <Icon className={cn("text-muted-foreground", compact ? "h-6 w-6" : "h-10 w-10")} strokeWidth={1.25} />
      </div>
      <h3 className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-base mb-1")}>{title}</h3>
      {description && (
        <p className={cn("text-muted-foreground max-w-xs", compact ? "text-xs mt-1" : "text-sm mt-2")}>{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className={cn("flex flex-wrap items-center justify-center gap-2", compact ? "mt-4" : "mt-6")}>
          {action && (
            <Button size="sm" onClick={action.onClick}>{action.label}</Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}
