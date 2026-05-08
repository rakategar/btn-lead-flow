// deno-lint-ignore-file no-explicit-any
import JSZip from "https://esm.sh/jszip@3.10.1";

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

const TEMPLATE_URL = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/templates/laporan-template.pptx`;

function buildFallbackInsight(dashboard: any) {
  const team = Array.isArray(dashboard?.tim) ? dashboard.tim : [];
  const top = [...team].sort((a, b) => Number(b?.target ?? b?.value ?? 0) - Number(a?.target ?? a?.value ?? 0))[0];
  const attention = [...team].sort((a, b) => Number(a?.target ?? a?.value ?? 0) - Number(b?.target ?? b?.value ?? 0))[0];
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
      "Pantau lead aging dan aktivitas RM untuk mitigasi risiko pipeline.",
    ],
    top_performer: top?.name ? `${top.name}: performa paling menonjol berdasarkan data aktivitas.` : "Belum ada top performer.",
    perlu_perhatian: attention?.name ? `${attention.name}: perlu perhatian agar progres pipeline sesuai target.` : "Belum ada RM yang perlu perhatian.",
    narasi_kpi: `KPI: ${totalLeads} leads, conversion ${conversionRate}, gap ${gap}.`,
    narasi_pipeline: `Prioritaskan ${high} lead high priority dan stage dekat closing.`,
    narasi_aktivitas: "Jaga efektivitas via follow-up konsisten dan eskalasi hambatan.",
    early_warning: "Risiko stagnasi pipeline jika lead prioritas tinggi tidak ditindaklanjuti.",
    action_plan: [
      "Review harian lead prioritas tinggi.",
      "Tetapkan next action setiap lead di stage kritis.",
      "Coaching terarah untuk RM yang tertinggal.",
    ],
    rekomendasi_leader: "Fokus pada lead prioritas tinggi, follow-up, dan coaching berbasis gap KPI.",
  };
}

async function callGemini(apiKey: string, dashboard: any) {
  const prompt = `Anda analis sales senior. Berdasarkan data dashboard A.C.T Sales CRM berikut, buat laporan mingguan profesional Bahasa Indonesia.

DATA: ${JSON.stringify(dashboard, null, 2)}

Kembalikan HANYA JSON valid:
{
  "ringkasan_eksekutif": "paragraf 3-4 kalimat",
  "insight_utama": ["1","2","3","4"],
  "top_performer": "nama RM + alasan",
  "perlu_perhatian": "nama RM + alasan",
  "narasi_kpi": "...",
  "narasi_pipeline": "...",
  "narasi_aktivitas": "...",
  "early_warning": "...",
  "action_plan": ["1","2","3"],
  "rekomendasi_leader": "..."
}`;
  const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash-lite";
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );
  const data = await r.json();
  if (!r.ok) {
    if (r.status === 429 || data?.error?.status === "RESOURCE_EXHAUSTED") {
      return { ...buildFallbackInsight(dashboard), _fallback: true, _warning: `Kuota Gemini habis untuk ${model}. Memakai analisis berbasis data.` };
    }
    throw new Error(data?.error?.message ?? JSON.stringify(data));
  }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return JSON.parse(text);
}

function xmlEscape(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Replace [KEY] placeholders inside a slide XML string.
 * Handles cases where PowerPoint splits a placeholder across <a:r> runs by
 * first stripping run boundaries inside any text that contains '[' or ']'.
 */
function replacePlaceholders(xml: string, vars: Record<string, string>): string {
  // Merge consecutive runs inside the same paragraph that together contain a placeholder.
  // Simple heuristic: collapse </a:t></a:r><a:r ...><a:rPr.../><a:t> sequences into a single run
  // when the surrounding text could form a placeholder. To keep it safe we only collapse when
  // the joined text in a paragraph contains a '['.
  xml = xml.replace(/<a:p\b[^>]*>[\s\S]*?<\/a:p>/g, (para) => {
    if (!para.includes("[")) return para;
    // Extract the first run's properties to preserve formatting
    const firstRunMatch = para.match(/<a:r\b[^>]*>([\s\S]*?)<\/a:r>/);
    if (!firstRunMatch) return para;
    // Concatenate all <a:t>...</a:t> contents in order
    const texts: string[] = [];
    para.replace(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g, (_m, t) => {
      texts.push(t);
      return "";
    });
    const joined = texts.join("");
    if (!/\[[A-Z0-9_ ]+\]/.test(joined)) return para;
    // Replace placeholders in joined text
    let replaced = joined;
    for (const [k, v] of Object.entries(vars)) {
      replaced = replaced.split(`[${k}]`).join(xmlEscape(v));
    }
    // Rebuild paragraph: keep first run's <a:rPr.../> if present, replace text with joined replaced
    const rPrMatch = firstRunMatch[1].match(/<a:rPr\b[^>]*\/>|<a:rPr\b[^>]*>[\s\S]*?<\/a:rPr>/);
    const rPr = rPrMatch ? rPrMatch[0] : "";
    const newRun = `<a:r>${rPr}<a:t>${replaced}</a:t></a:r>`;
    // Preserve paragraph properties (<a:pPr.../>) if any
    const pPrMatch = para.match(/<a:pPr\b[^>]*\/>|<a:pPr\b[^>]*>[\s\S]*?<\/a:pPr>/);
    const pPr = pPrMatch ? pPrMatch[0] : "";
    // Preserve paragraph end run properties
    const endParaMatch = para.match(/<a:endParaRPr\b[^>]*\/>|<a:endParaRPr\b[^>]*>[\s\S]*?<\/a:endParaRPr>/);
    const endPara = endParaMatch ? endParaMatch[0] : "";
    const openTag = para.match(/^<a:p\b[^>]*>/)?.[0] ?? "<a:p>";
    return `${openTag}${pPr}${newRun}${endPara}</a:p>`;
  });

  // Fallback: also replace any remaining [KEY] occurrences (e.g. inside chart XML, single-run text).
  for (const [k, v] of Object.entries(vars)) {
    xml = xml.split(`[${k}]`).join(xmlEscape(v));
  }
  return xml;
}

async function fillTemplate(vars: Record<string, string>): Promise<Uint8Array> {
  const r = await fetch(TEMPLATE_URL);
  if (!r.ok) throw new Error(`Failed to download template: ${r.status} ${r.statusText}`);
  const buf = new Uint8Array(await r.arrayBuffer());
  const zip = await JSZip.loadAsync(buf);

  const targets = Object.keys(zip.files).filter((f) =>
    /^ppt\/(slides|notesSlides|charts|diagrams|drawings)\/.*\.xml$/.test(f)
  );
  for (const path of targets) {
    const file = zip.file(path);
    if (!file) continue;
    const content = await file.async("string");
    if (!content.includes("[")) continue;
    zip.file(path, replacePlaceholders(content, vars));
  }

  return await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

function safeFile(s: string) {
  return String(s || "Laporan").replace(/[^a-zA-Z0-9_\-]+/g, "_").slice(0, 60);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) return json({ error: "Missing GEMINI_API_KEY" }, 500);

    const { dashboard, leaderName, periode, jenisLaporan } = await req.json();
    if (!dashboard) return json({ error: "Missing dashboard data" }, 400);

    const ai = await callGemini(GEMINI_API_KEY, dashboard);

    const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    const tim = Array.isArray(dashboard.tim) ? dashboard.tim : [];
    const rm = (i: number) => tim[i] || {};
    const eff = dashboard.efektivitas?.detail || [];
    const findEff = (kw: string) => {
      const f = eff.find((e: any) => String(e?.label ?? e?.name ?? "").toLowerCase().includes(kw));
      return f?.value ?? "";
    };
    const dist = dashboard.pipeline?.distribusi || {};
    const totalPipe = (Number(dist.hot) || 0) + (Number(dist.warm) || 0) + (Number(dist.cold) || 0);
    const area = dashboard.areaHasil || {};
    const ew = Array.isArray(dashboard.earlyWarning) ? dashboard.earlyWarning : [];
    const followupDue = Array.isArray(dashboard.leads)
      ? dashboard.leads.filter((l: any) => /follow/i.test(l?.stage ?? "")).length
      : (dashboard.pipeline?.followupDue ?? "");

    const splitName = (s: string) => (s ?? "").split(/[:\-—]/)[0]?.trim() ?? "";

    const vars: Record<string, string> = {
      // Cover
      NAMA_SALES_LEADER: leaderName ?? "",
      NAMA_LEADER: leaderName ?? "",
      PERIODE_LAPORAN: periode ?? "",
      PERIODE: periode ?? "",
      TANGGAL_GENERATE: today,
      TANGGAL: today,
      JENIS_LAPORAN: jenisLaporan ?? "Laporan Mingguan Tim",

      // KPI
      TOTAL_LEAD: String(dashboard.kpi?.totalLeads ?? ""),
      CONVERSION_RATE: String(dashboard.kpi?.conversionRate ?? ""),
      GAP_TARGET: String(dashboard.kpi?.gapToTarget ?? ""),
      LEAD_PRIORITAS: String(dashboard.kpi?.leadPrioritasHigh ?? ""),
      STATUS_KPI: String(dashboard.kpi?.status ?? (Number(dashboard.kpi?.gapToTarget) >= 0 ? "On Track" : "Perlu Perhatian")),

      // Tim
      RM1_NAMA: String(rm(0).name ?? ""),
      RM1_PROSPECTING: String(rm(0).prospecting ?? rm(0).target ?? ""),
      RM1_FOLLOWUP: String(rm(0).followup ?? ""),
      RM1_MEETING: String(rm(0).meeting ?? ""),
      RM1_CLOSING: String(rm(0).closing ?? ""),
      RM1_STATUS: String(rm(0).status ?? "On Track"),
      RM2_NAMA: String(rm(1).name ?? ""),
      RM2_PROSPECTING: String(rm(1).prospecting ?? rm(1).target ?? ""),
      RM2_FOLLOWUP: String(rm(1).followup ?? ""),
      RM2_MEETING: String(rm(1).meeting ?? ""),
      RM2_CLOSING: String(rm(1).closing ?? ""),
      RM2_STATUS: String(rm(1).status ?? "On Track"),
      RM3_NAMA: String(rm(2).name ?? ""),
      RM3_PROSPECTING: String(rm(2).prospecting ?? rm(2).target ?? ""),
      RM3_FOLLOWUP: String(rm(2).followup ?? ""),
      RM3_MEETING: String(rm(2).meeting ?? ""),
      RM3_CLOSING: String(rm(2).closing ?? ""),
      RM3_STATUS: String(rm(2).status ?? "On Track"),
      TOP_PERFORMER_NAMA: splitName(ai.top_performer),
      TOP_PERFORMER_DESC: ai.top_performer ?? "",
      NEED_ATTENTION_NAMA: splitName(ai.perlu_perhatian),
      NEED_ATTENTION_DESC: ai.perlu_perhatian ?? "",

      // Pipeline
      JUMLAH_FOLLOWUP_DUE: String(followupDue ?? ""),

      // Efektivitas
      TREN_EFEKTIVITAS: ai.narasi_aktivitas ?? "",
      EFEKTIVITAS_PROSPECTING: String(findEff("prospect")),
      EFEKTIVITAS_FOLLOWUP: String(findEff("follow")),
      EFEKTIVITAS_MEETING: String(findEff("meeting") || findEff("appoint")),

      // Early warning
      PERINGATAN_1_DESC: ew[0]?.message ?? ew[0]?.text ?? ai.early_warning ?? "",
      PERINGATAN_2_DESC: ew[1]?.message ?? ew[1]?.text ?? "",
      REMEDIAL_NAMA: splitName(ai.perlu_perhatian),
      REMEDIAL_TOPIK: "Follow-up & closing discipline",
      COACHING_FOKUS: ai.rekomendasi_leader ?? "",
      GAP_ALIGNMENT: String(dashboard.kpi?.gapToTarget ?? ""),

      // Action plan
      AKSI_1: ai.action_plan?.[0] ?? "",
      AKSI_2: ai.action_plan?.[1] ?? "",
      AKSI_3: ai.action_plan?.[2] ?? "",
      PIC_1: leaderName ?? "",
      PIC_2: leaderName ?? "",
      PIC_3: leaderName ?? "",
      DEADLINE_1: "Minggu depan",
      DEADLINE_2: "Minggu depan",
      DEADLINE_3: "Rutin",
      TANGGAL_REVIEW: today,

      // Area Hasil
      REVENUE_AKTUAL: String(area.revenueActual ?? dashboard.kpi?.actual ?? ""),
      REVENUE_TARGET: String(area.revenueTarget ?? dashboard.kpi?.target ?? ""),
      ENGAGEMENT_PERSEN: String(area.engagement ?? ""),
      GROWTH_PERSEN: String(area.growth ?? ""),
      LEADERSHIP_STATUS: String(area.leadershipStatus ?? "On Track"),
      COACHING_TERPENUHI: String(area.coachingDone ?? tim.length),
      TOTAL_RM: String(tim.length),

      // Ringkasan
      RINGKASAN_1: ai.insight_utama?.[0] ?? ai.ringkasan_eksekutif ?? "",
      RINGKASAN_2: ai.insight_utama?.[1] ?? "",
      RINGKASAN_3: ai.insight_utama?.[2] ?? "",
      HIGHLIGHT_POSITIF: ai.top_performer ?? "",
      AREA_FOKUS: ai.rekomendasi_leader ?? "",
    };

    const pptx = await fillTemplate(vars);

    const filename = `Laporan_${safeFile(leaderName)}_${safeFile(periode)}.pptx`;
    return new Response(pptx, {
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
