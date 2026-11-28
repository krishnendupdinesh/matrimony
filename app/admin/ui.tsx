// app/admin/ui.tsx
export const TONES: Record<string, string> = {
  active: "ok",
  approved: "ok",
  resolved: "ok",
  published: "ok",
  interested: "ok",
  answered: "ok",
  success: "ok",
  pending: "warn",
  pending_review: "warn",
  in_progress: "warn",
  open: "warn",
  call_back_later: "warn",
  no_answer: "warn",
  suspended: "bad",
  rejected: "bad",
  failed: "bad",
  wrong_number: "bad",
  not_interested: "bad",
  hidden: "muted",
  closed: "muted",
  refunded: "muted",
  dismissed: "muted",
};

export const Badge = ({ v }: { v: string }) => (
  <span className={`bdg bdg--${TONES[v.toLowerCase()] ?? "muted"}`}>{v}</span>
);
