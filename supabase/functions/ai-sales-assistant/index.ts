import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LeadCtx {
  nama: string;
  produk: string;
  stage: string;
  priority: string;
  fuStage: string;
  lastActivity: string;
  ringkasan: string;
  rmName?: string;
  objection?: string;
  mode?: "generate" | "rewrite";
  draft?: string;
  issues?: { phrase: string; reason: string; suggestion: string }[];
}

function fallbackDraft(l: LeadCtx): string {
  const greet =
    l.fuStage === "FU1"
      ? "Selamat pagi"
      : l.fuStage === "FU2"
      ? "Halo"
      : "Selamat siang";
  return (
    `${greet} Bapak/Ibu ${l.nama},\n\n` +
    `Saya ${l.rmName ?? "tim BTN"} ingin menindaklanjuti diskusi sebelumnya terkait ${l.produk}. ` +
    `Berdasarkan catatan kami: ${l.ringkasan || l.lastActivity}.\n\n` +
    `Pada tahap ${l.fuStage}, kami siap membantu menjelaskan langkah berikutnya secara lebih rinci. ` +
    `Apakah Bapak/Ibu berkenan kami jadwalkan diskusi singkat dalam 1–2 hari ke depan?\n\n` +
    `Terima kasih atas waktunya.`
  );
}

async function callLovableAI(messages: any[]): Promise<string | null> {
  const KEY = Deno.env.get("GEMINI_API_KEY");
  if (!KEY) return null;
  const maxRetries = 2;
  let delay = 1200;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages,
      }),
    });
    if (resp.ok) {
      const j = await resp.json();
      return j.choices?.[0]?.message?.content?.trim() ?? null;
    }
    if (resp.status === 429 || resp.status === 503) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
      continue;
    }
    return null;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const ctx = (await req.json()) as LeadCtx;
    const mode = ctx.mode ?? "generate";

    const sysGenerate =
      "Anda asisten Sales Bank BTN. Tugas: tulis draft pesan WhatsApp follow-up yang HANGAT, PROFESIONAL, SINGKAT (maks 120 kata), berbahasa Indonesia. " +
      "ATURAN COMPLIANCE: jangan menjanjikan bunga / return spesifik, jangan kata 'pasti', 'dijamin', 'wajib', 'harus'. " +
      "Jangan komitmen approval. Sebut produk yang diminati, akui konteks lead, ajukan langkah berikutnya yang jelas. Jangan bullet, gaya pesan natural.";

    const userGenerate =
      `Data lead:\n` +
      `- Nama: ${ctx.nama}\n` +
      `- Produk: ${ctx.produk}\n` +
      `- Stage pipeline: ${ctx.stage}\n` +
      `- Temperature: ${ctx.priority}\n` +
      `- Tahap FU: ${ctx.fuStage}\n` +
      `- Aktivitas terakhir: ${ctx.lastActivity}\n` +
      `- Catatan/objection: ${ctx.ringkasan}${ctx.objection ? " | " + ctx.objection : ""}\n` +
      `- RM pengirim: ${ctx.rmName ?? "tim BTN"}\n\n` +
      `Tulis draft pesan follow-up sesuai tahap ${ctx.fuStage}.`;

    const sysRewrite =
      "Anda editor compliance. Tulis ulang draft di bawah agar tetap natural namun MENGHILANGKAN bagian bermasalah. " +
      "Jangan menambah informasi baru. Jaga panjang serupa. Bahasa Indonesia.";

    const userRewrite =
      `Draft asli:\n${ctx.draft}\n\n` +
      `Bagian bermasalah & alasan:\n` +
      (ctx.issues ?? []).map((i, idx) => `${idx + 1}. "${i.phrase}" — ${i.reason}. Saran: ${i.suggestion}`).join("\n") +
      `\n\nTulis ulang seluruh draft dengan perbaikan tersebut.`;

    const messages =
      mode === "rewrite"
        ? [
            { role: "system", content: sysRewrite },
            { role: "user", content: userRewrite },
          ]
        : [
            { role: "system", content: sysGenerate },
            { role: "user", content: userGenerate },
          ];

    const ai = await callLovableAI(messages);
    const text = ai ?? fallbackDraft(ctx);
    return new Response(JSON.stringify({ draft: text, fallback: !ai }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-sales-assistant error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
