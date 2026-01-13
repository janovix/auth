import { OnboardingView } from "@/components/auth/OnboardingView";
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
	title: "Completa tu perfil | Janovix",
	description: "Configura tu nombre y foto de perfil para continuar.",
};

export default async function OnboardingPage({ searchParams }: PageProps) {
	const resolvedParams = await searchParams;
	return <OnboardingView redirectTo={getRedirect(resolvedParams)} />;
}
