import { CalendarId } from "@/domain/calendar/ids";
import { Clock } from "@/application/ports/Clock";
import { IdGenerator } from "@/application/ports/IdGenerator";
import { ShareInvite, SyncResult, SyncService, SyncState } from "@/application/ports/SyncService";

/**
 * Placeholder sync implementation: the app is fully usable on a single device.
 * `share()` mints a local token so the share flow can be built end-to-end; this
 * does NOT actually sync between devices yet. Replace this adapter with a real
 * backend to make family sync work. See docs/adr/0003-local-first-sync-abstraction.md.
 */
export class LocalOnlySyncService implements SyncService {
  constructor(
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  state(): SyncState {
    return "local-only";
  }

  async share(calendarId: CalendarId): Promise<ShareInvite> {
    const token = this.ids.newId();
    return { calendarId, token, url: `famsync://join/${token}` };
  }

  async sync(): Promise<SyncResult> {
    return { state: "local-only", lastSyncedAt: this.clock.now() };
  }
}
