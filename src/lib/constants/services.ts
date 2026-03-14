export const SERVICE_CATEGORIES = [
  {
    key: "electrician",
    serviceId: "svc_electrician",
    title: "Electrician",
    description: "Wiring, switches, MCB, fan and light repairs",
    basePriceInr: 299,
    etaMinutes: 30,
    color: "from-amber-400 to-orange-500",
  },
  {
    key: "plumber",
    serviceId: "svc_plumber",
    title: "Plumber",
    description: "Leak fixes, tap replacement, bathroom fittings",
    basePriceInr: 349,
    etaMinutes: 30,
    color: "from-sky-400 to-blue-600",
  },
  {
    key: "ac-repair",
    serviceId: "svc_ac_repair",
    title: "AC Repair",
    description: "Cooling issue diagnosis, gas refill, service",
    basePriceInr: 499,
    etaMinutes: 35,
    color: "from-cyan-300 to-teal-500",
  },
  {
    key: "appliance",
    serviceId: "svc_appliance",
    title: "Appliance Repair",
    description: "Washing machine, fridge, microwave support",
    basePriceInr: 399,
    etaMinutes: 40,
    color: "from-fuchsia-400 to-rose-500",
  },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
