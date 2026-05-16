/** Dashboard secret (not in wrangler.jsonc). Merges with OpenNext `CloudflareEnv`. */
declare global {
	interface CloudflareEnv {
		E2E_TURNSTILE_BYPASS_SECRET?: string;
	}
}

export {};
