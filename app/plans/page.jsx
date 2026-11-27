// app/plans/page.jsx  (Next.js App Router)
import Link from "next/link";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css"; // shared theme: colors, buttons, navbar
import "./plans.css";

// Prices are placeholders: set your own and keep them in sync with your payment gateway.
const PLANS = [
  { id: "free", name: "Free", price: 0, period: "Always free", blurb: "Create a profile and start browsing.",
    features: ["Create and edit your profile", "Browse matches", "Send limited interests", "Receive interests"], cta: "Current plan" },
  { id: "gold", name: "Gold", price: 2999, period: "3 months", blurb: "Everything you need to get started.",
    features: ["View 40 contact numbers", "Send unlimited interests", "Chat with accepted matches", "See who viewed your profile"], cta: "Choose Gold" },
  { id: "diamond", name: "Diamond", price: 4999, period: "6 months", blurb: "Our most chosen plan.", popular: true,
    features: ["View 100 contact numbers", "Unlimited interests and chat", "Horoscope matching (porutham)", "Profile highlighted in search", "Priority support"], cta: "Choose Diamond" },
  { id: "platinum", name: "Platinum", price: 7999, period: "12 months", blurb: "Best value for a longer search.",
    features: ["View 250 contact numbers", "Everything in Diamond", "Dedicated relationship manager", "Verified badge fast-track", "Profile boost every month"], cta: "Choose Platinum" },
];

const COMPARE = [
  ["Send interests", "Limited", "Unlimited", "Unlimited", "Unlimited"],
  ["Chat with matches", false, true, true, true],
  ["View contact numbers", "0", "40", "100", "250"],
  ["See who viewed you", false, true, true, true],
  ["Horoscope matching", false, false, true, true],
  ["Highlighted profile", false, false, true, true],
  ["Relationship manager", false, false, false, true],
];

const FAQ = [
  ["How does a plan renew?", "Plans do not renew on their own. You pay once for the period you choose, and we remind you before it ends."],
  ["Which payment methods can I use?", "UPI, debit and credit cards, and net banking."],
  ["Can I get a refund?", "If you have not used any contact views, you can request a refund within 7 days of buying. See our refund policy for details."],
  ["Can I upgrade later?", "Yes. Upgrade to a higher plan any time and we adjust the price for the days you have left."],
];

const inr = (n) => "₹" + n.toLocaleString("en-IN");
const Cell = ({ v }) => v === true ? <span className="tick" aria-label="Included">✓</span> : v === false ? <span className="dash-x" aria-label="Not included">–</span> : v;

export default function PlansPage() {
  return (
    <div className="dash-page">
      <Navbar name="Krishnendu" />
      <main className="plans">
        <header className="plans__head">
          <h1>Choose a plan to connect with your matches</h1>
          <p className="muted">Free members can browse. Paid plans let you chat, view contact details and get seen first.</p>
        </header>

        <section className="plan-grid">
          {PLANS.map((p) => (
            <article key={p.id} className={`card plan ${p.popular ? "plan--pop" : ""}`}>
              {p.popular && <span className="plan__flag">Most popular</span>}
              <h2>{p.name}</h2>
              <p className="muted">{p.blurb}</p>
              <div className="plan__price">
                <b>{p.price ? inr(p.price) : "₹0"}</b>
                <span>{p.period}</span>
              </div>
              {p.id === "free"
                ? <button className="btn btn--outline btn--block" disabled>{p.cta}</button>
                : <Link href={`/checkout?plan=${p.id}`} className={`btn btn--block ${p.popular ? "btn--solid" : "btn--outline"}`}>{p.cta}</Link>}
              <ul>
                {p.features.map((f) => <li key={f}><span className="tick">✓</span>{f}</li>)}
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
              <thead><tr><th></th>{PLANS.map((p) => <th key={p.id}>{p.name}</th>)}</tr></thead>
              <tbody>
                {COMPARE.map(([label, ...vals]) => (
                  <tr key={label}><th scope="row">{label}</th>{vals.map((v, i) => <td key={i}><Cell v={v} /></td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="faq">
          <h2 className="plans__h2">Questions about plans</h2>
          {FAQ.map(([q, a]) => (
            <details key={q} className="card"><summary>{q}</summary><p className="muted">{a}</p></details>
          ))}
          <p className="muted">Still unsure? <Link href="/help" className="link">Talk to our support team</Link></p>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}