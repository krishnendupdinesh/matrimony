"use client";
// app/plans/page.jsx — live subscription plans managed from /admin/plans (GET /api/plans).
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css";
import "./plans.css";

const FALLBACK_PLANS = [
  {
    id: "free",
    name: "Free",
    priceInr: 0,
    months: 0,
    periodLabel: "Always free",
    blurb: "Create a profile and start browsing.",
    contactsLimit: 0,
    features: ["Create and edit your profile", "Browse matches", "Send limited interests", "Receive interests"],
    ctaLabel: "Current plan",
    popular: false,
  },
  {
    id: "gold",
    name: "Gold",
    priceInr: 2999,
    months: 3,
    periodLabel: "3 months",
    blurb: "Everything you need to get started.",
    contactsLimit: 40,
    features: ["View 40 contact numbers", "Send unlimited interests", "Chat with accepted matches", "See who viewed your profile"],
    ctaLabel: "Choose Gold",
    popular: false,
  },
  {
    id: "diamond",
    name: "Diamond",
    priceInr: 4999,
    months: 6,
    periodLabel: "6 months",
    blurb: "Our most chosen plan.",
    contactsLimit: 100,
    popular: true,
    features: ["View 100 contact numbers", "Unlimited interests and chat", "Horoscope matching (porutham)", "Profile highlighted in search", "Priority support"],
    ctaLabel: "Choose Diamond",
  },
  {
    id: "platinum",
    name: "Platinum",
    priceInr: 7999,
    months: 12,
    periodLabel: "12 months",
    blurb: "Best value for a longer search.",
    contactsLimit: 250,
    features: ["View 250 contact numbers", "Everything in Diamond", "Dedicated relationship manager", "Verified badge fast-track", "Profile boost every month"],
    ctaLabel: "Choose Platinum",
    popular: false,
  },
];

const FALLBACK_FAQ = [
  ["How does a plan renew?", "Plans do not renew on their own. You pay once for the period you choose, and we remind you before it ends."],
  ["Which payment methods can I use?", "UPI, debit and credit cards, and net banking."],
  ["Can I get a refund?", "If you have not used any contact views, you can request a refund within 7 days of buying. See our refund policy for details."],
  ["Can I upgrade later?", "Yes. Upgrade to a higher plan any time and we adjust the price for the days you have left."],
];

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const Cell = ({ v }) =>
  v === true ? (
    <span className="tick" aria-label="Included">✓</span>
  ) : v === false ? (
    <span className="dash-x" aria-label="Not included">–</span>
  ) : (
    v
  );

export default function PlansPage() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [faqs, setFaqs] = useState(FALLBACK_FAQ);

  useEffect(() => {
    let active = true;
    apiFetch("/api/plans")
      .then((data) => {
        if (active && Array.isArray(data.plans) && data.plans.length > 0) {
          setPlans(data.plans);
        }
      })
      .catch(() => {});

    apiFetch("/api/content/faqs")
      .then((data) => {
        if (active && Array.isArray(data.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs.map((f) => [f.question, f.answer]));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const compareRows = [
    ["Price", ...plans.map((p) => (p.priceInr ? inr(p.priceInr) : "₹0"))],
    ["Duration", ...plans.map((p) => p.periodLabel || (p.months ? `${p.months} months` : "Always free"))],
    ["View contact numbers", ...plans.map((p) => String(p.contactsLimit || 0))],
    ["Chat with matches", ...plans.map((p) => p.priceInr > 0)],
    ["See who viewed you", ...plans.map((p) => p.priceInr > 0)],
  ];

  return (
    <div className="dash-page">
      <Navbar />
      <main className="plans">
        <header className="plans__head">
          <h1>Choose a plan to connect with your matches</h1>
          <p className="muted">Free members can browse. Paid plans let you chat, view contact details and get seen first.</p>
        </header>

        <section className="plan-grid">
          {plans.map((p) => (
            <article key={p.id} className={`card plan ${p.popular ? "plan--pop" : ""}`}>
              {p.popular && <span className="plan__flag">Most popular</span>}
              <h2>{p.name}</h2>
              <p className="muted">{p.blurb || ""}</p>
              <div className="plan__price">
                <b>{p.priceInr ? inr(p.priceInr) : "₹0"}</b>
                <span>{p.periodLabel || (p.months ? `${p.months} months` : "Always free")}</span>
              </div>
              {p.priceInr === 0 ? (
                <button type="button" className="btn btn--outline btn--block" disabled>
                  {p.ctaLabel || "Current plan"}
                </button>
              ) : (
                <Link
                  href={`/checkout?plan=${p.id}`}
                  className={`btn btn--block ${p.popular ? "btn--solid" : "btn--outline"}`}
                >
                  {p.ctaLabel || `Choose ${p.name}`}
                </Link>
              )}
              <ul>
                {(p.features || []).map((f) => (
                  <li key={f}>
                    <span className="tick">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="trust">
          <span>Secure payments</span>
          <span>Verified profiles</span>
          <span>7-day refund on unused plans</span>
          <span>Support in English and Malayalam</span>
        </section>

        <section>
          <h2 className="plans__h2">Compare plans</h2>
          <div className="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th></th>
                  {plans.map((p) => (
                    <th key={p.id}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map(([label, ...vals]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {vals.map((v, i) => (
                      <td key={i}>
                        <Cell v={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="faq">
          <h2 className="plans__h2">Questions about plans</h2>
          {faqs.map(([q, a]) => (
            <details key={q} className="card">
              <summary>{q}</summary>
              <p className="muted">{a}</p>
            </details>
          ))}
          <p className="muted">
            Still unsure? <Link href="/help" className="link">Talk to our support team</Link>
          </p>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
