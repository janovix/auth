import { redirect } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
	title: "Janovix Auth · Better Auth Reference",
	description:
		"UI de autenticación que consume auth-core vía Better Auth: login, registro, cierre de sesión y vista de cuenta basados en cookies HttpOnly.",
};

/**
 * Redirect / to /login preserving any query parameters
 */
export default async function HomePage({ searchParams }: PageProps) {
	const resolvedParams = await searchParams;
	const params = new URLSearchParams();

	// Preserve any query parameters
	if (resolvedParams) {
		Object.entries(resolvedParams).forEach(([key, value]) => {
			if (typeof value === "string") {
				params.set(key, value);
			} else if (Array.isArray(value)) {
				value.forEach((v) => params.append(key, v));
			}
		});
	}

	const queryString = params.toString();
	const redirectUrl = queryString ? `/login?${queryString}` : "/login";
	redirect(redirectUrl);
}
