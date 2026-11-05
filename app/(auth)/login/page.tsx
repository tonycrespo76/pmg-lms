"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "totp" | "setup">("email");
  const [message, setMessage] = useState("");

  async function requestOtp(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error || "Unable to send the code.");
    setStep("otp");
    setMessage("Enter the 6-digit code sent to your email.");
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error || "Unable to verify the code.");
    setCode("");
    if (result.requiresTotp) setStep("totp");
    else router.push("/");
  }

  async function verifyTotp(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/auth/totp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const result = await response.json();
    if (!response.ok) return setMessage(result.error || "Unable to verify the authenticator.");
    router.push("/");
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <Image src="/pmg-logo.png" alt="PMG" width={190} height={40} />
        <div>
          <span>WELCOME TO</span>
          <h1>PMG Learning</h1>
          <p>Build your knowledge. Strengthen your skills. Grow with PMG.</p>
        </div>
      </section>
      <section className="login-panel">
        <form onSubmit={step === "email" ? requestOtp : step === "otp" ? verifyOtp : verifyTotp}>
          <span className="eyebrow">TEAM ACCESS</span>
          <h2>Sign in to your account</h2>
          {message && <p role="status" className="login-message">{message}</p>}
          {step === "email" && <>
            <p>Enter your PMG email address. We will send you a one-time sign-in code.</p>
            <label>Email address<div className="input-wrap"><Mail size={18} /><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" /></div></label>
            <button className="primary-button" type="submit">Email me a sign-in code <ArrowRight size={18} /></button>
          </>}
          {step === "otp" && <>
            <label>Verification code<div className="input-wrap"><ShieldCheck size={18} /><input required autoFocus inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" /></div></label>
            <button className="primary-button" type="submit">Verify email code <ArrowRight size={18} /></button>
            <button type="button" className="text-button" onClick={() => setStep("email")}>Use a different email</button>
          </>}
          {step === "totp" && <>
            <p>Enter the 6-digit code from your authenticator app.</p>
            <label>Authenticator code<div className="input-wrap"><ShieldCheck size={18} /><input required autoFocus inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" /></div></label>
            <button className="primary-button" type="submit">Complete sign in <ArrowRight size={18} /></button>
          </>}
        </form>
      </section>
    </main>
  );
}
