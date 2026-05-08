// Dummy data — A.C.T Sales CRM Demo
// All data is fictional, prepared for conceptual demonstration only.

// Priority lead — istilah profesional menggantikan Hot/Warm/Cold
export type Priority = "High" | "Medium" | "Low";
export type PipelineStage = "Contact" | "Meet" | "Prospect" | "Close";
export type ResolutionStatus = "Close" | "In Progress" | "Follow Up" | "Not Eligible";
export type FollowUpStage = "FU1" | "FU2" | "FU3";

// Struktur organisasi: 1 Leader → banyak RM, 1 RM → 1 Leader
export interface Leader {
  name: string;
  rms: string[];
}

export const leaders: Leader[] = [
  { name: "Andre Wibowo", rms: ["Rina A.", "Dimas R.", "Lala N."] },
  { name: "Sari Trihandayani", rms: ["Maya P.", "Fajar H.", "Bagas S."] },
];

// Daftar semua RM (Relationship Manager) — sebelumnya disebut PIC
export const rms: string[] = leaders.flatMap((l) => l.rms);

/** Cari nama leader untuk RM tertentu. */
export function leaderOfRM(rm: string): string {
  const l = leaders.find((ld) => ld.rms.includes(rm));
  return l ? l.name : "—";
}

export interface Lead {
  id: string;
  nama: string;
  stage: PipelineStage;
  priority: Priority;
  pic: string; // RM (Relationship Manager) — dipertahankan agar backward compatible
  leader: string;
  source: string;
  produk: string;
  lastActivity: string;
  nextFollowUp: string;
  fuStage: FollowUpStage;
  status: ResolutionStatus;
  ringkasan: string;
}

export const initialLeads: Lead[] = [
  { id: "LD-001", nama: "Andi Pratama", stage: "Contact", priority: "Medium", pic: "Rina A.", leader: "Andre Wibowo", source: "Referral cabang", produk: "KPR Rumah Pertama", lastActivity: "WA awal", nextFollowUp: "Besok", fuStage: "FU1", status: "In Progress", ringkasan: "Tertarik simulasi cicilan KPR, perlu klarifikasi DP." },
  { id: "LD-002", nama: "Siti Rahma", stage: "Meet", priority: "High", pic: "Dimas R.", leader: "Andre Wibowo", source: "Walk-in cabang", produk: "KPR Subsidi", lastActivity: "Meeting selesai", nextFollowUp: "Hari ini", fuStage: "FU1", status: "Follow Up", ringkasan: "Sudah meeting, siap submit dokumen — butuh checklist final." },
  { id: "LD-003", nama: "Budi Santoso", stage: "Prospect", priority: "High", pic: "Maya P.", leader: "Sari Trihandayani", source: "Campaign digital", produk: "Take Over KPR", lastActivity: "Presentasi produk", nextFollowUp: "Besok", fuStage: "FU2", status: "In Progress", ringkasan: "Bandingkan rate take over; minta perhitungan tertulis." },
  { id: "LD-004", nama: "Nur Aisyah", stage: "Prospect", priority: "Medium", pic: "Fajar H.", leader: "Sari Trihandayani", source: "Call center", produk: "KPR Platinum", lastActivity: "Objection handling", nextFollowUp: "2 hari lagi", fuStage: "FU2", status: "Follow Up", ringkasan: "Ragu pada biaya provisi; perlu simulasi lengkap." },
  { id: "LD-005", nama: "Rizky Akbar", stage: "Close", priority: "High", pic: "Lala N.", leader: "Andre Wibowo", source: "Referral RM", produk: "Kredit Agunan Rumah", lastActivity: "Closing selesai", nextFollowUp: "-", fuStage: "FU3", status: "Close", ringkasan: "Closing tuntas, masuk pencatatan transaksi." },
  { id: "LD-006", nama: "Dini Wulandari", stage: "Contact", priority: "Low", pic: "Bagas S.", leader: "Sari Trihandayani", source: "Event partner", produk: "Tabungan + KPR", lastActivity: "Belum respon", nextFollowUp: "Minggu depan", fuStage: "FU3", status: "Not Eligible", ringkasan: "Belum ada urgensi; pertahankan nurture jangka panjang." },
  { id: "LD-007", nama: "Hendra Wijaya", stage: "Meet", priority: "Medium", pic: "Dimas R.", leader: "Andre Wibowo", source: "Walk-in cabang", produk: "KPR Subsidi", lastActivity: "Diskusi awal", nextFollowUp: "Besok", fuStage: "FU1", status: "In Progress", ringkasan: "Pertimbangan lokasi properti & angsuran." },
  { id: "LD-008", nama: "Dewi Lestari", stage: "Prospect", priority: "High", pic: "Rina A.", leader: "Andre Wibowo", source: "Referral nasabah", produk: "KPR Platinum", lastActivity: "Kirim simulasi", nextFollowUp: "Hari ini", fuStage: "FU2", status: "Follow Up", ringkasan: "Sudah bandingkan 2 produk; tinggal keputusan akhir." },
];

// Pipeline counts (visual demo)
export const pipelineSummary: { stage: PipelineStage; count: number; caption: string }[] = [
  { stage: "Contact", count: 52, caption: "Interaksi awal" },
  { stage: "Meet", count: 31, caption: "Sudah bertemu" },
  { stage: "Prospect", count: 24, caption: "Penawaran aktif" },
  { stage: "Close", count: 9, caption: "Transaksi selesai" },
];

// Activity Effectiveness (donut values 0-100)
export const activityEffectiveness = [
  { name: "Prospecting", value: 78, target: 80 },
  { name: "Follow-Up", value: 72, target: 75 },
  { name: "Appointment", value: 65, target: 70 },
];

// MTD KPI
export const mtdKpi = {
  target: 50,
  actual: 36,
  gap: -14,
  topPerformer: "Rina A.",
  needRemedial: "KC Tangerang",
  coachingFocus: "Follow-up consistency",
};

// Early warning
export const earlyWarnings = [
  "Low activity terdeteksi pada 2 PIC dalam 3 hari terakhir",
  "Follow-up backlog meningkat di area Tangerang",
  "Lead prioritas Medium stagnan selama 5 hari di tahap Prospect",
  "Need coaching pada closing stage untuk PIC junior",
];

// Overview alerts
export const priorityAlerts = [
  "8 lead belum ditindaklanjuti hari ini",
  "5 prospect berada di tahap FU2",
  "3 hot lead memerlukan aksi cepat",
  "2 PIC memiliki gap aktivitas terhadap target harian",
];

// Activity Daily — per PIC
export interface PicActivity {
  pic: string;
  leader: string;
  prospecting: number;
  followUp: number;
  meeting: number;
  closing: number;
  disiplin: "Sangat Baik" | "Baik" | "Perlu Dorongan";
}

export const picActivities: PicActivity[] = [
  { pic: "Rina A.", leader: "Andre Wibowo", prospecting: 4, followUp: 5, meeting: 2, closing: 1, disiplin: "Baik" },
  { pic: "Dimas R.", leader: "Andre Wibowo", prospecting: 3, followUp: 4, meeting: 1, closing: 0, disiplin: "Baik" },
  { pic: "Maya P.", leader: "Sari Trihandayani", prospecting: 2, followUp: 6, meeting: 2, closing: 1, disiplin: "Sangat Baik" },
  { pic: "Fajar H.", leader: "Sari Trihandayani", prospecting: 1, followUp: 2, meeting: 1, closing: 0, disiplin: "Perlu Dorongan" },
  { pic: "Lala N.", leader: "Andre Wibowo", prospecting: 3, followUp: 3, meeting: 2, closing: 1, disiplin: "Baik" },
  { pic: "Bagas S.", leader: "Sari Trihandayani", prospecting: 2, followUp: 3, meeting: 1, closing: 0, disiplin: "Perlu Dorongan" },
];

// Daily rhythm checklist
export const dailyRhythm = {
  sales: [
    "Hadir morning briefing (07.30 – 08.30)",
    "Minimal 2 kunjungan / kontak baru",
    "Follow-up rutin sesuai jadwal",
    "Update pipeline maksimal jam 17.00",
  ],
  head: [
    "Memimpin morning briefing",
    "Coaching harian via WA / telepon",
    "Monitoring aktivitas tim",
    "Review input & gap performa (max 18.00)",
  ],
};

// Customer 360 — Andi Pratama (kept profile photo from previous demo)
export const customerInteraksi = [
  { tanggal: "20 Apr 2026", aksi: "Mengisi form minat KPR via referral cabang" },
  { tanggal: "21 Apr 2026", aksi: "Dihubungi PIC Rina A. untuk verifikasi awal" },
  { tanggal: "22 Apr 2026", aksi: "Konsultasi simulasi KPR di kantor cabang" },
  { tanggal: "23 Apr 2026", aksi: "Dokumen awal diminta oleh PIC cabang" },
  { tanggal: "24 Apr 2026", aksi: "Reminder follow-up otomatis (FU1) dikirim" },
];

// Weekly & Monthly rhythm
export const weeklyRhythm = [
  "Weekly meeting tim sales",
  "Pipeline calibration mingguan",
  "1-on-1 coaching per PIC",
  "Laporan mingguan (Kamis 16.00)",
];

export const monthlyRhythm = [
  "Action plan bulan depan",
  "Sales performance review",
  "Evaluasi gap target",
  "Rencana remedial & coaching",
];

export const resultArea = [
  { name: "Revenue", value: "Rp 14,0 M", caption: "MTD vs target Rp 50,0 M" },
  { name: "Engagement", value: "82%", caption: "Aktivitas vs ekspektasi" },
  { name: "Sales Growth", value: "+9%", caption: "vs periode sebelumnya" },
  { name: "Leadership", value: "Stabil", caption: "Coaching cadence terpenuhi" },
];

export const followUpDue = [
  { nama: "Andi Pratama", stage: "Contact" as PipelineStage, pic: "Rina A.", fu: "FU1" as FollowUpStage, jadwal: "Besok", catatan: "Perlu follow-up" },
  { nama: "Siti Rahma", stage: "Meet" as PipelineStage, pic: "Dimas R.", fu: "FU1" as FollowUpStage, jadwal: "Hari ini", catatan: "Prioritas tinggi" },
  { nama: "Budi Santoso", stage: "Prospect" as PipelineStage, pic: "Maya P.", fu: "FU2" as FollowUpStage, jadwal: "Besok", catatan: "Objection handling" },
  { nama: "Dini Wulandari", stage: "Contact" as PipelineStage, pic: "Bagas S.", fu: "FU3" as FollowUpStage, jadwal: "Minggu depan", catatan: "Evaluasi ulang" },
];

// ============================================================================
// MANAGEMENT (Superuser) — Dummy Data Lintas Cabang
// ============================================================================

export type BranchStatus = "Healthy" | "Watchlist" | "At Risk";

export interface Branch {
  name: string;
  region: string;
  area: string;
  leader: string;
  salesCount: number;
  activityScore: number;     // 0-100
  pipelineValue: number;     // dalam juta Rupiah
  closingMTD: number;        // dalam juta Rupiah
  target: number;            // dalam juta Rupiah
  gap: number;               // pct
  status: BranchStatus;
  performanceScore: number;  // 0-100
}

export const branches: Branch[] = [
  { name: "KC Jakarta Pusat", region: "Jabodetabek", area: "DKI 1", leader: "Andre Wibowo",       salesCount: 12, activityScore: 88, pipelineValue: 14200, closingMTD: 4200, target: 5000, gap: -16, status: "Healthy",   performanceScore: 86 },
  { name: "KC Jakarta Selatan", region: "Jabodetabek", area: "DKI 2", leader: "Sari Trihandayani", salesCount: 10, activityScore: 81, pipelineValue: 11800, closingMTD: 3100, target: 4500, gap: -31, status: "Watchlist", performanceScore: 71 },
  { name: "KC Tangerang",       region: "Jabodetabek", area: "Banten", leader: "Bayu Mahendra",    salesCount: 9,  activityScore: 62, pipelineValue:  8400, closingMTD: 1800, target: 4200, gap: -57, status: "At Risk",   performanceScore: 48 },
  { name: "KC Bandung",         region: "Jawa Barat",  area: "Bandung Raya", leader: "Dewi Anggraini", salesCount: 11, activityScore: 84, pipelineValue: 12600, closingMTD: 3700, target: 4400, gap: -16, status: "Healthy",   performanceScore: 82 },
  { name: "KC Semarang",        region: "Jawa Tengah", area: "Semarang Raya", leader: "Hendra Yusuf",  salesCount: 8,  activityScore: 70, pipelineValue:  7200, closingMTD: 2100, target: 3800, gap: -45, status: "Watchlist", performanceScore: 64 },
  { name: "KC Surabaya",        region: "Jawa Timur",  area: "Surabaya Raya", leader: "Rizal Hakim",   salesCount: 13, activityScore: 90, pipelineValue: 15800, closingMTD: 4800, target: 5200, gap:  -8, status: "Healthy",   performanceScore: 91 },
  { name: "KC Medan",           region: "Sumatera",    area: "Sumut",         leader: "Yulia Pratiwi",  salesCount: 9,  activityScore: 66, pipelineValue:  6800, closingMTD: 1500, target: 3600, gap: -58, status: "At Risk",   performanceScore: 45 },
  { name: "KC Makassar",        region: "Indonesia Timur", area: "Sulsel",    leader: "Taufik Rahman",  salesCount: 8,  activityScore: 75, pipelineValue:  6200, closingMTD: 2200, target: 3200, gap: -31, status: "Watchlist", performanceScore: 68 },
];

export interface ProductKpi {
  name: string;
  target: number;
  actual: number;
  gap: number;
  pct: number;
  mtd: number;
  prevMonth: number;
  lastYear: number;
}

export const productKpis: ProductKpi[] = [
  { name: "Funding",        target: 12000, actual:  9300, gap: -2700, pct: 78, mtd:  9300, prevMonth:  8800, lastYear:  8200 },
  { name: "Lending",        target: 18000, actual: 15400, gap: -2600, pct: 86, mtd: 15400, prevMonth: 14200, lastYear: 13100 },
  { name: "KPR",            target: 22000, actual: 17800, gap: -4200, pct: 81, mtd: 17800, prevMonth: 16400, lastYear: 15200 },
  { name: "Tabungan",       target:  8000, actual:  7100, gap:  -900, pct: 89, mtd:  7100, prevMonth:  6800, lastYear:  6300 },
  { name: "Bancassurance",  target:  4500, actual:  2800, gap: -1700, pct: 62, mtd:  2800, prevMonth:  2600, lastYear:  2400 },
];

export const dailyRevenue: { day: number; target: number; actual: number }[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const target = 1500 + i * 35;
  const noise = Math.round(Math.sin(i * 0.7) * 180);
  const actual = Math.max(800, target - 220 + noise);
  return { day, target, actual };
});

export type AlertLevel = "Critical" | "Warning" | "Watch";
export interface MgmtAlert {
  id: string;
  level: AlertLevel;
  title: string;
  branch: string;
  pic?: string;
  ageDays: number;
  resolved: boolean;
}

export const mgmtAlerts: MgmtAlert[] = [
  { id: "AL-01", level: "Critical", title: "Closing MTD <50% target",                 branch: "KC Tangerang", pic: "Bayu Mahendra", ageDays: 5, resolved: false },
  { id: "AL-02", level: "Critical", title: "Activity compliance turun 3 hari beruntun", branch: "KC Medan",     pic: "Yulia Pratiwi", ageDays: 3, resolved: false },
  { id: "AL-03", level: "Warning",  title: "Stage aging Prospect >14 hari",           branch: "KC Semarang",  pic: "Hendra Yusuf",  ageDays: 9, resolved: false },
  { id: "AL-04", level: "Warning",  title: "Hot lead tanpa follow-up >48 jam",         branch: "KC Jakarta Selatan", pic: "Maya P.", ageDays: 2, resolved: false },
  { id: "AL-05", level: "Watch",    title: "Konversi Meet→Prospect di bawah benchmark", branch: "KC Makassar", pic: "Taufik Rahman", ageDays: 7, resolved: false },
  { id: "AL-06", level: "Watch",    title: "1 RM belum input aktivitas hari ini",      branch: "KC Bandung",   pic: "Fajar H.",      ageDays: 1, resolved: false },
  { id: "AL-07", level: "Critical", title: "Gap target Bancassurance >35%",            branch: "KC Tangerang", ageDays: 12, resolved: true  },
];

export const aiInsights = {
  situation: [
    "Pipeline nasional tumbuh 6% MoM dengan total Rp 83 M.",
    "8 cabang aktif; 3 cabang masuk kategori at risk / watchlist.",
    "Activity compliance harian 84% — dua cabang berada di bawah 70%.",
  ],
  keyIssues: [
    "KC Tangerang dan KC Medan tertinggal jauh dari target MTD.",
    "Konversi Meet→Prospect nasional 41% (benchmark 55%).",
    "Stage aging Prospect rata-rata 11 hari di 4 cabang.",
  ],
  improve: [
    "Coaching closing & objection handling untuk 5 RM junior.",
    "Aktifkan FU2 otomatis untuk lead Hot >48 jam tanpa update.",
    "Re-prioritisasi target Bancassurance ke cabang produktif.",
  ],
  grow: [
    "KC Surabaya & KC Jakarta Pusat over-perform — replikasi praktik.",
    "Produk KPR tumbuh 9% YoY — perluas campaign digital.",
    "Top 5 contributor menyumbang 42% closing nasional.",
  ],
};

export const aiRecommendations = [
  { title: "Tambah coaching closing untuk KC Tangerang",  context: "Closing MTD 43% target. Need-remedial 3 RM.",     action: "Jadwalkan coaching 2x minggu ini." },
  { title: "Re-assign 5 hot lead KC Medan",               context: "Hot lead stagnan >48 jam tanpa FU.",                action: "Pindahkan ke top performer regional." },
  { title: "Aktifkan kampanye KPR di Bandung",            context: "Conversion KPR Bandung 18% di atas benchmark.",     action: "Buka campaign digital 14 hari." },
  { title: "Bancassurance bundling di KC Surabaya",       context: "Nasabah KPR aktif tinggi, attach rate rendah.",     action: "Pilot bundling 30 hari." },
];

export const topContributors = [
  { name: "Rizal Hakim",       branch: "KC Surabaya",      score: 96, closing: 18 },
  { name: "Andre Wibowo",      branch: "KC Jakarta Pusat", score: 92, closing: 16 },
  { name: "Dewi Anggraini",    branch: "KC Bandung",       score: 89, closing: 14 },
  { name: "Sari Trihandayani", branch: "KC Jakarta Selatan", score: 84, closing: 12 },
  { name: "Maya P.",           branch: "KC Jakarta Selatan", score: 81, closing: 11 },
];

export const activityCompliance = {
  updated: 67,
  total: 80,
  branches: [
    { name: "KC Jakarta Pusat",   updated: 11, total: 12 },
    { name: "KC Jakarta Selatan", updated:  8, total: 10 },
    { name: "KC Tangerang",       updated:  5, total:  9 },
    { name: "KC Bandung",         updated: 10, total: 11 },
    { name: "KC Semarang",        updated:  6, total:  8 },
    { name: "KC Surabaya",        updated: 12, total: 13 },
    { name: "KC Medan",           updated:  5, total:  9 },
    { name: "KC Makassar",        updated: 10, total: 11 - 3 },
  ],
};

export const pipelineHealthBreakdown = [
  { name: "Hot Lead Readiness", score: 76, benchmark: 80 },
  { name: "FU Compliance",      score: 71, benchmark: 85 },
  { name: "Stage Aging",        score: 64, benchmark: 75 },
  { name: "Conversion Rate",    score: 58, benchmark: 65 },
];

export const pipelineHealth30d: number[] = Array.from({ length: 30 }, (_, i) =>
  Math.max(45, Math.min(95, Math.round(65 + Math.sin(i * 0.4) * 10 + i * 0.3)))
);

export const stageAging: { branch: string; contact: number; meet: number; prospect: number; close: number }[] = branches.map((b, i) => ({
  branch: b.name,
  contact: 2 + (i % 3),
  meet:    4 + (i % 4),
  prospect: 7 + (i % 6),
  close:   3 + (i % 3),
}));

export const conversionDiagnosis = branches.map((b, i) => ({
  branch: b.name,
  dropStage: ["Contact→Meet", "Meet→Prospect", "Prospect→Close"][i % 3],
  dropPct: 20 + ((i * 7) % 35),
}));

export const funnelConversion = [
  { stage: "Contact",  pct: 100, benchmark: 100 },
  { stage: "Meet",     pct: 62,  benchmark: 70 },
  { stage: "Prospect", pct: 41,  benchmark: 55 },
  { stage: "Close",    pct: 23,  benchmark: 32 },
];

export const remedialDashboard = [
  { branch: "KC Tangerang", gap: "-57%", owner: "Bayu Mahendra",  action: "Coaching closing + reassign 5 lead",     deadline: "30 Apr 2026", status: "On Track" },
  { branch: "KC Medan",     gap: "-58%", owner: "Yulia Pratiwi",  action: "Aktivasi FU otomatis + audit pipeline",   deadline: "28 Apr 2026", status: "Risiko" },
  { branch: "KC Semarang",  gap: "-45%", owner: "Hendra Yusuf",   action: "Sprint follow-up Hot lead 2 minggu",      deadline: "5 Mei 2026",  status: "On Track" },
  { branch: "KC Makassar",  gap: "-31%", owner: "Taufik Rahman",  action: "Pelatihan objection handling",            deadline: "10 Mei 2026", status: "Perlu Pantau" },
];

export interface MgmtUser {
  id: string;
  name: string;
  role: "Management" | "Sales Leader" | "Sales Team";
  branch: string;
  status: "Aktif" | "Nonaktif";
  lastLogin: string;
  email: string;
}

export const mgmtUsers: MgmtUser[] = [
  { id: "U-001", name: "Direktur Operasional", role: "Management",   branch: "Head Office",     status: "Aktif",    lastLogin: "Hari ini, 08:12",  email: "direktur.ops@btn.demo" },
  { id: "U-002", name: "Andre Wibowo",         role: "Sales Leader", branch: "KC Jakarta Pusat",   status: "Aktif",    lastLogin: "Hari ini, 07:45",  email: "andre.w@btn.demo" },
  { id: "U-003", name: "Sari Trihandayani",    role: "Sales Leader", branch: "KC Jakarta Selatan", status: "Aktif",    lastLogin: "Kemarin, 17:30",   email: "sari.t@btn.demo" },
  { id: "U-004", name: "Bayu Mahendra",        role: "Sales Leader", branch: "KC Tangerang",       status: "Aktif",    lastLogin: "2 hari lalu",      email: "bayu.m@btn.demo" },
  { id: "U-005", name: "Dewi Anggraini",       role: "Sales Leader", branch: "KC Bandung",         status: "Aktif",    lastLogin: "Hari ini, 09:02",  email: "dewi.a@btn.demo" },
  { id: "U-006", name: "Rizal Hakim",          role: "Sales Leader", branch: "KC Surabaya",        status: "Aktif",    lastLogin: "Hari ini, 06:50",  email: "rizal.h@btn.demo" },
  { id: "U-007", name: "Rina A.",              role: "Sales Team",   branch: "KC Jakarta Pusat",   status: "Aktif",    lastLogin: "Hari ini, 08:20",  email: "rina.a@btn.demo" },
  { id: "U-008", name: "Dimas R.",             role: "Sales Team",   branch: "KC Jakarta Pusat",   status: "Aktif",    lastLogin: "Hari ini, 08:25",  email: "dimas.r@btn.demo" },
  { id: "U-009", name: "Maya P.",              role: "Sales Team",   branch: "KC Jakarta Selatan", status: "Aktif",    lastLogin: "Hari ini, 09:10",  email: "maya.p@btn.demo" },
  { id: "U-010", name: "Fajar H.",             role: "Sales Team",   branch: "KC Bandung",         status: "Nonaktif", lastLogin: "32 hari lalu",     email: "fajar.h@btn.demo" },
  { id: "U-011", name: "Lala N.",              role: "Sales Team",   branch: "KC Surabaya",        status: "Aktif",    lastLogin: "Hari ini, 07:55",  email: "lala.n@btn.demo" },
  { id: "U-012", name: "Bagas S.",             role: "Sales Team",   branch: "KC Medan",           status: "Aktif",    lastLogin: "Kemarin, 18:40",   email: "bagas.s@btn.demo" },
];

export const rolePermissions: { permission: string; management: boolean; leader: boolean; rm: boolean }[] = [
  { permission: "Lihat semua data lintas cabang",     management: true,  leader: false, rm: false },
  { permission: "Lihat data tim sendiri",             management: true,  leader: true,  rm: false },
  { permission: "Lihat data pribadi",                 management: true,  leader: true,  rm: true  },
  { permission: "Input aktivitas lapangan",           management: false, leader: false, rm: true  },
  { permission: "Assign task ke RM",                  management: false, leader: true,  rm: false },
  { permission: "Generate laporan tim",               management: true,  leader: true,  rm: false },
  { permission: "Generate AI remedial plan",          management: true,  leader: false, rm: false },
  { permission: "Akses User & Role Management",       management: true,  leader: false, rm: false },
  { permission: "Akses System Configuration",         management: true,  leader: false, rm: false },
  { permission: "Akses Audit & Governance",           management: true,  leader: false, rm: false },
];

export const auditLogs: { ts: string; user: string; action: string; target: string }[] = [
  { ts: "08 Mei 2026, 09:12", user: "Direktur Operasional", action: "Update target",       target: "KC Tangerang · KPR" },
  { ts: "08 Mei 2026, 08:55", user: "Andre Wibowo",         action: "Assign task",         target: "Rina A. · Follow-up LD-008" },
  { ts: "08 Mei 2026, 08:30", user: "Direktur Operasional", action: "Generate laporan",     target: "Executive Summary harian" },
  { ts: "07 Mei 2026, 17:40", user: "Sari Trihandayani",    action: "Update lead",         target: "LD-004 · stage Prospect" },
  { ts: "07 Mei 2026, 16:22", user: "Direktur Operasional", action: "Eskalasi alert",       target: "AL-01 → Bayu Mahendra" },
  { ts: "07 Mei 2026, 14:08", user: "Bayu Mahendra",        action: "Login",                target: "Web · IP 10.20.4.18" },
];

export const exportLogs: { ts: string; user: string; action: string; target: string }[] = [
  { ts: "08 Mei 2026, 09:14", user: "Direktur Operasional", action: "Export PPTX",  target: "Laporan Executive Summary" },
  { ts: "07 Mei 2026, 18:02", user: "Andre Wibowo",         action: "Export CSV",   target: "Pipeline tim Andre" },
  { ts: "06 Mei 2026, 11:45", user: "Direktur Operasional", action: "Export XLSX",  target: "Branch Performance MTD" },
  { ts: "05 Mei 2026, 10:20", user: "Dewi Anggraini",       action: "Export CSV",   target: "Daftar lead KC Bandung" },
];

export const securityOverview = {
  loginSuccess: 312,
  loginFail: 9,
  activeSessions: 27,
  idleAccounts: 4,
};

export const dataQuality = branches.map((b, i) => ({
  branch: b.name,
  emptyFields: 4 + ((i * 3) % 14),
  duplicates:  (i * 2) % 6,
  leadsNoNote: 6 + ((i * 5) % 18),
}));

export interface OrgNode {
  name: string;
  children?: OrgNode[];
}

export const orgTree: OrgNode = {
  name: "National",
  children: [
    {
      name: "Region Jabodetabek",
      children: [
        { name: "Area DKI 1", children: [{ name: "KC Jakarta Pusat" }] },
        { name: "Area DKI 2", children: [{ name: "KC Jakarta Selatan" }] },
        { name: "Area Banten", children: [{ name: "KC Tangerang" }] },
      ],
    },
    {
      name: "Region Jawa",
      children: [
        { name: "Area Bandung Raya",  children: [{ name: "KC Bandung" }] },
        { name: "Area Semarang Raya", children: [{ name: "KC Semarang" }] },
        { name: "Area Surabaya Raya", children: [{ name: "KC Surabaya" }] },
      ],
    },
    {
      name: "Region Luar Jawa",
      children: [
        { name: "Area Sumut",   children: [{ name: "KC Medan" }] },
        { name: "Area Sulsel",  children: [{ name: "KC Makassar" }] },
      ],
    },
  ],
};

export const aiFeatureToggles = [
  { key: "exec_summary", label: "Executive Summary harian",   enabled: true  },
  { key: "remedial",     label: "AI Remedial Plan",            enabled: true  },
  { key: "lead_score",   label: "Lead Scoring otomatis",       enabled: true  },
  { key: "fu_suggest",   label: "Saran follow-up otomatis",    enabled: false },
  { key: "narasi_lap",   label: "Narasi otomatis untuk laporan", enabled: true },
];

export const fuRules = {
  fu1: 1,   // hari sejak lead masuk
  fu2: 3,
  fu3: 7,
  slaOverdue: 14,
};

export const officerProductivity = [
  { name: "Rizal Hakim",   branch: "KC Surabaya",        contact: 42, meeting: 18, closing: 8, revenue: 1850 },
  { name: "Andre Wibowo",  branch: "KC Jakarta Pusat",   contact: 38, meeting: 16, closing: 7, revenue: 1620 },
  { name: "Dewi Anggraini",branch: "KC Bandung",         contact: 36, meeting: 15, closing: 6, revenue: 1480 },
  { name: "Maya P.",       branch: "KC Jakarta Selatan", contact: 30, meeting: 12, closing: 5, revenue: 1280 },
  { name: "Rina A.",       branch: "KC Jakarta Pusat",   contact: 28, meeting: 11, closing: 5, revenue: 1140 },
  { name: "Lala N.",       branch: "KC Surabaya",        contact: 26, meeting:  9, closing: 4, revenue:  970 },
  { name: "Dimas R.",      branch: "KC Jakarta Pusat",   contact: 24, meeting:  8, closing: 3, revenue:  820 },
  { name: "Bagas S.",      branch: "KC Medan",           contact: 18, meeting:  6, closing: 2, revenue:  560 },
  { name: "Fajar H.",      branch: "KC Bandung",         contact: 14, meeting:  4, closing: 1, revenue:  320 },
];
