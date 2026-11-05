"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
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
        <form onSubmit={submit}>
          <span className="eyebrow">TEAM ACCESS</span>
          <h2>Sign in to your account</h2>
          <p>Enter your credentials to continue your training.</p>
          <label>Email address<div className="input-wrap"><Mail size={18} /><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" /></div></label>
          <label>Password<div className="input-wrap"><LockKeyhole size={18} /><input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" /></div></label>
          <button className="primary-button" type="submit">Sign in <ArrowRight size={18} /></button>
        </form>
      </section>
    </main>
  );
}
