"use client";
// app/admin/approvals/page.tsx — new profiles, profile edits, and photos wait here before going live. TODO: GET /api/admin/approvals
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import MemberDetails, { type FullProfile } from "../MemberDetails";

type FieldChange = { field: string; before?: string; after: string };

type Item = {
  id: string;
  kind: "New profile" | "Profile edit" | "Photo";
  member: string;
  memberId: string;
  ago: string;
  detail: string;
  changes?: FieldChange[];
  pendingPhotos?: { label: string; note: string }[];
  profile: FullProfile;
};

const SEED: Item[] = [
  {
    id: "a1",
    kind: "New profile",
    member: "Arjun P.",
    memberId: "SM204530",
    ago: "5 min ago",
    detail: "New registration · Kollam · Hindu, Nair",
    profile: {
      profileFor: "Myself", gender: "Male", dob: "1997-08-15", age: 29, height: "176 cm", maritalStatus: "Never married", motherTongue: "Malayalam",
      mobile: "9847044556", email: "arjun.p@sammatham.in", state: "Kerala", district: "Kollam", place: "Karunagappally", pincode: "690518",
      houseName: "Pranavam", landmark: "Near NH 66 Junction", mapLink: "https://maps.google.com/?q=Karunagappally+Kerala", addressVisibility: "Accepted matches only",
      religion: "Hindu", community: "Nair", subCommunity: "Pillai",
      education: "MBA", college: "CET Trivandrum", occupation: "Operations manager", employer: "Logistics firm, Kochi", income: "₹8–10 lakh", workLocation: "Kochi",
      fatherOccupation: "Retired teacher", motherOccupation: "Homemaker", siblings: "No siblings", familyType: "Nuclear", familyStatus: "Middle class",
      star: "Thiruvonam", rasi: "Makaram", dosham: "No dosham", timeOfBirth: "09:15 PM", placeOfBirth: "Kollam",
      diet: "Non-vegetarian", smoking: "No", drinking: "No",
      about: "Family-oriented person working in Kochi. Enjoy cricket, travel and cooking with family on weekends.",
      faceVerified: true,
    },
  },
  {
    id: "a2",
    kind: "Photo",
    member: "Lakshmi R.",
    memberId: "SM204529",
    ago: "22 min ago",
    detail: "3 new photos uploaded",
    pendingPhotos: [
      { label: "Photo 1 (New)", note: "Portrait · clear face detected · 94% match" },
      { label: "Photo 2 (New)", note: "Outdoor · clear face detected · 91% match" },
      { label: "Photo 3 (New)", note: "Family event · clear face detected · 89% match" },
    ],
    profile: {
      profileFor: "Daughter", gender: "Female", dob: "2000-02-11", age: 26, height: "162 cm", maritalStatus: "Never married", motherTongue: "Malayalam",
      mobile: "9847055667", email: "lakshmi.r@sammatham.in", state: "Kerala", district: "Thrissur", place: "Ollur", pincode: "680306",
      houseName: "Lakshmi Nivas", landmark: "Near Ollur Church", addressVisibility: "Accepted matches only",
      religion: "Hindu", community: "Ezhava", subCommunity: "—",
      education: "M.Sc Computer Science", college: "St. Thomas College, Thrissur", occupation: "Data analyst", employer: "Infopark, Kochi", income: "₹6–8 lakh", workLocation: "Kochi",
      fatherOccupation: "Retired engineer", motherOccupation: "Homemaker", siblings: "1 elder brother, married", familyType: "Nuclear", familyStatus: "Upper middle class",
      star: "Pooyam", rasi: "Karkidakam", dosham: "No dosham", timeOfBirth: "07:30 AM", placeOfBirth: "Thrissur",
      diet: "Non-vegetarian", smoking: "No", drinking: "No",
      about: "Working as a data analyst in Infopark. Looking for an understanding, supportive partner.",
      faceVerified: true,
    },
  },
  {
    id: "a3",
    kind: "Photo",
    member: "Rahul S.",
    memberId: "SM204528",
    ago: "1 h ago",
    detail: "Profile photo changed",
    pendingPhotos: [
      { label: "New primary photo", note: "Portrait · 96% match with verified selfie" },
    ],
    profile: {
      profileFor: "Myself", gender: "Male", dob: "1996-05-24", age: 30, height: "178 cm", maritalStatus: "Never married", motherTongue: "Malayalam",
      mobile: "9847066778", email: "rahul.s@sammatham.in", state: "Kerala", district: "Kannur", place: "Thalassery", pincode: "670101",
      houseName: "Sreekrishna Bhavan", landmark: "Near Thalassery Fort", addressVisibility: "Premium members I accept",
      religion: "Hindu", community: "Thiyya", subCommunity: "—",
      education: "B.Tech (Civil)", college: "GEC Kannur", occupation: "Civil engineer", employer: "Self-employed consultancy", income: "₹15–20 lakh", workLocation: "Kannur",
      fatherOccupation: "Businessman", motherOccupation: "Homemaker", siblings: "1 younger sister, studying", familyType: "Joint", familyStatus: "Upper middle class",
      star: "Rohini", rasi: "Edavam", dosham: "No dosham", timeOfBirth: "05:40 PM", placeOfBirth: "Kannur",
      diet: "Non-vegetarian", smoking: "No", drinking: "No",
      about: "Civil engineer running a construction consultancy in Kannur. Close-knit family of four.",
      faceVerified: true,
    },
  },
  {
    id: "a4",
    kind: "Profile edit",
    member: "Sneha V.",
    memberId: "SM204527",
    ago: "3 h ago",
    detail: "Edited About me and education",
    changes: [
      { field: "Education", before: "B.Com", after: "MBA (Finance), CUSAT" },
      {
        field: "About me",
        before: "Working in Kochi. Looking for a caring partner.",
        after: "Working as a senior financial analyst in Kochi. Enjoy Carnatic music, reading and travelling with family. Looking for a kind, family-oriented partner.",
      },
    ],
    profile: {
      profileFor: "Myself", gender: "Female", dob: "1999-09-10", age: 27, height: "161 cm", maritalStatus: "Never married", motherTongue: "Malayalam",
      mobile: "9847077889", email: "sneha.v@sammatham.in", state: "Kerala", district: "Ernakulam", place: "Kakkanad", pincode: "682030",
      houseName: "Vaisakh Villa", landmark: "Near Civil Station, Kakkanad", mapLink: "https://maps.google.com/?q=Kakkanad+Kochi", addressVisibility: "Accepted matches only",
      religion: "Hindu", community: "Nair", subCommunity: "Menon",
      education: "MBA (Finance), CUSAT", college: "CUSAT, Kochi", occupation: "Senior financial analyst", employer: "EY, Kochi", income: "₹10–15 lakh", workLocation: "Kochi",
      fatherOccupation: "Chartered accountant", motherOccupation: "College lecturer", siblings: "1 brother, working abroad", familyType: "Nuclear", familyStatus: "Affluent",
      star: "Uthram", rasi: "Chingam", dosham: "No dosham", timeOfBirth: "10:05 AM", placeOfBirth: "Kochi",
      diet: "Vegetarian", smoking: "No", drinking: "No",
      about: "Working as a senior financial analyst in Kochi. Enjoy Carnatic music, reading and travelling with family. Looking for a kind, family-oriented partner.",
      faceVerified: true,
    },
  },
];

const REASONS = [
  "Photo is unclear",
  "Not the member's own photo",
  "Inappropriate content",
  "Incomplete or false details",
  "Contact details in text",
];

export default function Approvals() {
  const [items, setItems] = useState(SEED);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<"changes" | "profile">("changes");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [msg, setMsg] = useState("");

  const reviewing = items.find((i) => i.id === reviewId) ?? null;

  useEffect(() => {
    if (!reviewId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReviewId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [reviewId]);

  const openReview = (id: string) => {
    setReviewId(id);
    setDrawerTab("changes");
    setRejecting(null);
  };

  const decide = async (i: Item, approve: boolean) => {
    setItems((l) => l.filter((x) => x.id !== i.id));
    setRejecting(null);
    if (reviewId === i.id) setReviewId(null);
    setMsg(`${i.member}: ${approve ? "approved" : "rejected"}`);
    await adminFetch(`/api/admin/approvals/${i.id}`, {
      method: "POST",
      body: JSON.stringify({ approve, reason: approve ? undefined : reason }),
    }).catch(() => {});
  };

  return (
    <>
      <h1 className="ad__h">Approvals <span className="muted">({items.length} waiting)</span></h1>
      {msg && <p className="ok" role="status">{msg}</p>}
      {items.length === 0 ? (
        <div className="card empty muted">Nothing waiting for review.</div>
      ) : (
        <ul className="queue">
          {items.map((i) => (
            <li key={i.id} className="card qrow">
              <div className="qrow__ph" aria-hidden="true">{i.member[0]}</div>
              <div className="qrow__body">
                <b>{i.member}</b> <small className="muted">{i.memberId} · {i.ago}</small>
                <p><span className="bdg bdg--warn">{i.kind}</span> {i.detail}</p>
                {rejecting === i.id && reviewId !== i.id && (
                  <div className="qrow__rej">
                    <select aria-label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
                      {REASONS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                    <button type="button" className="btn btn--solid btn--sm" onClick={() => decide(i, false)}>Confirm reject</button>
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setRejecting(null)}>Cancel</button>
                  </div>
                )}
              </div>
              <div className="acts">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => openReview(i.id)}
                  aria-label={`Review ${i.member}`}
                  title="Review changes & full profile"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <button type="button" className="btn btn--solid btn--sm" onClick={() => decide(i, true)}>Approve</button>
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setRejecting(i.id)}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Review slide-over drawer: Edited fields vs Full profile */}
      {reviewing && (
        <div className="ad-modal-bg" onClick={() => setReviewId(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`Review ${reviewing.member}`}
            className="ad-drawer ad-drawer--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-drawer__head">
              <div className="ad-drawer__who">
                <span className="qrow__ph" aria-hidden="true">{reviewing.member[0]}</span>
                <div>
                  <h2>{reviewing.member}</h2>
                  <small className="muted">{reviewing.memberId} · {reviewing.ago}</small>
                </div>
              </div>
              <button type="button" className="icon-btn" onClick={() => setReviewId(null)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="ad-drawer__badges">
              <span className="bdg bdg--warn">{reviewing.kind}</span>
              <span className={`bdg ${reviewing.profile.faceVerified ? "bdg--ok" : "bdg--warn"}`}>
                {reviewing.profile.faceVerified ? "Face verified" : "Face not verified"}
              </span>
            </div>

            <div className="tabs" role="tablist" style={{ marginBottom: 0 }}>
              <button
                type="button"
                role="tab"
                aria-selected={drawerTab === "changes"}
                className={drawerTab === "changes" ? "on" : ""}
                onClick={() => setDrawerTab("changes")}
              >
                {reviewing.kind === "Profile edit" ? "Edited fields" : reviewing.kind === "Photo" ? "Pending photos" : "Submission"}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={drawerTab === "profile"}
                className={drawerTab === "profile" ? "on" : ""}
                onClick={() => setDrawerTab("profile")}
              >
                Full profile &amp; bio
              </button>
            </div>

            {drawerTab === "changes" ? (
              <div className="ad-diff-list">
                {reviewing.changes && reviewing.changes.length > 0 ? (
                  reviewing.changes.map((c) => (
                    <div key={c.field} className="ad-diff">
                      <span className="ad-diff__label">{c.field}</span>
                      {c.before && (
                        <div className="ad-diff__old">
                          <small>Previous</small>
                          <p>{c.before}</p>
                        </div>
                      )}
                      <div className="ad-diff__new">
                        <small>Edited to</small>
                        <p>{c.after}</p>
                      </div>
                    </div>
                  ))
                ) : reviewing.pendingPhotos && reviewing.pendingPhotos.length > 0 ? (
                  reviewing.pendingPhotos.map((p) => (
                    <div key={p.label} className="ad-photo-card">
                      <div className="ad-photo-card__thumb" aria-hidden="true">{reviewing.member[0]}</div>
                      <div>
                        <b>{p.label}</b>
                        <p className="muted" style={{ marginTop: 2 }}>{p.note}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="ad-diff">
                    <span className="ad-diff__label">New registration</span>
                    <div className="ad-diff__new">
                      <small>Submitted bio</small>
                      <p>{reviewing.profile.about}</p>
                    </div>
                    <p className="muted" style={{ marginTop: 8 }}>
                      Switch to <b>Full profile &amp; bio</b> to inspect every registration detail before approving.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <MemberDetails p={reviewing.profile} />
            )}

            {rejecting === reviewing.id ? (
              <div className="ad-drawer__reject">
                <label className="field">
                  <span>Rejection reason</span>
                  <select value={reason} onChange={(e) => setReason(e.target.value)}>
                    {REASONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </label>
                <div className="ad-drawer__foot" style={{ paddingTop: 4 }}>
                  <button type="button" className="btn btn--danger" onClick={() => decide(reviewing, false)}>Confirm reject</button>
                  <button type="button" className="btn btn--outline" onClick={() => setRejecting(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="ad-drawer__foot">
                <button type="button" className="btn btn--solid" onClick={() => decide(reviewing, true)}>Approve</button>
                <button type="button" className="btn btn--outline" onClick={() => setRejecting(reviewing.id)}>Reject</button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
