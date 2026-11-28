"use client";
// app/admin/content/page.tsx — manage Banners, FAQs, Success Stories, and Announcements (content.manage).
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminApiFetch } from "@/lib/api";
import type { ContentAnnouncement, ContentBanner, ContentFaq, ContentStory } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

type ContentTab = "banners" | "faqs" | "stories" | "announcements";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminContentPage() {
  const { hasPermission } = useAdmin();
  const canManage = hasPermission("content.manage");

  const [tab, setTab] = useState<ContentTab>("banners");
  const [banners, setBanners] = useState<ContentBanner[]>([]);
  const [faqs, setFaqs] = useState<ContentFaq[]>([]);
  const [stories, setStories] = useState<ContentStory[]>([]);
  const [announcements, setAnnouncements] = useState<ContentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Banner form
  const [bTitle, setBTitle] = useState("");
  const [bSubtitle, setBSubtitle] = useState("");
  const [bLink, setBLink] = useState("");
  const [bOrder, setBOrder] = useState("0");
  const [bStart, setBStart] = useState("");
  const [bEnd, setBEnd] = useState("");
  const [bFile, setBFile] = useState<File | null>(null);

  // FAQ form
  const [fQuestion, setFQuestion] = useState("");
  const [fAnswer, setFAnswer] = useState("");
  const [fCategory, setFCategory] = useState("General");
  const [fOrder, setFOrder] = useState("0");

  // Story form
  const [sCouple, setSCouple] = useState("");
  const [sStory, setSStory] = useState("");
  const [sDate, setSDate] = useState("");
  const [sStatus, setSStatus] = useState<"pending" | "published" | "hidden">("published");
  const [sFile, setSFile] = useState<File | null>(null);

  // Announcement form
  const [aTitle, setATitle] = useState("");
  const [aMessage, setAMessage] = useState("");
  const [aAudience, setAAudience] = useState<"all" | "free" | "premium">("all");

  const loadTab = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    setErr("");
    try {
      if (tab === "banners") {
        const d = await adminApiFetch<{ banners: ContentBanner[] }>("/api/admin/content/banners");
        setBanners(d.banners);
      } else if (tab === "faqs") {
        const d = await adminApiFetch<{ faqs: ContentFaq[] }>("/api/admin/content/faqs");
        setFaqs(d.faqs);
      } else if (tab === "stories") {
        const d = await adminApiFetch<{ stories: ContentStory[] }>("/api/admin/content/success-stories");
        setStories(d.stories);
      } else {
        const d = await adminApiFetch<{ announcements: ContentAnnouncement[] }>("/api/admin/content/announcements");
        setAnnouncements(d.announcements);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }, [canManage, tab]);

  useEffect(() => {
    loadTab();
  }, [loadTab]);

  // ----- Banner actions -----
  const addBanner = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("title", bTitle);
      fd.append("subtitle", bSubtitle);
      fd.append("link", bLink);
      fd.append("sortOrder", bOrder);
      if (bStart) fd.append("startAt", new Date(bStart).toISOString());
      if (bEnd) fd.append("endAt", new Date(bEnd).toISOString());
      if (bFile) fd.append("image", bFile);
      await adminApiFetch("/api/admin/content/banners", { method: "POST", body: fd });
      setBTitle("");
      setBSubtitle("");
      setBLink("");
      setBOrder("0");
      setBStart("");
      setBEnd("");
      setBFile(null);
      setMsg("Banner created.");
      await loadTab();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create banner.");
    }
  };

  const toggleBanner = async (b: ContentBanner) => {
    await adminApiFetch(`/api/admin/content/banners/${b.id}`, {
      method: "PATCH",
      body: { active: !b.active },
    });
    await loadTab();
  };

  const moveBanner = async (b: ContentBanner, delta: number) => {
    await adminApiFetch(`/api/admin/content/banners/${b.id}`, {
      method: "PATCH",
      body: { sortOrder: b.sortOrder + delta },
    });
    await loadTab();
  };

  const removeBanner = async (b: ContentBanner) => {
    if (!window.confirm(`Delete banner '${b.title}'?`)) return;
    await adminApiFetch(`/api/admin/content/banners/${b.id}`, { method: "DELETE" });
    setMsg("Banner deleted.");
    await loadTab();
  };

  // ----- FAQ actions -----
  const addFaq = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await adminApiFetch("/api/admin/content/faqs", {
        method: "POST",
        body: { question: fQuestion, answer: fAnswer, category: fCategory, sortOrder: Number(fOrder) || 0 },
      });
      setFQuestion("");
      setFAnswer("");
      setFOrder("0");
      setMsg("FAQ created.");
      await loadTab();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create FAQ.");
    }
  };

  const toggleFaq = async (f: ContentFaq) => {
    await adminApiFetch(`/api/admin/content/faqs/${f.id}`, {
      method: "PATCH",
      body: { active: !f.active },
    });
    await loadTab();
  };

  const moveFaq = async (f: ContentFaq, delta: number) => {
    await adminApiFetch(`/api/admin/content/faqs/${f.id}`, {
      method: "PATCH",
      body: { sortOrder: f.sortOrder + delta },
    });
    await loadTab();
  };

  const removeFaq = async (f: ContentFaq) => {
    if (!window.confirm("Delete this FAQ?")) return;
    await adminApiFetch(`/api/admin/content/faqs/${f.id}`, { method: "DELETE" });
    setMsg("FAQ deleted.");
    await loadTab();
  };

  // ----- Story actions -----
  const addStory = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("coupleNames", sCouple);
      fd.append("story", sStory);
      if (sDate) fd.append("weddingDate", sDate);
      fd.append("status", sStatus);
      if (sFile) fd.append("photo", sFile);
      await adminApiFetch("/api/admin/content/success-stories", { method: "POST", body: fd });
      setSCouple("");
      setSStory("");
      setSDate("");
      setSFile(null);
      setMsg("Success story created.");
      await loadTab();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create story.");
    }
  };

  const setStoryStatus = async (s: ContentStory, nextStatus: ContentStory["status"]) => {
    await adminApiFetch(`/api/admin/content/success-stories/${s.id}`, {
      method: "PATCH",
      body: { status: nextStatus },
    });
    await loadTab();
  };

  const removeStory = async (s: ContentStory) => {
    if (!window.confirm(`Delete success story for '${s.coupleNames}'?`)) return;
    await adminApiFetch(`/api/admin/content/success-stories/${s.id}`, { method: "DELETE" });
    setMsg("Success story deleted.");
    await loadTab();
  };

  // ----- Announcement actions -----
  const sendAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    if (!window.confirm(`Send this announcement to '${aAudience}' members now?`)) return;
    setErr("");
    setMsg("");
    try {
      const d = await adminApiFetch<{ announcement: ContentAnnouncement }>("/api/admin/content/announcements", {
        method: "POST",
        body: { title: aTitle, message: aMessage, audience: aAudience },
      });
      setATitle("");
      setAMessage("");
      setMsg(`Announcement sent to ${d.announcement.recipientCount} members.`);
      await loadTab();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to send announcement.");
    }
  };

  const removeAnnouncement = async (a: ContentAnnouncement) => {
    if (!window.confirm(`Delete announcement '${a.title}'?`)) return;
    await adminApiFetch(`/api/admin/content/announcements/${a.id}`, { method: "DELETE" });
    await loadTab();
  };

  if (!canManage) {
    return <p className="err">You do not have permission to manage content.</p>;
  }

  return (
    <>
      <h1 className="ad__h">Content management</h1>
      {msg && <p className="ok" role="status">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}

      <div className="tabs">
        {(
          [
            ["banners", "Banners"],
            ["faqs", "FAQs"],
            ["stories", "Success stories"],
            ["announcements", "Announcements"],
          ] as [ContentTab, string][]
        ).map(([key, label]) => (
          <button key={key} type="button" className={tab === key ? "on" : ""} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "banners" && (
        <div className="ad__two" style={{ alignItems: "start" }}>
          <section className="card tblwrap">
            <table className="tbl">
              <thead>
                <tr><th>Banner</th><th>Order</th><th>Schedule</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="muted empty">Loading…</td></tr>
                ) : banners.length === 0 ? (
                  <tr><td colSpan={5} className="muted empty">No banners yet.</td></tr>
                ) : (
                  banners.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          {b.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={b.imageUrl} alt={b.title} className="ad-thumb" />
                          )}
                          <div>
                            <b>{b.title}</b>
                            {b.subtitle && <><br /><small className="muted">{b.subtitle}</small></>}
                          </div>
                        </div>
                      </td>
                      <td>
                        {b.sortOrder}{" "}
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => moveBanner(b, -1)}>↑</button>{" "}
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => moveBanner(b, 1)}>↓</button>
                      </td>
                      <td className="muted">{fmtDate(b.startAt)} – {fmtDate(b.endAt)}</td>
                      <td><Badge v={b.active ? "active" : "hidden"} /></td>
                      <td className="acts">
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => toggleBanner(b)}>
                          {b.active ? "Disable" : "Enable"}
                        </button>
                        <button type="button" className="btn btn--danger btn--sm" onClick={() => removeBanner(b)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="card">
            <h2>New banner</h2>
            <form onSubmit={addBanner} style={{ display: "grid", gap: 10 }}>
              <label className="field"><span>Title</span><input className="ad-input" required value={bTitle} onChange={(e) => setBTitle(e.target.value)} /></label>
              <label className="field"><span>Subtitle</span><input className="ad-input" value={bSubtitle} onChange={(e) => setBSubtitle(e.target.value)} /></label>
              <label className="field"><span>Link URL</span><input className="ad-input" placeholder="/plans" value={bLink} onChange={(e) => setBLink(e.target.value)} /></label>
              <label className="field"><span>Image (JPG/PNG/WebP)</span><input type="file" accept="image/*" onChange={(e) => setBFile(e.target.files?.[0] || null)} /></label>
              <label className="field"><span>Sort order</span><input className="ad-input" type="number" value={bOrder} onChange={(e) => setBOrder(e.target.value)} /></label>
              <label className="field"><span>Start at (optional)</span><input className="ad-input" type="datetime-local" value={bStart} onChange={(e) => setBStart(e.target.value)} /></label>
              <label className="field"><span>End at (optional)</span><input className="ad-input" type="datetime-local" value={bEnd} onChange={(e) => setBEnd(e.target.value)} /></label>
              <button type="submit" className="btn btn--solid">Create banner</button>
            </form>
          </section>
        </div>
      )}

      {tab === "faqs" && (
        <div className="ad__two" style={{ alignItems: "start" }}>
          <section className="card tblwrap">
            <table className="tbl">
              <thead>
                <tr><th>Question</th><th>Category</th><th>Order</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="muted empty">Loading…</td></tr>
                ) : faqs.length === 0 ? (
                  <tr><td colSpan={5} className="muted empty">No FAQs yet.</td></tr>
                ) : (
                  faqs.map((f) => (
                    <tr key={f.id}>
                      <td><b>{f.question}</b><br /><small className="muted">{f.answer.slice(0, 100)}</small></td>
                      <td>{f.category}</td>
                      <td>
                        {f.sortOrder}{" "}
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => moveFaq(f, -1)}>↑</button>{" "}
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => moveFaq(f, 1)}>↓</button>
                      </td>
                      <td><Badge v={f.active ? "active" : "hidden"} /></td>
                      <td className="acts">
                        <button type="button" className="btn btn--outline btn--sm" onClick={() => toggleFaq(f)}>
                          {f.active ? "Disable" : "Enable"}
                        </button>
                        <button type="button" className="btn btn--danger btn--sm" onClick={() => removeFaq(f)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="card">
            <h2>New FAQ</h2>
            <form onSubmit={addFaq} style={{ display: "grid", gap: 10 }}>
              <label className="field"><span>Question</span><input className="ad-input" required value={fQuestion} onChange={(e) => setFQuestion(e.target.value)} /></label>
              <label className="field"><span>Answer</span><textarea className="ad-textarea" required value={fAnswer} onChange={(e) => setFAnswer(e.target.value)} /></label>
              <label className="field"><span>Category</span><input className="ad-input" value={fCategory} onChange={(e) => setFCategory(e.target.value)} /></label>
              <label className="field"><span>Sort order</span><input className="ad-input" type="number" value={fOrder} onChange={(e) => setFOrder(e.target.value)} /></label>
              <button type="submit" className="btn btn--solid">Add FAQ</button>
            </form>
          </section>
        </div>
      )}

      {tab === "stories" && (
        <div className="ad__two" style={{ alignItems: "start" }}>
          <section className="card tblwrap">
            <table className="tbl">
              <thead>
                <tr><th>Couple</th><th>Wedding date</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="muted empty">Loading…</td></tr>
                ) : stories.length === 0 ? (
                  <tr><td colSpan={4} className="muted empty">No success stories yet.</td></tr>
                ) : (
                  stories.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          {s.photoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.photoUrl} alt={s.coupleNames} className="ad-thumb" />
                          )}
                          <div>
                            <b>{s.coupleNames}</b>
                            <br />
                            <small className="muted">{s.story.slice(0, 90)}</small>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{fmtDate(s.weddingDate)}</td>
                      <td><Badge v={s.status} /></td>
                      <td className="acts">
                        {s.status !== "published" && (
                          <button type="button" className="btn btn--solid btn--sm" onClick={() => setStoryStatus(s, "published")}>Publish</button>
                        )}
                        {s.status === "published" && (
                          <button type="button" className="btn btn--outline btn--sm" onClick={() => setStoryStatus(s, "hidden")}>Hide</button>
                        )}
                        <button type="button" className="btn btn--danger btn--sm" onClick={() => removeStory(s)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="card">
            <h2>New success story</h2>
            <form onSubmit={addStory} style={{ display: "grid", gap: 10 }}>
              <label className="field"><span>Couple names</span><input className="ad-input" required placeholder="Arjun & Meera" value={sCouple} onChange={(e) => setSCouple(e.target.value)} /></label>
              <label className="field"><span>Story</span><textarea className="ad-textarea" required value={sStory} onChange={(e) => setSStory(e.target.value)} /></label>
              <label className="field"><span>Wedding date</span><input className="ad-input" type="date" value={sDate} onChange={(e) => setSDate(e.target.value)} /></label>
              <label className="field">
                <span>Status</span>
                <select className="ad-select" value={sStatus} onChange={(e) => setSStatus(e.target.value as ContentStory["status"])}>
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                  <option value="hidden">Hidden</option>
                </select>
              </label>
              <label className="field"><span>Photo</span><input type="file" accept="image/*" onChange={(e) => setSFile(e.target.files?.[0] || null)} /></label>
              <button type="submit" className="btn btn--solid">Create story</button>
            </form>
          </section>
        </div>
      )}

      {tab === "announcements" && (
        <div className="ad__two" style={{ alignItems: "start" }}>
          <section className="card tblwrap">
            <table className="tbl">
              <thead>
                <tr><th>Announcement</th><th>Audience</th><th>Sent</th><th></th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="muted empty">Loading…</td></tr>
                ) : announcements.length === 0 ? (
                  <tr><td colSpan={4} className="muted empty">No announcements sent yet.</td></tr>
                ) : (
                  announcements.map((a) => (
                    <tr key={a.id}>
                      <td><b>{a.title}</b><br /><small className="muted">{a.message.slice(0, 120)}</small></td>
                      <td><span className="bdg bdg--muted">{a.audience} ({a.recipientCount})</span></td>
                      <td className="muted">{fmtDate(a.sentAt)}</td>
                      <td className="acts">
                        <button type="button" className="btn btn--danger btn--sm" onClick={() => removeAnnouncement(a)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="card">
            <h2>Send announcement</h2>
            <p className="muted" style={{ marginBottom: 12 }}>
              Sends an in-app notification to all approved members in the selected audience.
            </p>
            <form onSubmit={sendAnnouncement} style={{ display: "grid", gap: 10 }}>
              <label className="field"><span>Title</span><input className="ad-input" required value={aTitle} onChange={(e) => setATitle(e.target.value)} /></label>
              <label className="field"><span>Message</span><textarea className="ad-textarea" required value={aMessage} onChange={(e) => setAMessage(e.target.value)} /></label>
              <label className="field">
                <span>Audience</span>
                <select className="ad-select" value={aAudience} onChange={(e) => setAAudience(e.target.value as "all" | "free" | "premium")}>
                  <option value="all">All approved members</option>
                  <option value="free">Free members only</option>
                  <option value="premium">Premium members only</option>
                </select>
              </label>
              <button type="submit" className="btn btn--solid">Send announcement</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
