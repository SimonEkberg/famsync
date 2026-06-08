/** Minimal design tokens. Centralized so the UI stays consistent and themeable. */
export const colors = {
  background: "#0E1116",
  surface: "#151A21",
  surfaceAlt: "#1C232C",
  text: "#E8EDF2",
  textMuted: "#9AA7B4",
  primary: "#208AEF",
  onPrimary: "#FFFFFF",
  border: "#232C36",
  danger: "#E5484D",
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
