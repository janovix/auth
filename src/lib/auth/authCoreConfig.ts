const AUTH_CORE_DOMAIN_BY_ENV = {
	dev: "auth-core.janovix.algenium.dev",
	qa: "auth-svc.janovix.workers.dev",
	prod: "auth-svc.janovix.ai",
} as const;

const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const DEV_HOSTS = new Set([
	"auth.janovix.algenium.dev",
	"auth.janovix.workers.dev",
]);
const QA_HOSTS = new Set(["auth.janovix.algenium.qa"]);
const PROD_HOSTS = new Set(["auth.janovix.algenium.app"]);

const PR_PREVIEW_HOST_PATTERN = /^auth-pr-\d+\.janovix\.algenium\.dev$/i;

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

	if (PR_PREVIEW_HOST_PATTERN.test(normalizedHost)) {
		return "dev";
	}

	if (
		LOCAL_DEV_HOSTS.has(normalizedHost) ||
		DEV_HOSTS.has(normalizedHost) ||
		normalizedHost.endsWith(".janovix.algenium.dev") ||
		normalizedHost.endsWith(".janovix.workers.dev")
	) {
		return "dev";
	}

	if (
		QA_HOSTS.has(normalizedHost) ||
		normalizedHost.endsWith(".janovix.algenium.qa")
	) {
		return "qa";
	}

	if (
		PROD_HOSTS.has(normalizedHost) ||
		normalizedHost.endsWith(".janovix.algenium.app")
	) {
		return "prod";
	}

	return DEFAULT_ENVIRONMENT;
};

export const getAuthCoreBaseUrl = (host?: string) => {
	const environment = resolveAuthEnvironment(host);
	const domain = AUTH_CORE_DOMAIN_BY_ENV[environment];

	return `https://${domain}`;
};
