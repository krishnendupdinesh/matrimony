"use client";
// components/LegalPage.tsx — shared layout for privacy, terms and refund policy
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageShell from "./PageShell";

export type LegalSection = { h: string; p: string[] };
type Props = { title: string; updated: string; intro: string; sections: LegalSection[] };

function LegalBody({ title, updated, intro, sections }: Props) {
  return (
    <>
      <h1 className="pg__h">{title}</h1>
      <p className="muted">Last updated {updated}</p>
      <p className="legal__intro">{intro}</p>
      <nav className="card legal__toc" aria-label="On this page"><b>On this page</b>
        <ol>{sections.map((s, i) => <li key={s.h}><a href={`#s${i + 1}`} className="link">{s.h}</a></li>)}</ol></nav>
      {sections.map((s, i) => (
        <section key={s.h} id={`s${i + 1}`} className="legal__sec"><h2>{i + 1}. {s.h}</h2>{s.p.map((t) => <p key={t}>{t}</p>)}</section>
      ))}
    </>
  );
}

function LegalInner(props: Props) {
  const inApp = useSearchParams().get("in") === "app";
  return (
    <PageShell bare={!inApp} narrow>
      <LegalBody {...props} />
    </PageShell>
  );
}

export default function LegalPage(props: Props) {
  return (
    <Suspense fallback={<PageShell bare narrow><LegalBody {...props} /></PageShell>}>
      <LegalInner {...props} />
    </Suspense>
  );
}