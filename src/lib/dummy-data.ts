// Dummy data untuk BTN CRM Modernization Demo
export type LeadStatus = "Baru" | "Terhubungi" | "Follow-up" | "Konsultasi" | "Pengajuan" | "Lost" | "Eskalasi";
export type Channel = "balé Properti" | "Cabang" | "Call Center" | "Developer" | "Campaign" | "Digital";
export type SLAState = "Aman" | "Risiko" | "Lewat";

export interface Lead {
  id: string;
  nama: string;
  channel: Channel;
  produk: string;
  cabang: string;
  pic: string;
  status: LeadStatus;
  sla: SLAState;
  followUp: string;
  kota: string;
}

export const initialLeads: Lead[] = [
  { id: "LD-2026-001", nama: "Andi Pratama", channel: "balé Properti", produk: "KPR Rumah Pertama", cabang: "KC Bekasi", pic: "Rina A.", status: "Follow-up", sla: "Aman", followUp: "Hari ini", kota: "Bekasi" },
  { id: "LD-2026-002", nama: "Siti Rahma", channel: "Developer", produk: "KPR Subsidi", cabang: "KC Bandung", pic: "Dimas R.", status: "Terhubungi", sla: "Aman", followUp: "Kemarin", kota: "Bandung" },
  { id: "LD-2026-003", nama: "Budi Santoso", channel: "Campaign", produk: "Take Over KPR", cabang: "KC Tangerang", pic: "Maya P.", status: "Baru", sla: "Risiko", followUp: "2 hari lalu", kota: "Tangerang" },
  { id: "LD-2026-004", nama: "Nur Aisyah", channel: "Call Center", produk: "KPR Platinum", cabang: "KC Jakarta", pic: "Fajar H.", status: "Konsultasi", sla: "Aman", followUp: "Hari ini", kota: "Jakarta" },
  { id: "LD-2026-005", nama: "Rizky Akbar", channel: "Cabang", produk: "Kredit Agunan Rumah", cabang: "KC Surabaya", pic: "Lala N.", status: "Pengajuan", sla: "Aman", followUp: "3 jam lalu", kota: "Surabaya" },
  { id: "LD-2026-006", nama: "Dewi Lestari", channel: "balé Properti", produk: "KPR Rumah Pertama", cabang: "KC Jakarta", pic: "Fajar H.", status: "Follow-up", sla: "Aman", followUp: "Hari ini", kota: "Jakarta" },
  { id: "LD-2026-007", nama: "Hendra Wijaya", channel: "Developer", produk: "KPR Subsidi", cabang: "KC Bandung", pic: "Dimas R.", status: "Baru", sla: "Risiko", followUp: "1 hari lalu", kota: "Bandung" },
];

export const pipelineStages = [
  { name: "Lead Masuk", count: 1248, tone: "blue" as const },
  { name: "Terhubungi", count: 820, tone: "blue" as const },
  { name: "Konsultasi KPR", count: 510, tone: "orange" as const },
  { name: "Pengumpulan Dokumen", count: 280, tone: "orange" as const },
  { name: "Pengajuan Diproses", count: 174, tone: "green" as const },
  { name: "Akad / Closing", count: 86, tone: "green" as const },
];

export const aktivitas = [
  { judul: "RM Cabang Bekasi menghubungi lead KPR dari balé Properti", waktu: "10 menit lalu", channel: "Cabang" as Channel, status: "Selesai" },
  { judul: "Nasabah prioritas meminta simulasi take over KPR", waktu: "35 menit lalu", channel: "Call Center" as Channel, status: "Menunggu" },
  { judul: "Case komplain dokumen belum lengkap dieskalasi ke supervisor", waktu: "1 jam lalu", channel: "Cabang" as Channel, status: "Eskalasi" },
  { judul: "Lead developer partner dialihkan ke Cabang Bandung", waktu: "2 jam lalu", channel: "Developer" as Channel, status: "Selesai" },
  { judul: "Reminder follow-up dikirim ke officer Cabang Tangerang", waktu: "3 jam lalu", channel: "Digital" as Channel, status: "Menunggu" },
];

export const alerts = [
  { judul: "12 lead belum dihubungi lebih dari 24 jam", level: "warning" as const },
  { judul: "7 case mendekati batas SLA", level: "warning" as const },
  { judul: "3 cabang memiliki backlog follow-up tinggi", level: "danger" as const },
  { judul: "2 campaign menghasilkan lead tinggi namun konversi rendah", level: "info" as const },
];

export const cases = [
  { id: "CS-001", nasabah: "Andi Pratama", jenis: "Dokumen KPR belum lengkap", channel: "Cabang", pic: "Rina A.", prioritas: "Medium" as const, status: "Diproses", sla: "12 jam" },
  { id: "CS-002", nasabah: "Siti Rahma", jenis: "Permintaan simulasi ulang", channel: "Call Center", pic: "Dimas R.", prioritas: "Low" as const, status: "Menunggu Nasabah", sla: "1 hari" },
  { id: "CS-003", nasabah: "Budi Santoso", jenis: "Follow-up belum dilakukan", channel: "Digital", pic: "Maya P.", prioritas: "High" as const, status: "Eskalasi", sla: "3 jam" },
  { id: "CS-004", nasabah: "Nur Aisyah", jenis: "Update status pengajuan", channel: "Cabang", pic: "Fajar H.", prioritas: "Medium" as const, status: "Diproses", sla: "8 jam" },
];

export const cabang = [
  { nama: "KC Bekasi", lead: 82, followUp: 14, caseOpen: 6, sla: 94, backlog: 5, status: "Sehat" as const },
  { nama: "KC Bandung", lead: 64, followUp: 11, caseOpen: 4, sla: 91, backlog: 7, status: "Perlu Pantau" as const },
  { nama: "KC Tangerang", lead: 71, followUp: 9, caseOpen: 8, sla: 84, backlog: 14, status: "Risiko" as const },
  { nama: "KC Jakarta", lead: 93, followUp: 18, caseOpen: 5, sla: 96, backlog: 3, status: "Sehat" as const },
  { nama: "KC Surabaya", lead: 58, followUp: 10, caseOpen: 3, sla: 90, backlog: 6, status: "Sehat" as const },
];

export const campaigns = [
  { nama: "KPR Rumah Pertama 2026", channel: "Digital", lead: 420, qualified: 210, konversi: 23, status: "Aktif", insight: "Lead tinggi, perlu follow-up cabang" },
  { nama: "Take Over KPR", channel: "Email/WA", lead: 180, qualified: 92, konversi: 18, status: "Aktif", insight: "Segmentasi perlu diperbaiki" },
  { nama: "Developer Partner Expo", channel: "Event", lead: 260, qualified: 160, konversi: 31, status: "Sukses", insight: "Channel paling sehat minggu ini" },
];

export const auditTrail = [
  { waktu: "09:10", aksi: "Lead dibuat dari channel balé Properti" },
  { waktu: "09:25", aksi: "Assigned ke KC Bekasi" },
  { waktu: "10:15", aksi: "Officer menambahkan catatan follow-up" },
  { waktu: "13:30", aksi: "Reminder dibuat otomatis" },
  { waktu: "15:00", aksi: "Supervisor melihat status SLA" },
];

export const customerInteraksi = [
  { tanggal: "20 Apr 2026", aksi: "Mengisi form minat KPR di balé Properti" },
  { tanggal: "21 Apr 2026", aksi: "Dihubungi call center untuk verifikasi awal" },
  { tanggal: "22 Apr 2026", aksi: "Konsultasi simulasi KPR dengan officer cabang" },
  { tanggal: "23 Apr 2026", aksi: "Dokumen awal diminta oleh PIC cabang" },
  { tanggal: "24 Apr 2026", aksi: "Reminder follow-up otomatis dikirim" },
];
