// AI Sales heuristics — rule-based "AI" insights yang bekerja dari data lead
// yang sudah ada. Semua output diberi label "Saran AI · perlu review".
import type { Lead } from "@/lib/dummy-data";

// Pseudo-deterministic days-since-last-activity dari id, agar demo konsisten.
function daysSince(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 12; // 0..11
}
function stageDays(id: string): number {
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) >>> 0;
  return (h % 14) + 1; // 1..14
}

export interface PriorityItem {
  lead: Lead;
  score: number;
  reasons: string[];          // alasan pendek (badge)
  explanation: string;        // penjelasan panjang (Kenapa ini prioritas?)
  daysIdle: number;
  daysInStage: number;
}

export function rankPriority(leads: Lead[]): PriorityItem[] {
  const items: PriorityItem[] = leads
    .filter((l) => l.status !== "Close" && l.status !== "Not Eligible")
    .map((l) => {
      const idle = daysSince(l.id);
      const inStage = stageDays(l.id);
      const reasons: string[] = [];
      let score = 0;

      if (l.priority === "High") { score += 50; reasons.push("Hot lead"); }
      else if (l.priority === "Medium") { score += 25; reasons.push("Warm lead"); }

      if (l.nextFollowUp === "Hari ini") { score += 40; reasons.push("FU jatuh tempo hari ini"); }
      else if (l.nextFollowUp === "Besok") { score += 20; reasons.push("FU besok"); }

      if (idle >= 5 && l.priority === "High") { score += 35; reasons.push(`Hot — belum di-FU ${idle} hari`); }
      else if (idle >= 3) { score += 15; reasons.push(`Belum aktivitas ${idle} hari`); }

      if (inStage >= 7) { score += 25; reasons.push(`Stagnan di ${l.stage} ${inStage} hari`); }

      if (l.fuStage === "FU3") { score += 10; reasons.push("Tahap FU3 — keputusan akhir"); }

      const explanation =
        `Lead ini mendapat skor prioritas ${score} berdasarkan data: temperatur ${l.priority}, stage ${l.stage} ` +
        `(${inStage} hari di stage), aktivitas terakhir "${l.lastActivity}" sekitar ${idle} hari lalu, ` +
        `jadwal FU ${l.nextFollowUp}, tahap ${l.fuStage}, status ${l.status}.`;

      return { lead: l, score, reasons, explanation, daysIdle: idle, daysInStage: inStage };
    })
    .sort((a, b) => b.score - a.score);
  return items.slice(0, 6);
}

export interface PersonalWarning {
  id: string;
  level: "danger" | "warning" | "info";
  title: string;
  detail: string;
  leadId?: string;
  leadName?: string;
}

export function personalWarnings(leads: Lead[]): PersonalWarning[] {
  const out: PersonalWarning[] = [];
  for (const l of leads) {
    if (l.status === "Close" || l.status === "Not Eligible") continue;
    const idle = daysSince(l.id);
    const inStage = stageDays(l.id);
    if (idle > 5) {
      out.push({
        id: `idle-${l.id}`, level: "danger",
        title: `${l.nama} belum di-FU ${idle} hari`,
        detail: `Stage ${l.stage} · ${l.priority} · RM ${l.pic}.`,
        leadId: l.id, leadName: l.nama,
      });
    }
    if (inStage > 7) {
      out.push({
        id: `stage-${l.id}`, level: "warning",
        title: `${l.nama} stagnan ${inStage} hari di ${l.stage}`,
        detail: `Pertimbangkan langkah lanjutan untuk memindahkan ke stage berikutnya.`,
        leadId: l.id, leadName: l.nama,
      });
    }
    if (l.nextFollowUp === "Hari ini") {
      out.push({
        id: `fu-today-${l.id}`, level: "warning",
        title: `FU jatuh tempo hari ini: ${l.nama}`,
        detail: `${l.fuStage} · ${l.stage} · ${l.produk}.`,
        leadId: l.id, leadName: l.nama,
      });
    } else if (l.nextFollowUp === "Besok") {
      out.push({
        id: `fu-tmrw-${l.id}`, level: "info",
        title: `FU besok: ${l.nama}`,
        detail: `${l.fuStage} · ${l.stage}.`,
        leadId: l.id, leadName: l.nama,
      });
    }
  }
  // Dedup per lead — keep most severe
  const order = { danger: 0, warning: 1, info: 2 } as const;
  const byLead = new Map<string, PersonalWarning>();
  for (const w of out) {
    const key = w.leadId ?? w.id;
    const cur = byLead.get(key);
    if (!cur || order[w.level] < order[cur.level]) byLead.set(key, w);
  }
  return Array.from(byLead.values()).sort((a, b) => order[a.level] - order[b.level]);
}

// ===== Compliance guardrail =====
export interface ComplianceIssue {
  phrase: string;          // teks yang bermasalah
  reason: string;          // kenapa
  suggestion: string;      // saran perbaikan
}

const COMPLIANCE_RULES: { regex: RegExp; reason: string; suggestion: string }[] = [
  { regex: /\b(\d{1,2}([.,]\d+)?)\s*%\s*(p\.?a\.?|per\s*tahun|return|imbal\s*hasil|bunga)\b/gi,
    reason: "Menjanjikan bunga / return spesifik.",
    suggestion: "Sebut sebagai indikatif & arahkan untuk simulasi resmi.", },
  { regex: /\b(dijamin|pasti|guaranteed|garansi)\s+(untung|cuan|return|naik|profit|approve|cair)/gi,
    reason: "Janji/komitmen pasti.", suggestion: "Ganti dengan 'berpotensi' atau 'umumnya'." },
  { regex: /\b(harus|wajib|sekarang juga|hari ini juga|jangan sampai telat|terakhir)\b/gi,
    reason: "Nada terlalu mendesak / agresif.", suggestion: "Gunakan ajakan yang lebih hangat dan informatif." },
  { regex: /\b(saya jamin|kami jamin|bank menjamin|pasti disetujui|pasti cair)\b/gi,
    reason: "Komitmen yang terdengar mengikat bank.", suggestion: "Sebutkan 'tergantung penilaian kredit'." },
  { regex: /\b(promo terbatas|hanya hari ini|penawaran terakhir)\b/gi,
    reason: "Urgensi semu.", suggestion: "Jelaskan periode promo yang sebenarnya." },
];

export function checkCompliance(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  for (const r of COMPLIANCE_RULES) {
    const m = text.match(r.regex);
    if (m) for (const phrase of m) {
      issues.push({ phrase, reason: r.reason, suggestion: r.suggestion });
    }
  }
  // dedupe phrases
  const seen = new Set<string>();
  return issues.filter((i) => (seen.has(i.phrase.toLowerCase()) ? false : (seen.add(i.phrase.toLowerCase()), true)));
}

export function highlightCompliance(text: string, issues: ComplianceIssue[]): string {
  if (!issues.length) return text;
  let out = text;
  for (const i of issues) {
    const safe = i.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(safe, "gi"),
      (m) => `〔${m}〕`);
  }
  return out;
}

// ===== Data quality =====
export interface DataQualityIssue {
  field: string;
  level: "warning" | "info";
  message: string;
}

export function checkLeadQuality(lead: Partial<Lead> & { ringkasan?: string; lastActivity?: string }): DataQualityIssue[] {
  const out: DataQualityIssue[] = [];
  if (!lead.produk || !lead.produk.trim()) out.push({ field: "produk", level: "warning", message: "Produk diminati kosong — isi agar follow-up lebih terarah." });
  if (!lead.priority) out.push({ field: "priority", level: "warning", message: "Temperature (Hot/Warm/Cold) belum diisi." });
  if (!lead.nextFollowUp || !lead.nextFollowUp.trim() || lead.nextFollowUp === "-") out.push({ field: "nextFollowUp", level: "warning", message: "Next action / jadwal FU kosong." });
  const note = (lead.ringkasan ?? "").trim();
  if (!note) out.push({ field: "ringkasan", level: "warning", message: "Catatan aktivitas kosong." });
  else if (note.split(/\s+/).length < 20) out.push({ field: "ringkasan", level: "info", message: "Catatan terlalu singkat — tambahkan hasil dan next action agar follow-up berikutnya lebih terarah." });
  if (lead.status === "In Progress" && lead.stage === "Close") out.push({ field: "stage", level: "warning", message: "Status In Progress tapi stage Close — perpindahan stage tidak konsisten." });
  return out;
}
