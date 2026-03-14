#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredEnv = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_JWT_SECRET",
  "OTP_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  "NEXT_PUBLIC_SOCKET_URL",
  "ALLOWED_ORIGINS",
  "SOCKET_AUTH_TOKEN",
  "EMAIL_OTP_API_URL",
  "EMAIL_OTP_API_KEY",
];

const envPath = path.join(root, ".env");
const envExamplePath = path.join(root, ".env.example");

function parseEnv(content) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0].trim());
}

function logSection(title) {
  console.log(`\n=== ${title} ===`);
}

let hasFailure = false;

logSection("Environment Files");
if (!fs.existsSync(envExamplePath)) {
  console.log("FAIL: .env.example not found");
  hasFailure = true;
} else {
  console.log("PASS: .env.example found");
}

if (!fs.existsSync(envPath)) {
  console.log("WARN: .env not found (acceptable in CI)");
} else {
  console.log("PASS: .env found");
}

logSection("Required Variables");
let availableKeys = [];
if (fs.existsSync(envPath)) {
  availableKeys = parseEnv(fs.readFileSync(envPath, "utf8"));
} else if (fs.existsSync(envExamplePath)) {
  availableKeys = parseEnv(fs.readFileSync(envExamplePath, "utf8"));
}

for (const key of requiredEnv) {
  if (availableKeys.includes(key)) {
    console.log(`PASS: ${key}`);
  } else {
    console.log(`MISSING: ${key}`);
    hasFailure = true;
  }
}

logSection("Critical Files");
const criticalFiles = [
  "prisma/schema.prisma",
  "src/app/api/book-service/route.ts",
  "src/app/api/orders/route.ts",
  "src/app/api/payments/create-intent/route.ts",
  "scripts/socket-server.mjs",
];

for (const relative of criticalFiles) {
  const full = path.join(root, relative);
  if (fs.existsSync(full)) {
    console.log(`PASS: ${relative}`);
  } else {
    console.log(`FAIL: ${relative}`);
    hasFailure = true;
  }
}

logSection("Summary");
if (hasFailure) {
  console.log("Readiness check failed. Fix missing items and rerun.");
  process.exit(1);
}

console.log("All checks passed. Project is launch-readiness baseline compliant.");
