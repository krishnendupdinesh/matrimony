"use client";
// app/admin/coupons/page.tsx — manage discount coupons with role-based discount and validity limits.
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminApiFetch } from "@/lib/api";
import type { AdminCoupon, CouponLimits } from "@/lib/types";
import { useAdmin } from "../AdminContext";
import { Badge } from "../ui";

function fmtDate(iso?: string | null) {
  if (!iso) return "No expiry";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminCouponsPage() {
  const { hasPermission } = useAdmin();
  const canManage = hasPermission("coupons.manage");

  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [limits, setLimits] = useState<CouponLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Create form
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState("10");
  const [maxUses, setMaxUses] = useState("50");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCoupons = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    try {
      const data = await adminApiFetch<{ coupons: AdminCoupon[]; limits: CouponLimits | null }>(
        "/api/admin/coupons",
      );
      setCoupons(data.coupons);
      setLimits(data.limits);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not load coupons.");
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      await adminApiFetch("/api/admin/coupons", {
        method: "POST",
        body: {
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          maxUses: maxUses.trim() ? Number(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          active: true,
        },
      });
      setCode("");
      setMsg("Coupon created.");
      await loadCoupons();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not create coupon.");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (c: AdminCoupon) => {
    setErr("");
    setMsg("");
    try {
      await adminApiFetch(`/api/admin/coupons/${c.id}`, {
        method: "PATCH",
        body: { active: !c.active },
      });
      setMsg(`Coupon ${c.code} ${c.active ? "disabled" : "enabled"}.`);
      await loadCoupons();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not update coupon.");
    }
  };

  if (!canManage) {
    return <p className="err">You do not have permission to manage coupons.</p>;
  }

  return (
    <>
      <h1 className="ad__h">Coupons</h1>
      {limits && (
        <div className="ad-note">
          Staff limits: max {limits.maxPercentDiscount}% off or ₹{limits.maxFlatDiscountInr} flat, expiry date required (max {limits.maxValidityDays} days), usage limit required. Higher discounts require a super admin.
        </div>
      )}
      {msg && <p className="ok" role="status">{msg}</p>}
      {err && <p className="err" role="alert">{err}</p>}

      <div className="ad__two" style={{ alignItems: "start" }}>
        <section className="card tblwrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="muted empty">Loading coupons…</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={6} className="muted empty">No coupons created yet.</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id}>
                    <td><b>{c.code}</b></td>
                    <td>{c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                    <td>{c.usedCount} / {c.maxUses ?? "∞"}</td>
                    <td className="muted">{fmtDate(c.expiresAt)}</td>
                    <td><Badge v={c.active ? "active" : "hidden"} /></td>
                    <td className="acts">
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => toggleActive(c)}>
                        {c.active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>Create coupon</h2>
          <form onSubmit={handleCreate} style={{ display: "grid", gap: 10 }}>
            <label className="field">
              <span>Code</span>
              <input className="ad-input" required placeholder="WELCOME15" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            </label>
            <label className="field">
              <span>Discount type</span>
              <select className="ad-select" value={discountType} onChange={(e) => setDiscountType(e.target.value as "percent" | "flat")}>
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </label>
            <label className="field">
              <span>Discount value</span>
              <input className="ad-input" type="number" min={1} required value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
            </label>
            <label className="field">
              <span>Usage limit {limits ? "(required)" : "(blank = unlimited)"}</span>
              <input className="ad-input" type="number" min={1} required={Boolean(limits)} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            </label>
            <label className="field">
              <span>Expiry date {limits ? "(required)" : "(optional)"}</span>
              <input className="ad-input" type="date" required={Boolean(limits)} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </label>
            <button type="submit" className="btn btn--solid" disabled={busy}>
              {busy ? "Creating…" : "Create coupon"}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
