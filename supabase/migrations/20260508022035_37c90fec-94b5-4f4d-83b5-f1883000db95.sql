insert into storage.buckets (id, name, public) values ('templates', 'templates', true) on conflict (id) do nothing;

create policy "Public read templates" on storage.objects for select using (bucket_id = 'templates');