/**
 * Referral program API (auth-svc)
 */
import { getAuthCoreBaseUrl } from "./auth/authCoreConfig";

const base = () => `${getAuthCoreBaseUrl()}/api/referrals`;

export type ReferralMeData = {
	code: string | null;
	shareUrl: string | null;
	successfulReferrals: number;
	recentConversions: Array<{
		maskedEmail: string;
		convertedAt: string;
		conversionType: "subscription" | "license";
	}>;
};

export async function fetchReferralMe(): Promise<{
	ok: boolean;
	data?: ReferralMeData;
	error?: string;
}> {
	try {
		const res = await fetch(`${base()}/me`, { credentials: "include" });
		const json = (await res.json()) as {
			success?: boolean;
			data?: ReferralMeData;
			error?: { message?: string };
		};
		if (!res.ok || !json.success) {
			return {
				ok: false,
				error: json.error?.message || "Failed to load referral",
			};
		}
		return { ok: true, data: json.data };
	} catch {
		return { ok: false, error: "Network error" };
	}
}

export async function generateReferralCode(): Promise<{
	ok: boolean;
	data?: { code: string; shareUrl: string };
	error?: string;
}> {
	try {
		const res = await fetch(`${base()}/generate`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		});
		const json = (await res.json()) as {
			success?: boolean;
			data?: { code: string; shareUrl: string };
			error?: { message?: string };
		};
		if (!res.ok || !json.success) {
			return {
				ok: false,
				error: json.error?.message || "Failed to generate code",
			};
		}
		return { ok: true, data: json.data };
	} catch {
		return { ok: false, error: "Network error" };
	}
}
