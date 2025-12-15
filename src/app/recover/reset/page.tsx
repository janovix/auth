import { ResetPasswordView } from "@/components/auth/ResetPasswordView";
import type { Metadata } from "next";

type PageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getToken = (params?: Record<string, string | string[] | undefined>) => {
	if (!params) {
		return null;
	}

	const value = params.token;
	return typeof value === "string" ? value : null;
};

export const metadata: Metadata = {
	title: "Restablecer contraseña | Janovix Auth",
	description:
		"Define una nueva contraseña usando el token de restablecimiento emitido por auth-core.",
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
	const resolvedParams = await searchParams;
	return <ResetPasswordView token={getToken(resolvedParams)} />;
}
