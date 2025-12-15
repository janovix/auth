const AUTH_CORE_DOMAIN_BY_ENV = {
	dev: "auth-svc.janovix.workers.dev",
	prod: "auth-svc.janovix.ai",
} as const;

const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const DEFAULT_ENVIRONMENT: AuthEnvironment = "dev";

export type AuthEnvironment = keyof typeof AUTH_CORE_DOMAIN_BY_ENV;

const normalizeHost = (host?: string) => {
	if (!host) {
		return undefined;
	}

	const cleanedHost = host.trim().toLowerCase();
	const [hostname] = cleanedHost.split(":");

	return hostname;
};

export const getRuntimeHost = () => {
	if (typeof window === "undefined") {
		return undefined;
	}

	return window.location.host;
};

export const resolveAuthEnvironment = (
	host = getRuntimeHost(),
): AuthEnvironment => {
	const normalizedHost = normalizeHost(host);

	if (!normalizedHost) {
		return DEFAULT_ENVIRONMENT;
	}

	if (
		LOCAL_DEV_HOSTS.has(normalizedHost) ||
		normalizedHost.endsWith(".janovix.workers.dev")
	) {
		return "dev";
	}

	if (normalizedHost.endsWith(".janovix.ai")) {
		return "prod";
	}

	return DEFAULT_ENVIRONMENT;
};

export const getAuthCoreBaseUrl = (host?: string) => {
	const environment = resolveAuthEnvironment(host);
	const domain = AUTH_CORE_DOMAIN_BY_ENV[environment];

	return `https://${domain}`;
};
