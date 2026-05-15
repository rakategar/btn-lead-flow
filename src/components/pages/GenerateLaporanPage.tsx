import { useState } from "react";
import { FileText, Loader2, CheckCircle2, Download, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SessionUser } from "@/lib/auth";
import type { Lead } from "@/lib/dummy-data";
import {
  picActivities,
  pipelineSummary,
  activityEffectiveness,
  earlyWarnings,
  resultArea,
  mtdKpi,
  dailyRevenue,
} from "@/lib/dummy-data";

interface Props {
  user: SessionUser;
  leads: Lead[];
}

const STEPS = [
  "Mengambil data dashboard...",
  "Mengirim ke Gemini AI...",
  "Menyusun narasi dan insight...",
  "Membuat file laporan...",
  "Selesai!",
];

function buildDashboard(user: SessionUser, leads: Lead[]) {
  const teamRMs = picActivities.filter((p) => p.leader === user.name);
  const high = leads.filter((l) => l.priority === "High").length;
  const med = leads.filter((l) => l.priority === "Medium").length;
  const low = leads.filter((l) => l.priority === "Low").length;
  const closed = leads.filter((l) => l.stage === "Close").length;
  const conv = leads.length ? Math.round((closed / leads.length) * 100) : 0;
  return {
    kpi: {
      totalLeads: leads.length,
      conversionRate: `${conv}%`,
      gapToTarget: mtdKpi.gap,
      leadPrioritasHigh: high,
      target: mtdKpi.target,
      actual: mtdKpi.actual,
    },
    tim: teamRMs,
    pipeline: {
      perStage: pipelineSummary,
      distribusi: { hot: high, warm: med, cold: low },
    },
    efektivitas: {
      detail: activityEffectiveness,
      keseluruhan: Math.round(
        activityEffectiveness.reduce((s, a) => s + a.value, 0) / activityEffectiveness.length,
      ),
    },
    earlyWarning: earlyWarnings,
    areaHasil: resultArea,
    revenueHistory: dailyRevenue,
    leads: leads.map((l) => ({
      nama: l.nama, pic: l.pic, stage: l.stage, priority: l.priority, status: l.status,
    })),
  };
}

export function GenerateLaporanPage({ user, leads }: Props) {
  const [periode, setPeriode] = useState("Minggu 1, Mei 2026");
  const [namaLeader, setNamaLeader] = useState(user.name);
  const [jenis, setJenis] = useState("Laporan Mingguan Tim");
  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [result, setResult] = useState<{ url: string; filename: string; warning?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  if (user.role !== "leader") {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-danger mb-3" />
        <h2 className="font-display text-lg font-bold text-navy">Akses Terbatas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Halaman ini hanya tersedia untuk Leader.
        </p>
      </Card>
    );
  }

  const handleGenerate = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    setStepIdx(0);

    try {
      const dashboard = buildDashboard(user, leads);
      await new Promise((r) => setTimeout(r, 600));
      setStepIdx(1);
      await new Promise((r) => setTimeout(r, 400));
      setStepIdx(2);

      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-laporan`;
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ dashboard, leaderName: namaLeader, periode, jenisLaporan: jenis }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        let msg = txt;
        try { msg = JSON.parse(txt)?.error ?? txt; } catch { /* ignore */ }
        throw new Error(msg || `HTTP ${resp.status}`);
      }

      const blob = await resp.blob();
      const cd = resp.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `Laporan_${namaLeader}_${periode}.pptx`;
      const url = URL.createObjectURL(blob);
      const warningRaw = resp.headers.get("X-Report-Warning") ?? "";
      const warning = warningRaw ? decodeURIComponent(warningRaw) : undefined;

      setStepIdx(3);
      await new Promise((r) => setTimeout(r, 400));
      setStepIdx(4);
      setResult({ url, filename, warning });
      setGeneratedAt(new Date().toLocaleString("id-ID"));

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      if (warning) {
        toast.warning("Laporan dibuat dengan fallback", { description: warning });
      } else {
        toast.success("Laporan berhasil dibuat");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Gagal generate laporan");
      toast.error("Gagal generate laporan", { description: e?.message });
    } finally {
      setRunning(false);
    }
  };


  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-navy flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Generate Laporan Mingguan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Buat laporan otomatis berdasarkan data dashboard saat ini.
            </p>
          </div>
          <Badge className="bg-gold-light text-navy border border-gold/40">Leader</Badge>
        </div>
      </div>

      {/* Form */}
      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-navy text-sm">Konfigurasi Laporan</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nama Leader</Label>
            <Input value={namaLeader} onChange={(e) => setNamaLeader(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Periode Laporan</Label>
            <Input value={periode} onChange={(e) => setPeriode(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal Generate</Label>
            <Input value={today} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Jenis Laporan</Label>
            <Select value={jenis} onValueChange={setJenis}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Laporan Mingguan Tim">Laporan Mingguan Tim</SelectItem>
                <SelectItem value="Presentasi Manajemen">Presentasi Manajemen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={running}
          className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {running ? "Memproses..." : "Generate Laporan"}
        </Button>
      </Card>

      {/* Steps */}
      {(running || result || error) && (
        <Card className="p-5">
          <h3 className="font-semibold text-navy text-sm mb-3">Status</h3>
          <ol className="space-y-2">
            {STEPS.map((s, i) => {
              const done = i < stepIdx || (!!result && i <= 4);
              const active = i === stepIdx && running;
              return (
                <li key={s} className="flex items-center gap-3 text-sm">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border" />
                  )}
                  <span className={done || active ? "text-navy" : "text-muted-foreground"}>{s}</span>
                </li>
              );
            })}
          </ol>
          {error && (
            <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div><div className="font-semibold">Gagal generate</div><div className="text-xs opacity-90">{error}</div></div>
            </div>
          )}
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Ringkasan Insight
            </h3>
            {generatedAt && (
              <span className="text-xs text-muted-foreground">Dibuat pada {generatedAt}</span>
            )}
          </div>

          {result.warning && (
            <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>{result.warning}</div>
            </div>
          )}

          <p className="text-sm text-navy/80 leading-relaxed bg-muted/40 rounded-md p-3 border border-border">
            File <span className="font-mono text-xs">{result.filename}</span> berhasil dibuat.
            Download akan otomatis dimulai. Jika tidak, klik tombol di bawah.
          </p>

          <div className="flex gap-2 pt-2 flex-wrap">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href={result.url} download={result.filename}>
                <Download className="h-4 w-4 mr-2" /> Download Laporan (.pptx)
              </a>
            </Button>
            <Button variant="outline" onClick={handleGenerate} disabled={running}>
              <RefreshCw className="h-4 w-4 mr-2" /> Generate Ulang
            </Button>
          </div>

        </Card>
      )}
    </div>
  );
}