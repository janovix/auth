import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

// Mock better-auth/cookies
const mockGetSessionCookie = vi.fn();
vi.mock("better-auth/cookies", () => ({
	getSessionCookie: (request: NextRequest) => mockGetSessionCookie(request),
}));

// Mock redirect config
vi.mock("@/lib/auth/redirectConfig", () => ({
	getDefaultRedirectUrl: () => "https://app.example.workers.dev",
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("middleware", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env = { ...originalEnv };
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
			"https://auth-svc.example.workers.dev";
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe("unauthenticated users (no cookie)", () => {
		beforeEach(() => {
			mockGetSessionCookie.mockReturnValue(null);
		});

		it("should redirect to login when accessing account routes", async () => {
			const request = new NextRequest("https://auth.example.com/account");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/login",
			);
		});

		it("should allow access to login page", async () => {
			const request = new NextRequest("https://auth.example.com/login");
			const response = await middleware(request);

			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});

		it("should allow access to register page", async () => {
			const request = new NextRequest("https://auth.example.com/register");
			const response = await middleware(request);

			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});
	});

	describe("users with valid session", () => {
		beforeEach(() => {
			mockGetSessionCookie.mockReturnValue("valid-session-token");
			mockFetch.mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({ session: { id: "123" }, user: { id: "u1" } }),
			});
		});

		it("should allow access to account routes", async () => {
			const request = new NextRequest("https://auth.example.com/account");
			const response = await middleware(request);

			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});

		it("should redirect away from login page", async () => {
			const request = new NextRequest("https://auth.example.com/login");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toContain(
				"https://app.example.workers.dev",
			);
		});

		it("should redirect away from register page", async () => {
			const request = new NextRequest("https://auth.example.com/register");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toContain(
				"https://app.example.workers.dev",
			);
		});
	});

	describe("users with invalid/expired session cookie", () => {
		beforeEach(() => {
			mockGetSessionCookie.mockReturnValue("invalid-session-token");
		});

		it("should redirect to login when session validation fails (non-200)", async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({}),
			});

			const request = new NextRequest("https://auth.example.com/account");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/login",
			);
		});

		it("should redirect to login when session data is missing", async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({}), // No session or user
			});

			const request = new NextRequest("https://auth.example.com/account");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/login",
			);
		});

		it("should redirect to login when fetch throws error", async () => {
			mockFetch.mockRejectedValue(new Error("Network error"));

			const request = new NextRequest("https://auth.example.com/account");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/login",
			);
		});

		it("should allow access to login page with invalid session", async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({}),
			});

			const request = new NextRequest("https://auth.example.com/login");
			const response = await middleware(request);

			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});
	});

	describe("fallback auth service URL", () => {
		it("should use fallback URL when env var is not set", async () => {
			delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
			mockGetSessionCookie.mockReturnValue("session-token");
			mockFetch.mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({ session: { id: "123" }, user: { id: "u1" } }),
			});

			const request = new NextRequest("https://auth.example.com/account");
			await middleware(request);

			expect(mockFetch).toHaveBeenCalledWith(
				"https://auth-svc.example.workers.dev/api/auth/get-session",
				expect.any(Object),
			);
		});
	});
});
