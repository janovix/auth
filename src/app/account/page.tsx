import { AccountView } from "@/components/auth/AccountView";
import { getServerSession } from "@/lib/auth/getServerSession";
import { SessionHydrator } from "@/lib/auth/useAuthSession";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mi sesión | Janovix Auth",
	description:
		"Consulta los datos emitidos por auth-core (usuario, sesión y cookies) para validar la integración de Better Auth.",
};

/**
 * Account page - Server Component that fetches session before rendering.
 *
 * The session is fetched on the server and hydrated into the client-side
 * session store BEFORE AccountView renders. This eliminates the "blink"
 * effect where components first show no session then update.
 *
 * The middleware.ts already ensures only authenticated users reach this page.
 */
export default async function AccountPage() {
	const session = await getServerSession();
	return (
		<SessionHydrator session={session}>
			<AccountView />
		</SessionHydrator>
	);
}
