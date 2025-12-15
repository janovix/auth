import { LoginView } from "@/components/auth/LoginView";
import type { Metadata } from "next";

type PageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getRedirect = (
	params?: Record<string, string | string[] | undefined>,
) => {
	if (!params) {
		return undefined;
	}

	const value = params.next ?? params.redirectTo;
	return typeof value === "string" ? value : undefined;
};

const getResetSuccessMessage = (
	params?: Record<string, string | string[] | undefined>,
) => {
	if (!params) {
		return undefined;
	}

	const value = params.reset;
	if (typeof value !== "string") {
		return undefined;
	}

	return value === "success"
		? "Tu contraseña fue actualizada. Ingresa con tus nuevas credenciales."
		: undefined;
};

export const metadata: Metadata = {
	title: "Iniciar sesión | Janovix Auth",
	description:
		"Conecta con auth-core usando la librería Better Auth y cookies HttpOnly.",
};

export default async function LoginPage({ searchParams }: PageProps) {
	const resolvedParams = await searchParams;
	return (
		<LoginView
			redirectTo={getRedirect(resolvedParams)}
			defaultSuccessMessage={getResetSuccessMessage(resolvedParams)}
		/>
	);
}
