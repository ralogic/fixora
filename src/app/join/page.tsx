"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  Upload,
  User,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/services/api-client/client";

// ΓöÇΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

type PersonalForm = {
  name: string;
  phone: string;
  email: string;
  password: string;
  city: string;
  area: string;
};

type ProfessionalForm = {
  serviceCategory: string;
  experienceYears: string;
  skills: string[];
  toolsAvailable: boolean;
  workType: "HOME_SERVICE" | "SHOP" | "BOTH";
  bio: string;
};

type DocumentForm = {
  aadhaar: File | null;
  pan: File | null;
  profilePhoto: File | null;
  certificate: File | null;
  aadhaarPreview: string | null;
  panPreview: string | null;
  profilePhotoPreview: string | null;
  certificatePreview: string | null;
};

type LocationForm = {
  city: string;
  radiusKm: number;
  lat: number | null;
  lng: number | null;
};

type BankingForm = {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
};

// ΓöÇΓöÇΓöÇ Constants ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const SERVICE_CATEGORIES = [
  { value: "electrician", label: "Electrician", icon: "EL" },
  { value: "plumber", label: "Plumber", icon: "PL" },
  { value: "ac-repair", label: "AC Repair", icon: "AC" },
  { value: "appliance", label: "Appliance Repair", icon: "AP" },
  { value: "carpenter", label: "Carpenter", icon: "CR" },
  { value: "mobile-repair", label: "Mobile Repair", icon: "MR" },
  { value: "painter", label: "Painter", icon: "PT" },
  { value: "cleaner", label: "Deep Cleaner", icon: "DC" },
];

const SKILL_OPTIONS: Record<string, string[]> = {
  electrician: ["Wiring", "MCB/Fuse", "Fan Installation", "Light Fixtures", "CCTV Setup", "Inverter"],
  plumber: ["Leak Repair", "Tap Replace", "Pipe Fittings", "WC Repairs", "Water Heater", "Drain Cleaning"],
  "ac-repair": ["Gas Refill", "Cooling Diagnostics", "PCB Repair", "Motor Replacement", "AC Installation", "Deep Service"],
  appliance: ["Washing Machine", "Refrigerator", "Microwave", "Dishwasher", "Geyser", "RO Service"],
  carpenter: ["Furniture Assembly", "Door/Window", "Cupboard Repair", "False Ceiling", "Polishing", "Custom Work"],
  "mobile-repair": ["Screen Replace", "Battery Replace", "IC Repair", "Charging Port", "Software Flash", "Back Panel"],
  painter: ["Interior Painting", "Exterior Painting", "Texture Work", "Wall Putty", "Waterproofing"],
  cleaner: ["Deep Clean", "Kitchen Cleaning", "Bathroom Sanitize", "Sofa Shampooing", "Carpet Cleaning"],
};

const CITIES = ["Jaipur", "Delhi", "Mumbai", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata"];
const RADII = [5, 10, 15, 20];

const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Professional", icon: Briefcase },
  { id: 3, label: "Documents", icon: FileText },
  { id: 4, label: "Location", icon: MapPin },
  { id: 5, label: "Banking", icon: Banknote },
];

// ΓöÇΓöÇΓöÇ Slide variants ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25 } }),
};

// ΓöÇΓöÇΓöÇ Main component ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const [personal, setPersonal] = useState<PersonalForm>({
    name: "",
    phone: "",
    email: "",
    password: "",
    city: "",
    area: "",
  });

  const [professional, setProfessional] = useState<ProfessionalForm>({
    serviceCategory: "",
    experienceYears: "",
    skills: [],
    toolsAvailable: false,
    workType: "HOME_SERVICE",
    bio: "",
  });

  const [documents, setDocuments] = useState<DocumentForm>({
    aadhaar: null,
    pan: null,
    profilePhoto: null,
    certificate: null,
    aadhaarPreview: null,
    panPreview: null,
    profilePhotoPreview: null,
    certificatePreview: null,
  });

  const [location, setLocation] = useState<LocationForm>({
    city: "",
    radiusKm: 10,
    lat: null,
    lng: null,
  });

  const [banking, setBanking] = useState<BankingForm>({
    accountName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  // ΓöÇΓöÇΓöÇ Navigation ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  function goNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setDir(1);
    setStep((s) => Math.min(s + 1, 5));
  }

  function goBack() {
    setErrors({});
    setDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  // ΓöÇΓöÇΓöÇ Validation ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  function validateStep(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!personal.name.trim()) e.name = "Full name is required";
      if (!/^[6-9]\d{9}$/.test(personal.phone)) e.phone = "Enter a valid 10-digit mobile number";
      if (personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) e.email = "Enter a valid email";
      if (personal.password.length < 8) e.password = "Password must be at least 8 characters";
      if (!personal.city) e.city = "Select your city";
      if (!personal.area.trim()) e.area = "Enter your area";
    }
    if (s === 2) {
      if (!professional.serviceCategory) e.serviceCategory = "Select a service category";
      if (!professional.experienceYears) e.experienceYears = "Enter years of experience";
      if (professional.skills.length === 0) e.skills = "Select at least one skill";
    }
    if (s === 3) {
      if (!documents.aadhaar) e.aadhaar = "Aadhaar card is required";
      if (!documents.pan) e.pan = "PAN card is required";
      if (!documents.profilePhoto) e.profilePhoto = "Profile photo is required";
    }
    if (s === 4) {
      if (!location.city) e.locationCity = "Select service city";
    }
    if (s === 5) {
      if (!banking.accountName.trim()) e.accountName = "Account holder name is required";
      if (!banking.bankName.trim()) e.bankName = "Bank name is required";
      if (!/^\d{9,18}$/.test(banking.accountNumber)) e.accountNumber = "Enter a valid account number";
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(banking.ifscCode.toUpperCase())) e.ifscCode = "Enter a valid IFSC code";
    }
    return e;
  }

  // ΓöÇΓöÇΓöÇ File upload handler ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  function handleFileChange(
    field: keyof Pick<DocumentForm, "aadhaar" | "pan" | "profilePhoto" | "certificate">,
    file: File | null,
  ) {
    if (!file) return;
    // Validate size (max 5 MB) and type
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, [field]: "File must be under 5 MB" }));
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      setErrors((e) => ({ ...e, [field]: "Only JPG, PNG, WEBP or PDF allowed" }));
      return;
    }
    const previewKey = `${field}Preview` as keyof DocumentForm;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments((d) => ({
        ...d,
        [field]: file,
        [previewKey]: file.type.startsWith("image/") ? (reader.result as string) : null,
      }));
    };
    reader.readAsDataURL(file);
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  // ΓöÇΓöÇΓöÇ Submit ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  async function handleSubmit() {
    const errs = validateStep(5);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("personal", JSON.stringify(personal));
      formData.append("professional", JSON.stringify(professional));
      formData.append("location", JSON.stringify(location));
      formData.append("banking", JSON.stringify(banking));
      if (documents.aadhaar) formData.append("aadhaar", documents.aadhaar);
      if (documents.pan) formData.append("pan", documents.pan);
      if (documents.profilePhoto) formData.append("profilePhoto", documents.profilePhoto);
      if (documents.certificate) formData.append("certificate", documents.certificate);

      await fetch("/api/technicians/register", { method: "POST", body: formData });
      setSubmitted(true);
    } catch {
      setErrors({ submit: "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  // ΓöÇΓöÇΓöÇ Skill toggle ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  function toggleSkill(skill: string) {
    setProfessional((p) => ({
      ...p,
      skills: p.skills.includes(skill)
        ? p.skills.filter((s) => s !== skill)
        : [...p.skills, skill],
    }));
  }

  // ΓöÇΓöÇΓöÇ Success screen ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow-2xl shadow-blue-200">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900">Application submitted!</h1>
            <p className="mt-3 max-w-sm text-zinc-500">
              Our team will verify your documents within <strong>24-48 hours</strong>. You'll receive an SMS on{" "}
              <strong>{personal.phone}</strong> once approved.
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-blue-100 bg-white p-5 shadow-lg w-full max-w-sm text-left">
            {[
              ["Name", personal.name],
              ["Service", SERVICE_CATEGORIES.find((c) => c.value === professional.serviceCategory)?.label ?? ""],
              ["City", location.city || personal.city],
              ["Status", "Pending review"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-zinc-400">{k}</span>
                <span className="font-semibold text-zinc-800">{v}</span>
              </div>
            ))}
          </div>
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:opacity-90"
          >
            Back to home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* ΓöÇΓöÇΓöÇ Header ΓöÇΓöÇ */}
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-extrabold text-zinc-900">
              Fixora <span className="text-blue-700">Pro</span>
            </span>
          </Link>
          <Link href="/customer" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition">
            Already a pro? Sign in
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
        {/* ΓöÇΓöÇΓöÇ Hero strip ΓöÇΓöÇ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-200"
        >
          <h1 className="text-2xl font-extrabold md:text-3xl">Become a Fixora Technician</h1>
          <p className="mt-1 text-cyan-100">
            Earn Rs 30,000 to Rs 70,000 / month | Flexible hours | 10,000+ jobs available
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {[
              { icon: Shield, text: "Verified badge" },
              { icon: Star, text: "No joining fee" },
              { icon: Zap, text: "Same-day payouts" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
                <Icon className="h-3.5 w-3.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ΓöÇΓöÇΓöÇ Progress bar ΓöÇΓöÇ */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map(({ id, label, icon: StepIcon }, i) => (
              <div key={id} className="flex flex-1 flex-col items-center">
                <div className="relative flex items-center w-full">
                  {i > 0 && (
                    <div
                      className={`h-0.5 flex-1 transition-colors duration-500 ${
                        step > id - 1 ? "bg-blue-500" : "bg-zinc-200"
                      }`}
                    />
                  )}
                  <motion.div
                    animate={{
                      scale: step === id ? 1.15 : 1,
                      backgroundColor: step > id ? "#2563eb" : step === id ? "#2563eb" : "#e4e4e7",
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 mx-auto flex h-9 w-9 items-center justify-center rounded-full shadow-sm"
                  >
                    {step > id ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <StepIcon className={`h-4 w-4 ${step === id ? "text-white" : "text-zinc-400"}`} />
                    )}
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 transition-colors duration-500 ${
                        step > id ? "bg-blue-500" : "bg-zinc-200"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`mt-1.5 hidden text-xs font-semibold md:block transition-colors ${
                    step === id ? "text-blue-700" : step > id ? "text-blue-500" : "text-zinc-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-zinc-400">
            Step {step} of {STEPS.length} ΓÇö {STEPS[step - 1].label}
          </p>
        </div>

        {/* ΓöÇΓöÇΓöÇ Step card ΓöÇΓöÇ */}
        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-xl shadow-zinc-100">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="p-6 md:p-8"
            >
              {/* ΓöÇΓöÇΓöÇ Step 1: Personal Info ΓöÇΓöÇ */}
              {step === 1 && (
                <div className="space-y-5">
                  <StepHeader
                    icon={User}
                    title="Personal Information"
                    subtitle="Tell us about yourself"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      label="Full Name *"
                      icon={User}
                      value={personal.name}
                      onChange={(v) => setPersonal({ ...personal, name: v })}
                      placeholder="Rajesh Kumar"
                      error={errors.name}
                    />
                    <InputField
                      label="Phone Number *"
                      icon={Phone}
                      value={personal.phone}
                      onChange={(v) => setPersonal({ ...personal, phone: v })}
                      placeholder="9876543210"
                      maxLength={10}
                      error={errors.phone}
                    />
                    <InputField
                      label="Email Address"
                      icon={Mail}
                      value={personal.email}
                      onChange={(v) => setPersonal({ ...personal, email: v })}
                      placeholder="rajesh@email.com"
                      type="email"
                      error={errors.email}
                    />
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-zinc-700">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={personal.password}
                          onChange={(e) => setPersonal({ ...personal, password: e.target.value })}
                          placeholder="Min. 8 characters"
                          className={fieldCls(!!errors.password)}
                          style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-zinc-700">City *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <select
                          value={personal.city}
                          onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                          className={`${fieldCls(!!errors.city)} appearance-none`}
                          style={{ paddingLeft: "2.5rem" }}
                        >
                          <option value="">Select city</option>
                          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                    </div>
                    <InputField
                      label="Area / Locality *"
                      icon={MapPin}
                      value={personal.area}
                      onChange={(v) => setPersonal({ ...personal, area: v })}
                      placeholder="Malviya Nagar"
                      error={errors.area}
                    />
                  </div>
                </div>
              )}

              {/* ΓöÇΓöÇΓöÇ Step 2: Professional Details ΓöÇΓöÇ */}
              {step === 2 && (
                <div className="space-y-5">
                  <StepHeader
                    icon={Briefcase}
                    title="Professional Details"
                    subtitle="Tell us what you're skilled at"
                  />

                  {/* Service category */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">Service Category *</label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {SERVICE_CATEGORIES.map(({ value, label, icon }) => (
                        <motion.button
                          key={value}
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            setProfessional((p) => ({ ...p, serviceCategory: value, skills: [] }));
                            setErrors((e) => { const n = { ...e }; delete n.serviceCategory; return n; });
                          }}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition ${
                            professional.serviceCategory === value
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-zinc-200 text-zinc-600 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <span className="text-2xl">{icon}</span>
                          {label}
                        </motion.button>
                      ))}
                    </div>
                    {errors.serviceCategory && (
                      <p className="text-xs text-red-500">{errors.serviceCategory}</p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-zinc-700">Years of Experience *</label>
                      <select
                        value={professional.experienceYears}
                        onChange={(e) => setProfessional({ ...professional, experienceYears: e.target.value })}
                        className={fieldCls(!!errors.experienceYears)}
                      >
                        <option value="">Select experience</option>
                        {["Less than 1", "1", "2", "3", "4", "5", "6-10", "10+"].map((v) => (
                          <option key={v} value={v}>{v} year{v !== "Less than 1" ? "s" : ""}</option>
                        ))}
                      </select>
                      {errors.experienceYears && (
                        <p className="text-xs text-red-500">{errors.experienceYears}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-zinc-700">Work Type</label>
                      <select
                        value={professional.workType}
                        onChange={(e) =>
                          setProfessional({
                            ...professional,
                            workType: e.target.value as ProfessionalForm["workType"],
                          })
                        }
                        className={fieldCls(false)}
                      >
                        <option value="HOME_SERVICE">Home Service (visit customer)</option>
                        <option value="SHOP">Shop / Workshop</option>
                        <option value="BOTH">Both</option>
                      </select>
                    </div>
                  </div>

                  {/* Skills */}
                  {professional.serviceCategory && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-700">
                        Skills *{" "}
                        <span className="font-normal text-zinc-400">(select all that apply)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SKILL_OPTIONS[professional.serviceCategory]?.map((skill) => (
                          <motion.button
                            key={skill}
                            type="button"
                            whileTap={{ scale: 0.93 }}
                            onClick={() => toggleSkill(skill)}
                            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                              professional.skills.includes(skill)
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-zinc-200 text-zinc-600 hover:border-blue-300"
                            }`}
                          >
                            {skill}
                          </motion.button>
                        ))}
                      </div>
                      {errors.skills && <p className="text-xs text-red-500">{errors.skills}</p>}
                    </div>
                  )}

                  {/* Tools */}
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <input
                      type="checkbox"
                      id="tools"
                      checked={professional.toolsAvailable}
                      onChange={(e) =>
                        setProfessional({ ...professional, toolsAvailable: e.target.checked })
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                    <label htmlFor="tools" className="cursor-pointer text-sm text-zinc-700">
                      <span className="font-semibold">I have my own tools</span> ΓÇö I carry all required
                      equipment to job sites
                    </label>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-zinc-700">
                      Short Bio <span className="font-normal text-zinc-400">(optional)</span>
                    </label>
                    <textarea
                      value={professional.bio}
                      onChange={(e) => setProfessional({ ...professional, bio: e.target.value })}
                      placeholder="Tell customers a little about your experience..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              )}

              {/* ΓöÇΓöÇΓöÇ Step 3: Documents ΓöÇΓöÇ */}
              {step === 3 && (
                <div className="space-y-5">
                  <StepHeader
                    icon={Shield}
                    title="Identity Verification"
                    subtitle="Upload clear photos of your documents. Max 5 MB each."
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <DocUploadCard
                      label="Aadhaar Card *"
                      description="Front side - JPG/PNG/PDF"
                      field="aadhaar"
                      preview={documents.aadhaarPreview}
                      file={documents.aadhaar}
                      error={errors.aadhaar}
                      onChange={(f) => handleFileChange("aadhaar", f)}
                      onClear={() =>
                        setDocuments((d) => ({ ...d, aadhaar: null, aadhaarPreview: null }))
                      }
                    />
                    <DocUploadCard
                      label="PAN Card *"
                      description="Clear photo - JPG/PNG/PDF"
                      field="pan"
                      preview={documents.panPreview}
                      file={documents.pan}
                      error={errors.pan}
                      onChange={(f) => handleFileChange("pan", f)}
                      onClear={() =>
                        setDocuments((d) => ({ ...d, pan: null, panPreview: null }))
                      }
                    />
                    <DocUploadCard
                      label="Profile Photo *"
                      description="Clear face photo - JPG/PNG"
                      field="profilePhoto"
                      preview={documents.profilePhotoPreview}
                      file={documents.profilePhoto}
                      error={errors.profilePhoto}
                      onChange={(f) => handleFileChange("profilePhoto", f)}
                      onClear={() =>
                        setDocuments((d) => ({
                          ...d,
                          profilePhoto: null,
                          profilePhotoPreview: null,
                        }))
                      }
                      isPhoto
                    />
                    <DocUploadCard
                      label="Skill Certificate"
                      description="Optional - Diploma / ITI"
                      field="certificate"
                      preview={documents.certificatePreview}
                      file={documents.certificate}
                      error={errors.certificate}
                      onChange={(f) => handleFileChange("certificate", f)}
                      onClear={() =>
                        setDocuments((d) => ({
                          ...d,
                          certificate: null,
                          certificatePreview: null,
                        }))
                      }
                      optional
                    />
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      Your documents are encrypted and reviewed only by our trust & safety team. They are
                      never shared with customers.
                    </p>
                  </div>
                </div>
              )}

              {/* ΓöÇΓöÇΓöÇ Step 4: Location ΓöÇΓöÇ */}
              {step === 4 && (
                <div className="space-y-5">
                  <StepHeader
                    icon={MapPin}
                    title="Service Location"
                    subtitle="Define where you'll accept jobs"
                  />

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-zinc-700">Service City *</label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {CITIES.map((c) => (
                        <motion.button
                          key={c}
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            setLocation({ ...location, city: c });
                            setErrors((e) => { const n = { ...e }; delete n.locationCity; return n; });
                          }}
                          className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                            location.city === c
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-zinc-200 text-zinc-600 hover:border-blue-300"
                          }`}
                        >
                          {c}
                        </motion.button>
                      ))}
                    </div>
                    {errors.locationCity && (
                      <p className="text-xs text-red-500">{errors.locationCity}</p>
                    )}
                  </div>

                  {/* Radius */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-zinc-700">
                      Service Radius ΓÇö <span className="text-blue-700">{location.radiusKm} km</span>
                    </label>
                    <div className="flex gap-3">
                      {RADII.map((r) => (
                        <motion.button
                          key={r}
                          type="button"
                          whileTap={{ scale: 0.93 }}
                          onClick={() => setLocation({ ...location, radiusKm: r })}
                          className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition ${
                            location.radiusKm === r
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-zinc-200 text-zinc-600 hover:border-blue-300"
                          }`}
                        >
                          {r} km
                        </motion.button>
                      ))}
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                        animate={{ width: `${(RADII.indexOf(location.radiusKm) + 1) / RADII.length * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-zinc-400">
                      You'll receive job requests within {location.radiusKm} km of your location.
                    </p>
                  </div>

                  {/* Map placeholder */}
                  <div className="overflow-hidden rounded-2xl border border-zinc-200">
                    <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
                      <div className="text-center">
                        <MapPin className="mx-auto h-10 w-10 text-blue-500" />
                        <p className="mt-2 text-sm font-semibold text-zinc-600">
                          {location.city
                            ? `Showing coverage in ${location.city} (${location.radiusKm} km)`
                            : "Select a city to see your coverage area"}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Live map will be enabled after registration
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ΓöÇΓöÇΓöÇ Step 5: Banking ΓöÇΓöÇ */}
              {step === 5 && (
                <div className="space-y-5">
                  <StepHeader
                    icon={Banknote}
                    title="Payment Details"
                    subtitle="For receiving your job earnings"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      label="Account Holder Name *"
                      icon={User}
                      value={banking.accountName}
                      onChange={(v) => setBanking({ ...banking, accountName: v })}
                      placeholder="Rajesh Kumar"
                      error={errors.accountName}
                    />
                    <InputField
                      label="Bank Name *"
                      icon={Building2}
                      value={banking.bankName}
                      onChange={(v) => setBanking({ ...banking, bankName: v })}
                      placeholder="State Bank of India"
                      error={errors.bankName}
                    />
                    <InputField
                      label="Account Number *"
                      icon={Banknote}
                      value={banking.accountNumber}
                      onChange={(v) => setBanking({ ...banking, accountNumber: v.replace(/\D/g, "") })}
                      placeholder="Enter account number"
                      error={errors.accountNumber}
                    />
                    <InputField
                      label="IFSC Code *"
                      icon={Wrench}
                      value={banking.ifscCode}
                      onChange={(v) => setBanking({ ...banking, ifscCode: v.toUpperCase() })}
                      placeholder="SBIN0001234"
                      maxLength={11}
                      error={errors.ifscCode}
                    />
                    <div className="md:col-span-2">
                      <InputField
                        label="UPI ID"
                        icon={Zap}
                        value={banking.upiId}
                        onChange={(v) => setBanking({ ...banking, upiId: v })}
                        placeholder="rajesh@paytm (optional)"
                        error={errors.upiId}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-700">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      Bank details are end-to-end encrypted. Payouts are processed within 3 business days
                      after job completion.
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                    <h3 className="mb-3 font-bold text-zinc-800">Application Summary</h3>
                    <div className="space-y-2 text-sm">
                      {[
                        ["Name", personal.name],
                        ["Phone", personal.phone],
                        ["Service", SERVICE_CATEGORIES.find((c) => c.value === professional.serviceCategory)?.label ?? "ΓÇö"],
                        ["Experience", professional.experienceYears ? `${professional.experienceYears} years` : "ΓÇö"],
                        ["City", location.city || personal.city],
                        ["Radius", `${location.radiusKm} km`],
                        ["Skills", professional.skills.join(", ") || "ΓÇö"],
                        ["Documents", [documents.aadhaar && "Aadhaar", documents.pan && "PAN", documents.profilePhoto && "Photo", documents.certificate && "Certificate"].filter(Boolean).join(", ")],
                      ].map(([k, v]) => (
                        <div key={k as string} className="flex justify-between">
                          <span className="text-zinc-400">{k}</span>
                          <span className="font-semibold text-zinc-800 text-right max-w-[60%] truncate">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {errors.submit && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{errors.submit}</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ΓöÇΓöÇΓöÇ Navigation buttons ΓöÇΓöÇ */}
          <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 md:px-8">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {step < 5 ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goNext}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:opacity-90"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    SubmittingΓÇª
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ΓöÇΓöÇΓöÇ Reusable sub-components ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function fieldCls(hasError: boolean) {
  return `w-full rounded-xl border ${
    hasError ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-zinc-200 bg-zinc-50 focus:border-orange-400 focus:ring-orange-100"
  } px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition focus:ring-2`;
}

function StepHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4 pb-2">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-zinc-900">{title}</h2>
        <p className="text-sm text-zinc-500">{subtitle}</p>
      </div>
    </div>
  );
}

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  maxLength,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-zinc-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`${fieldCls(!!error)} pl-10`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function DocUploadCard({
  label,
  description,
  field,
  preview,
  file,
  error,
  onChange,
  onClear,
  isPhoto = false,
  optional = false,
}: {
  label: string;
  description: string;
  field: string;
  preview: string | null;
  file: File | null;
  error?: string;
  onChange: (f: File) => void;
  onClear: () => void;
  isPhoto?: boolean;
  optional?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-zinc-700">
        {label}{" "}
        {optional && <span className="font-normal text-zinc-400">(optional)</span>}
      </label>

      {file ? (
        <div className="relative overflow-hidden rounded-xl border-2 border-blue-300 bg-blue-50">
          {preview ? (
            <div className={`relative ${isPhoto ? "h-36" : "h-28"} w-full`}>
              <Image
                src={preview}
                alt={label}
                fill
                className={`object-${isPhoto ? "cover" : "contain"} p-1`}
              />
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center gap-2 text-sm text-zinc-600">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="max-w-[160px] truncate">{file.name}</span>
            </div>
          )}
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
          >
            <X className="h-3.5 w-3.5 text-zinc-600" />
          </button>
          <div className="flex items-center gap-1.5 border-t border-blue-200 px-3 py-1.5 text-xs text-blue-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {file.name}
          </div>
        </div>
      ) : (
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed py-8 transition ${
            error
              ? "border-red-300 bg-red-50 text-red-500"
              : "border-zinc-200 text-zinc-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          <Upload className="h-6 w-6" />
          <span className="text-sm font-semibold">Click to upload</span>
          <span className="text-xs">{description}</span>
        </motion.button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
