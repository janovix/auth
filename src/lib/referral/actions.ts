"use server";

import { cookies, headers } from "next/headers";

/**
 * Forwards the `janovix_ref` cookie to auth-svc and clears it.
 * Call once after sign-in (e.g. onboarding) so the referral is bound to the new user.
 */
export async function tryAttributeReferralFromCookie(): Promise<{
	ok: boolean;
	skipped?: boolean;
}> {
	const store = await cookies();
	const code = store.get("janovix_ref")?.value;
	if (!code) {
		return { ok: true, skipped: true };
	}

	const base = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL?.trim().replace(/\/$/, "");
	if (!base) {
		return { ok: false };
	}

	const h = await headers();
	const cookieHeader = h.get("cookie") ?? "";

	const res = await fetch(`${base}/api/referrals/attribute`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Cookie: cookieHeader,
		},
		body: JSON.stringify({ code: code.toUpperCase() }),
		cache: "no-store",
	});

	if (res.status === 401) {
		// Not signed in to auth-svc — keep the cookie for a later visit
		return { ok: false, skipped: true };
	}

	// 5xx: keep cookie to retry; 2xx/4xx with session: clear to avoid repeat sends
	if (res.ok || (res.status >= 400 && res.status < 500)) {
		store.delete("janovix_ref");
		store.delete("janovix_ref_pub");
	}

	if (!res.ok) {
		return { ok: false };
	}
	return { ok: true };
}
