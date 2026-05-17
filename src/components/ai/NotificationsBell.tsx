import { useEffect, useState } from "react";
import { BellRing, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { loadNotificationsFor, markNotificationRead, rowToNotif, type RmNotification } from "@/lib/persist";
import { cn } from "@/lib/utils";

export function NotificationsBell({ rmName }: { rmName: string }) {
  const [items, setItems] = useState<RmNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadNotificationsFor(rmName).then((d) => { if (mounted) setItems(d); }).catch(() => {});
    const ch = supabase.channel(`notif_${rmName}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rm_notifications", filter: `rm_name=eq.${rmName}` }, (p) => {
        setItems((prev) => {
          if (p.eventType === "INSERT") {
            const n = rowToNotif(p.new as Parameters<typeof rowToNotif>[0]);
            return prev.some((x) => x.id === n.id) ? prev : [n, ...prev];
          }
          if (p.eventType === "UPDATE") {
            const n = rowToNotif(p.new as Parameters<typeof rowToNotif>[0]);
            return prev.map((x) => (x.id === n.id ? n : x));
          }
          if (p.eventType === "DELETE") {
            const id = (p.old as { id: string }).id;
            return prev.filter((x) => x.id !== id);
          }
          return prev;
        });
      })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [rmName]);

  const unread = items.filter((i) => !i.readAt).length;

  const onMarkAll = async () => {
    const toMark = items.filter((i) => !i.readAt);
    setItems((prev) => prev.map((i) => i.readAt ? i : { ...i, readAt: new Date().toISOString() }));
    await Promise.all(toMark.map((i) => markNotificationRead(i.id).catch(() => {})));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-navy"
          title="Notifikasi"
          aria-label="Notifikasi"
        >
          <BellRing className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <div className="text-sm font-bold text-navy">Notifikasi</div>
          {unread > 0 && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onMarkAll}>
              <Check className="h-3 w-3 mr-1" /> Tandai dibaca
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-auto divide-y divide-border">
          {items.length === 0 && (
            <div className="px-3 py-6 text-xs text-muted-foreground text-center">Belum ada notifikasi.</div>
          )}
          {items.map((n) => (
            <div key={n.id} className={cn("px-3 py-2.5", !n.readAt && "bg-gold-light/40")}>
              <div className="text-[13px] text-navy">{n.message}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {n.createdBy ? `${n.createdBy} · ` : ""}
                {new Date(n.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
