// lib/posthogClient.ts
import posthog from "posthog-js";

let isInitialized = false;

export function initPosthog() {
  if (typeof window === "undefined") return; // only in browser
  if (isInitialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) return;

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
  });

  isInitialized = true;
}

export { posthog };
