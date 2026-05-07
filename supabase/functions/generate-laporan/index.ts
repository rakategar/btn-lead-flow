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

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
  if (!r.ok) throw new Error("Gemini error: " + JSON.stringify(data));
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return JSON.parse(text);
}

async function generateSlides(saJson: any, templateId: string, vars: Record<string, string>) {
  const token = await getAccessToken(
    saJson,
    "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/presentations",
  );

  // Copy template
  const copyR = await fetch(
    `https://www.googleapis.com/drive/v3/files/${templateId}/copy?supportsAllDrives=true`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Laporan Mingguan - ${new Date().toISOString().slice(0, 10)}` }),
    },
  );
  const copyData = await copyR.json();
  if (!copyR.ok) throw new Error("Drive copy error: " + JSON.stringify(copyData));
  const newId = copyData.id as string;

  // Make readable to anyone with link
  await fetch(`https://www.googleapis.com/drive/v3/files/${newId}/permissions?supportsAllDrives=true`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });

  // Build replace requests
  const requests = Object.entries(vars).map(([k, v]) => ({
    replaceAllText: {
      containsText: { text: `[${k}]`, matchCase: false },
      replaceText: String(v ?? ""),
    },
  }));

  const updR = await fetch(
    `https://slides.googleapis.com/v1/presentations/${newId}:batchUpdate`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests }),
    },
  );
  const updData = await updR.json();
  if (!updR.ok) throw new Error("Slides update error: " + JSON.stringify(updData));

  // Export as PPTX
  const exportUrl = `https://docs.google.com/presentation/d/${newId}/export/pptx`;
  const viewUrl = `https://docs.google.com/presentation/d/${newId}/edit`;
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${newId}/export?mimeType=application/vnd.openxmlformats-officedocument.presentationml.presentation`;

  return { presentationId: newId, viewUrl, exportUrl, downloadUrl };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SLIDES_TEMPLATE_ID = Deno.env.get("SLIDES_TEMPLATE_ID");
    const SA_JSON = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!GEMINI_API_KEY || !SLIDES_TEMPLATE_ID || !SA_JSON) {
      return json({ error: "Missing required environment variables" }, 500);
    }
    const saJson = JSON.parse(SA_JSON);

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
    const slides = await generateSlides(saJson, SLIDES_TEMPLATE_ID, vars);

    return json({ ok: true, ai, slides, vars });
  } catch (e: any) {
    console.error("generate-laporan error:", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});