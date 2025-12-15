import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./errorMessages";

describe("getAuthErrorMessage", () => {
	it("returns the message from a string error", () => {
		expect(getAuthErrorMessage("Error message")).toBe("Error message");
	});

	it("returns the message from an Error object", () => {
		const error = new Error("Error message");
		expect(getAuthErrorMessage(error)).toBe("Error message");
	});

	it("returns the message from an error object with message property", () => {
		const error = { message: "Error message" };
		expect(getAuthErrorMessage(error)).toBe("Error message");
	});

	it("returns the message from nested error object", () => {
		const error = { error: { message: "Nested error" } };
		expect(getAuthErrorMessage(error)).toBe("Nested error");
	});

	it("returns formatted status error when message is not available", () => {
		const error = { status: 401, statusText: "Unauthorized" };
		expect(getAuthErrorMessage(error)).toBe("Error 401 · Unauthorized");
	});

	it("returns message from issues array if available", () => {
		const error = { issues: [{ message: "Validation error" }] };
		expect(getAuthErrorMessage(error)).toBe("Validation error");
	});

	it("returns fallback message for unknown error types", () => {
		expect(getAuthErrorMessage(null)).toBe(
			"No pudimos completar la acción con auth-core. Intenta nuevamente en unos segundos.",
		);
		expect(getAuthErrorMessage(undefined)).toBe(
			"No pudimos completar la acción con auth-core. Intenta nuevamente en unos segundos.",
		);
		expect(getAuthErrorMessage({})).toBe(
			"No pudimos completar la acción con auth-core. Intenta nuevamente en unos segundos.",
		);
	});

	it("uses custom fallback message when provided", () => {
		const customFallback = "Custom error message";
		expect(getAuthErrorMessage(null, customFallback)).toBe(customFallback);
	});

	it("trims whitespace from error messages", () => {
		expect(getAuthErrorMessage("  Error message  ")).toBe("Error message");
		expect(getAuthErrorMessage({ message: "  Error message  " })).toBe(
			"Error message",
		);
	});

	it("handles empty string errors", () => {
		expect(getAuthErrorMessage("")).toBe(
			"No pudimos completar la acción con auth-core. Intenta nuevamente en unos segundos.",
		);
	});
});
