/**
 * Build-time guard for NEXT_PUBLIC_API_URL.
 *
 * NEXT_PUBLIC_* values are INLINED into the bundle at build time, so a wrong
 * value cannot be corrected by a Cloudflare runtime variable — it ships baked
 * into the Worker. This has already broken production once: `.env.local`
 * (which Next loads in every environment, including production builds) set the
 * API URL to http://localhost:8000, so every server-rendered page on the
 * deployed Worker tried to reach the build machine and errored.
 *
 * This script fails the build early, with a readable message, instead of
 * letting that deploy succeed and break at runtime.
 *
 * It resolves the value exactly the way `next build` does — via @next/env, so
 * .env file precedence is identical rather than approximated.
 */
// @next/env is CommonJS, so it must be imported via the default export.
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;

// dev: false — resolve the env as a production build sees it.
const { combinedEnv, loadedEnvFiles } = loadEnvConfig(process.cwd(), false);

const apiUrl = combinedEnv.NEXT_PUBLIC_API_URL;
const loadedFrom = loadedEnvFiles.map((f) => f.path).join(', ') || '(none)';

function fail(problem, fix) {
  console.error(`\n✖ Build blocked: ${problem}\n`);
  console.error(`  NEXT_PUBLIC_API_URL : ${apiUrl ?? '(not set)'}`);
  console.error(`  env files loaded    : ${loadedFrom}\n`);
  console.error(`  ${fix}\n`);
  process.exit(1);
}

if (!apiUrl) {
  fail(
    'NEXT_PUBLIC_API_URL is not set.',
    'Set it in .env.production. Cloudflare runtime variables are NOT available during the build, so it must come from a committed env file.'
  );
}

let host;
try {
  host = new URL(apiUrl).hostname;
} catch {
  fail(`NEXT_PUBLIC_API_URL is not a valid URL: "${apiUrl}"`, 'Use a full absolute URL, e.g. https://si-crafts-iwcd.onrender.com');
}

// A local address here means the deployed Worker would try to reach the
// machine that ran the build.
if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local')) {
  fail(
    `NEXT_PUBLIC_API_URL points at a local address ("${apiUrl}").`,
    'A production build must use the public backend URL. Local overrides belong in .env.development (dev only) — never in .env or .env.local, which are loaded during production builds.'
  );
}

console.log(`✓ Build env OK — NEXT_PUBLIC_API_URL=${apiUrl}`);
