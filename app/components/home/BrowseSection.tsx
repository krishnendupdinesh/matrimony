import Link from "next/link";

const container = "mx-auto w-full max-w-[1400px] px-4 sm:px-6";

const browseRows = [
  {
    heading: "Hindu",
    items: ["Nair", "Ezhava", "Brahmin", "Viswakarma", "Other Hindu"],
    searchKey: "community",
  },
  {
    heading: "Christian",
    items: [
      "Syrian Catholic",
      "Latin Catholic",
      "Jacobite",
      "Marthoma",
      "Pentecostal",
    ],
    searchKey: "community",
  },
  {
    heading: "Muslim",
    items: ["Sunni", "Mappila", "Other Muslim"],
    searchKey: "community",
  },
  {
    heading: "By district",
    items: [
      "Thiruvananthapuram",
      "Kollam",
      "Pathanamthitta",
      "Alappuzha",
      "Kottayam",
      "Idukki",
      "Ernakulam",
      "Thrissur",
      "Palakkad",
      "Malappuram",
      "Kozhikode",
      "Wayanad",
      "Kannur",
      "Kasaragod",
    ],
    searchKey: "district",
  },
  {
    heading: "Living abroad",
    items: [
      "Gulf countries",
      "United Kingdom",
      "USA and Canada",
      "Australia and New Zealand",
      "Europe",
    ],
    searchKey: "abroad",
  },
];

// Turns "Syrian Catholic" into /search?community=Syrian%20Catholic
function searchLink(key: string, value: string) {
  return `/search?${key}=${encodeURIComponent(value)}`;
}

export default function BrowseSection() {
  return (
    <section id="browse" className="bg-[var(--ivory)] py-24 text-[var(--wine-deep)]">
      <div className={container}>
        <h2 className="font-display mb-12 text-4xl sm:text-5xl">Browse profiles</h2>

        {browseRows.map((row) => (
          <div
            key={row.heading}
            className="grid gap-5 border-t border-black/15 py-8 md:grid-cols-[1fr_2.2fr]"
          >
            <h3 className="font-display text-3xl">{row.heading}</h3>

            <div className="flex flex-wrap gap-3">
              {row.items.map((item) => (
                <Link
                  key={item}
                  href={searchLink(row.searchKey, item)}
                  className="rounded-full border border-black/20 px-4 py-2 text-sm transition-colors hover:bg-[var(--wine)] hover:text-[var(--ivory)]"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
