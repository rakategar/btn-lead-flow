import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X, Clock, Workflow, Activity, Users, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchItem = {
  id: string;
  type: "lead" | "activity" | "officer" | "page";
  title: string;
  subtitle?: string;
  pageKey?: string;
};

interface Props {
  value: string;
  onChange: (v: string) => void;
  items: SearchItem[];
  onSelectItem?: (item: SearchItem) => void;
  placeholder?: string;
  className?: string;
}

const STORAGE_KEY = "btn_recent_searches";
const MAX_RECENT = 6;

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveRecent(q: string) {
  try {
    const prev = getRecent().filter((x) => x !== q);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
  } catch { /* ignore */ }
}
function removeRecent(q: string) {
  try {
    const prev = getRecent().filter((x) => x !== q);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
  } catch { /* ignore */ }
}

const typeLabel: Record<SearchItem["type"], string> = {
  lead: "Lead", activity: "Aktivitas", officer: "Officer", page: "Halaman",
};
const typeIcon: Record<SearchItem["type"], React.ComponentType<{ className?: string }>> = {
  lead: Workflow, activity: Activity, officer: Users, page: LayoutGrid,
};

function highlight(text: string, q: string) {
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))] rounded px-0.5 font-semibold not-italic">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export function SearchAutocomplete({ value, onChange, items, onSelectItem, placeholder, className }: Props) {
  const [open, setOpen] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState(value);
  const [cursor, setCursor] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Debounce 300ms
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQ(value), 300);
    return () => clearTimeout(timerRef.current);
  }, [value]);

  useEffect(() => {
    if (open) setRecent(getRecent());
  }, [open]);

  // Results
  const results = debouncedQ.trim().length > 0
    ? items.filter(
        (it) =>
          it.title.toLowerCase().includes(debouncedQ.toLowerCase()) ||
          (it.subtitle ?? "").toLowerCase().includes(debouncedQ.toLowerCase())
      ).slice(0, 8)
    : [];

  const grouped: Record<string, SearchItem[]> = {};
  results.forEach((r) => { (grouped[r.type] = grouped[r.type] || []).push(r); });
  const allResults = results;
  const showDropdown = open && (value.length === 0 ? true : true);

  const handleSelect = useCallback((item: SearchItem) => {
    saveRecent(item.title);
    setRecent(getRecent());
    onChange(item.title);
    onSelectItem?.(item);
    setOpen(false);
    setCursor(-1);
    inputRef.current?.blur();
  }, [onChange, onSelectItem]);

  const handleRecentSelect = (q: string) => {
    onChange(q);
    setOpen(false);
    setCursor(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (e.key === "Enter" && cursor >= 0) {
      e.preventDefault();
      handleSelect(allResults[cursor]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setCursor(-1);
      inputRef.current?.blur();
    }
  };

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setCursor(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearInput = () => {
    onChange("");
    setDebouncedQ("");
    setCursor(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-label="Cari lead, aktivitas, officer, atau halaman"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Cari..."}
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-16 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
        />
        {!value && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] pointer-events-none rounded px-1 py-0.5 border" style={{ color: "#94a3b8", backgroundColor: "#f4f6f9", borderColor: "#e2e8f0", borderRadius: "4px" }}>
            <span>Ctrl</span><span>K</span>
          </div>
        )}
        {value && (
          <button
            onClick={clearInput}
            aria-label="Hapus pencarian"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden animate-fade-in-down"
          role="listbox"
          aria-label="Hasil pencarian"
        >
          {/* Empty focus hint */}
          {value.length === 0 && recent.length === 0 && (
            <div className="px-4 py-3 text-center text-xs" style={{ color: "#64748b" }}>
              Cari lead, aktivitas, RM, atau Leader
            </div>
          )}

          {/* Recent searches (empty state) */}
          {value.length === 0 && recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Pencarian Terakhir
                </span>
                <button
                  onClick={() => { localStorage.removeItem(STORAGE_KEY); setRecent([]); }}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Hapus semua
                </button>
              </div>
              {recent.map((q) => (
                <div key={q} className="flex items-center group">
                  <button
                    onClick={() => handleRecentSelect(q)}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{q}</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeRecent(q); setRecent(getRecent()); }}
                    className="px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    aria-label={`Hapus "${q}" dari riwayat`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search results */}
          {value.length > 0 && (
            <>
              {results.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">Tidak ada hasil untuk <span className="font-medium text-foreground">"{value}"</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Coba kata kunci lain atau periksa ejaan</p>
                </div>
              )}
              {Object.entries(grouped).map(([type, typeItems]) => {
                const Icon = typeIcon[type as SearchItem["type"]];
                return (
                  <div key={type}>
                    <div className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Icon className="h-3 w-3" />
                      {typeLabel[type as SearchItem["type"]]}
                    </div>
                    {typeItems.map((item) => {
                      const globalIdx = allResults.indexOf(item);
                      const ItemIcon = typeIcon[item.type];
                      return (
                        <button
                          key={item.id}
                          role="option"
                          aria-selected={cursor === globalIdx}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setCursor(globalIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                            cursor === globalIdx ? "bg-[hsl(var(--primary-light))]" : "hover:bg-muted"
                          )}
                        >
                          <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <ItemIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{highlight(item.title, value)}</div>
                            {item.subtitle && <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
