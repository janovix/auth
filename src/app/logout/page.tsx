import { LogoutView } from "@/components/auth/LogoutView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Cerrar sesión | Janovix Auth",
	description:
		"Revoca la sesión actual en auth-core y elimina las cookies HttpOnly administradas por Better Auth.",
};

export default function LogoutPage() {
	return <LogoutView />;
}
