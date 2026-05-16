import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

const BYPASS_HEADER = "x-e2e-turnstile-bypass";

/**
 * Server-only: resolves Turnstile site key for this request.
 * Site key is always `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (single source of truth at build).
 * When Playwright sends `x-e2e-turnstile-bypass` matching the Worker `E2E_TURNSTILE_BYPASS_SECRET`,
 * returns `null` so the client skips the widget.
 */
export async function resolveTurnstileSiteKey(): Promise<string | null> {
	const h = await headers();
	const headerVal = h.get(BYPASS_HEADER);

	let env: CloudflareEnv = {} as CloudflareEnv;
	try {
		({ env } = await getCloudflareContext({ async: true }));
	} catch {
		// Missing OpenNext dev init, SSG edge cases, etc. — no Worker bindings.
	}

	const secret = env.E2E_TURNSTILE_BYPASS_SECRET;
	if (secret && headerVal === secret) {
		return null;
	}

	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
	return siteKey && siteKey.length > 0 ? siteKey : null;
}
