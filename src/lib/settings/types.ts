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

export interface PaymentMethod {
	id: string;
	type: "card" | "bank_account" | "paypal";
	label: string;
	last4?: string;
	isDefault?: boolean;
}

export interface UserSettings {
	id: string;
	userId: string;
	theme: Theme | null;
	timezone: string | null;
	language: LanguageCode | null;
	dateFormat: DateFormat | null;
	avatarUrl: string | null;
	paymentMethods: PaymentMethod[];
	metadata: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
}

export interface ResolvedSettings {
	theme: Theme;
	timezone: string;
	language: LanguageCode;
	dateFormat: DateFormat;
	avatarUrl: string | null;
	paymentMethods: PaymentMethod[];
	sources: {
		theme: "user" | "organization" | "browser" | "default";
		timezone: "user" | "organization" | "browser" | "default";
		language: "user" | "organization" | "browser" | "default";
		dateFormat: "user" | "organization" | "default";
	};
}

export interface UpdateUserSettingsInput {
	theme?: Theme | null;
	timezone?: string | null;
	language?: LanguageCode | null;
	dateFormat?: DateFormat | null;
	avatarUrl?: string | null;
	paymentMethods?: PaymentMethod[];
}

export interface SettingsApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}
