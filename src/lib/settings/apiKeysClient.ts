"use client";

/**
 * API Keys client for managing organization-scoped API keys.
 * Communicates with auth-svc at /api/api-keys endpoints.
 */
import { getAuthCoreBaseUrl } from "../auth/authCoreConfig";
import type {
	ApiKey,
	ApiKeyCreateResponse,
	SettingsApiResponse,
} from "./types";

const getBaseUrl = () => getAuthCoreBaseUrl();

/**
 * List all API keys for the active organization.
 * Returns key metadata (prefix, name, dates) — never the full key.
 */
export async function getApiKeys(): Promise<ApiKey[]> {
	const response = await fetch(`${getBaseUrl()}/api/api-keys`, {
		credentials: "include",
	});

	if (!response.ok) {
		const errorResponse = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(errorResponse.error || "Failed to fetch API keys");
	}

	const result = (await response.json()) as SettingsApiResponse<ApiKey[]>;
	return result.data;
}

/**
 * Create a new API key for the active organization.
 * The plain key is returned ONCE — it cannot be retrieved again.
 */
export async function createApiKey(
	name: string,
): Promise<ApiKeyCreateResponse> {
	const response = await fetch(`${getBaseUrl()}/api/api-keys`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name }),
	});

	if (!response.ok) {
		const errorResponse = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(errorResponse.error || "Failed to create API key");
	}

	const result =
		(await response.json()) as SettingsApiResponse<ApiKeyCreateResponse>;
	return result.data;
}

/**
 * Revoke an API key (soft delete).
 * Takes effect immediately — any requests using this key will be rejected.
 */
export async function revokeApiKey(id: string): Promise<ApiKey> {
	const response = await fetch(`${getBaseUrl()}/api/api-keys/${id}`, {
		method: "DELETE",
		credentials: "include",
	});

	if (!response.ok) {
		const errorResponse = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(errorResponse.error || "Failed to revoke API key");
	}

	const result = (await response.json()) as SettingsApiResponse<ApiKey>;
	return result.data;
}

/**
 * Rotate an API key: revoke the old key and create a new one.
 * The old key stops working immediately. The new plain key is shown once.
 */
export async function rotateApiKey(id: string): Promise<ApiKeyCreateResponse> {
	const response = await fetch(`${getBaseUrl()}/api/api-keys/${id}/rotate`, {
		method: "POST",
		credentials: "include",
	});

	if (!response.ok) {
		const errorResponse = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(errorResponse.error || "Failed to rotate API key");
	}

	const result =
		(await response.json()) as SettingsApiResponse<ApiKeyCreateResponse>;
	return result.data;
}
