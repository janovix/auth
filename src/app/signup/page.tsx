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
	title: "Crear cuenta | Janovix Auth",
	description:
		"Registra usuarios usando los endpoints /api/auth/* de auth-core administrados por Better Auth.",
};

export default async function SignupPage({ searchParams }: PageProps) {
	const resolvedParams = await searchParams;
	return <SignupView redirectTo={getRedirect(resolvedParams)} />;
}
