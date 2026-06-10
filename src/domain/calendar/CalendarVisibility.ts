/**
 * Whether a calendar is private to its owner or shared with the family group.
 * Today this is a model-level flag with no cross-device effect; when the sync
 * backend lands (M3) it controls what gets distributed to other members.
 */
export type CalendarVisibility = "private" | "shared";
