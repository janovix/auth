import { AccountView } from "@/components/auth/AccountView";
import { getServerSession } from "@/lib/auth/getServerSession";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mi sesión | Janovix Auth",
	description:
		"Consulta los datos emitidos por auth-core (usuario, sesión y cookies) para validar la integración de Better Auth.",
};

/**
 * Account page - Server Component that fetches session before rendering.
 *
 * The session is fetched on the server and passed to the client component,
 * eliminating the "blink" effect where users briefly see a loading state.
 * The proxy.ts middleware already ensures only authenticated users reach this page.
 */
export default async function AccountPage() {
	const session = await getServerSession();
	return <AccountView initialSession={session} />;
}
