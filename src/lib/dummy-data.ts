// Dummy data — A.C.T Sales CRM Demo
// All data is fictional, prepared for conceptual demonstration only.

export type Temperature = "Hot" | "Warm" | "Cold";
export type PipelineStage = "Contact" | "Meet" | "Prospect" | "Close";
export type ResolutionStatus = "Close" | "In Progress" | "Follow Up" | "Not Eligible";
export type FollowUpStage = "FU1" | "FU2" | "FU3";

export interface Lead {
  id: string;
  nama: string;
  stage: PipelineStage;
  temperature: Temperature;
  pic: string;
  source: string;
  produk: string;
  lastActivity: string;
  nextFollowUp: string;
  fuStage: FollowUpStage;
  status: ResolutionStatus;
  ringkasan: string;
}

export const initialLeads: Lead[] = [
  { id: "LD-001", nama: "Andi Pratama", stage: "Contact", temperature: "Warm", pic: "Rina A.", source: "Referral cabang", produk: "KPR Rumah Pertama", lastActivity: "WA awal", nextFollowUp: "Besok", fuStage: "FU1", status: "In Progress", ringkasan: "Tertarik simulasi cicilan KPR, perlu klarifikasi DP." },
  { id: "LD-002", nama: "Siti Rahma", stage: "Meet", temperature: "Hot", pic: "Dimas R.", source: "Walk-in cabang", produk: "KPR Subsidi", lastActivity: "Meeting selesai", nextFollowUp: "Hari ini", fuStage: "FU1", status: "Follow Up", ringkasan: "Sudah meeting, siap submit dokumen — butuh checklist final." },
  { id: "LD-003", nama: "Budi Santoso", stage: "Prospect", temperature: "Hot", pic: "Maya P.", source: "Campaign digital", produk: "Take Over KPR", lastActivity: "Presentasi produk", nextFollowUp: "Besok", fuStage: "FU2", status: "In Progress", ringkasan: "Bandingkan rate take over; minta perhitungan tertulis." },
  { id: "LD-004", nama: "Nur Aisyah", stage: "Prospect", temperature: "Warm", pic: "Fajar H.", source: "Call center", produk: "KPR Platinum", lastActivity: "Objection handling", nextFollowUp: "2 hari lagi", fuStage: "FU2", status: "Follow Up", ringkasan: "Ragu pada biaya provisi; perlu simulasi lengkap." },
  { id: "LD-005", nama: "Rizky Akbar", stage: "Close", temperature: "Hot", pic: "Lala N.", source: "Referral RM", produk: "Kredit Agunan Rumah", lastActivity: "Closing selesai", nextFollowUp: "-", fuStage: "FU3", status: "Close", ringkasan: "Closing tuntas, masuk pencatatan transaksi." },
  { id: "LD-006", nama: "Dini Wulandari", stage: "Contact", temperature: "Cold", pic: "Bagas S.", source: "Event partner", produk: "Tabungan + KPR", lastActivity: "Belum respon", nextFollowUp: "Minggu depan", fuStage: "FU3", status: "Not Eligible", ringkasan: "Belum ada urgensi; pertahankan nurture jangka panjang." },
  { id: "LD-007", nama: "Hendra Wijaya", stage: "Meet", temperature: "Warm", pic: "Dimas R.", source: "Walk-in cabang", produk: "KPR Subsidi", lastActivity: "Diskusi awal", nextFollowUp: "Besok", fuStage: "FU1", status: "In Progress", ringkasan: "Pertimbangan lokasi properti & angsuran." },
  { id: "LD-008", nama: "Dewi Lestari", stage: "Prospect", temperature: "Hot", pic: "Rina A.", source: "Referral nasabah", produk: "KPR Platinum", lastActivity: "Kirim simulasi", nextFollowUp: "Hari ini", fuStage: "FU2", status: "Follow Up", ringkasan: "Sudah bandingkan 2 produk; tinggal keputusan akhir." },
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
  "Warm leads stagnan selama 5 hari di tahap Prospect",
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
  prospecting: number;
  followUp: number;
  meeting: number;
  closing: number;
  disiplin: "Sangat Baik" | "Baik" | "Perlu Dorongan";
}

export const picActivities: PicActivity[] = [
  { pic: "Rina A.", prospecting: 4, followUp: 5, meeting: 2, closing: 1, disiplin: "Baik" },
  { pic: "Dimas R.", prospecting: 3, followUp: 4, meeting: 1, closing: 0, disiplin: "Baik" },
  { pic: "Maya P.", prospecting: 2, followUp: 6, meeting: 2, closing: 1, disiplin: "Sangat Baik" },
  { pic: "Fajar H.", prospecting: 1, followUp: 2, meeting: 1, closing: 0, disiplin: "Perlu Dorongan" },
  { pic: "Lala N.", prospecting: 3, followUp: 3, meeting: 2, closing: 1, disiplin: "Baik" },
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
