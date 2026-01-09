import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment =
	process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "development";
const isDevelopment = environment === "development";

Sentry.init({
	dsn,
	environment,
	tracesSampleRate: isDevelopment ? 1.0 : 0.2,
	enableLogs: true,
	sendDefaultPii: true,
});
