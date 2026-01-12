/**
 * Audit types for the auth frontend
 */

export type AuditEventType =
	| "CREATE"
	| "UPDATE"
	| "DELETE"
	| "LOGIN"
	| "LOGOUT"
	| "PASSWORD_RESET"
	| "EMAIL_VERIFIED"
	| "ROLE_CHANGE"
	| "PERMISSION_CHANGE"
	| "EXPORT"
	| "IMPORT"
	| "SYSTEM";

export interface AuditLog {
	id: string;
	eventType: AuditEventType | string;
	entityType: string;
	entityId: string | null;
	actorUserId: string | null;
	actorOrganizationId: string | null;
	actorIp: string | null;
	actorUserAgent: string | null;
	previousState: Record<string, unknown> | null;
	newState: Record<string, unknown> | null;
	changeSummary: Record<string, { old: unknown; new: unknown }> | null;
	sourceService: string;
	requestId: string | null;
	metadata: Record<string, unknown> | null;
	signature: string;
	previousSignature: string | null;
	createdAt: string;
}

export interface AuditLogFilters {
	eventType?: string;
	entityType?: string;
	entityId?: string;
	actorUserId?: string;
	actorOrganizationId?: string;
	sourceService?: string;
	startDate?: string;
	endDate?: string;
	search?: string;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
}

export interface PaginatedResult<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface ChainIntegrityResult {
	valid: boolean;
	totalVerified: number;
	brokenAt?: string;
	brokenSignature?: string;
	expectedSignature?: string;
	error?: string;
}

export type ExportFormat = "json" | "csv";

export interface AuditApiResponse<T> {
	success: boolean;
	data: T;
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: string;
}
