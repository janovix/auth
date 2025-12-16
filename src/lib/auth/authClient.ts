"use client";

import { createAuthClient } from "better-auth/client";

import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";

/**
 * Single point of truth for the Better Auth client. All components should use this instance
 * instead of constructing their own to ensure the base URL logic stays consistent.
 *
 * Note: We use "better-auth/client" instead of "better-auth/react" because we have a custom
 * useAuthSession hook (see useAuthSession.tsx) that wraps the nanostore-based session with
 * useSyncExternalStore for React 18+ concurrent features. This gives us more control over
 * session state management and testing. The Better Auth docs recommend "better-auth/react"
 * for simpler cases where you use authClient.useSession() directly as a React hook.
 *
 * The `credentials: "include"` option is critical for cross-origin cookie-based authentication.
 * Since the auth frontend (auth.*.janovix.workers.dev) and auth-svc (auth-svc.*.janovix.workers.dev)
 * are on different subdomains, the browser won't send cookies automatically unless we explicitly
 * request it. This ensures the session cookie is included in all requests to the auth service.
 */
export const authClient = createAuthClient({
	baseURL: getAuthCoreBaseUrl(),
	fetchOptions: {
		credentials: "include",
	},
});

export type AuthClient = typeof authClient;
