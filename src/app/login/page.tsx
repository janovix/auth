import { redirect } from "next/navigation";

type PageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Redirect /login to / (home page) since login is now on the index route
 */
export default async function LoginPage({ searchParams }: PageProps) {
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
	const redirectUrl = queryString ? `/?${queryString}` : "/";
	redirect(redirectUrl);
}
