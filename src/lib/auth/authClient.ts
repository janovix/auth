"use client";

import { createAuthClient } from "better-auth/client";

import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";

/**
 * Single point of truth for the Better Auth client. All components should use this instance
 * instead of constructing their own to ensure the base URL logic stays consistent.
 */
export const authClient = createAuthClient({
	baseURL: getAuthCoreBaseUrl(),
});

export type AuthClient = typeof authClient;
