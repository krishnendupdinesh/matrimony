// app/admin/ui.tsx
export const TONES: Record<string, string> = {
  active: "ok",
  approved: "ok",
  resolved: "ok",
  success: "ok",
  pending: "warn",
  open: "warn",
  suspended: "bad",
  rejected: "bad",
  failed: "bad",
  refunded: "muted",
  dismissed: "muted",
};

export const Badge = ({ v }: { v: string }) => (
  <span className={`bdg bdg--${TONES[v.toLowerCase()] ?? "muted"}`}>{v}</span>
);
