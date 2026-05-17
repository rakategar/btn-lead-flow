
ALTER TABLE public.rm_activities ADD COLUMN IF NOT EXISTS done boolean NOT NULL DEFAULT false;

ALTER TABLE public.task_notes ADD COLUMN IF NOT EXISTS target_type text;
ALTER TABLE public.task_notes ADD COLUMN IF NOT EXISTS target_id text;

CREATE TABLE IF NOT EXISTS public.rm_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rm_name text NOT NULL,
  message text NOT NULL,
  source text NOT NULL DEFAULT 'alert',
  created_by text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rm_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY demo_all_select_notif ON public.rm_notifications FOR SELECT USING (true);
CREATE POLICY demo_all_insert_notif ON public.rm_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY demo_all_update_notif ON public.rm_notifications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY demo_all_delete_notif ON public.rm_notifications FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.rm_notifications;
