import type { Member } from "../AppNavbar";

export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
export const LIMIT = 10;

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw Object.assign(new Error("Request failed"), { status: res.status });
  return res.json().catch(() => null);
}

export type Profile = {
  id: string;
  profileId: string;
  name: string;
  age: number;
  height: number; // cm
  religion: string;
  community: string;
  district: string;
  education: string; // category
  degree: string;
  profession: string;
  marital: string;
  diet: string;
  verified: boolean;
  photoUrl?: string | null;
  fit: number;
  about: string;
  saved?: boolean;
  sent?: boolean;
};

export type Filters = {
  q: string;
  ageMin: number; ageMax: number;
  heightMin: number; heightMax: number;
  religion: string[]; community: string[]; district: string[];
  education: string[]; marital: string[]; diet: string[];
  verified: boolean; photo: boolean;
};

export const DEFAULTS: Filters = {
  q: "", ageMin: 21, ageMax: 40, heightMin: 140, heightMax: 200,
  religion: [], community: [], district: [], education: [], marital: [], diet: [],
  verified: false, photo: false,
};

export const RELIGIONS = ["Hindu", "Christian", "Muslim"];
export const COMMUNITIES: Record<string, string[]> = {
  Hindu: ["Nair", "Ezhava", "Menon", "Namboodiri", "Vishwakarma", "Other Hindu"],
  Christian: ["Syrian Catholic", "Latin Catholic", "Orthodox", "Jacobite", "Marthoma", "Pentecostal", "CSI"],
  Muslim: ["Sunni", "Mujahid", "Jamaat", "Other Muslim"],
};
export const DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam",
  "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod",
];
export const EDUCATION = ["Graduate", "Post graduate", "Doctorate", "Professional degree", "Diploma"];
export const MARITAL = ["Never married", "Divorced", "Widowed"];
export const DIET = ["Vegetarian", "Non-vegetarian", "Eggetarian"];

export const cmToFt = (cm: number) => {
  const total = Math.round(cm / 2.54);
  return `${Math.floor(total / 12)}'${total % 12}"`;
};

export type Sort = "match" | "new" | "ageAsc";

const ARR = ["religion", "community", "district", "education", "marital", "diet"] as const;

export function toParams(f: Filters, sort: Sort) {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  (["ageMin", "ageMax", "heightMin", "heightMax"] as const).forEach((k) => {
    if (f[k] !== DEFAULTS[k]) p.set(k, String(f[k]));
  });
  ARR.forEach((k) => f[k].length && p.set(k, f[k].join(",")));
  if (f.verified) p.set("verified", "1");
  if (f.photo) p.set("photo", "1");
  if (sort !== "match") p.set("sort", sort);
  return p;
}

export function fromParams(sp: URLSearchParams): { filters: Filters; sort: Sort } {
  const num = (k: string, d: number) => (Number.isFinite(Number(sp.get(k))) && sp.get(k) ? Number(sp.get(k)) : d);
  const f: Filters = {
    ...DEFAULTS,
    q: sp.get("q") ?? "",
    ageMin: num("ageMin", DEFAULTS.ageMin), ageMax: num("ageMax", DEFAULTS.ageMax),
    heightMin: num("heightMin", DEFAULTS.heightMin), heightMax: num("heightMax", DEFAULTS.heightMax),
    verified: sp.get("verified") === "1", photo: sp.get("photo") === "1",
  };
  ARR.forEach((k) => (f[k] = sp.get(k)?.split(",").filter(Boolean) ?? []));
  const s = sp.get("sort");
  return { filters: f, sort: s === "new" || s === "ageAsc" ? s : "match" };
}

export function activeCount(f: Filters) {
  let n = 0;
  if (f.ageMin !== DEFAULTS.ageMin || f.ageMax !== DEFAULTS.ageMax) n++;
  if (f.heightMin !== DEFAULTS.heightMin || f.heightMax !== DEFAULTS.heightMax) n++;
  ARR.forEach((k) => (n += f[k].length));
  if (f.verified) n++;
  if (f.photo) n++;
  return n;
}

export const DEMO_ME: Member = {
  name: "Krishnendu", photoUrl: null, completion: 70, status: "approved", faceVerified: false,
  premium: false, unreadMessages: 2, notifications: 3,
};

// [name, age, height, religion, community, district, edu, degree, profession, marital, diet, verified, photo, fit]
const RAW: [string, number, number, string, string, string, string, string, string, string, string, boolean, boolean, number][] = [
  ["Anjana R.", 27, 160, "Hindu", "Nair", "Ernakulam", "Professional degree", "B.Tech", "Software engineer", "Never married", "Non-vegetarian", true, true, 92],
  ["Meera S.", 26, 158, "Hindu", "Ezhava", "Thrissur", "Post graduate", "M.A., B.Ed", "Teacher", "Never married", "Vegetarian", true, true, 88],
  ["Neha P.", 28, 165, "Christian", "Syrian Catholic", "Kozhikode", "Professional degree", "MBBS", "Doctor", "Never married", "Non-vegetarian", true, false, 85],
  ["Riya T.", 27, 162, "Christian", "Latin Catholic", "Kottayam", "Professional degree", "B.Arch", "Architect", "Never married", "Non-vegetarian", true, true, 81],
  ["Sana K.", 26, 157, "Muslim", "Sunni", "Kozhikode", "Professional degree", "CA", "Chartered accountant", "Never married", "Non-vegetarian", true, true, 79],
  ["Lakshmi V.", 25, 155, "Hindu", "Menon", "Thrissur", "Post graduate", "M.Sc", "Lecturer", "Never married", "Vegetarian", false, true, 76],
  ["Divya K.", 29, 163, "Hindu", "Nair", "Thiruvananthapuram", "Graduate", "B.Com", "Bank officer", "Divorced", "Non-vegetarian", true, false, 74],
  ["Aswathy M.", 25, 159, "Hindu", "Ezhava", "Alappuzha", "Professional degree", "B.Pharm", "Pharmacist", "Never married", "Eggetarian", true, true, 72],
  ["Fathima N.", 24, 156, "Muslim", "Mujahid", "Malappuram", "Graduate", "B.Sc Nursing", "Staff nurse", "Never married", "Non-vegetarian", false, true, 70],
  ["Merin J.", 27, 164, "Christian", "Orthodox", "Pathanamthitta", "Post graduate", "MBA", "HR manager", "Never married", "Non-vegetarian", true, true, 69],
  ["Gayathri B.", 30, 161, "Hindu", "Namboodiri", "Palakkad", "Doctorate", "PhD", "Research scientist", "Never married", "Vegetarian", true, false, 66],
  ["Nimmy C.", 31, 160, "Christian", "Jacobite", "Idukki", "Graduate", "B.Ed", "School teacher", "Widowed", "Non-vegetarian", false, true, 62],
];

export const DEMO_PROFILES: Profile[] = RAW.map((r, i) => ({
  id: String(i + 1), profileId: `SM${300100 + i * 37}`, name: r[0], age: r[1], height: r[2], religion: r[3],
  community: r[4], district: r[5], education: r[6], degree: r[7], profession: r[8], marital: r[9],
  diet: r[10], verified: r[11], photoUrl: r[12] ? "demo" : null, fit: r[13],
  about: `Looking for a caring, family-oriented partner. Enjoys ${["travel", "music", "reading", "cooking"][i % 4]} and values tradition.`,
}));

export function demoSearch(f: Filters, sort: Sort, page: number) {
  const q = f.q.trim().toLowerCase();
  let list = DEMO_PROFILES.filter(
    (p) =>
      p.age >= f.ageMin && p.age <= f.ageMax &&
      p.height >= f.heightMin && p.height <= f.heightMax &&
      (!f.religion.length || f.religion.includes(p.religion)) &&
      (!f.community.length || f.community.includes(p.community)) &&
      (!f.district.length || f.district.includes(p.district)) &&
      (!f.education.length || f.education.includes(p.education)) &&
      (!f.marital.length || f.marital.includes(p.marital)) &&
      (!f.diet.length || f.diet.includes(p.diet)) &&
      (!f.verified || p.verified) &&
      (!f.photo || p.photoUrl) &&
      (!q || [p.name, p.profileId, p.profession, p.degree].some((v) => v.toLowerCase().includes(q)))
  );
  list = [...list].sort((a, b) => (sort === "ageAsc" ? a.age - b.age : sort === "new" ? Number(b.id) - Number(a.id) : b.fit - a.fit));
  return { total: list.length, results: list.slice((page - 1) * LIMIT, page * LIMIT) };
}