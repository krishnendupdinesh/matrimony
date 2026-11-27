"use client";
// app/admin/members/page.tsx. TODO: GET /api/admin/members?query=&plan=&status=&page= (do paging on the server)
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../ui";
import { adminFetch } from "@/lib/adminApi";
import MemberDetails, { type FullProfile } from "../MemberDetails";

type M = {
  id: string;
  name: string;
  gender: string;
  district: string;
  plan: string;
  status: "Active" | "Suspended" | "Pending";
  joined: string;
  profile: FullProfile;
};

const SEED: M[] = [
  {
    id: "SM204518", name: "Krishnendu", gender: "Male", district: "Ernakulam", plan: "Free", status: "Active", joined: "12 Oct 2026",
    profile: {
      profileFor: "Myself", gender: "Male", dob: "1998-04-12", age: 28, height: "174 cm", maritalStatus: "Never married", motherTongue: "Malayalam",
      mobile: "9876543210", email: "krishnendu@sammatham.in", state: "Kerala", district: "Ernakulam", place: "Aluva", pincode: "683101",
      houseName: "Sreevalsam House", landmark: "Near Aluva Metro Station", mapLink: "https://maps.google.com/?q=Aluva+Kerala", addressVisibility: "Accepted matches only",
      religion: "Hindu", community: "Nair", subCommunity: "Menon",
      education: "B.Tech (CS)", college: "MEC Kochi", occupation: "Software engineer", employer: "Infopark, Kochi", income: "₹10–15 lakh", workLocation: "Kochi",
      fatherOccupation: "Retired govt officer", motherOccupation: "Homemaker", siblings: "1 younger sister, unmarried", familyType: "Nuclear", familyStatus: "Upper middle class",
      star: "Chithira", rasi: "Kanni", dosham: "No dosham", timeOfBirth: "08:10 AM", placeOfBirth: "Ernakulam",
      diet: "Non-vegetarian", smoking: "No", drinking: "No",
      about: "Software engineer based in Kochi. Value family traditions and open communication. Enjoy cycling, movies and weekend trips.",
      faceVerified: true,
    },
  },
  {
    id: "SM100231", name: "Divya K.", gender: "Female", district: "Ernakulam", plan: "Diamond", status: "Active", joined: "02 Sep 2026",
    profile: {
      profileFor: "Daughter", gender: "Female", dob: "2000-06-19", age: 26, height: "160 cm", maritalStatus: "Never married", motherTongue: "Malayalam",
      mobile: "9847011223", email: "divya.k@sammatham.in", state: "Kerala", district: "Ernakulam", place: "Aluva", pincode: "683102",
      houseName: "Kailasam Villa", landmark: "Near UC College", mapLink: "https://maps.google.com/?q=UC+College+Aluva", addressVisibility: "Accepted matches only",
      religion: "Hindu", community: "Nair", subCommunity: "Kiriyathil",
      education: "CA, B.Com", college: "St. Teresa's College", occupation: "Chartered accountant", employer: "Private firm, Kochi", income: "₹6–8 lakh", workLocation: "Kochi",
      fatherOccupation: "Retired bank manager", motherOccupation: "Homemaker", siblings: "1 brother, unmarried", familyType: "Nuclear", familyStatus: "Upper middle class",
      star: "Rohini", rasi: "Edavam", dosham: "No dosham", timeOfBirth: "06:45 AM", placeOfBirth: "Ernakulam",
      diet: "Vegetarian", smoking: "No", drinking: "No",
      about: "I work as a chartered accountant in Kochi. I enjoy classical music, travelling with family and cooking on weekends.",
      faceVerified: true,
    },
  },
  {
    id: "SM100245", name: "Anjali M.", gender: "Female", district: "Thrissur", plan: "Gold", status: "Active", joined: "18 Sep 2026",
    profile: {
      profileFor: "Myself", gender: "Female", dob: "1999-03-08", age: 27, height: "163 cm", maritalStatus: "Never married", motherTongue: "Malayalam",
      mobile: "9847022334", email: "anjali.m@sammatham.in", state: "Kerala", district: "Thrissur", place: "Chalakudy", pincode: "680307",
      houseName: "Moothedath House", landmark: "Near Chalakudy Town Hall", addressVisibility: "Only me",
      religion: "Hindu", community: "Ezhava", subCommunity: "—",
      education: "B.Tech", college: "NIT Calicut", occupation: "Software engineer", employer: "MNC, remote", income: "₹10–15 lakh", workLocation: "Remote / Thrissur",
      fatherOccupation: "Businessman", motherOccupation: "Teacher", siblings: "1 sister, married", familyType: "Joint", familyStatus: "Upper middle class",
      star: "Uthram", rasi: "Kanni", dosham: "No dosham", timeOfBirth: "11:20 AM", placeOfBirth: "Thrissur",
      diet: "Non-vegetarian", smoking: "No", drinking: "No",
      about: "Software engineer who works remotely. Love reading, hiking and trying new food. Family means a lot to me.",
      faceVerified: true,
    },
  },
  {
    id: "SM100455", name: "Reshma T.", gender: "Female", district: "Palakkad", plan: "Free", status: "Suspended", joined: "30 Aug 2026",
    profile: {
      profileFor: "Myself", gender: "Female", dob: "1995-11-02", age: 31, height: "157 cm", maritalStatus: "Never married", motherTongue: "Malayalam",
      mobile: "9847033445", email: "reshma.t@sammatham.in", state: "Kerala", district: "Palakkad", place: "Ottapalam", pincode: "679101",
      houseName: "Tharavadu Nivas", landmark: "Opposite Ottapalam Railway Station", addressVisibility: "Accepted matches only",
      religion: "Hindu", community: "Nair", subCommunity: "—",
      education: "B.Com", college: "Victoria College, Palakkad", occupation: "Bank officer", employer: "Public sector bank", income: "₹6–8 lakh", workLocation: "Palakkad",
      fatherOccupation: "Agriculturist", motherOccupation: "Homemaker", siblings: "1 brother, married", familyType: "Joint", familyStatus: "Middle class",
      star: "Chithira", rasi: "Thulam", dosham: "Other dosham", timeOfBirth: "04:30 PM", placeOfBirth: "Palakkad",
      diet: "Vegetarian", smoking: "No", drinking: "No",
      about: "Working as a bank officer in Palakkad. Simple, grounded and looking for a caring life partner.",
      faceVerified: false,
    },
  },
  {
    id: "SM204530", name: "Arjun P.", gender: "Male", district: "Kollam", plan: "Free", status: "Pending", joined: "Today",
    profile: {
      profileFor: "Myself", gender: "Male", dob: "1997-08-15", age: 29, height: "176 cm", maritalStatus: "Never married", motherTongue: "Malayalam",
      mobile: "9847044556", email: "arjun.p@sammatham.in", state: "Kerala", district: "Kollam", place: "Karunagappally", pincode: "690518",
      houseName: "Pranavam", landmark: "Near NH 66 Junction", addressVisibility: "Accepted matches only",
      religion: "Hindu", community: "Nair", subCommunity: "Pillai",
      education: "MBA", college: "CET Trivandrum", occupation: "Operations manager", employer: "Logistics firm, Kochi", income: "₹8–10 lakh", workLocation: "Kochi",
      fatherOccupation: "Retired teacher", motherOccupation: "Homemaker", siblings: "No siblings", familyType: "Nuclear", familyStatus: "Middle class",
      star: "Thiruvonam", rasi: "Makaram", dosham: "No dosham", timeOfBirth: "09:15 PM", placeOfBirth: "Kollam",
      diet: "Non-vegetarian", smoking: "No", drinking: "No",
      about: "Family-oriented person working in Kochi. Enjoy cricket, travel and cooking with family on weekends.",
      faceVerified: true,
    },
  },
];

export default function Members() {
  const [rows, setRows] = useState(SEED);
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const shown = useMemo(
    () => rows.filter((r) => (r.name + r.id).toLowerCase().includes(q.toLowerCase()) && (!plan || r.plan === plan) && (!status || r.status === status)),
    [rows, q, plan, status]
  );

  const toggle = async (m: M) => {
    const next = m.status === "Suspended" ? "Active" : "Suspended";
    if (!window.confirm(`${next === "Suspended" ? "Suspend" : "Reactivate"} ${m.name}?`)) return;
    setRows((l) => l.map((r) => (r.id === m.id ? { ...r, status: next } : r)));
    setMsg(`${m.name}: ${next.toLowerCase()}.`);
    await adminFetch(`/api/admin/members/${m.id}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) }).catch(() => {});
  };

  const remove = async (m: M) => {
    if (!window.confirm(`Permanently delete ${m.name} (${m.id})? This cannot be undone.`)) return;
    setRows((l) => l.filter((r) => r.id !== m.id));
    if (selectedId === m.id) setSelectedId(null);
    setMsg(`Deleted ${m.name} (${m.id}).`);
    await adminFetch(`/api/admin/members/${m.id}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <>
      <h1 className="ad__h">Members</h1>
      {msg && <p className="ok" role="status">{msg}</p>}
      <div className="tools">
        <input placeholder="Search name or ID" aria-label="Search members" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Plan" value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="">All plans</option>
          {["Free", "Gold", "Diamond", "Platinum"].map((p) => <option key={p}>{p}</option>)}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {["Active", "Pending", "Suspended"].map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr><th>Member</th><th>Gender</th><th>District</th><th>Plan</th><th>Status</th><th>Joined</th><th></th></tr>
          </thead>
          <tbody>
            {shown.map((m) => (
              <tr key={m.id}>
                <td><b>{m.name}</b><br /><small className="muted">{m.id}</small></td>
                <td>{m.gender}</td>
                <td>{m.district}</td>
                <td>{m.plan}</td>
                <td><Badge v={m.status} /></td>
                <td className="muted">{m.joined}</td>
                <td className="acts">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setSelectedId(m.id)}
                    aria-label={`View full details for ${m.name}`}
                    title="View full details"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => toggle(m)}>
                    {m.status === "Suspended" ? "Reactivate" : "Suspend"}
                  </button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => remove(m)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={7} className="muted empty">No members match.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Full member details drawer */}
      {selected && (
        <div className="ad-modal-bg" onClick={() => setSelectedId(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.name} full details`}
            className="ad-drawer ad-drawer--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-drawer__head">
              <div className="ad-drawer__who">
                <span className="qrow__ph" aria-hidden="true">{selected.name[0]}</span>
                <div>
                  <h2>{selected.name}</h2>
                  <small className="muted">{selected.id} · Joined {selected.joined}</small>
                </div>
              </div>
              <button type="button" className="icon-btn" onClick={() => setSelectedId(null)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="ad-drawer__badges">
              <Badge v={selected.status} />
              <span className="bdg bdg--muted">{selected.plan} plan</span>
              <span className={`bdg ${selected.profile.faceVerified ? "bdg--ok" : "bdg--warn"}`}>
                {selected.profile.faceVerified ? "Face verified" : "Not verified"}
              </span>
            </div>

            <MemberDetails p={selected.profile} />

            <div className="ad-drawer__foot">
              <button type="button" className="btn btn--outline" onClick={() => toggle(selected)}>
                {selected.status === "Suspended" ? "Reactivate account" : "Suspend account"}
              </button>
              <button type="button" className="btn btn--danger" onClick={() => remove(selected)}>
                Delete account
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
