import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock3, Headphones, Pencil, Play, Trophy, UserCircle } from "lucide-react";
import { modules, padModule } from "@/data/modules";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  let dbModules: { title: string; category: string }[] = [];
  try {
    const session = await readSession();
    const user = session?.sub ? (await db.query("SELECT access_all_modules FROM pmg_users WHERE id=$1 AND active=true", [session.sub])).rows[0] : null;
    const assigned = session?.sub && !user?.access_all_modules
      ? (await db.query("SELECT m.title, m.category FROM pmg_modules m JOIN pmg_user_modules um ON um.module_id=m.id WHERE um.user_id=$1 AND m.published=true ORDER BY m.position ASC", [session.sub])).rows
      : (await db.query("SELECT title, category FROM pmg_modules WHERE published = true ORDER BY position ASC, created_at ASC")).rows;
    dbModules = assigned;
  } catch {
    // Static course content remains available until PostgreSQL is configured.
  }
  const courseModules = dbModules.length ? dbModules.map(module => [module.title, module.category] as const) : modules;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand"><Image src="/pmg-logo.png" alt="PMG" width={150} height={32} priority /></Link>
        <nav>
          <a className="nav-item active" href="#"><BookOpen size={19} /> Learning home</a>
          <a className="nav-item" href="#courses"><Play size={19} /> My courses</a>
          <a className="nav-item" href="#"><Trophy size={19} /> Certificates</a>
          <Link className="nav-item" href="/admin"><Pencil size={19} /> Admin backend</Link>
          <Link className="nav-item" href="/profile"><UserCircle size={19} /> Profile</Link>
        </nav>
        <div className="sidebar-user"><div className="avatar">TC</div><div><strong>Tony Crespo</strong><span>Team member</span></div></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span className="eyebrow">TRAINING DASHBOARD</span><h1>Welcome back, Tony</h1></div>
          <Link href="/login" className="logout">Log out</Link>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="course-label">CONTINUE LEARNING</span>
            <h2>Understanding Merchant Services</h2>
            <p>Build the foundation for confident conversations with merchants and stronger sales results.</p>
            <div className="hero-actions">
              <Link href="/modules/0" className="primary-button"><Play size={18} fill="currentColor" /> Continue module</Link>
              <span><Clock3 size={17} /> 18 min</span>
            </div>
          </div>
          <div className="hero-art"><div className="sound-ring"><Headphones size={52} /></div><div className="wave">••••••••••••••••••••</div></div>
        </section>

        <section className="stats" aria-label="Learning progress">
          <div><strong>{courseModules.length}</strong><span>Total modules</span></div>
          <div><strong>4</strong><span>Completed</span></div>
          <div><strong>17%</strong><span>Course progress</span></div>
          <div className="progress-stat"><span><strong>6h 40m</strong><small>Learning time</small></span><div className="progress-track"><i style={{width: "17%"}} /></div></div>
        </section>

        <section className="courses" id="courses">
          <div className="section-heading"><div><span className="eyebrow">PMG TRAINING ACADEMY</span><h2>Your learning path</h2></div><span>{courseModules.length} modules</span></div>
          <div className="module-grid">
            {courseModules.map(([title, category], index) => (
              <Link className={`module-card ${index === 0 ? "featured" : ""}`} href={`/modules/${index}`} key={title}>
                <div className="module-thumb">
                  <span className="module-number">{padModule(index)}</span>
                  <div className="module-icon">{index === 22 ? <Trophy size={26} /> : <Headphones size={26} />}</div>
                </div>
                <div className="module-body">
                  <span>{category}</span>
                  <h3>{title}</h3>
                  <div className="module-meta"><span>{index < 4 ? `${index * 20}% complete` : "18 min"}</span><ArrowRight size={18} /></div>
                  {index < 4 && <div className="module-progress"><i style={{width: `${index * 20}%`}} /></div>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
