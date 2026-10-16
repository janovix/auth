import { AccountView } from "@/components/auth/AccountView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mi sesión | Yenio",
	description: "Revisa tu sesión y la información de tu cuenta en Yenio.",
};

/**
 * Account page - displays user session information.
 *
 * The session is already hydrated at the root layout level,
 * so AccountView has immediate access to session data without any blink.
 * The middleware.ts ensures only authenticated users reach this page.
 */
export default function AccountPage() {
	return <AccountView />;
}
