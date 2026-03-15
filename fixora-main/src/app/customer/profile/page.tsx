import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage name, phone, addresses, and security settings.</CardDescription>
      </Card>
    </main>
  );
}
