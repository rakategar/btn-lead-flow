-- Notes from Leader to RM per RM cell
CREATE TABLE IF NOT EXISTS public.task_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rm_name text NOT NULL,
  leader_name text NOT NULL,
  message text NOT NULL,
  read_at timestamptz,
  read_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_all_select_notes" ON public.task_notes FOR SELECT USING (true);
CREATE POLICY "demo_all_insert_notes" ON public.task_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "demo_all_update_notes" ON public.task_notes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "demo_all_delete_notes" ON public.task_notes FOR DELETE USING (true);

-- Realtime
ALTER TABLE public.task_notes REPLICA IDENTITY FULL;
ALTER TABLE public.daily_tasks REPLICA IDENTITY FULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'task_notes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.task_notes';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'daily_tasks'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_tasks';
  END IF;
END $$;