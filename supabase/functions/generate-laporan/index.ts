// deno-lint-ignore-file no-explicit-any
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function getAccessToken(saJson: any, scope: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(saJson.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const jwt = await create(
    { alg: "RS256", typ: "JWT" },
    {
      iss: saJson.client_email,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      exp: getNumericDate(3600),
      iat: getNumericDate(0),
    },
    key,
  );
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error("OAuth error: " + JSON.stringify(data));
  return data.access_token as string;
}

function buildFallbackInsight(dashboard: any) {
  const team = Array.isArray(dashboard?.tim) ? dashboard.tim : [];
  const top = [...team].sort((a, b) => Number(b?.target ?? b?.value ?? 0) - Number(a?.target ?? a?.value ?? 0))[0];
  const attention = [...team].sort((a, b) => Number(a?.target ?? a?.value ?? 0) - Number(b?.target ?? b?.value ?? 0))[0];
  const totalLeads = dashboard?.kpi?.totalLeads ?? 0;
  const conversionRate = dashboard?.kpi?.conversionRate ?? "0%";
  const gap = dashboard?.kpi?.gapToTarget ?? "belum tersedia";
  const high = dashboard?.kpi?.leadPrioritasHigh ?? 0;

  return {
    ringkasan_eksekutif: `Dashboard menunjukkan ${totalLeads} leads dengan conversion rate ${conversionRate}. Gap terhadap target saat ini berada di ${gap}, sehingga fokus utama perlu diarahkan pada percepatan follow-up lead prioritas tinggi. Terdapat ${high} lead prioritas tinggi yang perlu dikawal untuk menjaga momentum pipeline.`,
    insight_utama: [
      `Total lead aktif: ${totalLeads}, dengan ${high} lead prioritas tinggi.`,
      `Conversion rate saat ini ${conversionRate}; aktivitas tim perlu diarahkan ke prospek dengan peluang closing tertinggi.`,
      `Gap target ${gap} perlu ditutup melalui ritme follow-up yang lebih disiplin.`,
      "Pantau lead aging dan aktivitas RM agar risiko pipeline dapat ditangani lebih awal.",
    ],
    top_performer: top?.name ? `${top.name} menunjukkan performa paling menonjol berdasarkan data aktivitas tim.` : "Belum ada top performer yang dapat ditentukan dari data saat ini.",
    perlu_perhatian: attention?.name ? `${attention.name} perlu perhatian tambahan agar progres pipeline tetap sesuai target.` : "Belum ada RM spesifik yang memerlukan perhatian dari data saat ini.",
    narasi_kpi: `KPI utama mencatat ${totalLeads} leads, conversion rate ${conversionRate}, dan gap target ${gap}.`,
    narasi_pipeline: `Pipeline perlu diprioritaskan pada ${high} lead high priority dan prospek dengan stage paling dekat ke closing.`,
    narasi_aktivitas: "Efektivitas aktivitas perlu dijaga melalui follow-up konsisten, pembaruan status lead, dan eskalasi hambatan closing.",
    early_warning: "Early warning utama adalah potensi stagnasi pipeline jika lead prioritas tinggi tidak segera ditindaklanjuti.",
    action_plan: [
      "Lakukan review harian untuk lead prioritas tinggi.",
      "Tetapkan next action yang jelas untuk setiap lead di stage kritis.",
      "Berikan coaching terarah kepada RM yang progresnya tertinggal.",
    ],
    rekomendasi_leader: "Sales Leader disarankan memfokuskan ritme manajemen pada lead prioritas tinggi, aktivitas follow-up, dan coaching berbasis gap KPI.",
  };
}

async function callGemini(apiKey: string, dashboard: any) {
  const prompt = `Anda adalah analis sales senior. Berdasarkan data dashboard A.C.T Sales CRM berikut, buat laporan mingguan profesional dalam Bahasa Indonesia.

DATA DASHBOARD:
${JSON.stringify(dashboard, null, 2)}

Kembalikan HANYA JSON valid (tanpa markdown fence) dengan struktur:
{
  "ringkasan_eksekutif": "paragraf 3-4 kalimat",
  "insight_utama": ["poin 1", "poin 2", "poin 3", "poin 4"],
  "top_performer": "nama RM dengan alasan singkat",
  "perlu_perhatian": "nama RM dengan alasan singkat",
  "narasi_kpi": "narasi singkat KPI dan gap",
  "narasi_pipeline": "narasi pipeline & distribusi prioritas",
  "narasi_aktivitas": "narasi efektivitas aktivitas tim",
  "early_warning": "narasi early warning",
  "action_plan": ["aksi 1", "aksi 2", "aksi 3"],
  "rekomendasi_leader": "rekomendasi untuk Sales Leader"
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
    const status = data?.error?.status;
    const retryDelay = data?.error?.details?.find((d: any) => d?.["@type"]?.includes("RetryInfo"))?.retryDelay;
    if (r.status === 429 || status === "RESOURCE_EXHAUSTED") {
      return {
        ...buildFallbackInsight(dashboard),
        _fallback: true,
        _warning: `Kuota Gemini API untuk model ${model} sedang habis${retryDelay ? `, coba lagi sekitar ${retryDelay}` : ""}. Laporan dibuat memakai analisis berbasis data tanpa AI agar proses tetap selesai.`,
      };
    }
    throw new Error(data?.error?.message ? `Gemini error: ${data.error.message}` : "Gemini error: " + JSON.stringify(data));
  }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return JSON.parse(text);
}

const TEMPLATE_ID = "1e_paf4UWA_3fpr829436SNkQZgMoHbCVQeWU7spOOGk";

async function generateSlides(vars: Record<string, string>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SLIDES_KEY = Deno.env.get("GOOGLE_SLIDES_API_KEY");
  const DRIVE_KEY = Deno.env.get("GOOGLE_DRIVE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!SLIDES_KEY) throw new Error("GOOGLE_SLIDES_API_KEY is not configured");
  if (!DRIVE_KEY) throw new Error("GOOGLE_DRIVE_API_KEY is not configured");

  const slidesHeaders = {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": SLIDES_KEY,
    "Content-Type": "application/json",
  };
  const driveHeaders = {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": DRIVE_KEY,
    "Content-Type": "application/json",
  };

  // 1. Copy template via Drive API
  const title = `Laporan ${vars.NAMA_LEADER || ""} - ${vars.PERIODE || new Date().toISOString().slice(0, 10)}`.trim();
  const copyR = await fetch(
    `https://connector-gateway.lovable.dev/google_drive/drive/v3/files/${TEMPLATE_ID}/copy?supportsAllDrives=true`,
    {
      method: "POST",
      headers: driveHeaders,
      body: JSON.stringify({ name: title }),
    },
  );
  const copyData = await copyR.json();
  if (!copyR.ok) throw new Error(`Drive copy error [${copyR.status}]: ${JSON.stringify(copyData)}`);
  const newId = copyData.id as string;

  // 2. Best-effort: share read-only
  await fetch(
    `https://connector-gateway.lovable.dev/google_drive/drive/v3/files/${newId}/permissions?supportsAllDrives=true`,
    {
      method: "POST",
      headers: driveHeaders,
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    },
  ).catch(() => {});

  // 3. Replace all placeholders via Slides batchUpdate
  const requests = Object.entries(vars).map(([key, value]) => ({
    replaceAllText: {
      containsText: { text: `[${key}]`, matchCase: true },
      replaceText: (value ?? "").toString(),
    },
  }));

  const updR = await fetch(
    `https://connector-gateway.lovable.dev/google_slides/v1/presentations/${newId}:batchUpdate`,
    {
      method: "POST",
      headers: slidesHeaders,
      body: JSON.stringify({ requests }),
    },
  );
  const updData = await updR.json();
  if (!updR.ok) throw new Error(`Slides update error [${updR.status}]: ${JSON.stringify(updData)}`);

  const viewUrl = `https://docs.google.com/presentation/d/${newId}/edit`;
  const exportUrl = `https://docs.google.com/presentation/d/${newId}/export/pptx`;
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${newId}/export?mimeType=application/vnd.openxmlformats-officedocument.presentationml.presentation`;

  return { presentationId: newId, viewUrl, exportUrl, downloadUrl };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return json({ error: "Missing GEMINI_API_KEY" }, 500);
    }

    const { dashboard, leaderName, periode, jenisLaporan } = await req.json();
    if (!dashboard) return json({ error: "Missing dashboard data" }, 400);

    // 1. Gemini
    const ai = await callGemini(GEMINI_API_KEY, dashboard);

    // 2. Slides variables
    const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    const vars: Record<string, string> = {
      NAMA_LEADER: leaderName ?? "",
      PERIODE: periode ?? "",
      TANGGAL: today,
      JENIS_LAPORAN: jenisLaporan ?? "Laporan Mingguan Tim",
      RINGKASAN_EKSEKUTIF: ai.ringkasan_eksekutif ?? "",
      INSIGHT_1: ai.insight_utama?.[0] ?? "",
      INSIGHT_2: ai.insight_utama?.[1] ?? "",
      INSIGHT_3: ai.insight_utama?.[2] ?? "",
      INSIGHT_4: ai.insight_utama?.[3] ?? "",
      TOP_PERFORMER: ai.top_performer ?? "",
      PERLU_PERHATIAN: ai.perlu_perhatian ?? "",
      NARASI_KPI: ai.narasi_kpi ?? "",
      NARASI_PIPELINE: ai.narasi_pipeline ?? "",
      NARASI_AKTIVITAS: ai.narasi_aktivitas ?? "",
      EARLY_WARNING: ai.early_warning ?? "",
      ACTION_1: ai.action_plan?.[0] ?? "",
      ACTION_2: ai.action_plan?.[1] ?? "",
      ACTION_3: ai.action_plan?.[2] ?? "",
      REKOMENDASI: ai.rekomendasi_leader ?? "",
      TOTAL_LEADS: String(dashboard.kpi?.totalLeads ?? ""),
      CONVERSION_RATE: String(dashboard.kpi?.conversionRate ?? ""),
      GAP_TARGET: String(dashboard.kpi?.gapToTarget ?? ""),
      LEAD_PRIORITAS_HIGH: String(dashboard.kpi?.leadPrioritasHigh ?? ""),
    };

    // 3. Slides
    const slides = await generateSlides(vars);

    return json({ ok: true, ai, slides, vars, warning: ai._warning ?? null });
  } catch (e: any) {
    console.error("generate-laporan error:", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});