// Persistence helpers untuk leads, rm_activities, dan rm_notifications (Lovable Cloud).
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { Lead, LeadNote, LeadExtras, PipelineStage, Priority, ResolutionStatus, FollowUpStage, RmActivity } from "./dummy-data";

type LeadRow = {
  id: string; nama: string; stage: string; priority: string; pic: string; leader: string;
  source: string | null; produk: string | null; last_activity: string | null;
  next_follow_up: string | null; fu_stage: string; status: string; ringkasan: string | null;
  notes: unknown;
  extras?: unknown;
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
  extras: (r.extras && typeof r.extras === "object" ? (r.extras as LeadExtras) : {}),
});
export const leadToRow = (l: Lead) => ({
  id: l.id, nama: l.nama, stage: l.stage, priority: l.priority, pic: l.pic, leader: l.leader,
  source: l.source ?? null, produk: l.produk ?? null,
  last_activity: l.lastActivity ?? null, next_follow_up: l.nextFollowUp ?? null,
  fu_stage: l.fuStage, status: l.status, ringkasan: l.ringkasan ?? null,
  notes: (l.notes ?? []) as unknown as Json,
  extras: (l.extras ?? {}) as unknown as Json,
});

type ActRow = {
  id: string; rm: string; leader: string; jenis: string;
  lead_id: string | null; lead_name: string | null;
  datetime: string; description: string; hasil: string | null;
  photos: unknown; created_at: string; done?: boolean | null;
};
export const rowToActivity = (r: ActRow): RmActivity => ({
  id: r.id, rm: r.rm, leader: r.leader, jenis: r.jenis,
  leadId: r.lead_id ?? undefined, leadName: r.lead_name ?? undefined,
  datetime: r.datetime, description: r.description, hasil: r.hasil ?? undefined,
  photos: Array.isArray(r.photos) ? (r.photos as string[]) : [],
  createdAt: r.created_at,
  done: !!r.done,
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
    hasil: a.hasil ?? null, photos: (a.photos ?? []) as unknown as Json,
  };
  const { data, error } = await supabase.from("rm_activities").insert(row).select("*").single();
  if (error) throw error;
  return rowToActivity(data as ActRow);
}
export async function setActivityDone(id: string, done: boolean): Promise<void> {
  const { error } = await supabase.from("rm_activities").update({ done }).eq("id", id);
  if (error) throw error;
}
export async function seedLeadsIfEmpty(seed: Lead[]): Promise<void> {
  const { count, error } = await supabase.from("leads").select("*", { count: "exact", head: true });
  if (error) throw error;
  if ((count ?? 0) > 0) return;
  const rows = seed.map(leadToRow);
  const { error: insErr } = await supabase.from("leads").insert(rows);
  if (insErr) throw insErr;
}

// --------- Notifications ---------
export interface RmNotification {
  id: string; rmName: string; message: string; source: string;
  createdBy: string | null; readAt: string | null; createdAt: string;
}
type NotifRow = {
  id: string; rm_name: string; message: string; source: string;
  created_by: string | null; read_at: string | null; created_at: string;
};
export const rowToNotif = (r: NotifRow): RmNotification => ({
  id: r.id, rmName: r.rm_name, message: r.message, source: r.source,
  createdBy: r.created_by, readAt: r.read_at, createdAt: r.created_at,
});
export async function loadNotificationsFor(rm: string): Promise<RmNotification[]> {
  const { data, error } = await supabase.from("rm_notifications")
    .select("*").eq("rm_name", rm).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToNotif(r as NotifRow));
}
export async function insertNotification(n: { rmName: string; message: string; source?: string; createdBy?: string }): Promise<RmNotification> {
  const { data, error } = await supabase.from("rm_notifications").insert({
    rm_name: n.rmName, message: n.message, source: n.source ?? "alert", created_by: n.createdBy ?? null,
  }).select("*").single();
  if (error) throw error;
  return rowToNotif(data as NotifRow);
}
export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from("rm_notifications")
    .update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
