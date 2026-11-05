"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Mail, Pencil, Plus, Trash2, UserPlus, Users, X } from "lucide-react";

type Module = {
  id: string; slug: string; title: string; category: string; description: string; transcript: string;
  audio_url: string; duration_minutes: number; position: number; published: boolean;
};

type User = {
  id: string; email: string; name: string | null; role: "admin" | "learner";
  active: boolean; access_all_modules: boolean; moduleIds?: string[];
};

const emptyModule = {
  slug: "", title: "", category: "General", description: "", transcript: "", audioUrl: "",
  durationMinutes: 18, position: 0, published: true,
};

export default function AdminPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<"modules" | "users">("modules");
  const [editing, setEditing] = useState<(typeof emptyModule & { id?: string }) | null>(null);
  const [editingUser, setEditingUser] = useState<(User & { accessAllModules: boolean }) | null>(null);
  const [newUser, setNewUser] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/modules");
    if (!response.ok) return setError("Admin access is required.");
    setModules(await response.json());
    const userResponse = await fetch("/api/admin/users");
    if (userResponse.ok) setUsers(await userResponse.json());
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

  async function saveUser() {
    if (!editingUser) return;
    setError("");
    const isNew = newUser;
    const response = await fetch(isNew ? "/api/admin/users" : `/api/admin/users/${editingUser.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: editingUser.email,
        name: editingUser.name,
        role: editingUser.role,
        active: editingUser.active,
        accessAllModules: editingUser.accessAllModules,
        moduleIds: editingUser.moduleIds ?? [],
      }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error || "Unable to save user.");
    setEditingUser(null);
    setNewUser(false);
    load();
  }

  async function removeUser(id: string) {
    if (!confirm("Delete this user? Their sign-in and module assignments will be removed.")) return;
    const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) setError(result.error || "Unable to delete user.");
    else load();
  }

  function addUser() {
    setNewUser(true);
    setEditingUser({
      id: "", email: "", name: null, role: "learner", active: true, accessAllModules: true, access_all_modules: true, moduleIds: [],
    });
  }

  function editUser(user: User) {
    setNewUser(false);
    setEditingUser({ ...user, accessAllModules: user.access_all_modules });
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
        <div><Link href="/" className="secondary-button"><ArrowLeft size={17} /> Learning home</Link><button className="primary-button" onClick={tab === "modules" ? () => setEditing(emptyModule) : addUser}>{tab === "modules" ? <Plus size={18} /> : <UserPlus size={18} />}{tab === "modules" ? "Add module" : "Add user"}</button></div>
      </header>
      <section className="admin-content">
        <div className="admin-tabs"><button className={tab === "modules" ? "active" : ""} onClick={() => setTab("modules")}><Eye size={17} /> Modules</button><button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}><Users size={17} /> Users</button></div>
        <div className="admin-title"><div><span className="eyebrow">ADMIN BACKEND</span><h1>{tab === "modules" ? "Module management" : "User management"}</h1></div><span>{tab === "modules" ? `${modules.length} modules` : `${users.length} users`}</span></div>
        {error && <div className="admin-error">{error}</div>}
        {tab === "modules" ? (
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
        ) : (
        <div className="admin-table">
          <div className="admin-row user-table-head"><span>User</span><span>Role</span><span>Module access</span><span>Status</span><span>Actions</span></div>
          {users.map(user => (
            <div className="admin-row user-table-row" key={user.id}>
              <div><strong>{user.name || user.email}</strong><small>{user.email}</small></div>
              <span className="role-label">{user.role}</span>
              <span>{user.role === "admin" || user.access_all_modules ? "All modules" : `${user.moduleIds?.length ?? 0} assigned`}</span>
              <span className={user.active ? "status published" : "status"}>{user.active ? "Active" : "Disabled"}</span>
              <div className="row-actions"><button aria-label={`Edit ${user.email}`} onClick={() => editUser(user)}><Pencil size={17} /></button><button aria-label={`Delete ${user.email}`} onClick={() => removeUser(user.id)}><Trash2 size={17} /></button></div>
            </div>
          ))}
          {!users.length && <div className="admin-empty">No users have been added yet.</div>}
        </div>
        )}
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

      {editingUser && (
        <div className="modal-backdrop" role="presentation">
          <form className="module-editor" onSubmit={event => { event.preventDefault(); saveUser(); }}>
            <div className="editor-heading"><div><span className="eyebrow">{newUser ? "NEW USER" : "EDIT USER"}</span><h2>{newUser ? "Add learner access" : "Update user"}</h2></div><button type="button" onClick={() => setEditingUser(null)} aria-label="Close"><X /></button></div>
            <label>Email address<input type="email" required disabled={!newUser} value={editingUser.email} onChange={event => setEditingUser({ ...editingUser, email: event.target.value })} /></label>
            <label>Name<input value={editingUser.name ?? ""} onChange={event => setEditingUser({ ...editingUser, name: event.target.value })} /></label>
            <div className="editor-grid">
              <label>Role<select value={editingUser.role} onChange={event => setEditingUser({ ...editingUser, role: event.target.value as "admin" | "learner" })}><option value="learner">Learner</option><option value="admin">Administrator</option></select></label>
              <label className="checkbox-label"><input type="checkbox" checked={editingUser.active} onChange={event => setEditingUser({ ...editingUser, active: event.target.checked })} /> Active account</label>
            </div>
            {editingUser.role === "learner" && <>
              <label className="checkbox-label"><input type="checkbox" checked={editingUser.accessAllModules} onChange={event => setEditingUser({ ...editingUser, accessAllModules: event.target.checked })} /> Give access to all modules</label>
              {!editingUser.accessAllModules && <div className="module-access-list"><strong>Assigned modules</strong>{modules.filter(module => module.published).map(module => (
                <label className="checkbox-label" key={module.id}><input type="checkbox" checked={editingUser.moduleIds?.includes(module.id) ?? false} onChange={event => setEditingUser({ ...editingUser, moduleIds: event.target.checked ? [...(editingUser.moduleIds ?? []), module.id] : (editingUser.moduleIds ?? []).filter(id => id !== module.id) })} />{module.title}</label>
              ))}</div>}
            </>}
            <div className="editor-actions"><button type="button" className="secondary-button" onClick={() => setEditingUser(null)}>Cancel</button><button type="submit" className="primary-button"><Mail size={17} /> {newUser ? "Add user" : "Save user"}</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
