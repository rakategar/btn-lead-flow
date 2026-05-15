// deno-lint-ignore-file no-explicit-any
import pptxgen from "npm:pptxgenjs@3.12.0";
import { BTN_LOGO_B64 } from "./btn-logo-b64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "Content-Disposition, X-Report-Warning",
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// BTN brand palette
const C = {
  navy:        "001A80",
  blue:        "0033CC",
  blueLight:   "3B82F6",
  blueLighter: "93C5FD",
  blueLightest:"BFDBFE",
  red:         "CC0000",
  gray:        "E8EDF5",
  grayDark:    "CBD5E1",
  text:        "1E293B",
  textMuted:   "64748B",
  green:       "16A34A",
  greenBg:     "F0FDF4",
  redBg:       "FEF2F2",
  yellow:      "EAB308",
  white:       "FFFFFF",
};

// ---------- Fallback AI insight ----------
function buildFallbackInsight(dashboard: any) {
  const team = Array.isArray(dashboard?.tim) ? dashboard.tim : [];
  const top = [...team].sort((a, b) => Number(b?.closing ?? 0) - Number(a?.closing ?? 0))[0];
  const att = [...team].sort((a, b) => Number(a?.closing ?? 0) - Number(b?.closing ?? 0))[0];
  const totalLeads = dashboard?.kpi?.totalLeads ?? 0;
  const conversionRate = dashboard?.kpi?.conversionRate ?? "0%";
  const gap = dashboard?.kpi?.gapToTarget ?? "belum tersedia";
  const high = dashboard?.kpi?.leadPrioritasHigh ?? 0;
  return {
    ringkasan_eksekutif: `Dashboard menunjukkan ${totalLeads} leads dengan conversion rate ${conversionRate}. Gap target ${gap}, fokus pada percepatan follow-up lead prioritas tinggi (${high}).`,
    insight_utama: [
      `Total lead aktif: ${totalLeads}, dengan ${high} lead prioritas tinggi.`,
      `Conversion rate ${conversionRate}; arahkan aktivitas tim ke prospek peluang closing tertinggi.`,
      `Gap target ${gap} perlu ditutup melalui ritme follow-up disiplin.`,
    ],
    top_performer: top?.pic ? `${top.pic}: closing tertinggi minggu ini.` : "Data top performer belum tersedia.",
    perlu_perhatian: att?.pic ? `${att.pic}: perlu dorongan agar progres pipeline sesuai target.` : "Data belum tersedia.",
    narasi_kpi: `KPI: ${totalLeads} leads, conversion ${conversionRate}, gap ${gap}.`,
    narasi_pipeline: `Prioritaskan ${high} lead high priority dan stage dekat closing.`,
    narasi_aktivitas: "Tren efektivitas stabil; jaga follow-up konsisten.",
    early_warning: "Risiko stagnasi pipeline jika lead prioritas tinggi tidak ditindaklanjuti.",
    action_plan: [
      "Review harian lead prioritas tinggi.",
      "Tetapkan next action setiap lead di stage kritis.",
      "Coaching terarah untuk RM yang tertinggal.",
    ],
    rekomendasi_leader: "Fokus pada lead prioritas tinggi, follow-up, dan coaching berbasis gap KPI.",
  };
}

// ---------- Gemini AI call ----------
async function callGemini(dashboard: any) {
  const prompt = `Anda analis sales senior. Berdasarkan data dashboard A.C.T Sales CRM berikut, buat laporan mingguan profesional Bahasa Indonesia.

DATA: ${JSON.stringify(dashboard, null, 2)}

Kembalikan HANYA JSON valid:
{
  "ringkasan_eksekutif": "paragraf 3-4 kalimat",
  "insight_utama": ["1","2","3"],
  "top_performer": "nama RM + alasan",
  "perlu_perhatian": "nama RM + alasan",
  "narasi_kpi": "kalimat singkat dengan kata kritis/perhatian/baik",
  "narasi_pipeline": "...",
  "narasi_aktivitas": "tren naik/turun/stabil",
  "early_warning": "...",
  "action_plan": ["1","2","3"],
  "rekomendasi_leader": "..."
}`;

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return { ...buildFallbackInsight(dashboard), _warning: "LOVABLE_API_KEY tidak tersedia. Memakai fallback." };
  }
  const model = Deno.env.get("GEMINI_MODEL") || "google/gemini-2.0-flash-001";
  let delay = 1500;
  let lastStatus = 0;
  let lastErr = "";
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Kamu menjawab HANYA JSON valid tanpa markdown." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (r.status === 429 || r.status === 503) {
        lastStatus = r.status;
        await r.text().catch(() => "");
        if (attempt < maxRetries) { await new Promise(res => setTimeout(res, delay)); delay *= 2; continue; }
        return { ...buildFallbackInsight(dashboard), _warning: `AI sibuk (${r.status}). Memakai analisis berbasis data.` };
      }
      if (r.status === 402) return { ...buildFallbackInsight(dashboard), _warning: "Kredit AI habis. Memakai analisis berbasis data." };
      const data = await r.json();
      if (!r.ok) return { ...buildFallbackInsight(dashboard), _warning: `AI error (${r.status}). Memakai analisis berbasis data.` };
      const text = data?.choices?.[0]?.message?.content ?? "{}";
      try { return JSON.parse(text); } catch {
        const m = text.match(/\{[\s\S]*\}/);
        return m ? JSON.parse(m[0]) : { ...buildFallbackInsight(dashboard), _warning: "Output AI tidak valid." };
      }
    } catch (e: any) {
      lastErr = e?.message ?? String(e);
      if (attempt < maxRetries) { await new Promise(res => setTimeout(res, delay)); delay *= 2; continue; }
    }
  }
  return { ...buildFallbackInsight(dashboard), _warning: `AI gagal (${lastStatus || lastErr}). Memakai fallback.` };
}

// ---------- Utilities ----------
function safeFile(s: string) {
  return String(s || "Laporan").replace(/[^a-zA-Z0-9_\-]+/g, "_").slice(0, 60);
}
function num(v: any, d = 0): number {
  const n = Number(v); return Number.isFinite(n) ? n : d;
}

// ---------- Revenue history: 30 days → 5 weekly periods ----------
function aggregateRevenue(revHist: any[]): { labels: string[]; actual: number[]; target: number[] } {
  if (!Array.isArray(revHist) || revHist.length < 20) return { labels: [], actual: [], target: [] };
  const size = Math.floor(revHist.length / 5);
  const labels = ["Pekan 1", "Pekan 2", "Pekan 3", "Pekan 4", "Pekan 5"];
  const actual: number[] = [];
  const target: number[] = [];
  for (let p = 0; p < 5; p++) {
    const chunk = revHist.slice(p * size, (p + 1) * size);
    actual.push(Math.round(chunk.reduce((s: number, d: any) => s + num(d.actual), 0) / chunk.length));
    target.push(Math.round(chunk.reduce((s: number, d: any) => s + num(d.target), 0) / chunk.length));
  }
  return { labels, actual, target };
}

// ---------- Slide helpers ----------
function addHeader(slide: any, title: string) {
  slide.addShape("rect", { x: 0, y: 0, w: 10, h: 0.52, fill: { color: C.navy } });
  // BTN logo in header (right-aligned)
  slide.addImage({ data: `image/png;base64,${BTN_LOGO_B64}`, x: 8.05, y: 0.04, w: 1.7, h: 0.44 });
  slide.addText(title, {
    x: 0.25, y: 0, w: 7.7, h: 0.52,
    fontFace: "Calibri", fontSize: 17, bold: true, color: C.white, valign: "middle",
  });
}

function kpiCard(slide: any, x: number, y: number, w: number, h: number, label: string, value: string, sub?: string) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color: C.white }, line: { color: C.grayDark, width: 1 }, rectRadius: 0.08 });
  slide.addShape("rect", { x, y, w, h: 0.07, fill: { color: C.blue }, line: { color: C.blue } });
  slide.addText(label, { x: x+0.12, y: y+0.12, w: w-0.24, h: 0.3, fontSize: 9, color: C.textMuted, fontFace: "Calibri" });
  slide.addText(value, { x: x+0.12, y: y+0.42, w: w-0.24, h: h-0.65, fontSize: 22, bold: true, color: C.navy, fontFace: "Calibri", valign: "middle" });
  if (sub) slide.addText(sub, { x: x+0.12, y: y+h-0.28, w: w-0.24, h: 0.25, fontSize: 8, color: C.textMuted, fontFace: "Calibri" });
}

// ---------- Build slides ----------
function buildSlides(pres: any, dashboard: any, ai: any, leaderName: string, periode: string, today: string) {
  pres.defineLayout({ name: "WIDE_10x5625", width: 10, height: 5.625 });
  pres.layout = "WIDE_10x5625";

  const tim = Array.isArray(dashboard.tim) ? dashboard.tim : [];
  const eff = Array.isArray(dashboard.efektivitas?.detail) ? dashboard.efektivitas.detail : [];

  const findEff    = (kw: string) => { const f = eff.find((e: any) => String(e?.name ?? e?.label ?? "").toLowerCase().includes(kw)); return num(f?.value); };
  const findTarget = (kw: string) => { const f = eff.find((e: any) => String(e?.name ?? e?.label ?? "").toLowerCase().includes(kw)); return num(f?.target, 80); };

  const effProsp = findEff("prospect");   const tgtProsp = findTarget("prospect");
  const effFu    = findEff("follow");     const tgtFu    = findTarget("follow");
  const effAppt  = findEff("meeting") || findEff("appoint"); const tgtAppt = findTarget("meeting") || findTarget("appoint");
  const effOverall = num(dashboard.efektivitas?.keseluruhan, Math.round((effProsp + effFu + effAppt) / 3));

  const dist    = dashboard.pipeline?.distribusi || {};
  const hotCnt  = num(dist.hot);
  const warmCnt = num(dist.warm);
  const coldCnt = num(dist.cold);
  const perStage = Array.isArray(dashboard.pipeline?.perStage) ? dashboard.pipeline.perStage : [];

  // ===== SLIDE 1 — COVER =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    // Left accent bar
    s.addShape("rect", { x: 0, y: 0, w: 0.15, h: 5.625, fill: { color: C.blue }, line: { color: C.blue } });
    // Top-right red accent
    s.addShape("rect", { x: 9.2, y: 0, w: 0.8, h: 0.15, fill: { color: C.red }, line: { color: C.red } });

    // BTN Logo — prominent on cover
    s.addImage({
      data: `image/png;base64,${BTN_LOGO_B64}`,
      x: 0.4, y: 0.3, w: 2.2, h: 1.32,
    });

    // Title
    s.addText("Laporan Performa\nPenjualan Mingguan", {
      x: 0.5, y: 1.8, w: 8.8, h: 1.65,
      fontSize: 38, bold: true, color: C.navy, fontFace: "Calibri",
    });
    s.addText("Banking Sales Command Center — A.C.T Framework", {
      x: 0.5, y: 3.45, w: 8.8, h: 0.38,
      fontSize: 14, color: C.textMuted, fontFace: "Calibri",
    });

    // Info box
    s.addShape("roundRect", { x: 0.5, y: 3.95, w: 5.8, h: 1.3, fill: { color: C.gray }, line: { color: C.grayDark }, rectRadius: 0.08 });
    s.addText([
      { text: "Leader : ", options: { bold: true, color: C.navy } },
      { text: `${leaderName}\n`, options: { color: C.text } },
      { text: "Periode         : ", options: { bold: true, color: C.navy } },
      { text: `${periode}\n`, options: { color: C.text } },
      { text: "Tanggal        : ", options: { bold: true, color: C.navy } },
      { text: today, options: { color: C.text } },
    ], { x: 0.7, y: 4.05, w: 5.4, h: 1.1, fontSize: 13, fontFace: "Calibri", valign: "middle" });

    s.addText("Dibuat otomatis dengan AI — Untuk keperluan internal", {
      x: 0.5, y: 5.25, w: 8.8, h: 0.28,
      italic: true, fontSize: 10, color: C.textMuted, fontFace: "Calibri",
    });
  }

  // ===== SLIDE 2 — KPI =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "INDIKATOR KINERJA UTAMA (KPI)");

    const actualKpi = num(dashboard.kpi?.actual);
    const targetKpi = num(dashboard.kpi?.target);
    const pctAchieve = targetKpi > 0 ? Math.round((actualKpi / targetKpi) * 100) : 0;

    kpiCard(s, 0.25, 0.65, 2.3, 1.55, "Total Lead Tim",         String(dashboard.kpi?.totalLeads ?? "-"),     "seluruh lead aktif");
    kpiCard(s, 2.68, 0.65, 2.3, 1.55, "Conversion Rate",        String(dashboard.kpi?.conversionRate ?? "-"), "lead → closing");
    kpiCard(s, 5.11, 0.65, 2.3, 1.55, "Gap ke Target MTD",      String(dashboard.kpi?.gapToTarget ?? "-"),    "juta Rupiah");
    kpiCard(s, 7.54, 0.65, 2.3, 1.55, "Lead Prioritas Tinggi",  String(dashboard.kpi?.leadPrioritasHigh ?? "-"), "perlu FU segera");

    // Status badge
    const narasi = String(ai.narasi_kpi ?? "").toLowerCase();
    const onTrack  = !/kritis|perhatian|buruk/.test(narasi);
    const badgeColor = /kritis/.test(narasi) ? C.red : /perhatian/.test(narasi) ? C.yellow : C.green;
    const badgeText  = /kritis/.test(narasi) ? "⚠ Status: Kritis" : /perhatian/.test(narasi) ? "! Perlu Perhatian" : "✓ On Track";
    s.addShape("roundRect", { x: 7.54, y: 0.57, w: 2.3, h: 0.28, fill: { color: badgeColor }, line: { color: badgeColor }, rectRadius: 0.05 });
    s.addText(badgeText, { x: 7.54, y: 0.57, w: 2.3, h: 0.28, fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Calibri" });

    // Bar chart: Aktual vs Target
    s.addChart(pres.ChartType.bar, [
      { name: `Aktual MTD (Rp ${actualKpi} M)`, labels: ["Pencapaian MTD"], values: [actualKpi] },
      { name: `Target MTD (Rp ${targetKpi} M)`, labels: ["Pencapaian MTD"], values: [targetKpi] },
    ], {
      x: 0.25, y: 2.35, w: 6.5, h: 3.0,
      barDir: "bar", barGrouping: "clustered",
      chartColors: [C.blue, C.gray],
      showValue: true, dataLabelFontSize: 12, dataLabelFontBold: true,
      showLegend: true, legendPos: "b", legendFontSize: 11,
      showTitle: true, title: "Target vs Aktual MTD (dalam juta Rupiah)",
      titleFontSize: 12, titleColor: C.navy,
    });

    // Achievement gauge card
    s.addShape("roundRect", { x: 6.95, y: 2.35, w: 2.8, h: 3.0, fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.1 });
    s.addText("Pencapaian MTD", { x: 7.05, y: 2.55, w: 2.6, h: 0.35, fontSize: 11, bold: true, color: C.white, align: "center", fontFace: "Calibri" });
    s.addText(`${pctAchieve}%`, { x: 7.05, y: 2.9, w: 2.6, h: 1.0, fontSize: 44, bold: true, color: C.yellow, align: "center", fontFace: "Calibri" });
    s.addText(`Rp ${actualKpi} M dari`, { x: 7.05, y: 3.95, w: 2.6, h: 0.35, fontSize: 11, color: C.white, align: "center", fontFace: "Calibri" });
    s.addText(`target Rp ${targetKpi} M`, { x: 7.05, y: 4.3, w: 2.6, h: 0.35, fontSize: 11, color: C.blueLightest, align: "center", fontFace: "Calibri" });
    s.addText(ai.narasi_kpi ?? "", { x: 7.05, y: 4.7, w: 2.6, h: 0.5, fontSize: 9, color: C.gray, align: "center", fontFace: "Calibri" });
  }

  // ===== SLIDE 3 — AKTIVITAS TIM =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "PERFORMA AKTIVITAS HARIAN PER RM");

    // Table
    const headerRow = ["Nama RM", "Prospecting", "Follow-Up", "Meeting", "Closing", "Disiplin"].map(t => ({
      text: t, options: { bold: true, color: C.white, fill: { color: C.navy }, align: "center" },
    }));
    const bodyRows = tim.map((r: any, idx: number) => {
      const bg = idx % 2 === 0 ? C.white : "F8FAFF";
      return [
        { text: String(r.pic ?? r.name ?? "-"),              options: { color: C.text, bold: true, fill: { color: bg } } },
        { text: String(r.prospecting ?? "-"),                 options: { align: "center", color: C.text, fill: { color: bg } } },
        { text: String(r.followUp ?? r.followup ?? "-"),      options: { align: "center", color: C.text, fill: { color: bg } } },
        { text: String(r.meeting ?? "-"),                     options: { align: "center", color: C.text, fill: { color: bg } } },
        { text: String(r.closing ?? "-"),                     options: { align: "center", color: C.text, fill: { color: bg } } },
        { text: String(r.disiplin ?? r.status ?? "Baik"),     options: { align: "center", color: C.text, fill: { color: bg } } },
      ];
    });
    s.addTable([headerRow, ...bodyRows], {
      x: 0.25, y: 0.65, w: 9.5, colW: [2.3, 1.5, 1.5, 1.5, 1.5, 1.2],
      fontSize: 10, fontFace: "Calibri",
      border: { type: "solid", color: C.grayDark, pt: 1 },
      rowH: 0.36,
    });

    // Clustered bar chart
    const rmLabels = tim.map((r: any) => String(r.pic ?? r.name ?? ""));
    s.addChart(pres.ChartType.bar, [
      { name: "Prospecting",  labels: rmLabels, values: tim.map((r: any) => num(r.prospecting)) },
      { name: "Follow-Up",   labels: rmLabels, values: tim.map((r: any) => num(r.followUp ?? r.followup)) },
      { name: "Meeting",     labels: rmLabels, values: tim.map((r: any) => num(r.meeting)) },
      { name: "Closing",     labels: rmLabels, values: tim.map((r: any) => num(r.closing)) },
    ], {
      x: 0.25, y: 2.7, w: 6.1, h: 2.75,
      barDir: "col", barGrouping: "clustered",
      chartColors: [C.navy, C.blue, C.blueLight, C.blueLighter],
      showValue: true, dataLabelFontSize: 9,
      showLegend: true, legendPos: "b", legendFontSize: 9,
      showTitle: true, title: "Jumlah Aktivitas per RM (minggu ini)",
      titleFontSize: 11, titleColor: C.navy,
    });

    // Top performer + Perlu perhatian cards
    s.addShape("roundRect", { x: 6.55, y: 2.7, w: 3.2, h: 1.3, fill: { color: C.greenBg }, line: { color: C.green, width: 2 }, rectRadius: 0.08 });
    s.addText("🏆 Top Performer", { x: 6.7, y: 2.75, w: 2.9, h: 0.3, fontSize: 10, bold: true, color: C.green, fontFace: "Calibri" });
    s.addText(String(ai.top_performer ?? "-"), { x: 6.7, y: 3.05, w: 2.9, h: 0.9, fontSize: 10, color: C.text, fontFace: "Calibri" });

    s.addShape("roundRect", { x: 6.55, y: 4.1, w: 3.2, h: 1.35, fill: { color: C.redBg }, line: { color: C.red, width: 2 }, rectRadius: 0.08 });
    s.addText("⚠ Perlu Perhatian", { x: 6.7, y: 4.15, w: 2.9, h: 0.3, fontSize: 10, bold: true, color: C.red, fontFace: "Calibri" });
    s.addText(String(ai.perlu_perhatian ?? "-"), { x: 6.7, y: 4.45, w: 2.9, h: 0.95, fontSize: 10, color: C.text, fontFace: "Calibri" });
  }

  // ===== SLIDE 4 — PIPELINE =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "PIPELINE DAN PELACAKAN PROGRES");

    const stageLabels = perStage.length ? perStage.slice(0, 4).map((x: any) => String(x.stage ?? x.name ?? "-")) : ["Contact", "Meet", "Prospect", "Close"];
    const stageVals   = perStage.length ? perStage.slice(0, 4).map((x: any) => num(x.count ?? x.value)) : [0, 0, 0, 0];
    const totalPipeline = stageVals.reduce((a: number, b: number) => a + b, 0);

    // Bar chart: Lead per stage
    s.addChart(pres.ChartType.bar, [
      { name: "Jumlah Lead", labels: stageLabels, values: stageVals },
    ], {
      x: 0.25, y: 0.65, w: 5.6, h: 3.6,
      barDir: "bar",
      chartColors: [C.navy, C.blue, C.blueLight, C.blueLighter],
      showValue: true, dataLabelFontSize: 12, dataLabelFontBold: true,
      showTitle: true, title: `Jumlah Lead per Tahap Pipeline (Total: ${totalPipeline})`,
      titleFontSize: 11, titleColor: C.navy,
      showLegend: false,
    });

    // Stage conversion arrows (text)
    const convArr = stageVals.map((v: number, i: number) => i > 0 && stageVals[i-1] > 0 ? `${Math.round((v/stageVals[i-1])*100)}%` : "-");
    s.addText(`Konversi antar tahap: ${stageLabels.map((l: string, i: number) => i > 0 ? `${stageLabels[i-1]}→${l}: ${convArr[i]}` : "").filter(Boolean).join("  |  ")}`, {
      x: 0.25, y: 4.3, w: 5.6, h: 0.3,
      fontSize: 9, italic: true, color: C.textMuted, fontFace: "Calibri",
    });

    // Donut: Lead priority distribution
    const totalDist = hotCnt + warmCnt + coldCnt;
    s.addChart(pres.ChartType.doughnut, [{
      name: "Prioritas",
      labels: [`High Priority (${hotCnt})`, `Medium Priority (${warmCnt})`, `Low Priority (${coldCnt})`],
      values: [hotCnt || 0.001, warmCnt || 0.001, coldCnt || 0.001],
    }], {
      x: 5.95, y: 0.65, w: 3.8, h: 3.3,
      chartColors: [C.red, C.yellow, C.blueLight],
      holeSize: 55,
      showPercent: true, showLabel: false, dataLabelFontSize: 11, dataLabelFontBold: true,
      showTitle: true, title: `Distribusi Prioritas Lead (Total: ${totalDist})`,
      titleFontSize: 11, titleColor: C.navy,
      showLegend: true, legendPos: "b", legendFontSize: 10,
    });

    // Follow-up narasi box
    s.addShape("roundRect", { x: 0.25, y: 4.65, w: 9.5, h: 0.85, fill: { color: C.redBg }, line: { color: C.red, width: 1.5 }, rectRadius: 0.06 });
    s.addText("Follow-Up Jatuh Tempo:", { x: 0.4, y: 4.7, w: 2.0, h: 0.3, fontSize: 10, bold: true, color: C.red, fontFace: "Calibri" });
    s.addText(String(ai.narasi_pipeline ?? "-"), { x: 2.4, y: 4.7, w: 7.1, h: 0.75, fontSize: 10, color: C.text, fontFace: "Calibri", valign: "middle" });
  }

  // ===== SLIDE 5 — EFEKTIVITAS =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "EFEKTIVITAS MANAJEMEN AKTIVITAS");

    // 3 metric cards (menggantikan donut dengan overlaid text — lebih jelas dan readable)
    const metrics = [
      { label: "Prospecting",  val: effProsp, target: tgtProsp, x: 0.25 },
      { label: "Follow-Up",    val: effFu,    target: tgtFu,    x: 3.45 },
      { label: "Appointment",  val: effAppt,  target: tgtAppt,  x: 6.65 },
    ];
    metrics.forEach(({ label, val, target, x }) => {
      const onTarget = val >= target;
      const borderColor = onTarget ? C.green : C.red;
      const bgColor     = onTarget ? C.greenBg : C.redBg;
      const statusText  = onTarget ? "✓ On Target" : `✗ Di bawah target ${val - target}%`;

      s.addShape("roundRect", { x, y: 0.62, w: 3.1, h: 2.4, fill: { color: bgColor }, line: { color: borderColor, width: 2 }, rectRadius: 0.1 });
      s.addText(label, { x: x+0.1, y: 0.72, w: 2.9, h: 0.3, fontSize: 11, bold: true, color: C.navy, align: "center", fontFace: "Calibri" });
      s.addText(`${val}%`, { x: x+0.1, y: 1.02, w: 2.9, h: 0.95, fontSize: 44, bold: true, color: borderColor, align: "center", fontFace: "Calibri" });
      s.addText(`Target: ${target}%`, { x: x+0.1, y: 1.97, w: 2.9, h: 0.28, fontSize: 10, color: C.textMuted, align: "center", fontFace: "Calibri" });
      s.addText(statusText, { x: x+0.1, y: 2.25, w: 2.9, h: 0.65, fontSize: 10, bold: true, color: borderColor, align: "center", valign: "middle", fontFace: "Calibri" });
    });

    // Overall effectiveness banner
    const overallColor = effOverall >= 75 ? C.green : effOverall >= 60 ? C.yellow : C.red;
    s.addShape("roundRect", { x: 0.25, y: 3.12, w: 9.5, h: 0.65, fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.06 });
    s.addText(`Skor Efektivitas Keseluruhan: ${effOverall}%   |   Tren: ${ai.narasi_aktivitas ?? "stabil"}`, {
      x: 0.4, y: 3.12, w: 9.2, h: 0.65,
      fontSize: 13, bold: true, color: C.white, valign: "middle", fontFace: "Calibri",
    });

    // Comparison bar chart: Aktual vs Target — uses real activityEffectiveness data
    const actLabels = eff.length ? eff.map((e: any) => String(e?.name ?? e?.label ?? "")) : ["Prospecting", "Follow-Up", "Appointment"];
    const actActual = eff.length ? eff.map((e: any) => num(e?.value)) : [effProsp, effFu, effAppt];
    const actTarget = eff.length ? eff.map((e: any) => num(e?.target)) : [tgtProsp, tgtFu, tgtAppt];
    s.addChart(pres.ChartType.bar, [
      { name: "Aktual (%)", labels: actLabels, values: actActual },
      { name: "Target (%)", labels: actLabels, values: actTarget },
    ], {
      x: 0.25, y: 3.85, w: 9.5, h: 1.65,
      barDir: "col", barGrouping: "clustered",
      chartColors: [C.blue, C.grayDark],
      showValue: true, dataLabelFontSize: 10, dataLabelFontBold: true,
      showLegend: true, legendPos: "r", legendFontSize: 10,
      showTitle: true, title: "Aktual vs Target per Jenis Aktivitas (%)",
      titleFontSize: 11, titleColor: C.navy,
      valAxisMinVal: 0, valAxisMaxVal: 100,
    });
  }

  // ===== SLIDE 6 — EARLY WARNING =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "SISTEM PERINGATAN DINI & COACHING");

    const ew = Array.isArray(dashboard.earlyWarning) ? dashboard.earlyWarning : [];
    const ewText = (i: number) => { const a = ew[i]; if (!a) return ""; return typeof a === "string" ? a : (a.message ?? a.text ?? a.title ?? ""); };

    // Radar chart — dimensi aktivitas per RM (dengan skor disiplin dari data nyata)
    const disiplinScore = (r: any) => {
      const d = String(r.disiplin ?? r.status ?? "").toLowerCase();
      if (d.includes("sangat") || d.includes("excellent")) return 90;
      if (d.includes("baik") || d.includes("track")) return 72;
      return 50;
    };
    const radarLabels = ["Prospecting", "Follow-Up", "Meeting", "Closing", "Disiplin"];
    const radarSeries = tim.slice(0, 3).map((r: any) => ({
      name: String(r.pic ?? r.name ?? "RM"),
      labels: radarLabels,
      values: [
        Math.min(100, num(r.prospecting) * 10),
        Math.min(100, num(r.followUp ?? r.followup) * 10),
        Math.min(100, num(r.meeting) * 10),
        Math.min(100, num(r.closing) * 10),
        disiplinScore(r),
      ],
    }));
    if (radarSeries.length) {
      s.addChart(pres.ChartType.radar, radarSeries, {
        x: 0.2, y: 0.6, w: 5.1, h: 4.8,
        chartColors: [C.blue, C.red, C.green],
        radarStyle: "filled",
        showLegend: true, legendPos: "b", legendFontSize: 10,
        showTitle: true, title: "Dimensi Aktivitas per RM (Radar Score)",
        titleFontSize: 11, titleColor: C.navy,
      });
      s.addText("*Skala 0–100. Tiap dimensi = jumlah aktivitas × 10 (maks 100)", {
        x: 0.2, y: 5.38, w: 5.1, h: 0.22,
        fontSize: 8, italic: true, color: C.textMuted, fontFace: "Calibri",
      });
    }

    // Warning cards (kanan)
    const warnCards = [
      { title: "Peringatan 1", text: `${ewText(0)}\n${ewText(1)}`, color: C.red, bg: C.redBg },
      { title: "Peringatan 2", text: `${ewText(2)}\n${ewText(3)}`, color: C.yellow, bg: "FFFBEB" },
      { title: "Rekomendasi Coaching", text: `${ai.perlu_perhatian ?? ""}\n${ai.rekomendasi_leader ?? ""}`, color: C.blue, bg: "EFF6FF" },
    ];
    warnCards.forEach(({ title, text, color, bg }, i) => {
      const y = 0.6 + i * 1.65;
      s.addShape("roundRect", { x: 5.45, y, w: 4.3, h: 1.55, fill: { color: bg }, line: { color, width: 1.5 }, rectRadius: 0.08 });
      s.addShape("rect", { x: 5.45, y, w: 0.12, h: 1.55, fill: { color }, line: { color } });
      s.addText(title, { x: 5.65, y: y+0.08, w: 3.95, h: 0.28, fontSize: 10, bold: true, color, fontFace: "Calibri" });
      s.addText(text, { x: 5.65, y: y+0.36, w: 3.95, h: 1.15, fontSize: 9.5, color: C.text, fontFace: "Calibri" });
    });
  }

  // ===== SLIDE 7 — ACTION PLAN =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "RENCANA AKSI MINGGU DEPAN");

    const plans = ai.action_plan ?? [];
    const priorities: Array<[string, string, string, string]> = [
      ["Prioritas 1 — TINGGI",  String(plans[0] ?? ""),  C.red,    "Minggu depan"],
      ["Prioritas 2 — SEDANG",  String(plans[1] ?? ""),  C.yellow, "Minggu depan"],
      ["Prioritas 3 — RUTIN",   String(plans[2] ?? ""),  C.blue,   "Rutin harian"],
    ];
    priorities.forEach(([label, txt, color, deadline], i) => {
      const y = 0.68 + i * 1.5;
      s.addShape("roundRect", { x: 0.25, y, w: 6.15, h: 1.38, fill: { color: C.white }, line: { color, width: 2 }, rectRadius: 0.08 });
      s.addShape("rect", { x: 0.25, y, w: 0.12, h: 1.38, fill: { color }, line: { color } });
      s.addText(label, { x: 0.45, y: y+0.07, w: 5.8, h: 0.28, fontSize: 10, bold: true, color, fontFace: "Calibri" });
      s.addText(txt, { x: 0.45, y: y+0.36, w: 5.8, h: 0.6, fontSize: 10, color: C.text, fontFace: "Calibri" });
      s.addText(`PIC: ${leaderName}   ·   Tenggat: ${deadline}`, { x: 0.45, y: y+0.96, w: 5.8, h: 0.3, fontSize: 9, italic: true, color: C.textMuted, fontFace: "Calibri" });
    });

    // Bar chart: distribusi lead aktif (hot/warm/cold) — data nyata dari dashboard
    const totalActif = hotCnt + warmCnt + coldCnt;
    s.addChart(pres.ChartType.bar, [
      { name: "High Priority",   labels: ["High",   "Medium", "Low"], values: [hotCnt,  0, 0] },
      { name: "Medium Priority", labels: ["High",   "Medium", "Low"], values: [0, warmCnt, 0] },
      { name: "Low Priority",    labels: ["High",   "Medium", "Low"], values: [0, 0, coldCnt] },
    ], {
      x: 6.5, y: 0.68, w: 3.3, h: 4.25,
      barDir: "bar", barGrouping: "stacked",
      chartColors: [C.red, C.yellow, C.blueLight],
      showValue: true, dataLabelFontSize: 11, dataLabelFontBold: true,
      showTitle: true, title: `Lead Aktif\n(Total: ${totalActif})`,
      titleFontSize: 11, titleColor: C.navy,
      showLegend: true, legendPos: "b", legendFontSize: 9,
    });

    s.addShape("roundRect", { x: 0.25, y: 5.2, w: 9.5, h: 0.3, fill: { color: C.gray }, line: { color: C.grayDark }, rectRadius: 0.04 });
    s.addText(`Review berikutnya: ${today}   |   ${leaderName}`, { x: 0.25, y: 5.2, w: 9.5, h: 0.3, fontSize: 10, color: C.text, align: "center", valign: "middle", fontFace: "Calibri" });
  }

  // ===== SLIDE 8 — TREN REVENUE =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "AREA HASIL — KERANGKA A.C.T");

    const area   = Array.isArray(dashboard.areaHasil) ? dashboard.areaHasil : [];
    const aGet   = (i: number) => area[i] || {};
    const actual = num(dashboard.kpi?.actual);
    const target = num(dashboard.kpi?.target);

    // 4 KPI cards
    const cards = [
      { label: "Revenue MTD",   value: String(aGet(0).value ?? `Rp ${actual} M`), sub: String(aGet(0).caption ?? `vs Target Rp ${target} M`), x: 0.25 },
      { label: "Engagement",    value: String(aGet(1).value ?? "-"),               sub: String(aGet(1).caption ?? "Aktivitas vs ekspektasi"), x: 2.67 },
      { label: "Sales Growth",  value: String(aGet(2).value ?? "-"),               sub: String(aGet(2).caption ?? "vs periode sebelumnya"),   x: 5.09 },
      { label: "Leadership",    value: String(aGet(3).value ?? "-"),               sub: `${tim.length} RM di-review`,                         x: 7.51 },
    ];
    cards.forEach(({ label, value, sub, x }) => kpiCard(s, x, 0.65, 2.22, 1.45, label, value, sub));

    // Revenue trend: aggregated from revenueHistory (30 days → 5 periods)
    const revAgg    = aggregateRevenue(dashboard.revenueHistory);
    const hasHist   = revAgg.labels.length === 5;
    const revLabels = hasHist ? revAgg.labels : ["Jan", "Feb", "Mar", "Apr", "Mei"];
    const revActual = hasHist ? revAgg.actual  : [Math.max(0, actual-8), Math.max(0, actual-6), Math.max(0, actual-3), Math.max(0, actual-1), actual];
    const revTarget = hasHist ? revAgg.target  : [Math.max(0, target-4), Math.max(0, target-3), Math.max(0, target-2), Math.max(0, target-1), target];

    s.addChart(pres.ChartType.line, [
      { name: "Revenue Aktual", labels: revLabels, values: revActual },
      { name: "Target",         labels: revLabels, values: revTarget },
    ], {
      x: 0.25, y: 2.25, w: 9.5, h: 3.1,
      chartColors: [C.blue, C.red],
      lineSize: 2.5, lineSmooth: true,
      showValue: true, dataLabelFontSize: 9,
      showLegend: true, legendPos: "b", legendFontSize: 11,
      showTitle: true, title: `Tren Revenue Harian — Rata-rata per Periode${hasHist ? " (data 30 hari terakhir)" : ""}`,
      titleFontSize: 12, titleColor: C.navy,
      showGridLineMajorY: true,
    });
    s.addText(hasHist ? "*Nilai rata-rata revenue harian per periode (5 × 6 hari)" : "*Data historis tidak tersedia — menampilkan proyeksi indikatif", {
      x: 0.25, y: 5.38, w: 9.5, h: 0.22,
      fontSize: 8, italic: true, color: C.textMuted, fontFace: "Calibri",
    });
  }

  // ===== SLIDE 9 — RINGKASAN EKSEKUTIF =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "RINGKASAN EKSEKUTIF");

    const insights = Array.isArray(ai.insight_utama) ? ai.insight_utama : [];
    const insightColors = [C.blue, C.navy, C.blueLight];
    insights.slice(0, 3).forEach((txt: string, i: number) => {
      const y = 0.68 + i * 0.88;
      s.addShape("roundRect", { x: 0.25, y, w: 5.7, h: 0.8, fill: { color: "F8FAFF" }, line: { color: insightColors[i], width: 1.5 }, rectRadius: 0.08 });
      s.addShape("ellipse", { x: 0.35, y: y+0.15, w: 0.5, h: 0.5, fill: { color: insightColors[i] }, line: { color: insightColors[i] } });
      s.addText(String(i + 1), { x: 0.35, y: y+0.15, w: 0.5, h: 0.5, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Calibri" });
      s.addText(String(txt ?? "-"), { x: 0.95, y: y+0.07, w: 4.85, h: 0.66, fontSize: 10, color: C.text, valign: "middle", fontFace: "Calibri" });
    });

    // Pencapaian terbaik
    s.addShape("roundRect", { x: 0.25, y: 3.38, w: 5.7, h: 0.88, fill: { color: C.greenBg }, line: { color: C.green, width: 1.5 }, rectRadius: 0.08 });
    s.addText("🏆 Pencapaian Terbaik", { x: 0.4, y: 3.44, w: 5.4, h: 0.3, fontSize: 10, bold: true, color: C.green, fontFace: "Calibri" });
    s.addText(String(ai.top_performer ?? "-"), { x: 0.4, y: 3.74, w: 5.4, h: 0.48, fontSize: 10, color: C.text, fontFace: "Calibri" });

    // Area fokus
    s.addShape("roundRect", { x: 0.25, y: 4.35, w: 5.7, h: 0.9, fill: { color: C.redBg }, line: { color: C.red, width: 1.5 }, rectRadius: 0.08 });
    s.addText("⚠ Area Fokus Minggu Depan", { x: 0.4, y: 4.41, w: 5.4, h: 0.3, fontSize: 10, bold: true, color: C.red, fontFace: "Calibri" });
    s.addText(String(ai.perlu_perhatian ?? "-"), { x: 0.4, y: 4.71, w: 5.4, h: 0.5, fontSize: 10, color: C.text, fontFace: "Calibri" });

    // Closing panel (BTN branding)
    s.addShape("rect", { x: 6.15, y: 0.65, w: 3.6, h: 4.65, fill: { color: C.navy }, line: { color: C.navy } });
    s.addImage({ data: `image/png;base64,${BTN_LOGO_B64}`, x: 6.3, y: 0.82, w: 2.0, h: 1.2 });
    s.addText("Terima Kasih", { x: 6.2, y: 2.15, w: 3.5, h: 0.55, fontSize: 22, bold: true, color: C.white, align: "center", fontFace: "Calibri" });
    s.addText("Atas dedikasi dan kerja keras\nseluruh tim sales BTN.", { x: 6.2, y: 2.72, w: 3.5, h: 0.85, fontSize: 11, color: C.white, align: "center", fontFace: "Calibri" });
    s.addShape("rect", { x: 6.3, y: 3.7, w: 3.3, h: 0.02, fill: { color: C.blueLighter }, line: { color: C.blueLighter } });
    s.addText("A.C.T Sales CRM", { x: 6.2, y: 3.85, w: 3.5, h: 0.3, fontSize: 11, color: C.blueLightest, align: "center", fontFace: "Calibri" });
    s.addText(`Dibuat otomatis — ${today}`, { x: 6.2, y: 5.0, w: 3.5, h: 0.25, fontSize: 9, italic: true, color: C.grayDark, align: "center", fontFace: "Calibri" });
  }
}

// ---------- Main handler ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { dashboard, leaderName, periode, jenisLaporan: _jenis } = await req.json();
    if (!dashboard) return json({ error: "Missing dashboard data" }, 400);

    const ai = await callGemini(dashboard);
    const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

    const pres = new pptxgen();
    pres.author  = "A.C.T Sales CRM";
    pres.company = "Bank BTN";
    pres.title   = `Laporan ${leaderName} — ${periode}`;

    buildSlides(pres, dashboard, ai, leaderName ?? "-", periode ?? "-", today);

    const buf = await pres.write({ outputType: "nodebuffer" }) as Uint8Array;
    const filename = `Laporan_${safeFile(leaderName)}_${safeFile(periode)}.pptx`;

    return new Response(buf, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Report-Warning": ai._warning ? encodeURIComponent(ai._warning) : "",
      },
    });
  } catch (e: any) {
    console.error("generate-laporan error:", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});
