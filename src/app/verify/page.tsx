import { VerifyEmailView } from "@/components/auth/VerifyEmailView";
import type { Metadata } from "next";

type PageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
	title: "Verificar correo | Janovix Auth",
	description: "Verifica tu correo electrónico para completar el registro.",
};

const getVerificationStatus = (
	params?: Record<string, string | string[] | undefined>,
) => {
	if (!params) {
		return { success: false, error: undefined, email: undefined };
	}

	const success = params.success === "true";
	const error = typeof params.error === "string" ? params.error : undefined;
	const email = typeof params.email === "string" ? params.email : undefined;

	return { success, error, email };
};

export default async function VerifyPage({ searchParams }: PageProps) {
	const resolvedParams = await searchParams;
	const { success, error, email } = getVerificationStatus(resolvedParams);

	return <VerifyEmailView success={success} error={error} email={email} />;
}
