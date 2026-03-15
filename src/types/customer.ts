export type SessionUser = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  emailVerified?: boolean;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
};

export type SavedAddress = {
  id: string;
  label: "HOME" | "OFFICE" | "OTHER";
  addressLine: string;
  landmark?: string | null;
  floor?: string | null;
  lat: number | string;
  lng: number | string;
  city?: { id: string; name: string; slug: string } | null;
  zone?: { id: string; name: string } | null;
  createdAt: string;
};
