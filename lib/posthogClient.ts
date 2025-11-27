"use client";

import posthog from "posthog-js";

if (typeof window !== "undefined") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

  if (key) {
    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
    });
  }
}

export default posthog;
