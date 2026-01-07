import { RecoverView } from "@/components/auth/RecoverView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Recuperar acceso | Janovix",
	description: "Solicita un enlace para restablecer tu contraseña.",
};

export default function RecoverPage() {
	return <RecoverView />;
}
