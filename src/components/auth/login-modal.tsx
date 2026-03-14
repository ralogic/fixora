"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiClient } from "@/services/api-client/client";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function LoginModal({ open, onClose, onSuccess }: Props) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpHint, setOtpHint] = useState<string | null>(null);

  async function sendOtp() {
    setError(null);
    setLoading(true);
    try {
      const result = await apiClient.post<{ devOtp?: string }>("/api/auth/send-otp", { phone });
      setSent(true);
      setOtpHint(result.devOtp ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError(null);
    setLoading(true);
    try {
      await apiClient.post("/api/auth/verify-otp", { phone, otp, name });
      onSuccess();
      onClose();
      setPhone("");
      setOtp("");
      setName("");
      setSent(false);
      setOtpHint(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] bg-black/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5 shadow-2xl md:left-1/2 md:top-1/2 md:h-auto md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl"
          >
            <h3 className="text-xl font-bold text-zinc-900">Login to continue</h3>
            <p className="mt-1 text-sm text-zinc-500">Phone OTP login for secure bookings.</p>

            {!sent ? (
              <div className="mt-4 space-y-3">
                <input
                  className="h-11 w-full rounded-xl border border-zinc-300 px-3"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Full name"
                />
                <input
                  className="h-11 w-full rounded-xl border border-zinc-300 px-3"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone number"
                />
                <Button onClick={sendOtp} disabled={loading || phone.trim().length < 10}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <OtpInput value={otp} onChange={setOtp} />
                {otpHint ? (
                  <p className="text-center text-xs text-zinc-500">Dev OTP: {otpHint}</p>
                ) : null}
                <Button onClick={verifyOtp} disabled={loading || otp.length < 6}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            )}

            {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
            <button onClick={onClose} className="mt-4 w-full text-sm font-medium text-zinc-500">
              Close
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
