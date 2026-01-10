"use client";

/**
 * Audit API client for the auth frontend
 */
import { getAuthCoreBaseUrl } from "../auth/authCoreConfig";
import type {
	AuditLog,
	AuditLogFilters,
	PaginationParams,
	PaginatedResult,
	ChainIntegrityResult,
	ExportFormat,
	AuditApiResponse,
} from "./types";

const getBaseUrl = () => getAuthCoreBaseUrl();

/**
 * List audit logs with filters and pagination
 */
export async function listAuditLogs(
	filters: AuditLogFilters = {},
	pagination: PaginationParams = {},
): Promise<PaginatedResult<AuditLog>> {
	const params = new URLSearchParams();

	// Add filters
	if (filters.eventType) params.set("eventType", filters.eventType);
	if (filters.entityType) params.set("entityType", filters.entityType);
	if (filters.entityId) params.set("entityId", filters.entityId);
	if (filters.actorUserId) params.set("actorUserId", filters.actorUserId);
	if (filters.actorOrganizationId)
		params.set("actorOrganizationId", filters.actorOrganizationId);
	if (filters.sourceService) params.set("sourceService", filters.sourceService);
	if (filters.startDate) params.set("startDate", filters.startDate);
	if (filters.endDate) params.set("endDate", filters.endDate);
	if (filters.search) params.set("search", filters.search);

	// Add pagination
	if (pagination.page) params.set("page", String(pagination.page));
	if (pagination.limit) params.set("limit", String(pagination.limit));

	const response = await fetch(`${getBaseUrl()}/api/audit?${params}`, {
		credentials: "include",
	});

	if (!response.ok) {
		if (response.status === 403) {
			throw new Error("Admin access required");
		}
		throw new Error("Failed to fetch audit logs");
	}

	const result = (await response.json()) as AuditApiResponse<AuditLog[]>;
	return {
		data: result.data,
		pagination: result.pagination!,
	};
}

/**
 * Get single audit log entry
 */
export async function getAuditLog(id: string): Promise<AuditLog> {
	const response = await fetch(`${getBaseUrl()}/api/audit/${id}`, {
		credentials: "include",
	});

	if (!response.ok) {
		if (response.status === 404) {
			throw new Error("Audit log not found");
		}
		throw new Error("Failed to fetch audit log");
	}

	const result = (await response.json()) as AuditApiResponse<AuditLog>;
	return result.data;
}

/**
 * Verify chain integrity
 */
export async function verifyChainIntegrity(
	startId?: string,
	endId?: string,
	limit = 1000,
): Promise<ChainIntegrityResult> {
	const params = new URLSearchParams();
	if (startId) params.set("startId", startId);
	if (endId) params.set("endId", endId);
	params.set("limit", String(limit));

	const response = await fetch(`${getBaseUrl()}/api/audit/verify?${params}`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to verify chain integrity");
	}

	const result =
		(await response.json()) as AuditApiResponse<ChainIntegrityResult>;
	return result.data;
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(
	format: ExportFormat,
	filters: AuditLogFilters = {},
): Promise<Blob> {
	const response = await fetch(`${getBaseUrl()}/api/audit/export`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ format, filters }),
	});

	if (!response.ok) {
		throw new Error("Failed to export audit logs");
	}

	return response.blob();
}

/**
 * Download exported audit logs
 */
export async function downloadAuditLogs(
	format: ExportFormat,
	filters: AuditLogFilters = {},
): Promise<void> {
	const blob = await exportAuditLogs(format, filters);
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const filename = `audit-logs-${timestamp}.${format}`;

	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
