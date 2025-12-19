import { AccountView } from "@/components/auth/AccountView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mi sesión | Janovix Auth",
	description:
		"Consulta los datos emitidos por auth-core (usuario, sesión y cookies) para validar la integración de Better Auth.",
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
