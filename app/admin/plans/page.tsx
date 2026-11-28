"use client";
// app/admin/plans/page.tsx — manage subscription plan prices, durations, features, and visibility (plans.manage).
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminApiFetch } from "@/lib/api";
import type { Plan } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

type PlanDraft = {
  name: string;
  blurb: string;
  priceInr: string;
  months: string;
  periodLabel: string;
  contactsLimit: string;
  ctaLabel: string;
  popular: boolean;
  active: boolean;
  sortOrder: string;
  featuresText: string;
};

function toDraft(p: Plan): PlanDraft {
  return {
    name: p.name,
    blurb: p.blurb || "",
    priceInr: String(p.priceInr),
    months: String(p.months),
    periodLabel: p.periodLabel || (p.months ? `${p.months} months` : "Always free"),
    contactsLimit: String(p.contactsLimit),
    ctaLabel: p.ctaLabel || "",
    popular: Boolean(p.popular),
    active: p.active !== false,
    sortOrder: String(p.sortOrder ?? 0),
    featuresText: (p.features || []).join("\n"),
  };
}

export default function AdminPlansPage() {
  const { hasPermission } = useAdmin();
  const canManage = hasPermission("plans.manage");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [drafts, setDrafts] = useState<Record<string, PlanDraft>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // New plan form
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newBlurb, setNewBlurb] = useState("");
  const [newPrice, setNewPrice] = useState("1999");
  const [newMonths, setNewMonths] = useState("1");
  const [newPeriod, setNewPeriod] = useState("1 month");
  const [newContacts, setNewContacts] = useState("20");
  const [newFeatures, setNewFeatures] = useState("View 20 contact numbers\nUnlimited interests and chat");
  const [creating, setCreating] = useState(false);

  const loadPlans = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    setErr("");
    try {
      const data = await adminApiFetch<{ plans: Plan[] }>("/api/admin/plans");
      setPlans(data.plans);
      const nextDrafts: Record<string, PlanDraft> = {};
      data.plans.forEach((p) => {
        nextDrafts[p.id] = toDraft(p);
      });
      setDrafts(nextDrafts);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load plans.");
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const setField = <K extends keyof PlanDraft>(id: string, key: K, value: PlanDraft[K]) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }));
  };

  const savePlan = async (planId: string) => {
    const d = drafts[planId];
    if (!d) return;
    const features = d.featuresText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (features.length === 0) {
      setErr("Each plan must have at least one feature.");
      return;
    }

    setSavingId(planId);
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/plans/${planId}`, {
        method: "PATCH",
        body: {
          name: d.name.trim(),
          blurb: d.blurb.trim(),
          priceInr: Number(d.priceInr) || 0,
          months: Number(d.months) || 0,
          periodLabel: d.periodLabel.trim(),
          contactsLimit: Number(d.contactsLimit) || 0,
          ctaLabel: d.ctaLabel.trim(),
          popular: d.popular,
          active: d.active,
          sortOrder: Number(d.sortOrder) || 0,
          features,
        },
      });
      setMsg(`Saved '${d.name}' plan — changes are now live on /plans.`);
      await loadPlans();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save plan.");
    } finally {
      setSavingId(null);
    }
  };

  const createPlan = async (e: FormEvent) => {
    e.preventDefault();
    const features = newFeatures
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (features.length === 0) {
      setErr("Add at least one feature line.");
      return;
    }

    setCreating(true);
    setErr("");
    setMsg("");
    try {
      await adminApiFetch("/api/admin/plans", {
        method: "POST",
        body: {
          id: newId.trim().toLowerCase(),
          name: newName.trim(),
          blurb: newBlurb.trim(),
          priceInr: Number(newPrice) || 0,
          months: Number(newMonths) || 0,
          periodLabel: newPeriod.trim(),
          contactsLimit: Number(newContacts) || 0,
          ctaLabel: `Choose ${newName.trim()}`,
          features,
        },
      });
      setNewId("");
      setNewName("");
      setNewBlurb("");
      setMsg("New plan created and live on /plans.");
      await loadPlans();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not create plan.");
    } finally {
      setCreating(false);
    }
  };

  const deletePlan = async (p: Plan) => {
    if (!window.confirm(`Delete plan '${p.name}'?`)) return;
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/plans/${p.id}`, { method: "DELETE" });
      setMsg(`Deleted plan '${p.name}'.`);
      await loadPlans();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not delete plan.");
    }
  };

  if (!canManage) {
    return <p className="err">You do not have permission to manage plans.</p>;
  }

  return (
    <>
      <h1 className="ad__h">Subscription plans</h1>
      <p className="muted" style={{ marginBottom: 14 }}>
        Edit plan prices, durations, contact limits, and features here. Saved updates immediately reflect on the member <code>/plans</code> page and checkout.
      </p>

      {msg && <p className="ok" role="status">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}

      {loading ? (
        <div className="card empty muted">Loading plans…</div>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", marginBottom: 24 }}>
          {plans.map((p) => {
            const d = drafts[p.id];
            if (!d) return null;
            return (
              <section key={p.id} className="card" style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{p.name}</h2>
                    <small className="muted">ID: <code>{p.id}</code></small>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {d.popular && <span className="bdg bdg--warn">Most popular</span>}
                    <Badge v={d.active ? "active" : "hidden"} />
                  </div>
                </div>

                <label className="field">
                  <span>Plan name</span>
                  <input className="ad-input" value={d.name} onChange={(e) => setField(p.id, "name", e.target.value)} />
                </label>

                <label className="field">
                  <span>Subtitle / description</span>
                  <input className="ad-input" value={d.blurb} onChange={(e) => setField(p.id, "blurb", e.target.value)} />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label className="field">
                    <span>Price (₹)</span>
                    <input
                      className="ad-input"
                      type="number"
                      min={0}
                      value={d.priceInr}
                      onChange={(e) => setField(p.id, "priceInr", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Duration (months)</span>
                    <input
                      className="ad-input"
                      type="number"
                      min={0}
                      value={d.months}
                      onChange={(e) => setField(p.id, "months", e.target.value)}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <label className="field">
                    <span>Period label</span>
                    <input className="ad-input" value={d.periodLabel} onChange={(e) => setField(p.id, "periodLabel", e.target.value)} />
                  </label>
                  <label className="field">
                    <span>Contact views limit</span>
                    <input
                      className="ad-input"
                      type="number"
                      min={0}
                      value={d.contactsLimit}
                      onChange={(e) => setField(p.id, "contactsLimit", e.target.value)}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 8 }}>
                  <label className="field">
                    <span>Button label</span>
                    <input className="ad-input" value={d.ctaLabel} onChange={(e) => setField(p.id, "ctaLabel", e.target.value)} />
                  </label>
                  <label className="field">
                    <span>Order</span>
                    <input
                      className="ad-input"
                      type="number"
                      value={d.sortOrder}
                      onChange={(e) => setField(p.id, "sortOrder", e.target.value)}
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Features (one per line)</span>
                  <textarea
                    className="ad-textarea"
                    rows={5}
                    value={d.featuresText}
                    onChange={(e) => setField(p.id, "featuresText", e.target.value)}
                  />
                </label>

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <label className="ad-switch" style={{ fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={d.popular}
                      onChange={(e) => setField(p.id, "popular", e.target.checked)}
                    />
                    <span>Most popular badge</span>
                  </label>
                  <label className="ad-switch" style={{ fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={d.active}
                      onChange={(e) => setField(p.id, "active", e.target.checked)}
                    />
                    <span>Visible to users</span>
                  </label>
                </div>

                <div className="acts" style={{ justifyContent: "space-between", marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn--solid btn--sm"
                    disabled={savingId === p.id}
                    onClick={() => savePlan(p.id)}
                  >
                    {savingId === p.id ? "Saving…" : "Save plan"}
                  </button>
                  {p.id !== "free" && (
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => deletePlan(p)}>
                      Delete
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Create new plan */}
      <section className="card" style={{ maxWidth: 640 }}>
        <h2>Add a new plan</h2>
        <form onSubmit={createPlan} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label className="field">
              <span>Plan ID (lowercase slug)</span>
              <input className="ad-input" required placeholder="e.g. silver" value={newId} onChange={(e) => setNewId(e.target.value.toLowerCase())} />
            </label>
            <label className="field">
              <span>Plan name</span>
              <input className="ad-input" required placeholder="e.g. Silver" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Subtitle / description</span>
            <input className="ad-input" placeholder="Short description" value={newBlurb} onChange={(e) => setNewBlurb(e.target.value)} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            <label className="field">
              <span>Price (₹)</span>
              <input className="ad-input" type="number" min={0} required value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            </label>
            <label className="field">
              <span>Months</span>
              <input className="ad-input" type="number" min={0} required value={newMonths} onChange={(e) => setNewMonths(e.target.value)} />
            </label>
            <label className="field">
              <span>Period label</span>
              <input className="ad-input" value={newPeriod} onChange={(e) => setNewPeriod(e.target.value)} />
            </label>
            <label className="field">
              <span>Contacts</span>
              <input className="ad-input" type="number" min={0} value={newContacts} onChange={(e) => setNewContacts(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Features (one per line)</span>
            <textarea className="ad-textarea" rows={3} required value={newFeatures} onChange={(e) => setNewFeatures(e.target.value)} />
          </label>
          <div>
            <button type="submit" className="btn btn--solid" disabled={creating}>
              {creating ? "Creating…" : "Create plan"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
