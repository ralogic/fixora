"use client";

import { useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    setMessage(json.ok ? "Login successful" : json.message || "Login failed");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Card className="space-y-4">
        <CardTitle>Login</CardTitle>
        <CardDescription>Login with email and password, or OTP through API.</CardDescription>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <Button onClick={login}>Login</Button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </Card>
    </main>
  );
}
