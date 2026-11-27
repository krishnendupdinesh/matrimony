// app/dashboard/page.jsx  (Next.js App Router)
import Link from "next/link";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css";

// TODO: replace with data from your API (http://localhost:5000)
const user = { name: "Krishnendu", id: "SM204518", strength: 70, plan: "Free member" };
const stats = [
  { n: 5, t: "Interests received", s: "2 waiting for reply" },
  { n: 3, t: "Interests accepted", s: "Start a conversation" },
  { n: 2, t: "Unread messages", s: "Open your inbox" },
  { n: 18, t: "Profile views", s: "In the last 7 days" },
];
const matches = [
  { name: "Divya K.", age: 26, job: "Chartered accountant", place: "Kochi", score: "8/10" },
  { name: "Anjali M.", age: 27, job: "Software engineer", place: "Thrissur", score: "9/10" },
  { name: "Fathima R.", age: 25, job: "Doctor", place: "Kozhikode", score: "7/10" },
];
const received = [
  { name: "Divya K.", meta: "Chartered accountant, 26 · today" },
  { name: "Meera S.", meta: "Teacher, 28 · yesterday" },
];

export default function Dashboard() {
  return (
    <div className="dash-page">
      <Navbar name={user.name} />
      <main className="dash">
        {/* Welcome + stats */}
        <section className="dash__top">
          <div className="card profile">
            <div className="profile__row">
              <div className="avatar-lg">{user.name[0]}</div>
              <div>
                <h2>{user.name}</h2>
                <p className="muted">ID: {user.id}</p>
              </div>
            </div>
            <div className="chips"><span className="chip chip--ok">Profile approved</span><span className="chip">{user.plan}</span></div>
            <div className="bar-label"><span>Profile strength</span><b>{user.strength}%</b></div>
            <div className="bar"><i style={{ width: `${user.strength}%` }} /></div>
            <Link href="/profile" className="btn btn--outline btn--block">Edit profile</Link>
            <Link href="/plans" className="btn btn--solid btn--block">Upgrade to Premium</Link>
          </div>

          <div>
            <p className="muted">Welcome back, {user.name}</p>
            <h1>Your activity at a glance</h1>
            <div className="stats">
              {stats.map((s) => (
                <div key={s.t} className="card stat">
                  <b>{s.n}</b><span>{s.t}</span><small>{s.s}</small>
                </div>
              ))}
            </div>
            <div className="card verify">
              <div>
                <h3>Get your Verified badge</h3>
                <p className="muted">A quick selfie check shows families your profile is genuine and brings more replies.</p>
              </div>
              <Link href="/verify" className="btn btn--solid">Verify now</Link>
            </div>
          </div>
        </section>

        {/* Matches + interests */}
        <section className="dash__grid">
          <div>
            <div className="head">
              <h2>Matches for you</h2>
              <Link href="/search" className="link">Advanced search</Link>
            </div>
            <div className="tabs">
              <button className="on">Daily matches (6)</button>
              <button>Shortlisted (0)</button>
              <button>Interests sent (0)</button>
            </div>
            <div className="matches">
              {matches.map((m) => (
                <article key={m.name} className="card match">
                  <div className="photo">{m.name[0]}</div>
                  <h3>{m.name}, {m.age}</h3>
                  <p className="muted">{m.job}</p>
                  <p className="muted">{m.place} · Horoscope {m.score}</p>
                  <div className="match__btns">
                    <Link href="/profile/1" className="btn btn--outline">View profile</Link>
                    <button className="btn btn--solid">Send interest</button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside>
            <div className="head"><h2>Interests received</h2></div>
            <div className="card list">
              {received.map((r) => (
                <div key={r.name} className="list__item">
                  <div className="avatar-sm">{r.name[0]}</div>
                  <div><b>{r.name}</b><p className="muted">{r.meta}</p></div>
                  <div className="list__btns">
                    <button className="btn btn--solid btn--sm">Accept</button>
                    <button className="btn btn--outline btn--sm">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}