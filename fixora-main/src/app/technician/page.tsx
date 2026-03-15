import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ChatWindow } from "@/components/chat/chat-window";

const actions = [
  "Accept/reject booking",
  "Update job status",
  "Online/offline toggle",
  "Track earnings",
  "Manage service area",
  "Upload ID and profile",
];

export default function TechnicianDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Technician Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Card key={action}>
            <CardTitle>{action}</CardTitle>
            <CardDescription>Backed by role-protected API workflows.</CardDescription>
          </Card>
        ))}
      </div>
      <ChatWindow bookingId="demo-booking-id" receiverId="demo-user-id" />
    </main>
  );
}
