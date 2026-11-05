"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, ShieldOff } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string; role: string; totpEnabled: boolean } | null>(null);
  const [step, setStep] = useState<"status" | "setup">("status");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/account/totp");
    if (response.ok) setUser(await response.json());
  }

  useEffect(() => { load(); }, []);

  async function startSetup() {
    setMessage("");
    const response = await fetch("/api/auth/totp/setup", { method: "POST" });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error || "Unable to start setup.");
    setQrCode(result.qrCode);
    setSecret(result.secret);
    setStep("setup");
  }

  async function verifySetup(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/auth/totp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, setup: true }),
    });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error || "Invalid authenticator code.");
    setStep("status");
    setCode("");
    load();
  }

  async function disableTotp() {
    if (!confirm("Disable authenticator sign-in for this account? Email OTP will remain required.")) return;
    await fetch("/api/account/totp", { method: "DELETE" });
    load();
  }

  return (
    <main className="profile-shell">
      <header className="profile-header"><Link href="/" className="brand"><Image src="/pmg-logo.png" alt="PMG Learning" width={150} height={32} /></Link><Link href="/" className="profile-back"><ArrowLeft size={18} /> Learning home</Link></header>
      <section className="profile-content">
        <span className="eyebrow">MY ACCOUNT</span><h1>Profile & security</h1>
        <div className="profile-card">
          <div><span>Signed in as</span><strong>{user?.name || user?.email || "Loading..."}</strong><small>{user?.email}</small></div>
          <span className="role-label">{user?.role}</span>
        </div>
        <div className="security-card">
          <div className="security-icon">{user?.totpEnabled ? <ShieldCheck /> : <ShieldOff />}</div>
          <div className="security-copy"><span className="eyebrow">EXTRA SECURITY</span><h2>Authenticator app</h2><p>{user?.totpEnabled ? "Authenticator verification is active. Each sign-in will require your email code and authenticator code." : "Optional: enable an authenticator app for an extra sign-in step. Email OTP is always required."}</p></div>
          {step === "status" && !user?.totpEnabled && <button className="primary-button" onClick={startSetup}>Enable authenticator</button>}
          {step === "status" && user?.totpEnabled && <button className="secondary-button" onClick={disableTotp}>Disable</button>}
        </div>
        {step === "setup" && <form className="totp-setup-card" onSubmit={verifySetup}><h2>Set up your authenticator</h2>{qrCode && <img src={qrCode} alt="Authenticator QR code" />}<p>Scan this code with Google Authenticator, Microsoft Authenticator, or another TOTP app. If it cannot be scanned, enter this key:</p><code>{secret}</code>{message && <div className="admin-error">{message}</div>}<label>Authenticator code<input required autoFocus inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" /></label><div className="editor-actions"><button type="button" className="secondary-button" onClick={() => setStep("status")}>Cancel</button><button type="submit" className="primary-button">Activate authenticator</button></div></form>}
      </section>
    </main>
  );
}
