"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";

type Module = {
  id: string; slug: string; title: string; category: string; description: string; transcript: string;
  audio_url: string; duration_minutes: number; position: number; published: boolean;
};

const emptyModule = {
  slug: "", title: "", category: "General", description: "", transcript: "", audioUrl: "",
  durationMinutes: 18, position: 0, published: true,
};

export default function AdminPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [editing, setEditing] = useState<(typeof emptyModule & { id?: string }) | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/modules");
    if (!response.ok) return setError("Admin access is required.");
    setModules(await response.json());
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setError("");
    const response = await fetch(editing.id ? `/api/admin/modules/${editing.id}` : "/api/admin/modules", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error || "Unable to save module.");
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this module?")) return;
    await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
    load();
  }

  function edit(module: Module) {
    setEditing({
      id: module.id, slug: module.slug, title: module.title, category: module.category,
      description: module.description, transcript: module.transcript, audioUrl: module.audio_url,
      durationMinutes: module.duration_minutes, position: module.position, published: module.published,
    });
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="admin-brand"><Image src="/pmg-logo.png" alt="PMG Learning" width={150} height={32} /></Link>
        <div><Link href="/" className="secondary-button"><ArrowLeft size={17} /> Learning home</Link><button className="primary-button" onClick={() => setEditing(emptyModule)}><Plus size={18} /> Add module</button></div>
      </header>
      <section className="admin-content">
        <div className="admin-title"><div><span className="eyebrow">ADMIN BACKEND</span><h1>Module management</h1></div><span>{modules.length} modules</span></div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-table">
          <div className="admin-row admin-table-head"><span>Module</span><span>Category</span><span>Status</span><span>Actions</span></div>
          {modules.map(module => (
            <div className="admin-row" key={module.id}>
              <div><strong>{module.title}</strong><small>Position {module.position}</small></div>
              <span>{module.category}</span>
              <span className={module.published ? "status published" : "status"}>{module.published ? <Eye size={15} /> : <EyeOff size={15} />}{module.published ? "Published" : "Draft"}</span>
              <div className="row-actions"><button aria-label={`Edit ${module.title}`} onClick={() => edit(module)}><Pencil size={17} /></button><button aria-label={`Delete ${module.title}`} onClick={() => remove(module.id)}><Trash2 size={17} /></button></div>
            </div>
          ))}
          {!modules.length && !error && <div className="admin-empty">No modules created yet. Add the first training module.</div>}
        </div>
      </section>

      {editing && (
        <div className="modal-backdrop" role="presentation">
          <form className="module-editor" onSubmit={event => { event.preventDefault(); save(); }}>
            <div className="editor-heading"><div><span className="eyebrow">{editing.id ? "EDIT MODULE" : "NEW MODULE"}</span><h2>{editing.id ? "Update module" : "Add a training module"}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Close"><X /></button></div>
            <label>Module title<input required value={editing.title} onChange={event => setEditing({ ...editing, title: event.target.value })} /></label>
            <div className="editor-grid">
              <label>URL slug<input value={editing.slug} onChange={event => setEditing({ ...editing, slug: event.target.value })} placeholder="auto-generated" /></label>
              <label>Category<input value={editing.category} onChange={event => setEditing({ ...editing, category: event.target.value })} /></label>
              <label>Duration (minutes)<input type="number" min="1" value={editing.durationMinutes} onChange={event => setEditing({ ...editing, durationMinutes: Number(event.target.value) })} /></label>
              <label>Position<input type="number" value={editing.position} onChange={event => setEditing({ ...editing, position: Number(event.target.value) })} /></label>
            </div>
            <label>Audio URL<input value={editing.audioUrl} onChange={event => setEditing({ ...editing, audioUrl: event.target.value })} placeholder="/audio/module.mp3" /></label>
            <label>Short description<textarea rows={3} value={editing.description} onChange={event => setEditing({ ...editing, description: event.target.value })} /></label>
            <label>Transcript<textarea rows={7} value={editing.transcript} onChange={event => setEditing({ ...editing, transcript: event.target.value })} /></label>
            <label className="checkbox-label"><input type="checkbox" checked={editing.published} onChange={event => setEditing({ ...editing, published: event.target.checked })} /> Publish immediately</label>
            {error && <div className="admin-error">{error}</div>}
            <div className="editor-actions"><button type="button" className="secondary-button" onClick={() => setEditing(null)}>Cancel</button><button className="primary-button" type="submit">{editing.id ? "Save changes" : "Create module"}</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
