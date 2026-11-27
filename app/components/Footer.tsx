import Link from "next/link";

const BRAND = "Sammatham"; // keep this the same everywhere
const COPYRIGHT_YEAR = 2026; // fixed value: new Date() is not allowed during prerender with cacheComponents

const footerColumns = [
  {
    heading: "Find a match",
    links: [
      { label: "Brides", href: "/register" },
      { label: "Grooms", href: "/register" },
      { label: "By community", href: "/#browse" },
      { label: "Living abroad", href: "/#browse" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Safety tips", href: "/privacy" },
      { label: "Refund policy", href: "/refund-policy" },
      { label: "Sign in", href: "/login" },
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

export default function Footer() {
  const container = "mx-auto w-full max-w-[1400px] px-4 sm:px-6";

  return (
    <footer id="help" className="border-t border-white/15 bg-[var(--wine-deep)] py-14">
      <div className={`${container} grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]`}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white.png" alt={BRAND} className="h-16 w-auto" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            Verified profiles and real people to help, for Kerala families at home and abroad.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.heading}>
            <h4 className="font-display text-lg">{column.heading}</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className={`${container} mt-12 text-xs text-white/50`}>
        © {COPYRIGHT_YEAR} {BRAND}. All rights reserved.
      </p>
    </footer>
  );
}
