"use client";
// app/checkout/page.tsx  — reached from /plans via /checkout?plan=gold|diamond|platinum
import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css"; // shared theme
import "./checkout.css";

// Keep in sync with the plans page and your server. The server must recompute the price: never trust the browser.
const PLANS: Record<string, { name: string; price: number; months: number; features: string[] }> = {
  gold: { name: "Gold", price: 2999, months: 3, features: ["View 40 contact numbers", "Unlimited interests", "Chat with accepted matches", "See who viewed you"] },
  diamond: { name: "Diamond", price: 4999, months: 6, features: ["View 100 contact numbers", "Unlimited interests and chat", "Horoscope matching", "Highlighted in search", "Priority support"] },
  platinum: { name: "Platinum", price: 7999, months: 12, features: ["View 250 contact numbers", "Everything in Diamond", "Dedicated relationship manager", "Verified badge fast-track", "Monthly profile boost"] },
};
const COUPONS: Record<string, number> = { WELCOME10: 10 }; // percent off. TODO: validate on the server
const GST = 0.18;                                           // confirm the rate with your accountant
const METHODS = [
  { id: "upi", label: "UPI", hint: "Google Pay, PhonePe, Paytm or any UPI app" },
  { id: "card", label: "Debit or credit card", hint: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net banking", hint: "All major Indian banks" },
];

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const addMonths = (m: number) => { const d = new Date(); d.setMonth(d.getMonth() + m); return d; };

type Phase = "form" | "processing" | "success" | "failed";

function Checkout() {
  const planId = useSearchParams().get("plan") ?? "";
  const plan = PLANS[planId];

  const [name, setName] = useState("Krishnendu");       // TODO: prefill from the member's profile
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("upi");
  const [code, setCode] = useState("");
  const [off, setOff] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [orderId, setOrderId] = useState("");

  if (!plan) {
    return (<main className="co"><div className="card co__box"><h1>Choose a plan first</h1>
      <p className="muted">We could not find that plan.</p><Link href="/plans" className="btn btn--solid">View plans</Link></div></main>);
  }

  const discount = Math.round((plan.price * off) / 100);
  const taxable = plan.price - discount;
  const gst = taxable * GST;
  const total = taxable + gst;
  const validTill = addMonths(plan.months);

  const applyCoupon = () => {
    const pct = COUPONS[code.trim().toUpperCase()];
    if (pct) { setOff(pct); setCouponMsg(`${pct}% discount applied`); } else { setOff(0); setCouponMsg("This code is not valid"); }
  };

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please enter your full name.");
    if (!/^[6-9]\d{9}$/.test(mobile)) return setError("Enter a valid 10-digit mobile number.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (!agree) return setError("Please accept the terms to continue.");

    setPhase("processing");
    // TODO (real payments, e.g. Razorpay):
    // 1. POST /api/orders { plan: planId, coupon: code }  -> server returns { orderId, amount }
    // 2. Open the gateway's hosted checkout with that orderId. Card, UPI and bank details are entered
    //    in the gateway's window, never in your own inputs.
    // 3. On success, POST /api/payments/verify { orderId, paymentId, signature }. Activate the plan only after the server confirms.
    await new Promise((r) => setTimeout(r, 1500)); // demo only: simulates the gateway
    setOrderId("SM-" + Date.now().toString().slice(-8));
    setPhase("success");
  };

  if (phase === "success") {
    return (
      <main className="co">
        <div className="card co__box co__done">
          <div className="co__tick" aria-hidden="true">✓</div>
          <h1>Payment successful</h1>
          <p className="muted">Your {plan.name} plan is now active. A receipt has been sent to {email}.</p>
          <dl className="co__receipt">
            <div><dt>Order ID</dt><dd>{orderId}</dd></div>
            <div><dt>Plan</dt><dd>{plan.name} · {plan.months} months</dd></div>
            <div><dt>Amount paid</dt><dd>{inr(total)}</dd></div>
            <div><dt>Valid till</dt><dd>{fmt(validTill)}</dd></div>
          </dl>
          <div className="co__btns">
            <Link href="/matches" className="btn btn--solid">See your matches</Link>
            <Link href="/dashboard" className="btn btn--outline">Go to dashboard</Link>
          </div>
          <Link href="/invoices" className="link">Download invoice</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="co">
      <div className="co__top">
        <Link href="/plans" className="link">← Change plan</Link>
        <h1>Checkout</h1>
        <ol className="steps" aria-label="Progress"><li className="done">Choose plan</li><li className="now" aria-current="step">Payment</li><li>Done</li></ol>
      </div>

      <form className="co__layout" onSubmit={pay} noValidate>
        <div className="co__left">
          {phase === "failed" && (
            <div className="card co__fail" role="alert"><b>Payment did not go through.</b> You have not been charged. Try again or pick another payment method.</div>
          )}

          <section className="card co__sec">
            <h2>Your details</h2>
            <div className="co__grid">
              <label className="field"><span>Full name</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
              <label className="field"><span>Mobile number</span><input inputMode="numeric" maxLength={10} placeholder="10-digit number" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} autoComplete="tel-national" /></label>
              <label className="field field--wide"><span>Email for receipt</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            </div>
          </section>

          <section className="card co__sec">
            <h2>Payment method</h2>
            <div className="methods" role="radiogroup" aria-label="Payment method">
              {METHODS.map((m) => (
                <label key={m.id} className={`method ${method === m.id ? "on" : ""}`}>
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <span><b>{m.label}</b><small>{m.hint}</small></span>
                </label>
              ))}
            </div>
            <p className="note">You will enter your {method === "upi" ? "UPI ID or scan a QR code" : method === "card" ? "card details" : "bank login"} in our secure payment window. We never see or store them.</p>
          </section>

          <section className="card co__sec">
            <label className="check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I agree to the <Link href="/terms" className="link">Terms</Link> and <Link href="/refund-policy" className="link">Refund policy</Link>. The plan does not renew automatically.</span></label>
          </section>
        </div>

        <aside className="co__right">
          <div className="card co__sum">
            <h2>Order summary</h2>
            <div className="co__plan">
              <div><b>{plan.name} plan</b><p className="muted">{plan.months} months · valid till {fmt(validTill)}</p></div>
              <b>{inr(plan.price)}</b>
            </div>
            <ul className="co__feat">{plan.features.map((f) => <li key={f}><span aria-hidden="true">✓</span>{f}</li>)}</ul>

            <div className="coupon">
              <input placeholder="Coupon code" aria-label="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
              <button type="button" className="btn btn--outline" onClick={applyCoupon} disabled={!code.trim()}>Apply</button>
            </div>
            {couponMsg && <p className={`coupon__msg ${off ? "ok" : "err"}`} role="status">{couponMsg}</p>}

            <dl className="co__math">
              <div><dt>Plan price</dt><dd>{inr(plan.price)}</dd></div>
              {discount > 0 && <div className="ok"><dt>Discount</dt><dd>− {inr(discount)}</dd></div>}
              <div><dt>GST (18%)</dt><dd>{inr(gst)}</dd></div>
              <div className="co__total"><dt>Total</dt><dd>{inr(total)}</dd></div>
            </dl>

            {error && <p className="err" role="alert">{error}</p>}
            <button className="btn btn--solid btn--block co__pay" disabled={phase === "processing"}>
              {phase === "processing" ? "Processing payment…" : phase === "failed" ? `Try again · ${inr(total)}` : `Pay ${inr(total)}`}
            </button>
            <ul className="co__trust"><li>Secure, encrypted payment</li><li>7-day refund if unused</li><li>Support: help@sammatham.com</li></ul>
          </div>
        </aside>
      </form>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="dash-page">
      <Navbar name="Krishnendu" />
      <Suspense fallback={<main className="co"><p className="muted">Loading…</p></main>}><Checkout /></Suspense>
      <AppFooter />
    </div>
  );
}