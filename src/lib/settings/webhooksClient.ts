"use client";

import { getAuthCoreBaseUrl } from "../auth/authCoreConfig";
import type {
	ApiKeyEnvironment,
	SettingsApiResponse,
	WebhookDelivery,
	WebhookEndpoint,
} from "./types";

const getBaseUrl = () => getAuthCoreBaseUrl();

export async function getWebhookEndpoints(
	environment: ApiKeyEnvironment = "production",
): Promise<WebhookEndpoint[]> {
	const response = await fetch(
		`${getBaseUrl()}/api/webhooks/endpoints?environment=${environment}`,
		{ credentials: "include" },
	);
	if (!response.ok) {
		const err = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(err.error || "Failed to fetch webhook endpoints");
	}
	const result = (await response.json()) as SettingsApiResponse<
		WebhookEndpoint[]
	>;
	return result.data;
}

export async function createWebhookEndpoint(input: {
	url: string;
	events: string[];
	description?: string;
	environment: ApiKeyEnvironment;
}): Promise<WebhookEndpoint & { secret: string }> {
	const response = await fetch(`${getBaseUrl()}/api/webhooks/endpoints`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!response.ok) {
		const err = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(err.error || "Failed to create webhook endpoint");
	}
	const result = (await response.json()) as SettingsApiResponse<
		WebhookEndpoint & { secret: string }
	>;
	return result.data;
}

export async function updateWebhookEndpoint(
	id: string,
	input: {
		url?: string;
		events?: string[];
		description?: string;
		active?: boolean;
	},
): Promise<WebhookEndpoint> {
	const response = await fetch(`${getBaseUrl()}/api/webhooks/endpoints/${id}`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!response.ok) {
		const err = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(err.error || "Failed to update webhook endpoint");
	}
	const result =
		(await response.json()) as SettingsApiResponse<WebhookEndpoint>;
	return result.data;
}

export async function deleteWebhookEndpoint(id: string): Promise<void> {
	const response = await fetch(`${getBaseUrl()}/api/webhooks/endpoints/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!response.ok) {
		const err = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(err.error || "Failed to delete webhook endpoint");
	}
}

export async function getWebhookDeliveries(
	environment: ApiKeyEnvironment = "production",
): Promise<WebhookDelivery[]> {
	const response = await fetch(
		`${getBaseUrl()}/api/webhooks/deliveries?environment=${environment}`,
		{ credentials: "include" },
	);
	if (!response.ok) {
		const err = (await response
			.json()
			.catch(() => ({ error: "Unknown error" }))) as { error?: string };
		throw new Error(err.error || "Failed to fetch webhook deliveries");
	}
	const result = (await response.json()) as SettingsApiResponse<
		WebhookDelivery[]
	>;
	return result.data;
}
