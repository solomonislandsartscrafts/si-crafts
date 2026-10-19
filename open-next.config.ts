import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// Without an incremental cache the `next: { revalidate }` reads in
// src/lib/api-client.ts never persist between requests, so every page view
// re-rendered and woke the (free-tier, sleeping) Render backend.
//
// - R2 holds the ISR/fetch cache entries (binding NEXT_INC_CACHE_R2_BUCKET).
// - The regional cache in "long-lived" mode keeps hot entries in the
//   colo's Cache API so most hits never reach R2.
// - The Durable Object queue (NEXT_CACHE_DO_QUEUE) runs background
//   revalidation once an entry goes stale, so visitors get the stale page
//   instantly instead of waiting on a cold backend.
//
// No tagCache: the site only uses time-based revalidation (no
// revalidateTag / revalidatePath), so there is nothing to invalidate on demand.
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
  queue: doQueue,
});
