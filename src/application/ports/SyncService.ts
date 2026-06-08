import { CalendarId } from "@/domain/calendar/ids";

export type SyncState = "local-only" | "connected" | "syncing" | "error";

export interface ShareInvite {
  readonly calendarId: CalendarId;
  readonly token: string;
  readonly url: string;
}

export interface SyncResult {
  readonly state: SyncState;
  readonly lastSyncedAt: Date | null;
}

/**
 * Port: the family-sharing / sync seam — the single most important boundary in
 * this codebase for avoiding lock-in. Today a local-only stub implements it; a
 * real backend (Supabase, Firebase, a CRDT engine) can be dropped in later with
 * NO changes to the domain, use-cases, or UI.
 */
export interface SyncService {
  state(): SyncState;
  /** Produce an invite another family member can use to join the calendar. */
  share(calendarId: CalendarId): Promise<ShareInvite>;
  /** Reconcile local and remote state. */
  sync(): Promise<SyncResult>;
}
