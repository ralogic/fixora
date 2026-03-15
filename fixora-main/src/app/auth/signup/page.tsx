"use client";

import { useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  async function sendOtp() {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "SIGNUP" }),
    });
    const json = await res.json();
    setMessage(json.ok ? "OTP sent" : json.message || "Failed");
  }

  async function verifyOtp() {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "SIGNUP", code, name, password, role: "CUSTOMER" }),
    });
    const json = await res.json();
    setMessage(json.ok ? "Account created" : json.message || "Failed");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Card className="space-y-4">
        <CardTitle>Signup with OTP</CardTitle>
        <CardDescription>Create a customer account using OTP verification.</CardDescription>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <Button onClick={sendOtp} variant="outline">
          Send OTP
        </Button>
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter OTP" />
        <Button onClick={verifyOtp}>Verify OTP & Signup</Button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </Card>
    </main>
  );
}
