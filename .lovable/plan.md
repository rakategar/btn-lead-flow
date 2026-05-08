## Tambah Role Management (Superuser) + 10 Halaman, Mengikuti Gaya Existing

### Prinsip selaras dengan project saat ini
- Pakai semua design token & komponen yang sudah ada: `panel`, `KpiCard`, `StatusBadge` (`tone="navy|blue|gold|green|orange|red|gray"`), `Button`, warna semantic (`navy`, `gold`, `primary`, `success`, `accent`, `danger`, `muted`).
- Struktur tiap halaman meniru pola existing: hero/greeting "Halo, {user.name} — {role}" seperti `OverviewPage`, kartu `panel p-5` dengan `Header`/`SectionHead` (icon `bg-navy text-gold`), tabel `panel overflow-hidden` dengan `<thead className="bg-muted/50 ...">`, donut SVG seperti `CommandCenterPage`, chip filter seperti `PipelinePage`, board kolom seperti `ActivityDailyPage`, card pillar seperti `OverviewPage`.
- Tidak menambah library baru. Chart pakai SVG inline / div bar (pola existing) — TIDAK pakai recharts (proyek tidak memakainya di kode existing).
- Data semua dummy di `dummy-data.ts` (proyek pakai pendekatan dummy, bukan tabel DB baru). Tidak ada migrasi DB.
- Tidak menyentuh edge function `generate-laporan` atau halaman existing selain `AppShell` & `Index`.

### Perubahan tipe & data

**`src/lib/auth.tsx`**
- Tambah `"management"` ke `Role`.
- `listAccounts()` push 1 akun: `{ role: "management", name: "Direktur Operasional" }` (tanpa leaderName).

**`src/lib/dummy-data.ts`** (append, jangan ubah yang ada)
- `branches`: array cabang (8) — `{ name, region, area, leader, salesCount, activityScore, pipelineValue, closingMTD, target, gap, status: "Healthy"|"Watchlist"|"At Risk", performanceScore }`. Leader memakai nama existing + tambahan dummy.
- `productKpis`: `{ name, target, actual, gap, pct, mtd, prevMonth, lastYear }` untuk Funding/Lending/KPR/Tabungan/Bancassurance.
- `dailyRevenue`: array 30 hari `{ day, target, actual }`.
- `mgmtAlerts`: `{ id, level: "Critical"|"Warning"|"Watch", title, branch, pic, ageDays, resolved }`.
- `aiInsights`: `{ situation[], keyIssues[], improve[], grow[] }` + `aiRecommendations[]` `{ title, context, action }`.
- `topContributors`: 5 nama dengan score & cabang.
- `activityCompliance`: `{ updated, total, branches: [{name, updated, total}] }`.
- `pipelineHealthBreakdown`: 4 dimensi `{ name, score, benchmark }` + `pipelineHealth30d`: 30 angka.
- `stageAging`: per cabang `{ branch, contact, meet, prospect, close }` (rata-rata hari).
- `conversionDiagnosis`: per cabang `{ branch, dropStage, dropPct }`.
- `funnelConversion`: 4 stage `{ stage, pct, benchmark }`.
- `remedialDashboard`: `{ branch, gap, owner, action, deadline, status }`.
- `mgmtUsers`: 12 user `{ name, role, branch, status, lastLogin }`.
- `rolePermissions`: matriks `{ permission, management, leader, rm }`.
- `auditLogs`, `exportLogs`: `{ ts, user, action, target }`.
- `securityOverview`: `{ loginSuccess, loginFail, activeSessions, idleAccounts }`.
- `dataQuality`: per cabang `{ branch, emptyFields, duplicates, leadsNoNote }`.
- `orgTree`: nested National→Region→Area→Branch.

### Navigasi & shell

**`src/components/AppShell.tsx`**
- Extend `PageKey` dengan: `"mgmt-overview" | "mgmt-command" | "mgmt-branch" | "mgmt-kpi" | "mgmt-pipeline" | "mgmt-alerts" | "mgmt-ai" | "mgmt-users" | "mgmt-config" | "mgmt-audit"`.
- Tambah menu item dengan flag `managementOnly: true`, dipisah grup baru: "Management — Executive", "Management — Analitik", "Management — Sistem".
- Filter `visibleMenu`: 
  - role `management` → hanya item yang `managementOnly`.
  - role `leader`/`rm` → exclude `managementOnly` (dan tetap exclude `leaderOnly` untuk RM).
- Role label header: tambah branch `management` → "Management (Superuser)" + `RoleIcon = ShieldCheck`.
- Sidebar bottom badge: tetap (Mode Demo Konsep).

**`src/pages/Index.tsx`**
- Tambah entries di `pageMeta` untuk 10 page baru (judul + subtitle senada gaya existing).
- `useState<PageKey>` initial: jika `user.role === "management"` set `"mgmt-overview"`, else `"overview"` (lewat lazy init memo). Karena hooks sebelum login: tetap initial `"overview"`, lalu `useEffect` set ke `mgmt-overview` saat user management login pertama kali.
- Sembunyikan tombol "Tambah Aktivitas Dummy" untuk management (cek `user.role !== "management"` di `AppShell` props atau no-op handler — paling bersih: tambah prop `showAddActivity` ke `AppShell` dan render kondisional).
- `scopedLeads` untuk management = `leads` (semua, tanpa filter).
- Switch render tambahkan 10 case ke komponen baru.

### 10 halaman baru di `src/components/pages/management/`

Setiap file pakai pola: 
- Hero/greeting `panel p-5 bg-gradient-to-r from-primary-light/60 ...` dengan label role.
- Section helper `Header`/`SectionHead` (copy pola dari OverviewPage/CommandCenterPage).
- `panel`, `KpiCard`, `StatusBadge` untuk konten.
- Tabel pakai `<table className="w-full text-sm">` + `<thead className="bg-muted/50 ...">`.

1. **`ExecutiveOverviewPage.tsx`**
   - Greeting + tanggal hari ini (Date locale id-ID).
   - 4 `KpiCard` (Total Pipeline Value, Hot Leads, Closing MTD vs Target, Avg Productivity Officer).
   - "Target vs Actual Revenue" — line chart SVG inline (sumbu dummy 30 hari).
   - "Ranking Cabang" — list `panel` dengan score bar + `StatusBadge` Healthy/Watchlist/At Risk (gunakan tone green/orange/red).
   - Panel "AI Key Issues" (list bullet pakai `AlertTriangle`).
   - Panel "Top Contributor Minggu Ini" (list dengan avatar/inisial bg-navy text-gold).
   - Panel "Activity Compliance" (progress bar pakai `bg-muted` + fill `bg-primary` seperti ActivityDailyPage).

2. **`MgmtCommandCenterPage.tsx`**
   - Filter chips bar (cabang/area/produk/temperature/periode) — pola Chip dari PipelinePage.
   - Pipeline board 4 kolom (Contact/Meet/Prospect/Close) — agregat: jumlah lead + total value (Rp), pakai pola `CommandCenterPage` pipeline board.
   - Funnel conversion: 4 baris bar horizontal (`bg-muted` + fill `bg-primary`) dengan label persentase + benchmark.
   - Tabel remedial dashboard (cabang/gap/owner/action/deadline/status) — pola tabel existing.

3. **`BranchPerformancePage.tsx`**
   - Tabel cabang lengkap (sortable by header click). Status pakai `StatusBadge`.
   - Klik baris → drawer kanan (pola PipelinePage drawer) berisi KPI cabang, daftar aktivitas tim (reuse picActivities filter), pipeline per PIC, coaching notes (dummy).
   - Heatmap grid: `grid grid-cols-{n}` div berwarna `bg-success/30`, `bg-accent/30`, `bg-danger/30` per cabang, hover tooltip.

4. **`KpiTrackerPage.tsx`**
   - Grid kartu per produk (5–6 kartu) — header produk, target/actual/gap, persentase, mini bar.
   - Bar chart inline 3-seri perbandingan (MTD vs prev month vs LY) untuk total revenue.
   - Tabel produktivitas officer (nama/cabang/contact/meeting/closing/revenue/ranking).

5. **`PipelineIntelligencePage.tsx`**
   - Health score gauge donut (SVG, pola Donut di CommandCenterPage) di kiri + 4 dimensi breakdown bar di kanan.
   - Donut Hot/Warm/Cold (3 segmen SVG) + list nama lead tiap kategori.
   - Tabel stage aging per cabang (kolom: cabang/Contact/Meet/Prospect/Close).
   - Tabel conversion diagnosis (cabang/drop stage/drop %).

6. **`EarlyWarningPage.tsx`**
   - 3 section: Critical (border-l-danger), Warning (border-l-accent), Watch (border-l-primary). Tiap card: deskripsi, cabang/PIC, age (X hari), tombol "Tindak Lanjut" + "Eskalasi" (toast on click).
   - Tabs sederhana (state local) "Open" vs "Resolved" pakai chip.

7. **`AiInsightCenterPage.tsx`**
   - 4 panel "AI Executive Summary": Current Situation / Key Issues / Need to be Improved / Continue to Grow (icon + bullet list).
   - Grid kartu rekomendasi (3–6) — context + tombol "Terapkan" (toast).
   - Line chart SVG pipeline health 30 hari.
   - "AI Remedial Plan": Select cabang (native `<select>`) + tombol Generate → tampilkan card action plan dummy (timeline + owner) dengan toast "Plan terkirim ke leader".

8. **`UserManagementPage.tsx`** (management only)
   - Toolbar: filter role/cabang/status (chips), search input.
   - Tabel users (nama/role/cabang/status/last login) + checkbox per row.
   - Tombol "Tambah User", "Import Excel", "Export Directory" (semua → toast).
   - Bulk action bar muncul jika ada selection: "Set Aktif/Nonaktif", "Ubah Role", "Pindah Cabang".
   - Section terpisah: tabel Role Matrix (permission × role, ✓/✗).

9. **`SystemConfigPage.tsx`** (management only)
   - Tabs sederhana (state local) tanpa Radix:
     - **Cabang & Area**: tree view `Collapsible` (sudah ada di project) National→Region→Area→Branch dengan tombol +/edit/hapus.
     - **Target Cabang**: tabel input `<input>` per cabang/produk + tombol Import Excel.
     - **Rules Follow-Up**: form FU1/FU2/FU3 SLA (input number hari).
     - **Konfigurasi AI**: list toggle (`Switch` shadcn sudah ada) per fitur AI + textarea template & guardrail.

10. **`AuditGovernancePage.tsx`**
    - Tabs: Activity Log / Export Log / Security Overview / Data Quality.
    - Activity & Export Log: tabel `(ts, user, action, target)` + filter chip.
    - Security: 4 `KpiCard` (login sukses/gagal, sesi aktif, akun idle >30hr).
    - Data Quality: per cabang progress bar (% empty fields, duplikat, lead tanpa catatan).

### Akses & permission
- Sidebar AppShell sudah filter berdasarkan role; halaman management tidak terlihat untuk leader/rm.
- Index.tsx switch: jika kebetulan `page` = `mgmt-*` tapi `user.role !== "management"`, render `OverviewPage` fallback (defensive).
- Tombol "Tambah Aktivitas Dummy" tidak ditampilkan untuk role management.

### Files yang akan diubah/dibuat
- Edit: `src/lib/auth.tsx`, `src/lib/dummy-data.ts`, `src/components/AppShell.tsx`, `src/pages/Index.tsx`.
- Buat baru di `src/components/pages/management/`: `ExecutiveOverviewPage.tsx`, `MgmtCommandCenterPage.tsx`, `BranchPerformancePage.tsx`, `KpiTrackerPage.tsx`, `PipelineIntelligencePage.tsx`, `EarlyWarningPage.tsx`, `AiInsightCenterPage.tsx`, `UserManagementPage.tsx`, `SystemConfigPage.tsx`, `AuditGovernancePage.tsx`.
