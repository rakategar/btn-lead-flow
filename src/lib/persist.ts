// Persistence helpers untuk leads & rm_activities (Lovable Cloud).
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadNote, PipelineStage, Priority, ResolutionStatus, FollowUpStage, RmActivity } from "./dummy-data";

type LeadRow = {
  id: string; nama: string; stage: string; priority: string; pic: string; leader: string;
  source: string | null; produk: string | null; last_activity: string | null;
  next_follow_up: string | null; fu_stage: string; status: string; ringkasan: string | null;
  notes: unknown;
};
export const rowToLead = (r: LeadRow): Lead => ({
  id: r.id, nama: r.nama,
  stage: (r.stage as PipelineStage) ?? "Contact",
  priority: (r.priority as Priority) ?? "Medium",
  pic: r.pic, leader: r.leader,
  source: r.source ?? "", produk: r.produk ?? "",
  lastActivity: r.last_activity ?? "",
  nextFollowUp: r.next_follow_up ?? "",
  fuStage: (r.fu_stage as FollowUpStage) ?? "FU1",
  status: (r.status as ResolutionStatus) ?? "In Progress",
  ringkasan: r.ringkasan ?? "",
  notes: Array.isArray(r.notes) ? (r.notes as LeadNote[]) : [],
});
export const leadToRow = (l: Lead) => ({
  id: l.id, nama: l.nama, stage: l.stage, priority: l.priority, pic: l.pic, leader: l.leader,
  source: l.source ?? null, produk: l.produk ?? null,
  last_activity: l.lastActivity ?? null, next_follow_up: l.nextFollowUp ?? null,
  fu_stage: l.fuStage, status: l.status, ringkasan: l.ringkasan ?? null,
  notes: (l.notes ?? []) as unknown as object,
});

type ActRow = {
  id: string; rm: string; leader: string; jenis: string;
  lead_id: string | null; lead_name: string | null;
  datetime: string; description: string; hasil: string | null;
  photos: unknown; created_at: string;
};
export const rowToActivity = (r: ActRow): RmActivity => ({
  id: r.id, rm: r.rm, leader: r.leader, jenis: r.jenis,
  leadId: r.lead_id ?? undefined, leadName: r.lead_name ?? undefined,
  datetime: r.datetime, description: r.description, hasil: r.hasil ?? undefined,
  photos: Array.isArray(r.photos) ? (r.photos as string[]) : [],
  createdAt: r.created_at,
});

export async function loadLeads(): Promise<Lead[]> {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToLead(r as LeadRow));
}
export async function loadActivities(): Promise<RmActivity[]> {
  const { data, error } = await supabase.from("rm_activities").select("*").order("datetime", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToActivity(r as ActRow));
}
export async function insertLead(lead: Lead): Promise<Lead> {
  const { data, error } = await supabase.from("leads").insert(leadToRow(lead)).select("*").single();
  if (error) throw error;
  return rowToLead(data as LeadRow);
}
export async function insertActivity(a: RmActivity): Promise<RmActivity> {
  const row = {
    rm: a.rm, leader: a.leader, jenis: a.jenis,
    lead_id: a.leadId ?? null, lead_name: a.leadName ?? null,
    datetime: a.datetime, description: a.description,
    hasil: a.hasil ?? null, photos: (a.photos ?? []) as unknown as object,
  };
  const { data, error } = await supabase.from("rm_activities").insert(row).select("*").single();
  if (error) throw error;
  return rowToActivity(data as ActRow);
}
export async function seedLeadsIfEmpty(seed: Lead[]): Promise<void> {
  const { count, error } = await supabase.from("leads").select("*", { count: "exact", head: true });
  if (error) throw error;
  if ((count ?? 0) > 0) return;
  const rows = seed.map(leadToRow);
  const { error: insErr } = await supabase.from("leads").insert(rows);
  if (insErr) throw insErr;
}
