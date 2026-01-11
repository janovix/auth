"use client";

/**
 * Settings API client for the auth frontend
 */
import { getAuthCoreBaseUrl } from "../auth/authCoreConfig";
import type {
	UserSettings,
	ResolvedSettings,
	UpdateUserSettingsInput,
	OrganizationSettings,
	UpdateOrganizationSettingsInput,
	OrganizationMembership,
	SettingsApiResponse,
	AmlComplianceSettings,
	CreateAmlComplianceSettingsInput,
	UpdateAmlComplianceSettingsInput,
} from "./types";

const getBaseUrl = () => getAuthCoreBaseUrl();

/**
 * Get current user's settings
 */
export async function getUserSettings(): Promise<UserSettings | null> {
	const response = await fetch(`${getBaseUrl()}/api/settings/user`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch user settings");
	}

	const result =
		(await response.json()) as SettingsApiResponse<UserSettings | null>;
	return result.data;
}

/**
 * Update current user's settings
 */
export async function updateUserSettings(
	input: UpdateUserSettingsInput,
): Promise<UserSettings> {
	const response = await fetch(`${getBaseUrl()}/api/settings/user`, {
		method: "PATCH",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		const errorResponse = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(errorResponse.error || "Failed to update user settings");
	}

	const result = (await response.json()) as SettingsApiResponse<UserSettings>;
	return result.data;
}

/**
 * Get resolved settings (merged from all sources)
 */
export async function getResolvedSettings(): Promise<ResolvedSettings> {
	// Encode browser hints
	const browserHints = {
		"accept-language": navigator.language,
		"x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
		"x-preferred-theme": window.matchMedia("(prefers-color-scheme: dark)")
			.matches
			? "dark"
			: "light",
	};
	const encodedHeaders = btoa(JSON.stringify(browserHints));

	const response = await fetch(
		`${getBaseUrl()}/api/settings/resolved?headers=${encodeURIComponent(encodedHeaders)}`,
		{
			credentials: "include",
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch resolved settings");
	}

	const result =
		(await response.json()) as SettingsApiResponse<ResolvedSettings>;
	return result.data;
}

/**
 * Get organization settings
 */
export async function getOrganizationSettings(
	organizationId: string,
): Promise<OrganizationSettings | null> {
	const response = await fetch(
		`${getBaseUrl()}/api/settings/organization/${organizationId}`,
		{
			credentials: "include",
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch organization settings");
	}

	const result =
		(await response.json()) as SettingsApiResponse<OrganizationSettings | null>;
	return result.data;
}

/**
 * Update organization settings (owner only)
 */
export async function updateOrganizationSettings(
	organizationId: string,
	input: UpdateOrganizationSettingsInput,
): Promise<OrganizationSettings> {
	const response = await fetch(
		`${getBaseUrl()}/api/settings/organization/${organizationId}`,
		{
			method: "PATCH",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(input),
		},
	);

	if (!response.ok) {
		const errorResponse = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(
			errorResponse.error || "Failed to update organization settings",
		);
	}

	const result =
		(await response.json()) as SettingsApiResponse<OrganizationSettings>;
	return result.data;
}

/**
 * Get user's membership/role in an organization
 */
export async function getOrganizationMembership(
	organizationId: string,
): Promise<OrganizationMembership | null> {
	const response = await fetch(
		`${getBaseUrl()}/api/settings/organization/${organizationId}/membership`,
		{
			credentials: "include",
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch organization membership");
	}

	const result =
		(await response.json()) as SettingsApiResponse<OrganizationMembership | null>;
	return result.data;
}

/**
 * Get AML compliance settings for an organization
 * (proxied through auth-svc to aml-svc)
 */
export async function getAmlComplianceSettings(
	organizationId: string,
): Promise<AmlComplianceSettings | null> {
	const response = await fetch(
		`${getBaseUrl()}/api/settings/aml-compliance/${organizationId}`,
		{
			credentials: "include",
		},
	);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error("Failed to fetch AML compliance settings");
	}

	const result =
		(await response.json()) as SettingsApiResponse<AmlComplianceSettings | null>;
	return result.data;
}

/**
 * Create or update AML compliance settings (owner/admin only)
 */
export async function createOrUpdateAmlComplianceSettings(
	organizationId: string,
	input: CreateAmlComplianceSettingsInput,
): Promise<AmlComplianceSettings> {
	const response = await fetch(
		`${getBaseUrl()}/api/settings/aml-compliance/${organizationId}`,
		{
			method: "PUT",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(input),
		},
	);

	if (!response.ok) {
		const errorResponse = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as {
			error?: string;
			details?: unknown;
		};
		throw new Error(
			errorResponse.error || "Failed to update AML compliance settings",
		);
	}

	const result =
		(await response.json()) as SettingsApiResponse<AmlComplianceSettings>;
	return result.data;
}

/**
 * Partial update AML compliance settings (owner/admin only)
 */
export async function updateAmlComplianceSettings(
	organizationId: string,
	input: UpdateAmlComplianceSettingsInput,
): Promise<AmlComplianceSettings> {
	const response = await fetch(
		`${getBaseUrl()}/api/settings/aml-compliance/${organizationId}`,
		{
			method: "PATCH",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(input),
		},
	);

	if (!response.ok) {
		const errorResponse = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as {
			error?: string;
			details?: unknown;
		};
		throw new Error(
			errorResponse.error || "Failed to update AML compliance settings",
		);
	}

	const result =
		(await response.json()) as SettingsApiResponse<AmlComplianceSettings>;
	return result.data;
}
