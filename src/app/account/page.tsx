import { AccountView } from "@/components/auth/AccountView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Mi sesión | Janovix Auth",
	description:
		"Consulta los datos emitidos por auth-core (usuario, sesión y cookies) para validar la integración de Better Auth.",
};

export default function AccountPage() {
	return <AccountView />;
}
