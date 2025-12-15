interface ErrorLike {
	message?: string;
	error?: ErrorLike | string;
	status?: number;
	statusText?: string;
	issues?: Array<{ message?: string }>;
	[key: string]: unknown;
}

const FALLBACK_MESSAGE =
	"No pudimos completar la acción con auth-core. Intenta nuevamente en unos segundos.";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const pickMessage = (value: unknown): string | undefined => {
	if (!value) {
		return undefined;
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}

	if (value instanceof Error) {
		return value.message?.trim() ?? undefined;
	}

	if (!isRecord(value)) {
		return undefined;
	}

	const candidate = (value as ErrorLike).message;
	if (typeof candidate === "string" && candidate.trim().length > 0) {
		return candidate.trim();
	}

	const nested = (value as ErrorLike).error;
	if (nested) {
		const nestedMessage = pickMessage(nested);
		if (nestedMessage) {
			return nestedMessage;
		}
	}

	const issues = (value as ErrorLike).issues;
	if (Array.isArray(issues) && issues.length > 0) {
		const issueMessage = pickMessage(issues[0]?.message);
		if (issueMessage) {
			return issueMessage;
		}
	}

	const status = (value as ErrorLike).status;
	const statusText = (value as ErrorLike).statusText;
	if (typeof status === "number" && typeof statusText === "string") {
		return `Error ${status} · ${statusText}`;
	}

	return undefined;
};

export const getAuthErrorMessage = (
	error: unknown,
	fallback = FALLBACK_MESSAGE,
) => pickMessage(error) ?? fallback;
