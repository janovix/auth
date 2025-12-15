import { RecoverView } from "@/components/auth/RecoverView";
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

export const metadata: Metadata = {
	title: "Recuperar acceso | Janovix Auth",
	description:
		"Solicita un enlace de restablecimiento de contraseña en auth-core.",
};

export default async function RecoverPage({ searchParams }: PageProps) {
	const resolvedParams = await searchParams;
	return <RecoverView redirectTo={getRedirect(resolvedParams)} />;
}
