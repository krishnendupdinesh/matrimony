"use client";
// app/profile/[id]/page.tsx — live opposite-gender member profile powered by GET /api/members/:id.
import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "../../components/AuthProvider";
import Navbar from "../../components/AppNavbar";
import AppFooter from "../../components/AppFooter";
import "../../styles/dashboard.css";
import "./profile-view.css";

interface MemberDetail {
  id: string;
  profileCode: string;
  name: string;
  gender: "male" | "female";
  age: number | null;
  religion: string;
  community: string;
  subCommunity: string;
  heightCm: number | null;
  maritalStatus: string;
  motherTongue: string;
  state: string;
  district: string;
  place: string;
  education: string;
  college: string;
  occupation: string;
  employer: string;
  income: string;
  workLocation: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: string;
  familyType: string;
  familyStatus: string;
  star: string;
  rasi: string;
  dosham: string;
  diet: string;
  smoking: string;
  drinking: string;
  about: string;
  idVerified: boolean;
  photos: { id: string; url: string; isPrimary: boolean }[];
  isShortlisted: boolean;
  interest: { id: string; status: string; direction: "sent" | "received" } | null;
  contactUnlocked: boolean;
  horoscope: { score: number; maxScore: number; verdict: string } | null;
  contact: {
    mobile: string;
    email: string;
    houseName: string;
    landmark: string;
    pincode: string;
    mapLink: string;
  } | null;
}

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="vrow">
    <dt>{label}</dt>
    <dd>{value || "—"}</dd>
  </div>
);

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="card vsec">
    <h2>{title}</h2>
    <dl>{children}</dl>
  </section>
);

function ViewProfileContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [photoIx, setPhotoIx] = useState(0);
  const [interestStatus, setInterestStatus] = useState<string>("none");
  const [shortlisted, setShortlisted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [menu, setMenu] = useState(false);
  const [actionErr, setActionErr] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // Redirect to own profile editor when viewing own ID.
    if (String(user.id) === String(id)) {
      router.replace("/profile");
      return;
    }

    let active = true;
    setLoading(true);
    setNotFound(false);

    apiFetch<{ member: MemberDetail }>(`/api/members/${encodeURIComponent(id)}`)
      .then((data) => {
        if (!active) return;
        setMember(data.member);
        setInterestStatus(data.member.interest?.status || "none");
        setShortlisted(Boolean(data.member.isShortlisted));
      })
      .catch(() => {
        if (!active) return;
        setMember(null);
        setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user, id, router]);

  if (authLoading || loading) {
    return (
      <main className="vp">
        <div className="card vp__missing">
          <p className="muted">Loading profile…</p>
        </div>
      </main>
    );
  }

  if (notFound || !member) {
    return (
      <main className="vp">
        <div className="card vp__missing">
          <h1>Profile not available</h1>
          <p className="muted">This profile may have been hidden or removed, or is not available to view.</p>
          <Link href="/search" className="btn btn--solid">
            Back to search
          </Link>
        </div>
      </main>
    );
  }

  const firstName = member.name.split(" ")[0] || member.name;
  const tiles = member.photos.length ? member.photos.map((p) => p.url) : [""];

  const sendInterest = async () => {
    setActionErr("");
    try {
      await apiFetch("/api/interests", { method: "POST", body: { receiverId: member.id } });
      setInterestStatus("pending");
    } catch (err) {
      setActionErr(err instanceof ApiError ? err.message : "Could not send interest.");
    }
  };

  const toggleShortlist = async () => {
    setActionErr("");
    try {
      if (shortlisted) {
        await apiFetch(`/api/shortlist/${member.id}`, { method: "DELETE" });
        setShortlisted(false);
      } else {
        await apiFetch("/api/shortlist", { method: "POST", body: { targetUserId: member.id } });
        setShortlisted(true);
      }
    } catch (err) {
      setActionErr(err instanceof ApiError ? err.message : "Could not update shortlist.");
    }
  };

  const toggleBlock = async () => {
    setActionErr("");
    setMenu(false);
    try {
      if (blocked) {
        await apiFetch(`/api/blocks/${member.id}`, { method: "DELETE" });
        setBlocked(false);
      } else {
        await apiFetch("/api/blocks", { method: "POST", body: { blockedId: member.id } });
        setBlocked(true);
      }
    } catch (err) {
      setActionErr(err instanceof ApiError ? err.message : "Could not update block status.");
    }
  };

  const score = member.horoscope?.score ?? 0;

  return (
    <main className="vp">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/search" className="link">
          ← Back to search
        </Link>
      </nav>

      <div className="vp__layout">
        <div className="vp__main">
          {/* Photos + headline */}
          <section className="card vhead">
            <div className="gallery">
              <div className="gallery__main" aria-live="polite">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {tiles[photoIx] ? (
                  <img src={tiles[photoIx]} alt={`${member.name}, photo ${photoIx + 1}`} />
                ) : (
                  <span>{member.name[0]?.toUpperCase() || "M"}</span>
                )}
                {tiles.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="g-nav g-prev"
                      onClick={() => setPhotoIx((photoIx + tiles.length - 1) % tiles.length)}
                      aria-label="Previous photo"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="g-nav g-next"
                      onClick={() => setPhotoIx((photoIx + 1) % tiles.length)}
                      aria-label="Next photo"
                    >
                      ›
                    </button>
                    <b className="g-count">
                      {photoIx + 1} / {tiles.length}
                    </b>
                  </>
                )}
              </div>
              {tiles.length > 1 && (
                <div className="thumbs">
                  {tiles.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      className={i === photoIx ? "on" : ""}
                      onClick={() => setPhotoIx(i)}
                      aria-label={`Show photo ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {t ? <img src={t} alt="" /> : member.name[0]}
                    </button>
                  ))}
                </div>
              )}
              {member.photos.length === 0 && (
                <p className="muted gallery__none">{firstName} has not added photos yet.</p>
              )}
            </div>

            <div className="vhead__info">
              <div className="vhead__top">
                <div>
                  <h1>
                    {member.name}
                    {member.age ? `, ${member.age}` : ""}
                  </h1>
                  <p className="muted">Profile ID {member.profileCode || member.id}</p>
                </div>
                <div className="vmenu">
                  <button
                    type="button"
                    className="kebab"
                    aria-label="More options"
                    aria-expanded={menu}
                    onClick={() => setMenu(!menu)}
                  >
                    ⋯
                  </button>
                  {menu && (
                    <div className="sm-dropdown" role="menu">
                      <button type="button" role="menuitem" onClick={toggleBlock}>
                        {blocked ? "Unblock" : "Block"}
                      </button>
                      <Link href={`/help?report=${member.profileCode || member.id}`} role="menuitem">
                        Report profile
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="chips">
                {member.idVerified && <span className="chip chip--ok">Verified</span>}
                <span className="chip">{member.maritalStatus}</span>
              </div>
              <p className="vhead__line">
                {[member.occupation, member.education].filter(Boolean).join(" · ") || "Member"}
              </p>
              <p className="vhead__line">
                {[member.place, member.district].filter(Boolean).join(", ") || member.state}
                {member.heightCm ? ` · ${member.heightCm} cm` : ""}
              </p>
              <p className="vhead__line">
                {[member.religion, member.community, member.star, member.motherTongue].filter(Boolean).join(" · ")}
              </p>
            </div>
          </section>

          {member.about && (
            <section className="card vsec">
              <h2>About {firstName}</h2>
              <p className="about">{member.about}</p>
            </section>
          )}

          <Section title="Basic details">
            <Row label="Age" value={member.age ? `${member.age} years` : "—"} />
            <Row label="Height" value={member.heightCm ? `${member.heightCm} cm` : "—"} />
            <Row label="Marital status" value={member.maritalStatus} />
            <Row label="Mother tongue" value={member.motherTongue} />
          </Section>

          <Section title="Location">
            <Row label="State" value={member.state} />
            <Row label="District" value={member.district} />
            <Row label="Place" value={member.place} />
            <Row
              label="House address"
              value={
                member.contact?.houseName ? (
                  member.contact.houseName
                ) : (
                  <span className="muted">Shared after the family accepts your interest</span>
                )
              }
            />
          </Section>

          <Section title="Religion and community">
            <Row label="Religion" value={member.religion} />
            <Row label="Community" value={member.community} />
            <Row label="Sub-community" value={member.subCommunity} />
          </Section>

          <Section title="Education and career">
            <Row label="Education" value={member.education} />
            <Row label="College" value={member.college} />
            <Row label="Occupation" value={member.occupation} />
            <Row label="Employer" value={member.employer} />
            <Row label="Annual income" value={member.income} />
            <Row label="Work location" value={member.workLocation} />
          </Section>

          <Section title="Family">
            <Row label="Father" value={member.fatherOccupation} />
            <Row label="Mother" value={member.motherOccupation} />
            <Row label="Siblings" value={member.siblings} />
            <Row label="Family type" value={member.familyType} />
            <Row label="Family status" value={member.familyStatus} />
          </Section>

          <Section title="Horoscope">
            <Row label="Star" value={member.star} />
            <Row label="Rasi" value={member.rasi} />
            <Row label="Dosham" value={member.dosham} />
          </Section>

          <Section title="Lifestyle">
            <Row label="Diet" value={member.diet} />
            <Row label="Smoking" value={member.smoking} />
            <Row label="Drinking" value={member.drinking} />
          </Section>
        </div>

        {/* Right column: actions and compatibility */}
        <aside className="vp__side">
          <div className="card vact">
            {actionErr && (
              <p className="muted" style={{ color: "#B3261E" }} role="alert">
                {actionErr}
              </p>
            )}
            {blocked ? (
              <p className="muted">
                You blocked this profile.{" "}
                <button type="button" className="link vlink" onClick={toggleBlock}>
                  Unblock
                </button>
              </p>
            ) : (
              <>
                {interestStatus === "none" && (
                  <button type="button" className="btn btn--solid btn--block" onClick={sendInterest}>
                    Send interest
                  </button>
                )}
                {interestStatus === "pending" && (
                  <button type="button" className="btn btn--outline btn--block" disabled>
                    Interest sent
                  </button>
                )}
                {interestStatus === "accepted" && (
                  <Link href="/messages" className="btn btn--solid btn--block">
                    Message {firstName}
                  </Link>
                )}
                {interestStatus === "declined" && (
                  <p className="muted">This member is not interested at the moment.</p>
                )}
                <button
                  type="button"
                  className="btn btn--outline btn--block"
                  aria-pressed={shortlisted}
                  onClick={toggleShortlist}
                >
                  {shortlisted ? "Shortlisted" : "Shortlist"}
                </button>
              </>
            )}
          </div>

          {member.horoscope && (
            <div className="card vmatch">
              <h2>Horoscope match</h2>
              <div className="vmatch__score">
                <b>{score}/10</b>
                <span className="muted">{member.horoscope.verdict || "porutham"}</span>
              </div>
              <div className="bar">
                <i style={{ width: `${score * 10}%` }} />
              </div>
              <Link href="/horoscope" className="link">
                See full horoscope match
              </Link>
            </div>
          )}

          <div className="card vcontact">
            <h2>Contact details</h2>
            {member.contactUnlocked && member.contact ? (
              <div>
                <p className="vcontact__num">{member.contact.mobile}</p>
                <p className="muted">{member.contact.email}</p>
              </div>
            ) : (
              <>
                <p className="muted">
                  Phone number and email are visible to premium members after an accepted interest.
                </p>
                <Link href="/plans" className="btn btn--solid btn--block">
                  Upgrade to view
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function ViewProfilePage() {
  return (
    <div className="dash-page">
      <Navbar />
      <Suspense fallback={<main className="vp"><p className="muted">Loading…</p></main>}>
        <ViewProfileContent />
      </Suspense>
      <AppFooter />
    </div>
  );
}
