import { SignupView } from "@/components/auth/SignupView";
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

	const value = params.redirect_to;
	return typeof value === "string" ? value : undefined;
};

export const metadata: Metadata = {
	title: "Crear cuenta | Janovix",
	description: "Crea tu cuenta en Janovix para empezar.",
};

export default async function SignupPage({ searchParams }: PageProps) {
	const resolvedParams = await searchParams;
	return <SignupView redirectTo={getRedirect(resolvedParams)} />;
}
