import { getDataEnvironment } from "@/lib/environment-store";

function shouldAttachEnvironmentHeader(): boolean {
	if (typeof window === "undefined") return false;
	return (
		process.env.NODE_ENV !== "test" &&
		process.env.VITEST !== "true" &&
		process.env.JEST_WORKER_ID === undefined
	);
}

/**
 * Headers for requests that should respect the dashboard data environment
 * (forwarded to aml-svc via auth-svc).
 */
export function dataEnvironmentHeaders(): Record<string, string> {
	if (!shouldAttachEnvironmentHeader()) return {};
	return { "X-Environment": getDataEnvironment() };
}
