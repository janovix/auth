import { RecoverView } from "@/components/auth/RecoverView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Recuperar acceso | Janovix Auth",
	description:
		"Solicita un enlace de restablecimiento de contraseña en auth-core.",
};

export default function RecoverPage() {
	return <RecoverView />;
}
