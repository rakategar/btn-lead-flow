// deno-lint-ignore-file no-explicit-any
import pptxgen from "npm:pptxgenjs@3.12.0";

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
  navy: "001A80",
  blue: "0033CC",
  blueLight: "3B82F6",
  blueLighter: "93C5FD",
  blueLightest: "BFDBFE",
  red: "CC0000",
  gray: "E8EDF5",
  text: "1E293B",
  textMuted: "64748B",
  green: "16A34A",
  yellow: "EAB308",
  orange: "D97706",
  white: "FFFFFF",
};

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
    top_performer: top?.pic ? `${top.pic}: closing tertinggi minggu ini.` : "Belum ada top performer.",
    perlu_perhatian: att?.pic ? `${att.pic}: perlu perhatian agar progres pipeline sesuai target.` : "Belum ada RM yang perlu perhatian.",
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

async function callGemini(_apiKey: string, dashboard: any) {
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
  const model = Deno.env.get("GEMINI_MODEL") || "google/gemini-3-flash-preview";
  const maxRetries = 3;
  let delay = 1500;
  let lastStatus = 0;
  let lastErr = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
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
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, delay));
          delay *= 2;
          continue;
        }
        return { ...buildFallbackInsight(dashboard), _warning: `AI sibuk (${r.status}). Memakai analisis berbasis data.` };
      }

      if (r.status === 402) {
        return { ...buildFallbackInsight(dashboard), _warning: "Kredit AI habis. Memakai analisis berbasis data." };
      }

      const data = await r.json();
      if (!r.ok) {
        return { ...buildFallbackInsight(dashboard), _warning: `AI error (${r.status}). Memakai analisis berbasis data.` };
      }
      const text = data?.choices?.[0]?.message?.content ?? "{}";
      try {
        return JSON.parse(text);
      } catch {
        const m = text.match(/\{[\s\S]*\}/);
        return m ? JSON.parse(m[0]) : { ...buildFallbackInsight(dashboard), _warning: "Output AI tidak valid. Memakai fallback." };
      }
    } catch (e: any) {
      lastErr = e?.message ?? String(e);
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
        continue;
      }
    }
  }
  return { ...buildFallbackInsight(dashboard), _warning: `AI gagal (${lastStatus || lastErr}). Memakai fallback.` };
}

function safeFile(s: string) {
  return String(s || "Laporan").replace(/[^a-zA-Z0-9_\-]+/g, "_").slice(0, 60);
}

function num(v: any, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

// ---------- Slide helpers ----------
function addHeader(slide: any, title: string) {
  slide.addShape("rect", { x: 0, y: 0, w: 10, h: 0.55, fill: { color: C.navy } });
  slide.addText(title, {
    x: 0.3, y: 0, w: 9.4, h: 0.55,
    fontFace: "Calibri", fontSize: 18, bold: true, color: C.white, valign: "middle",
  });
}

function kpiCard(slide: any, x: number, y: number, w: number, h: number, label: string, value: string) {
  slide.addShape("roundRect", {
    x, y, w, h, fill: { color: C.white },
    line: { color: C.gray, width: 1 }, rectRadius: 0.08,
  });
  slide.addText(label, {
    x: x + 0.1, y: y + 0.1, w: w - 0.2, h: 0.35,
    fontSize: 10, color: C.textMuted, fontFace: "Calibri",
  });
  slide.addText(value, {
    x: x + 0.1, y: y + 0.45, w: w - 0.2, h: h - 0.55,
    fontSize: 24, bold: true, color: C.navy, fontFace: "Calibri", valign: "middle",
  });
}

function buildSlides(pres: any, dashboard: any, ai: any, leaderName: string, periode: string, today: string) {
  pres.defineLayout({ name: "ACT_10x5_625", width: 10, height: 5.625 });
  pres.layout = "ACT_10x5_625";

  const tim = Array.isArray(dashboard.tim) ? dashboard.tim : [];
  const eff = dashboard.efektivitas?.detail || [];
  const findEff = (kw: string) => {
    const f = eff.find((e: any) => String(e?.label ?? e?.name ?? "").toLowerCase().includes(kw));
    return num(f?.value, 0);
  };
  const effProsp = findEff("prospect");
  const effFu = findEff("follow");
  const effAppt = findEff("meeting") || findEff("appoint");
  const effOverall = num(dashboard.efektivitas?.keseluruhan, Math.round((effProsp + effFu + effAppt) / 3));

  const dist = dashboard.pipeline?.distribusi || {};
  const perStage = Array.isArray(dashboard.pipeline?.perStage) ? dashboard.pipeline.perStage : [];

  // ===== SLIDE 1 — COVER =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    s.addShape("rect", { x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: C.blue }, line: { color: C.blue } });
    s.addShape("rect", { x: 9.2, y: 0, w: 0.8, h: 0.18, fill: { color: C.red }, line: { color: C.red } });
    s.addShape("rect", { x: 0.4, y: 0.25, w: 1.4, h: 0.5, fill: { color: C.blue }, line: { color: C.blue } });
    s.addText("BTN", {
      x: 0.4, y: 0.25, w: 1.4, h: 0.5,
      fontSize: 22, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Calibri",
    });
    s.addText("Laporan Performa\nPenjualan Mingguan", {
      x: 0.6, y: 1.3, w: 8.5, h: 1.6,
      fontSize: 40, bold: true, color: C.navy, fontFace: "Calibri",
    });
    s.addText("Banking Sales Command Center", {
      x: 0.6, y: 2.95, w: 8.5, h: 0.4,
      fontSize: 16, color: C.textMuted, fontFace: "Calibri",
    });
    s.addShape("roundRect", {
      x: 0.6, y: 3.55, w: 5.5, h: 1.3,
      fill: { color: C.gray }, line: { color: C.gray }, rectRadius: 0.08,
    });
    s.addText(
      [
        { text: "Sales Leader: ", options: { bold: true, color: C.navy } },
        { text: `${leaderName}\n`, options: { color: C.text } },
        { text: "Periode: ", options: { bold: true, color: C.navy } },
        { text: `${periode}\n`, options: { color: C.text } },
        { text: "Tanggal: ", options: { bold: true, color: C.navy } },
        { text: today, options: { color: C.text } },
      ],
      { x: 0.8, y: 3.65, w: 5.1, h: 1.1, fontSize: 13, fontFace: "Calibri", valign: "middle" },
    );
    s.addText("Didukung oleh Kerangka A.C.T — Action · Control · Track", {
      x: 0.6, y: 5.05, w: 8.5, h: 0.35,
      italic: true, fontSize: 11, color: C.textMuted, fontFace: "Calibri",
    });
  }

  // ===== SLIDE 2 — KPI =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "INDIKATOR KINERJA UTAMA (KPI)");
    kpiCard(s, 0.3, 0.7, 2.2, 1.5, "Total Lead Tim", String(dashboard.kpi?.totalLeads ?? "-"));
    kpiCard(s, 2.68, 0.7, 2.2, 1.5, "Conversion Rate", String(dashboard.kpi?.conversionRate ?? "-"));
    kpiCard(s, 5.06, 0.7, 2.2, 1.5, "Gap ke Target", String(dashboard.kpi?.gapToTarget ?? "-"));
    kpiCard(s, 7.44, 0.7, 2.2, 1.5, "Lead Prioritas Tinggi", String(dashboard.kpi?.leadPrioritasHigh ?? "-"));

    const narasi = String(ai.narasi_kpi ?? "").toLowerCase();
    const badgeColor = /kritis/.test(narasi) ? C.red : /perhatian/.test(narasi) ? C.yellow : C.green;
    const badgeText = /kritis/.test(narasi) ? "Status: Kritis" : /perhatian/.test(narasi) ? "Status: Perlu Perhatian" : "Status: On Track";
    s.addShape("roundRect", {
      x: 7.6, y: 0.62, w: 2.1, h: 0.28,
      fill: { color: badgeColor }, line: { color: badgeColor }, rectRadius: 0.05,
    });
    s.addText(badgeText, {
      x: 7.6, y: 0.62, w: 2.1, h: 0.28,
      fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Calibri",
    });

    s.addChart(pres.ChartType.bar, [
      { name: "Aktual MTD", labels: ["MTD"], values: [num(dashboard.kpi?.actual)] },
      { name: "Target MTD", labels: ["MTD"], values: [num(dashboard.kpi?.target)] },
    ], {
      x: 2.3, y: 2.3, w: 7.4, h: 3.0,
      barDir: "bar", chartColors: [C.blue, C.gray],
      showValue: true, showLegend: true, legendPos: "b",
      showTitle: true, title: "Target MTD vs Aktual MTD",
      titleFontSize: 12, titleColor: C.navy,
    });
  }

  // ===== SLIDE 3 — AKTIVITAS TIM =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "PERFORMA AKTIVITAS HARIAN PER RM");

    const headerRow = ["Nama RM", "Prospecting", "Follow-Up", "Meeting", "Closing", "Status"].map((t) => ({
      text: t, options: { bold: true, color: C.white, fill: { color: C.blue }, align: "center" },
    }));
    const bodyRows = tim.map((r: any) => [
      { text: String(r.pic ?? r.name ?? "-"), options: { color: C.text } },
      { text: String(r.prospecting ?? "-"), options: { align: "center", color: C.text } },
      { text: String(r.followUp ?? r.followup ?? "-"), options: { align: "center", color: C.text } },
      { text: String(r.meeting ?? "-"), options: { align: "center", color: C.text } },
      { text: String(r.closing ?? "-"), options: { align: "center", color: C.text } },
      { text: String(r.status ?? "On Track"), options: { align: "center", color: C.text } },
    ]);
    s.addTable([headerRow, ...bodyRows], {
      x: 0.3, y: 0.7, w: 9.4, colW: [2.2, 1.6, 1.6, 1.5, 1.5, 1.0],
      fontSize: 10, fontFace: "Calibri",
      border: { type: "solid", color: C.gray, pt: 1 },
    });

    const labels = tim.map((r: any) => String(r.pic ?? r.name ?? ""));
    s.addChart(pres.ChartType.bar, [
      { name: "Prospecting", labels, values: tim.map((r: any) => num(r.prospecting)) },
      { name: "Follow-Up", labels, values: tim.map((r: any) => num(r.followUp ?? r.followup)) },
      { name: "Meeting", labels, values: tim.map((r: any) => num(r.meeting)) },
      { name: "Closing", labels, values: tim.map((r: any) => num(r.closing)) },
    ], {
      x: 0.3, y: 2.35, w: 6.2, h: 3.0,
      barDir: "col", barGrouping: "clustered",
      chartColors: [C.blue, C.blueLight, C.blueLighter, C.blueLightest],
      showLegend: true, legendPos: "b",
    });

    // Top performer card (green border)
    s.addShape("roundRect", {
      x: 6.7, y: 2.35, w: 3.0, h: 1.4,
      fill: { color: C.white }, line: { color: C.green, width: 2 }, rectRadius: 0.08,
    });
    s.addText("Top Performer", { x: 6.85, y: 2.4, w: 2.7, h: 0.3, fontSize: 10, bold: true, color: C.green, fontFace: "Calibri" });
    s.addText(String(ai.top_performer ?? "-"), {
      x: 6.85, y: 2.7, w: 2.7, h: 1.0, fontSize: 10, color: C.text, fontFace: "Calibri",
    });

    s.addShape("roundRect", {
      x: 6.7, y: 3.85, w: 3.0, h: 1.5,
      fill: { color: C.white }, line: { color: C.red, width: 2 }, rectRadius: 0.08,
    });
    s.addText("Perlu Perhatian", { x: 6.85, y: 3.9, w: 2.7, h: 0.3, fontSize: 10, bold: true, color: C.red, fontFace: "Calibri" });
    s.addText(String(ai.perlu_perhatian ?? "-"), {
      x: 6.85, y: 4.2, w: 2.7, h: 1.1, fontSize: 10, color: C.text, fontFace: "Calibri",
    });
  }

  // ===== SLIDE 4 — PIPELINE =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "PIPELINE DAN PELACAKAN PROGRES");

    const stageLabels = ["Kontak", "Meeting", "Prospek", "Closing"];
    const stageVals = perStage.length
      ? perStage.slice(0, 4).map((x: any) => num(x.count ?? x.value))
      : [0, 0, 0, 0];

    s.addChart(pres.ChartType.bar, [
      { name: "Lead", labels: stageLabels, values: stageVals },
    ], {
      x: 0.3, y: 0.7, w: 5.8, h: 3.5,
      barDir: "bar",
      chartColors: [C.navy],
      showValue: true, dataLabelPosition: "inEnd",
      showTitle: true, title: "Lead per Tahap Pipeline", titleFontSize: 12, titleColor: C.navy,
      showLegend: false,
    });

    s.addChart(pres.ChartType.doughnut, [{
      name: "Temperatur",
      labels: ["Hot", "Warm", "Cold"],
      values: [num(dist.hot), num(dist.warm), num(dist.cold)],
    }], {
      x: 6.2, y: 0.7, w: 3.5, h: 3.2,
      chartColors: [C.red, C.yellow, C.blue],
      showPercent: true, holeSize: 50,
      showTitle: true, title: "Distribusi Temperatur Lead", titleFontSize: 12, titleColor: C.navy,
      showLegend: true, legendPos: "b",
    });

    s.addShape("roundRect", {
      x: 0.3, y: 4.4, w: 9.4, h: 1.0,
      fill: { color: C.white }, line: { color: C.red, width: 2 }, rectRadius: 0.08,
    });
    s.addText("Follow-Up Jatuh Tempo", { x: 0.45, y: 4.45, w: 9.0, h: 0.3, fontSize: 11, bold: true, color: C.red, fontFace: "Calibri" });
    s.addText(String(ai.narasi_pipeline ?? "-"), {
      x: 0.45, y: 4.75, w: 9.0, h: 0.6, fontSize: 10, color: C.text, fontFace: "Calibri",
    });
  }

  // ===== SLIDE 5 — EFEKTIVITAS =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "EFEKTIVITAS MANAJEMEN AKTIVITAS");

    const donut = (x: number, val: number, target: number, label: string) => {
      const color = val < target ? C.red : C.green;
      s.addChart(pres.ChartType.doughnut, [{
        name: label, labels: [label, "Sisa"], values: [val, Math.max(0, 100 - val)],
      }], {
        x, y: 0.65, w: 3.1, h: 2.3,
        chartColors: [color, C.gray], holeSize: 65,
        showTitle: true, title: `${label}: ${val}% (target ${target}%)`,
        titleFontSize: 10, titleColor: C.navy, showLegend: false,
      });
      s.addText(`${val}%`, {
        x: x + 0.55, y: 1.3, w: 2.0, h: 0.6,
        fontSize: 18, bold: true, color: C.navy, align: "center", valign: "middle", fontFace: "Calibri",
      });
    };
    donut(0.2, effProsp, 80, "Prospecting");
    donut(3.45, effFu, 75, "Follow-Up");
    donut(6.7, effAppt, 70, "Appointment");

    s.addShape("roundRect", {
      x: 0.2, y: 3.05, w: 9.6, h: 0.8,
      fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.05,
    });
    s.addText(`Skor Efektivitas Keseluruhan: ${effOverall}% — Tren: ${ai.narasi_aktivitas ?? "stabil"}`, {
      x: 0.4, y: 3.05, w: 9.2, h: 0.8,
      fontSize: 13, bold: true, color: C.white, valign: "middle", fontFace: "Calibri",
    });

    const labels = ["M-4", "M-3", "M-2", "M-1", "Ini"];
    const back = (cur: number) => [Math.max(0, cur - 8), Math.max(0, cur - 6), Math.max(0, cur - 4), Math.max(0, cur - 2), cur];
    s.addChart(pres.ChartType.line, [
      { name: "Prospecting", labels, values: back(effProsp) },
      { name: "Follow-Up", labels, values: back(effFu) },
      { name: "Appointment", labels, values: back(effAppt) },
    ], {
      x: 0.2, y: 3.95, w: 9.6, h: 1.55,
      chartColors: [C.blue, C.yellow, C.red],
      lineSmooth: true, showLegend: true, legendPos: "r",
      valAxisMinVal: 50, valAxisMaxVal: 100,
    });
  }

  // ===== SLIDE 6 — EARLY WARNING =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "SISTEM PERINGATAN DINI & COACHING");

    const ew = Array.isArray(dashboard.earlyWarning) ? dashboard.earlyWarning : [];
    const radarLabels = ["Prospecting", "Follow-Up", "Meeting", "Closing", "Disiplin"];
    const radarSeries = tim.slice(0, 3).map((r: any) => ({
      name: String(r.pic ?? r.name ?? "RM"),
      labels: radarLabels,
      values: [
        Math.min(100, num(r.prospecting) * 10),
        Math.min(100, num(r.followUp ?? r.followup) * 10),
        Math.min(100, num(r.meeting) * 10),
        Math.min(100, num(r.closing) * 10),
        80,
      ],
    }));
    if (radarSeries.length) {
      s.addChart(pres.ChartType.radar, radarSeries, {
        x: 0.2, y: 0.65, w: 5.0, h: 4.7,
        chartColors: [C.blue, C.red, C.green],
        radarStyle: "filled", showLegend: true, legendPos: "b",
        showTitle: true, title: "Skor Dimensi Aktivitas per RM",
        titleFontSize: 11, titleColor: C.navy,
      });
    }

    const ewText = (i: number) => {
      const a = ew[i];
      if (!a) return "";
      return typeof a === "string" ? a : (a.message ?? a.text ?? a.title ?? "");
    };

    s.addShape("roundRect", {
      x: 5.4, y: 0.7, w: 4.4, h: 1.5,
      fill: { color: C.white }, line: { color: C.red, width: 2 }, rectRadius: 0.08,
    });
    s.addText("Peringatan 1", { x: 5.55, y: 0.75, w: 4.1, h: 0.3, fontSize: 11, bold: true, color: C.red, fontFace: "Calibri" });
    s.addText(`${ewText(0)}\n${ewText(1)}`, {
      x: 5.55, y: 1.05, w: 4.1, h: 1.1, fontSize: 10, color: C.text, fontFace: "Calibri",
    });

    s.addShape("roundRect", {
      x: 5.4, y: 2.3, w: 4.4, h: 1.5,
      fill: { color: C.white }, line: { color: C.red, width: 2 }, rectRadius: 0.08,
    });
    s.addText("Peringatan 2", { x: 5.55, y: 2.35, w: 4.1, h: 0.3, fontSize: 11, bold: true, color: C.red, fontFace: "Calibri" });
    s.addText(`${ewText(2)}\n${ewText(3)}`, {
      x: 5.55, y: 2.65, w: 4.1, h: 1.1, fontSize: 10, color: C.text, fontFace: "Calibri",
    });

    s.addShape("roundRect", {
      x: 5.4, y: 3.9, w: 4.4, h: 1.45,
      fill: { color: C.white }, line: { color: C.blue, width: 2 }, rectRadius: 0.08,
    });
    s.addText("Coaching", { x: 5.55, y: 3.95, w: 4.1, h: 0.3, fontSize: 11, bold: true, color: C.blue, fontFace: "Calibri" });
    s.addText(`${ai.perlu_perhatian ?? ""}\n${ai.rekomendasi_leader ?? ""}`, {
      x: 5.55, y: 4.25, w: 4.1, h: 1.05, fontSize: 10, color: C.text, fontFace: "Calibri",
    });
  }

  // ===== SLIDE 7 — ACTION PLAN =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "RENCANA AKSI MINGGU DEPAN");

    const plans = ai.action_plan ?? [];
    const cards: Array<[string, string, string]> = [
      ["Prioritas 1 — TINGGI", String(plans[0] ?? ""), C.red],
      ["Prioritas 2 — SEDANG", String(plans[1] ?? ""), C.yellow],
      ["Prioritas 3 — RUTIN", String(plans[2] ?? ""), C.blue],
    ];
    cards.forEach(([label, txt, color], i) => {
      const y = 0.75 + i * 1.45;
      s.addShape("roundRect", {
        x: 0.3, y, w: 6.2, h: 1.3,
        fill: { color: C.white }, line: { color, width: 2 }, rectRadius: 0.08,
      });
      s.addText(label, { x: 0.45, y: y + 0.05, w: 5.9, h: 0.3, fontSize: 11, bold: true, color, fontFace: "Calibri" });
      s.addText(txt, { x: 0.45, y: y + 0.35, w: 5.9, h: 0.6, fontSize: 10, color: C.text, fontFace: "Calibri" });
      s.addText(`PIC: ${leaderName}   ·   Tenggat: ${i === 0 ? "Minggu depan" : i === 1 ? "Minggu depan" : "Rutin"}`, {
        x: 0.45, y: y + 0.95, w: 5.9, h: 0.3, fontSize: 9, italic: true, color: C.textMuted, fontFace: "Calibri",
      });
    });

    s.addChart(pres.ChartType.bar, [
      { name: "Hari", labels: ["Aksi 1", "Aksi 2", "Aksi 3"], values: [2, 3, 5] },
    ], {
      x: 6.7, y: 0.75, w: 3.1, h: 4.3,
      barDir: "bar", chartColors: [C.red],
      showValue: true,
      showTitle: true, title: "Timeline (Hari ke-)", titleFontSize: 11, titleColor: C.navy,
      showLegend: false,
    });

    s.addShape("roundRect", {
      x: 0.3, y: 5.15, w: 9.4, h: 0.35,
      fill: { color: C.gray }, line: { color: C.gray }, rectRadius: 0.05,
    });
    s.addText(`Review berikutnya: ${today}`, {
      x: 0.3, y: 5.15, w: 9.4, h: 0.35,
      fontSize: 10, color: C.text, align: "center", valign: "middle", fontFace: "Calibri",
    });
  }

  // ===== SLIDE 8 — AREA HASIL =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "AREA HASIL — KERANGKA A.C.T");

    const area = Array.isArray(dashboard.areaHasil) ? dashboard.areaHasil : [];
    const a = (i: number) => area[i] || {};
    const actual = num(dashboard.kpi?.actual);
    const target = num(dashboard.kpi?.target);

    const cardA = (x: number, label: string, value: string, sub: string) => {
      s.addShape("roundRect", {
        x, y: 0.7, w: 2.2, h: 1.4,
        fill: { color: C.white }, line: { color: C.gray, width: 1 }, rectRadius: 0.08,
      });
      s.addText(label, { x: x + 0.1, y: 0.78, w: 2.0, h: 0.3, fontSize: 10, color: C.textMuted, fontFace: "Calibri" });
      s.addText(value, { x: x + 0.1, y: 1.05, w: 2.0, h: 0.55, fontSize: 18, bold: true, color: C.navy, fontFace: "Calibri" });
      s.addText(sub, { x: x + 0.1, y: 1.6, w: 2.0, h: 0.45, fontSize: 9, color: C.textMuted, fontFace: "Calibri" });
    };
    cardA(0.25, "Revenue", `Rp ${actual} M`, `vs Target Rp ${target} M`);
    cardA(2.67, "Engagement", String(a(1).value ?? "-"), String(a(1).label ?? ""));
    cardA(5.09, "Pertumbuhan", String(a(2).value ?? "-"), String(a(2).label ?? ""));
    cardA(7.51, "Leadership", String(a(3).value ?? "-"), `${tim.length}/${tim.length} RM di-review`);

    const labels = ["Jan", "Feb", "Mar", "Apr", "Mei"];
    const revSeries = [Math.max(0, actual - 8), Math.max(0, actual - 6), Math.max(0, actual - 3), Math.max(0, actual - 1), actual];
    const tgtSeries = [Math.max(0, target - 4), Math.max(0, target - 3), Math.max(0, target - 2), Math.max(0, target - 1), target];

    s.addChart(pres.ChartType.area, [
      { name: "Revenue Aktual", labels, values: revSeries },
      { name: "Target", labels, values: tgtSeries },
    ], {
      x: 0.25, y: 2.3, w: 9.5, h: 3.1,
      chartColors: [C.blue, C.gray],
      lineSmooth: true, showLegend: true, legendPos: "b",
      showTitle: true, title: "Tren Revenue Bulanan (Rp Miliar)",
      titleFontSize: 12, titleColor: C.navy,
    });
  }

  // ===== SLIDE 9 — RINGKASAN & TERIMA KASIH =====
  {
    const s = pres.addSlide();
    s.background = { color: C.white };
    addHeader(s, "RINGKASAN EKSEKUTIF");

    const insights = ai.insight_utama ?? [];
    [0, 1, 2].forEach((i) => {
      const y = 0.75 + i * 0.85;
      s.addShape("roundRect", {
        x: 0.3, y, w: 5.6, h: 0.75,
        fill: { color: C.white }, line: { color: C.gray, width: 1 }, rectRadius: 0.08,
      });
      s.addShape("ellipse", {
        x: 0.42, y: y + 0.12, w: 0.5, h: 0.5,
        fill: { color: C.blue }, line: { color: C.blue },
      });
      s.addText(String(i + 1), {
        x: 0.42, y: y + 0.12, w: 0.5, h: 0.5,
        fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", fontFace: "Calibri",
      });
      s.addText(String(insights[i] ?? "-"), {
        x: 1.05, y: y + 0.05, w: 4.75, h: 0.65,
        fontSize: 10, color: C.text, valign: "middle", fontFace: "Calibri",
      });
    });

    s.addShape("roundRect", {
      x: 0.3, y: 3.4, w: 5.6, h: 0.85,
      fill: { color: C.white }, line: { color: C.green, width: 2 }, rectRadius: 0.08,
    });
    s.addText("Pencapaian Terbaik", { x: 0.45, y: 3.45, w: 5.3, h: 0.3, fontSize: 11, bold: true, color: C.green, fontFace: "Calibri" });
    s.addText(String(ai.top_performer ?? "-"), { x: 0.45, y: 3.75, w: 5.3, h: 0.45, fontSize: 10, color: C.text, fontFace: "Calibri" });

    s.addShape("roundRect", {
      x: 0.3, y: 4.35, w: 5.6, h: 0.95,
      fill: { color: C.white }, line: { color: C.red, width: 2 }, rectRadius: 0.08,
    });
    s.addText("Area Fokus", { x: 0.45, y: 4.4, w: 5.3, h: 0.3, fontSize: 11, bold: true, color: C.red, fontFace: "Calibri" });
    s.addText(String(ai.perlu_perhatian ?? "-"), { x: 0.45, y: 4.7, w: 5.3, h: 0.55, fontSize: 10, color: C.text, fontFace: "Calibri" });

    s.addShape("rect", {
      x: 6.1, y: 0.7, w: 3.7, h: 4.7,
      fill: { color: C.navy }, line: { color: C.navy },
    });
    s.addText("Terima Kasih", {
      x: 6.2, y: 1.4, w: 3.5, h: 0.6,
      fontSize: 24, bold: true, color: C.white, fontFace: "Calibri",
    });
    s.addText("Terima kasih atas dedikasi dan kerja keras seluruh tim", {
      x: 6.2, y: 2.0, w: 3.5, h: 0.9,
      fontSize: 12, color: C.white, fontFace: "Calibri",
    });
    s.addText("BTN", {
      x: 6.2, y: 3.3, w: 3.5, h: 0.5,
      fontSize: 20, bold: true, color: C.white, fontFace: "Calibri",
    });
    s.addText("A.C.T Sales CRM", {
      x: 6.2, y: 3.8, w: 3.5, h: 0.3,
      fontSize: 11, color: C.gray, fontFace: "Calibri",
    });
    s.addText(`Dibuat otomatis — ${today}`, {
      x: 6.2, y: 4.95, w: 3.5, h: 0.3,
      fontSize: 9, italic: true, color: C.gray, fontFace: "Calibri",
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) return json({ error: "Missing GEMINI_API_KEY" }, 500);

    const { dashboard, leaderName, periode, jenisLaporan: _jenis } = await req.json();
    if (!dashboard) return json({ error: "Missing dashboard data" }, 400);

    const ai = await callGemini(GEMINI_API_KEY, dashboard);
    const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

    const pres = new pptxgen();
    pres.author = "A.C.T Sales CRM";
    pres.company = "Bank BTN";
    pres.title = `Laporan ${leaderName} — ${periode}`;

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
