"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatWindowProps = {
  bookingId: string;
  receiverId: string;
};

export function ChatWindow({ bookingId, receiverId }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function sendMessage() {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, receiverId, message }),
    });

    const json = await res.json();
    setStatus(json.ok ? "Message sent" : json.message || "Failed");
    if (json.ok) setMessage("");
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-4">
      <h4 className="text-sm font-semibold text-slate-900">In-app chat</h4>
      <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message" />
      <Button onClick={sendMessage} size="sm">
        Send
      </Button>
      {status ? <p className="text-xs text-slate-600">{status}</p> : null}
    </div>
  );
}
