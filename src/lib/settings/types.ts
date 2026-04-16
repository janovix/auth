/**
 * Settings types for the auth frontend
 */

export type Theme = "light" | "dark" | "system";
export type DateFormat =
	| "MM/DD/YYYY"
	| "DD/MM/YYYY"
	| "YYYY-MM-DD"
	| "DD.MM.YYYY";
export type LanguageCode = "en" | "es";
export type ClockFormat = "12h" | "24h";

export interface PaymentMethod {
	id: string;
	type: "card" | "bank_account" | "paypal";
	label: string;
	last4?: string;
	isDefault?: boolean;
}

/**
 * Notification sound type options — mirrors SoundType in NotificationsWidget
 */
export type NotificationSoundType = "chime" | "bell" | "pop" | "ding" | "none";

/**
 * UI preferences stored in metadata
 */
export interface UIPreferences {
	sidebarCollapsed?: boolean;
	notificationSound?: boolean;
	notificationSoundType?: NotificationSoundType;
}

/**
 * Type-safe metadata for user settings
 */
export interface UserSettingsMetadata extends UIPreferences {
	[key: string]: unknown;
}

export interface UserSettings {
	id: string;
	userId: string;
	theme: Theme | null;
	timezone: string | null;
	language: LanguageCode | null;
	dateFormat: DateFormat | null;
	clockFormat: ClockFormat | null;
	avatarUrl: string | null;
	paymentMethods: PaymentMethod[];
	metadata: UserSettingsMetadata | null;
	createdAt: string;
	updatedAt: string;
}

export interface ResolvedSettings {
	theme: Theme;
	timezone: string;
	language: LanguageCode;
	dateFormat: DateFormat;
	clockFormat: ClockFormat;
	avatarUrl: string | null;
	paymentMethods: PaymentMethod[];
	sources: {
		theme: "user" | "organization" | "browser" | "default";
		timezone: "user" | "organization" | "browser" | "default";
		language: "user" | "organization" | "browser" | "default";
		dateFormat: "user" | "organization" | "default";
		clockFormat: "user" | "organization" | "default";
	};
}

export interface UpdateUserSettingsInput {
	theme?: Theme | null;
	timezone?: string | null;
	language?: LanguageCode | null;
	dateFormat?: DateFormat | null;
	clockFormat?: ClockFormat | null;
	avatarUrl?: string | null;
	paymentMethods?: PaymentMethod[];
	metadata?: UserSettingsMetadata;
}

export interface OrganizationSettings {
	id: string;
	organizationId: string;
	theme: Theme | null;
	timezone: string | null;
	language: LanguageCode | null;
	dateFormat: DateFormat | null;
	clockFormat: ClockFormat | null;
	avatarUrl: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateOrganizationSettingsInput {
	theme?: Theme | null;
	timezone?: string | null;
	language?: LanguageCode | null;
	dateFormat?: DateFormat | null;
	clockFormat?: ClockFormat | null;
	avatarUrl?: string | null;
}

export interface OrganizationMembership {
	role: "owner" | "admin" | "member";
	organizationId: string;
}

export interface SettingsApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}

/**
 * AML Compliance Settings (stored in aml-svc)
 */
export interface AmlComplianceSettings {
	id: string;
	organizationId: string;
	obligatedSubjectKey: string; // RFC (clave_sujeto_obligado) - 12 characters
	activityKey: string; // Vulnerable activity code (e.g., "VEH")
	// KYC Self-Service settings
	selfServiceMode?: "disabled" | "manual" | "automatic";
	selfServiceExpiryHours?: number;
	selfServiceRequiredSections?: string[] | null;
	/** When true (default), aml-svc emails the client when a KYC session is created. */
	selfServiceSendEmail?: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateAmlComplianceSettingsInput {
	obligatedSubjectKey?: string;
	activityKey?: string;
}

export interface UpdateSelfServiceSettingsInput {
	selfServiceMode?: "disabled" | "manual" | "automatic";
	selfServiceExpiryHours?: number;
	selfServiceRequiredSections?: string[] | null;
	selfServiceSendEmail?: boolean;
}

export interface CreateAmlComplianceSettingsInput {
	obligatedSubjectKey: string;
	activityKey: string;
}

// ============================================================================
// API Keys (organization-scoped, for third-party programmatic access)
// ============================================================================

export type ApiKeyEnvironment = "production" | "staging" | "development";

export interface ApiKey {
	id: string;
	name: string;
	keyPrefix: string;
	organizationId: string;
	environment: ApiKeyEnvironment;
	createdById: string;
	lastUsedAt: string | null;
	expiresAt: string | null;
	revokedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ApiKeyCreateResponse {
	apiKey: ApiKey;
	plainKey: string;
}

// ============================================================================
// Webhooks (organization-scoped, for receiving event notifications)
// ============================================================================

export const WEBHOOK_EVENTS = [
	"client.created",
	"client.updated",
	"client.kyc_status_changed",
	"client.watchlist_screening_complete",
	"operation.created",
	"alert.created",
	"alert.status_changed",
	"notice.generated",
	"notice.submitted",
	"kyc_session.submitted",
	"kyc_session.status_changed",
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

export interface WebhookEndpoint {
	id: string;
	organizationId: string;
	environment: ApiKeyEnvironment;
	url: string;
	description: string | null;
	events: WebhookEventType[];
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface WebhookDelivery {
	id: string;
	endpointId: string;
	organizationId: string;
	environment: string;
	eventType: string;
	status: "delivered" | "failed";
	attempts: number;
	lastAttemptAt: string | null;
	lastResponseStatus: number | null;
	lastError: string | null;
	createdAt: string;
}
