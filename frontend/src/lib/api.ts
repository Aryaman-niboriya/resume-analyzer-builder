/** Backend base URL. In dev defaults to localhost:5001; set VITE_API_URL in production. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:5001" : "")
).replace(/\/$/, "");

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let warmupPromise: Promise<void> | null = null;

async function warmupBackend(): Promise<void> {
  if (warmupPromise) return warmupPromise;
  warmupPromise = (async () => {
    try {
      await fetch(apiUrl("/health"), { method: "GET" });
    } catch {
      // Ignore warmup errors; retry flow handles failures.
    } finally {
      warmupPromise = null;
    }
  })();
  return warmupPromise;
}

/**
 * Fetch wrapper with light retry for Render free-tier cold starts.
 * It retries transient fetch failures and optionally warms the backend once.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  const attempts = 3;

  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      if (i === attempts - 1) throw error;
      if (i === 0) await warmupBackend();
      await sleep(1200 * (i + 1));
    }
  }

  throw new Error("Unexpected request failure");
}
