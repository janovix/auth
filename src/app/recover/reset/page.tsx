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

const getError = (params?: Record<string, string | string[] | undefined>) => {
	if (!params) {
		return null;
	}

	const value = params.error;
	return typeof value === "string" ? value : null;
};

export const metadata: Metadata = {
	title: "Restablecer contraseña | Janovix Auth",
	description:
		"Define una nueva contraseña usando el token de restablecimiento emitido por auth-core.",
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
	const resolvedParams = await searchParams;
	const token = getToken(resolvedParams);
	const error = getError(resolvedParams);

	// Better Auth redirects with ?error=INVALID_TOKEN if token is invalid/expired
	// See: https://www.better-auth.com/docs/authentication/email-password#request-password-reset
	if (error === "INVALID_TOKEN") {
		return (
			<ResetPasswordView
				token={null}
				initialError="El enlace de restablecimiento ha expirado o es inválido. Por favor, solicita un nuevo enlace."
			/>
		);
	}

	return <ResetPasswordView token={token} />;
}
