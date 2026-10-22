import { BetaAccessView } from "@/components/auth/BetaAccessView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Beta Access - Janovix",
	description: "Your registration is being reviewed for beta access",
};

/**
 * Beta Access page for users with "visitor" role.
 *
 * This page is shown to users who have registered but are waiting
 * for admin approval to access the platform. The middleware redirects
 * visitors here instead of to onboarding.
 *
 * The session is already hydrated at the root layout level,
 * so BetaAccessView has immediate access to session data without any blink.
 * The middleware.ts ensures only visitors reach this page.
 *
 * The page displays:
 * - A message confirming their registration was received
 * - Information about the beta phase
 * - A sign out button to return to login
 */
export default function BetaAccessPage() {
	return <BetaAccessView />;
}
