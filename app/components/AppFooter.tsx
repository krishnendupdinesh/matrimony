import Link from "next/link";

const COLUMNS = [
  {
    heading: "Find a match",
    links: [
      { label: "Matches", href: "/matches" },
      { label: "Search profiles", href: "/search" },
      { label: "Interests", href: "/interests" },
      { label: "Shortlist", href: "/shortlist" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Safety tips", href: "/help" },
      { label: "Talk to an advisor", href: "/help" },
      { label: "Membership plans", href: "/plans" },
      { label: "Settings & privacy", href: "/settings" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/#how-it-works" },
      { label: "Success stories", href: "/#stories" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function AppFooter() {
  return (
    <footer className="sm-foot">
      <div className="sm-foot__inner">
        <div className="sm-foot__brand">
          <Link href="/dashboard" className="sm-foot__logo">Sammatham</Link>
          <p className="muted">
            Verified profiles and real people to help, for Kerala families at home and abroad.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading} className="sm-foot__col">
            <h4>{col.heading}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="sm-foot__copy">© 2026 Sammatham. All rights reserved.</p>
    </footer>
  );
}
