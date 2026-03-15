"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BookingForm() {
  const [service, setService] = useState("Electrician");
  const [technicianId, setTechnicianId] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState(499);
  const [addressLine, setAddressLine] = useState("");
  const [latitude, setLatitude] = useState(26.9124);
  const [longitude, setLongitude] = useState(75.7873);
  const [message, setMessage] = useState("");

  async function submitBooking() {
    setMessage("Creating booking...");
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service,
        technicianId,
        date: new Date(date).toISOString(),
        price,
        addressLine,
        latitude,
        longitude,
      }),
    });

    const json = await res.json();
    setMessage(json.ok ? `Booking created: ${json.data.id}` : json.message || "Failed");
  }

  return (
    <div className="space-y-3">
      <Input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service" />
      <Input value={technicianId} onChange={(e) => setTechnicianId(e.target.value)} placeholder="Technician ID" />
      <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
      <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="Address" />
      <div className="grid grid-cols-2 gap-3">
        <Input type="number" value={latitude} onChange={(e) => setLatitude(Number(e.target.value))} placeholder="Latitude" />
        <Input type="number" value={longitude} onChange={(e) => setLongitude(Number(e.target.value))} placeholder="Longitude" />
      </div>
      <Button onClick={submitBooking}>Create Booking</Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
