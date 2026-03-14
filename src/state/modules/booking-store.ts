import { create } from "zustand";
import { persist } from "zustand/middleware";

type BookingDraft = {
  serviceId?: string;
  issueType?: string;
  issueNotes?: string;
  addressId?: string;
  citySlug?: string;
  zoneId?: string;
  addressLine?: string;
  landmark?: string;
  floor?: string;
  lat?: number;
  lng?: number;
  contactName?: string;
  contactPhone?: string;
  paymentMethod?: "card" | "cash";
};

type BookingStore = {
  step: number;
  draft: BookingDraft;
  setStep: (step: number) => void;
  updateDraft: (partial: Partial<BookingDraft>) => void;
  resetDraft: () => void;
};

const initialDraft: BookingDraft = {
  paymentMethod: "card",
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      step: 1,
      draft: initialDraft,
      setStep: (step) => set({ step }),
      updateDraft: (partial) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...partial,
          },
        })),
      resetDraft: () => set({ step: 1, draft: initialDraft }),
    }),
    {
      name: "fixora-booking-draft",
      partialize: (state) => ({
        draft: state.draft,
      }),
    },
  ),
);
