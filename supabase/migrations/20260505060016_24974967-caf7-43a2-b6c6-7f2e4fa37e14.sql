
create table public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text,
  priority text not null default 'Medium',
  assignee text,
  done boolean not null default false,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rhythms (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('weekly','monthly')),
  label text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.daily_tasks enable row level security;
alter table public.rhythms enable row level security;

-- Demo: open access (no real auth in this prototype)
create policy "demo_all_select_tasks" on public.daily_tasks for select using (true);
create policy "demo_all_insert_tasks" on public.daily_tasks for insert with check (true);
create policy "demo_all_update_tasks" on public.daily_tasks for update using (true) with check (true);
create policy "demo_all_delete_tasks" on public.daily_tasks for delete using (true);

create policy "demo_all_select_rhythms" on public.rhythms for select using (true);
create policy "demo_all_insert_rhythms" on public.rhythms for insert with check (true);
create policy "demo_all_update_rhythms" on public.rhythms for update using (true) with check (true);
create policy "demo_all_delete_rhythms" on public.rhythms for delete using (true);

-- Touch updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger daily_tasks_touch
before update on public.daily_tasks
for each row execute function public.touch_updated_at();

-- Realtime
alter publication supabase_realtime add table public.daily_tasks;
alter publication supabase_realtime add table public.rhythms;

-- Seed rhythms
insert into public.rhythms (type, label, position) values
('weekly','Weekly meeting tim sales',1),
('weekly','Pipeline calibration mingguan',2),
('weekly','1-on-1 coaching per RM',3),
('weekly','Laporan mingguan (Kamis 16.00)',4),
('monthly','Action plan bulan depan',1),
('monthly','Sales performance review',2),
('monthly','Evaluasi gap target',3),
('monthly','Rencana remedial & coaching',4);

-- Seed sample daily tasks
insert into public.daily_tasks (title, detail, priority, assignee, done, created_by) values
('Follow-up Andi Pratama (FU1)','Kirim simulasi cicilan KPR.','High','Rina A.',true,'Andre Wibowo'),
('Submit dokumen Siti Rahma','Verifikasi checklist final closing.','High','Dimas R.',false,'Andre Wibowo'),
('Prospecting kawasan Permata Hijau','Minimal 3 kontak baru.','Medium','Lala N.',false,'Andre Wibowo'),
('Coaching objection handling','Sesi 30 menit untuk produk Take Over.','Medium','Maya P.',false,'Sari Trihandayani'),
('Update pipeline Q2','Pastikan stage & next FU semua lead terisi.','Low','Fajar H.',false,'Sari Trihandayani'),
('Survey kebutuhan KPR di event partner',null,'Medium',null,false,'Andre Wibowo'),
('Recap meeting nasabah Dewi Lestari',null,'High',null,false,'Andre Wibowo');
