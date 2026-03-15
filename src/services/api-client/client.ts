const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  let result: { success?: boolean; data?: unknown; error?: { message?: string } | string } | null = null;
  try {
    result = (await response.json()) as { success?: boolean; data?: unknown; error?: { message?: string } | string };
  } catch {
    // Handle empty/non-JSON responses without crashing the UI.
  }

  if (!response.ok || !result?.success) {
    const message =
      typeof result?.error === "string"
        ? result.error
        : result?.error?.message ?? (response.ok ? "Request failed" : `Request failed (${response.status})`);
    throw new Error(message);
  }

  return result.data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};
