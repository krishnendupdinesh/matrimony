"use client";
// app/settings/page.tsx — account, privacy, notifications, blocked list, and profile visibility
import { useState, type FormEvent } from "react";
import Link from "next/link";
import PageShell from "../components/PageShell";

const Switch = ({
  label,
  hint,
  on,
  set,
}: {
  label: string;
  hint?: string;
  on: boolean;
  set: (v: boolean) => void;
}) => (
  <label className="tgl">
    <span>
      <b>{label}</b>
      {hint && <small>{hint}</small>}
    </span>
    <input type="checkbox" role="switch" checked={on} onChange={(e) => set(e.target.checked)} />
  </label>
);

const CHANNELS = ["Email", "SMS", "WhatsApp"] as const;
const TOPICS = ["Interests", "Messages", "Profile views", "Offers and news"];
const SECTIONS = [
  { id: "account", label: "Account & password" },
  { id: "privacy", label: "Privacy controls" },
  { id: "notifications", label: "Notifications" },
  { id: "blocked", label: "Blocked members" },
  { id: "danger", label: "Hide or delete" },
] as const;

export default function Settings() {
  const [activeSection, setActiveSection] = useState<string>("account");
  const [saved, setSaved] = useState("");
  const flash = (k: string) => {
    setSaved(k);
    setTimeout(() => setSaved(""), 3000);
  };

  // Password
  const [pw, setPw] = useState({ cur: "", next: "", again: "" });
  const [pwErr, setPwErr] = useState("");
  const changePw = (e: FormEvent) => {
    e.preventDefault();
    setPwErr("");
    if (pw.next.length < 8) return setPwErr("New password must be at least 8 characters.");
    if (pw.next !== pw.again) return setPwErr("The two new passwords do not match.");
    if (pw.next === pw.cur) return setPwErr("Choose a password you have not used here before.");
    setPw({ cur: "", next: "", again: "" });
    flash("pw"); // TODO: POST /api/account/password { current, next }
  };

  // Privacy
  const [priv, setPriv] = useState({
    photos: "All members",
    phone: "Premium members after acceptance",
    address: "Accepted matches only",
    lastSeen: true,
  });

  // Notifications: topic -> [email, sms, whatsapp]
  const [notif, setNotif] = useState<Record<string, boolean[]>>({
    Interests: [true, true, false],
    Messages: [true, false, false],
    "Profile views": [true, false, false],
    "Offers and news": [false, false, false],
  });
  const flip = (t: string, i: number) =>
    setNotif((n) => ({ ...n, [t]: n[t].map((v, j) => (j === i ? !v : v)) }));

  // Blocked
  const [blocked, setBlocked] = useState([
    { id: "SM188021", name: "Hari N." },
    { id: "SM190440", name: "Vishnu A." },
  ]);

  // Danger zone
  const [hidden, setHidden] = useState(false);
  const [confirm, setConfirm] = useState("");

  return (
    <PageShell>
      <header className="pg-head">
        <div className="pg-head__copy">
          <h1 className="pg__h">Settings and privacy</h1>
          <p className="muted">Manage your password, profile visibility, alerts, and blocked members.</p>
        </div>
        <div className="pg-head__actions">
          <Link href="/help" className="btn btn--outline">
            Need help?
          </Link>
        </div>
      </header>

      <div className="pg-split-set">
        {/* Left navigation rail */}
        <nav className="pg-sidenav pg-sticky" aria-label="Settings sections">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={activeSection === s.id ? "on" : ""}
              onClick={() => setActiveSection(s.id)}
            >
              {s.label}
            </a>
          ))}
        </nav>

        {/* Right settings content */}
        <div className="stack" style={{ gap: 20 }}>
          <section className="card stack" id="account">
            <div className="pg-card-hd">
              <h2>Account &amp; password</h2>
              <p>
                Mobile number and email are updated after verification.{" "}
                <Link href="/help" className="link">
                  Contact support
                </Link>
              </p>
            </div>
            <form className="stack" onSubmit={changePw}>
              <label className="field">
                <span>Current password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={pw.cur}
                  onChange={(e) => setPw({ ...pw, cur: e.target.value })}
                  required
                />
              </label>
              <div className="two">
                <label className="field">
                  <span>New password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={pw.again}
                    onChange={(e) => setPw({ ...pw, again: e.target.value })}
                    required
                  />
                </label>
              </div>
              {pwErr && (
                <p className="err" role="alert">
                  {pwErr}
                </p>
              )}
              {saved === "pw" && (
                <p className="okmsg" role="status">
                  Password changed
                </p>
              )}
              <div>
                <button className="btn btn--solid btn--inline">Change password</button>
              </div>
            </form>
          </section>

          <section className="card stack" id="privacy">
            <div className="pg-card-hd">
              <h2>Who can see what</h2>
              <p>Control how much of your profile is visible to other members.</p>
            </div>
            <div className="two">
              {(
                [
                  ["photos", "My photos", ["All members", "Accepted matches only"]],
                  ["phone", "My phone number", ["Only me", "Premium members after acceptance"]],
                  ["address", "House name and map link", ["Only me", "Accepted matches only"]],
                ] as const
              ).map(([k, l, opts]) => (
                <label className="field" key={k}>
                  <span>{l}</span>
                  <select value={priv[k]} onChange={(e) => setPriv({ ...priv, [k]: e.target.value })}>
                    {opts.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <Switch
              label="Show when I was last active"
              hint="Let matches know when you were recently online."
              on={priv.lastSeen}
              set={(v) => setPriv({ ...priv, lastSeen: v })}
            />
            <div className="row">
              <button className="btn btn--solid btn--inline" onClick={() => flash("priv")}>
                Save privacy settings
              </button>
              {saved === "priv" && (
                <span className="okmsg" role="status">
                  Saved
                </span>
              )}
            </div>
          </section>

          <section className="card stack" id="notifications">
            <div className="pg-card-hd">
              <h2>Notifications</h2>
              <p>Choose how you want to be notified for new activity.</p>
            </div>
            <div className="tw">
              <table className="mx">
                <thead>
                  <tr>
                    <th scope="col">Tell me about</th>
                    {CHANNELS.map((c) => (
                      <th key={c} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TOPICS.map((t) => (
                    <tr key={t}>
                      <td>{t}</td>
                      {CHANNELS.map((c, i) => (
                        <td key={c}>
                          <input
                            type="checkbox"
                            aria-label={`${t} by ${c}`}
                            checked={notif[t][i]}
                            onChange={() => flip(t, i)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row">
              <button className="btn btn--solid btn--inline" onClick={() => flash("notif")}>
                Save notification settings
              </button>
              {saved === "notif" && (
                <span className="okmsg" role="status">
                  Saved
                </span>
              )}
            </div>
          </section>

          <section className="card stack" id="blocked">
            <div className="pg-card-hd">
              <h2>Blocked members</h2>
              <p>Blocked members cannot view your profile, send interests, or message you.</p>
            </div>
            {blocked.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                You have not blocked anyone.
              </p>
            ) : (
              <ul className="list">
                {blocked.map((b) => (
                  <li key={b.id}>
                    <span>
                      <b>{b.name}</b> <small className="muted">{b.id}</small>
                    </span>
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => setBlocked(blocked.filter((x) => x.id !== b.id))}
                    >
                      Unblock
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card stack danger" id="danger">
            <div className="pg-card-hd">
              <h2>Hide or delete profile</h2>
              <p>Temporarily pause your profile or permanently remove your account.</p>
            </div>
            <Switch
              label="Hide my profile"
              hint="Other members cannot find or see you. You can switch this off any time."
              on={hidden}
              set={setHidden}
            />
            <label className="field">
              <span>Delete my profile permanently</span>
              <small>
                This removes your profile, photos, interests and messages. It cannot be undone. Type DELETE to confirm.
              </small>
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" />
            </label>
            <div>
              <button
                className="btn btn--danger btn--inline"
                disabled={confirm !== "DELETE"}
                onClick={() => {
                  /* TODO: DELETE /api/account, then sign out */
                }}
              >
                Delete my profile
              </button>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
