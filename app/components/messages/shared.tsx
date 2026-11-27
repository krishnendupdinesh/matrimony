import { API_URL } from "@/lib/api";
import type { Member } from "../AppNavbar";

export const API = API_URL;

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw Object.assign(new Error("Request failed"), { status: res.status });
  return res.json().catch(() => null);
}

export type Conversation = {
  id: string;
  name: string;
  age: number;
  line: string; // "Software engineer"
  place: string;
  education: string;
  verified: boolean;
  last: string;
  time: string;
  unread: number;
  request?: boolean; // interest accepted, no message yet
  blocked?: boolean;
};

export type Message = {
  id: string;
  mine: boolean;
  body: string;
  at: string; // "10:42 AM"
  day: string; // "Today", "Yesterday"
  status?: "sending" | "sent" | "read" | "failed";
};

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <span
      className="font-display flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[var(--claret)] to-[var(--wine-deep)] text-[var(--ivory)]"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {name.charAt(0)}
    </span>
  );
}

// Sample data, used only when the backend is unreachable
export const DEMO_ME: Member = {
  name: "Krishnendu", photoUrl: null, completion: 70, status: "approved", faceVerified: false,
  premium: false, unreadMessages: 2, notifications: 3,
};

export const DEMO_CONVOS: Conversation[] = [
  { id: "1", name: "Anjana R.", age: 27, line: "Software engineer", place: "Kochi", education: "B.Tech", verified: true, last: "Sure, let's talk this weekend", time: "10:45 AM", unread: 2 },
  { id: "2", name: "Meera S.", age: 26, line: "Teacher", place: "Thrissur", education: "M.A., B.Ed", verified: true, last: "Thank you for accepting", time: "Yesterday", unread: 0 },
  { id: "3", name: "Neha P.", age: 28, line: "Doctor", place: "Kozhikode", education: "MBBS", verified: false, last: "", time: "Mon", unread: 0, request: true },
];

export const DEMO_MESSAGES: Record<string, Message[]> = {
  "1": [
    { id: "m1", mine: false, body: "Hello! Thank you for accepting my interest.", at: "10:40 AM", day: "Today" },
    { id: "m2", mine: true, body: "Hi Anjana, nice to meet you. Tell me a little about your family.", at: "10:42 AM", day: "Today", status: "read" },
    { id: "m3", mine: false, body: "Sure, let's talk this weekend", at: "10:45 AM", day: "Today" },
  ],
  "2": [
    { id: "m4", mine: false, body: "Thank you for accepting", at: "6:10 PM", day: "Yesterday" },
  ],
};