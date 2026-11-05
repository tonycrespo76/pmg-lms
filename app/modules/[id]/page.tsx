import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Clock3, Headphones, ListChecks } from "lucide-react";
import { modules, padModule } from "@/data/modules";

export function generateStaticParams() {
  return modules.map((_, id) => ({ id: String(id) }));
}

export default async function ModulePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const safeId = Number.isInteger(id) && id >= 0 && id < modules.length ? id : 0;
  const moduleNumber = padModule(safeId);
  const transcript = await fs.readFile(path.join(process.cwd(), "public", "transcripts", `PMG_${moduleNumber}_EN_transcript.txt`), "utf8");
  const lines = transcript.split(/\n\n+/).filter(Boolean);
  const title = modules[safeId][0];
  const lessonLines = lines.slice(2).map((block) => {
    const [heading, ...content] = block.split("\n");
    return { heading, content: content.join(" ").trim() };
  }).filter(item => item.content);

  return (
    <main className="lesson-shell">
      <aside className="lesson-sidebar">
        <Link href="/" className="brand"><Image src="/pmg-logo.png" alt="PMG" width={150} height={32} /></Link>
        <Link href="/" className="back-link"><ArrowLeft size={18} /> Learning home</Link>
        <span className="eyebrow">MODULE {moduleNumber}</span>
        <h1>{title}</h1>
        <div className="lesson-progress-label"><span>Module progress</span><strong>25%</strong></div>
        <div className="module-progress"><i style={{width: "25%"}} /></div>
        <div className="lesson-list">
          {lessonLines.map((lesson, index) => <div className={index === 0 ? "lesson-link current" : "lesson-link"} key={lesson.heading}><span>{index === 0 ? <Headphones size={16} /> : <CheckCircle2 size={16} />}</span>{lesson.heading}<small>{lesson.content ? `${Math.max(2, Math.ceil(lesson.content.length / 130))} min` : ""}</small></div>)}
        </div>
      </aside>
      <section className="lesson-content">
        <div className="lesson-top"><span><Clock3 size={17} /> 18 minutes</span><span><ListChecks size={17} /> Audio lesson</span></div>
        <article>
          <span className="course-label">{modules[safeId][1]}</span>
          <h1>{lessonLines[0]?.heading || "Introduction"}</h1>
          <p className="lesson-text">{lessonLines[0]?.content}</p>
          <audio controls className="audio-player" src={`/audio/pmg_module_${moduleNumber}_01.mp3`} preload="metadata">Your browser does not support audio.</audio>
          <div className="lesson-navigation">
            {safeId > 0 && <Link href={`/modules/${safeId - 1}`} className="secondary-button"><ArrowLeft size={17} /> Previous</Link>}
            {safeId < modules.length - 1 && <Link href={`/modules/${safeId + 1}`} className="primary-button">Next module <ArrowRightIcon /></Link>}
          </div>
        </article>
      </section>
    </main>
  );
}

function ArrowRightIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
