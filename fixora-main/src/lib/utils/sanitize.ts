export function sanitizeString(value: string) {
  return value.trim().replace(/[<>]/g, "");
}
