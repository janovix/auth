"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { authClient } from "@/lib/auth/authClient";
import { tryAttributeReferralFromCookie } from "@/lib/referral/actions";

/**
 * Forwards the referral cookie to auth-svc after login on app routes
 * (onboarding, settings, account). No-op if no `janovix_ref` cookie.
 */
export function ReferralAttributionClient() {
	const pathname = usePathname();

	useEffect(() => {
		const okPath =
			pathname.startsWith("/onboarding") ||
			pathname.startsWith("/settings") ||
			pathname.startsWith("/products") ||
			pathname === "/account" ||
			pathname.startsWith("/account/");

		if (!okPath) {
			return;
		}

		void (async () => {
			const session = await authClient.getSession();
			if (!session.data?.user) {
				return;
			}
			await tryAttributeReferralFromCookie();
		})();
	}, [pathname]);

	return null;
}
