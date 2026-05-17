-- LEADS table
CREATE TABLE public.leads (
  id text PRIMARY KEY,
  nama text NOT NULL,
  stage text NOT NULL DEFAULT 'Contact',
  priority text NOT NULL DEFAULT 'Medium',
  pic text NOT NULL,
  leader text NOT NULL,
  source text,
  produk text,
  last_activity text,
  next_follow_up text,
  fu_stage text NOT NULL DEFAULT 'FU1',
  status text NOT NULL DEFAULT 'In Progress',
  ringkasan text,
  notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_all_select_leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "demo_all_insert_leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "demo_all_update_leads" ON public.leads FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "demo_all_delete_leads" ON public.leads FOR DELETE USING (true);

CREATE TRIGGER trg_leads_touch BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER TABLE public.leads REPLICA IDENTITY FULL;

-- RM_ACTIVITIES table
CREATE TABLE public.rm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rm text NOT NULL,
  leader text NOT NULL,
  jenis text NOT NULL,
  lead_id text,
  lead_name text,
  datetime timestamptz NOT NULL DEFAULT now(),
  description text NOT NULL,
  hasil text,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rm_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_all_select_activities" ON public.rm_activities FOR SELECT USING (true);
CREATE POLICY "demo_all_insert_activities" ON public.rm_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "demo_all_update_activities" ON public.rm_activities FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "demo_all_delete_activities" ON public.rm_activities FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.rm_activities;
ALTER TABLE public.rm_activities REPLICA IDENTITY FULL;

CREATE INDEX idx_rm_activities_rm ON public.rm_activities(rm);
CREATE INDEX idx_rm_activities_datetime ON public.rm_activities(datetime DESC);
CREATE INDEX idx_leads_pic ON public.leads(pic);
CREATE INDEX idx_leads_leader ON public.leads(leader);