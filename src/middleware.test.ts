import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

// Mock better-auth/cookies
const mockGetSessionCookie = vi.fn();
vi.mock("better-auth/cookies", () => ({
	getSessionCookie: (request: NextRequest) => mockGetSessionCookie(request),
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
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.workers.dev";
		process.env.NEXT_PUBLIC_AML_APP_URL = "https://app.example.workers.dev";
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

		it("should redirect to login when accessing settings routes", async () => {
			const request = new NextRequest("https://auth.example.com/settings");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/login",
			);
		});

		it("should redirect to login when accessing products route", async () => {
			const request = new NextRequest("https://auth.example.com/products");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/login",
			);
		});

		it("should redirect to login when accessing onboarding route", async () => {
			const request = new NextRequest("https://auth.example.com/onboarding");
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

	describe("users with valid session, name set, and organization", () => {
		beforeEach(() => {
			mockGetSessionCookie.mockReturnValue("valid-session-token");
			// Only one fetch call needed: get-session already contains name +
			// activeOrganizationId, so the middleware skips the onboarding-status call.
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						session: { id: "123", activeOrganizationId: "org123" },
						user: { id: "u1", name: "John Doe", email: "john@example.com" },
					}),
				headers: {
					getSetCookie: () => [],
				},
			});
		});

		it("should allow access to account routes", async () => {
			const request = new NextRequest("https://auth.example.com/account");
			const response = await middleware(request);

			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});

		it("should allow access to settings routes", async () => {
			const request = new NextRequest("https://auth.example.com/settings");
			const response = await middleware(request);

			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});

		it("should allow access to products route", async () => {
			const request = new NextRequest("https://auth.example.com/products");
			const response = await middleware(request);

			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});

		it("should redirect away from login page", async () => {
			const request = new NextRequest("https://auth.example.com/login");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/products",
			);
		});

		it("should redirect away from register page", async () => {
			const request = new NextRequest("https://auth.example.com/register");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/products",
			);
		});

		it("should redirect away from onboarding page when name is set", async () => {
			const request = new NextRequest("https://auth.example.com/onboarding");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/products",
			);
		});

		it("should use redirect_to parameter when redirecting from onboarding", async () => {
			const request = new NextRequest(
				"https://auth.example.com/onboarding?redirect_to=https://custom.example.com/dashboard",
			);
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://custom.example.com/dashboard",
			);
		});

		it("should skip onboarding-status fetch when session has name and activeOrganizationId", async () => {
			const request = new NextRequest("https://auth.example.com/account");
			await middleware(request);

			// Only one fetch (get-session) — no onboarding-status call
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/api/auth/get-session"),
				expect.any(Object),
			);
		});

		it("should always fetch onboarding-status for the /invite route even when session is complete", async () => {
			// Re-mock because beforeEach only sets one mock response (fast path).
			// For /invite we need two: get-session + onboarding-status.
			mockFetch
				.mockReset()
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							session: { id: "123", activeOrganizationId: "org123" },
							user: { id: "u1", name: "John Doe", email: "john@example.com" },
						}),
					headers: { getSetCookie: () => [] },
				})
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							success: true,
							data: {
								profileComplete: true,
								hasOrganization: true,
								hasSubscription: true,
								subscriptionStatus: "active",
								plan: "business",
								pendingInvitation: {
									id: "inv1",
									organizationId: "org2",
									organizationName: "Other Org",
									organizationLogo: null,
									role: "member",
									inviterName: "Alice",
									inviterEmail: "alice@example.com",
									expiresAt: null,
								},
								canCreateOrganization: true,
							},
						}),
				});

			const request = new NextRequest("https://auth.example.com/invite");
			const response = await middleware(request);

			// Both fetches must be called — fast path is bypassed for /invite
			expect(mockFetch).toHaveBeenCalledTimes(2);
			expect(mockFetch).toHaveBeenNthCalledWith(
				2,
				expect.stringContaining("/api/subscription/onboarding-status"),
				expect.any(Object),
			);
			// User has pending invitation → allowed through (200, no redirect)
			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});
	});

	describe("users with valid session but no name (needs onboarding)", () => {
		beforeEach(() => {
			mockGetSessionCookie.mockReturnValue("valid-session-token");
			// Mock both fetch calls: first for get-session, then for onboarding-status
			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							session: { id: "123" },
							user: { id: "u1", name: null, email: "john@example.com" },
						}),
					headers: {
						getSetCookie: () => [],
					},
				})
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							success: true,
							data: {
								profileComplete: false,
								hasOrganization: false,
								hasSubscription: false,
								subscriptionStatus: null,
								plan: null,
								pendingInvitation: null,
								canCreateOrganization: false,
							},
						}),
				});
		});

		it("should redirect to onboarding from account routes", async () => {
			const request = new NextRequest("https://auth.example.com/account");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			const location = response.headers.get("location");
			expect(location).toContain("/onboarding");
			expect(location).toContain(
				"redirect_to=https%3A%2F%2Fauth.example.com%2Faccount",
			);
		});

		it("should redirect to onboarding from settings routes", async () => {
			const request = new NextRequest("https://auth.example.com/settings");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			const location = response.headers.get("location");
			expect(location).toContain("/onboarding");
			expect(location).toContain(
				"redirect_to=https%3A%2F%2Fauth.example.com%2Fsettings",
			);
		});

		it("should redirect to onboarding from login page with default redirect", async () => {
			const request = new NextRequest("https://auth.example.com/login");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			const location = response.headers.get("location");
			expect(location).toContain("/onboarding");
			expect(location).toContain(
				"redirect_to=https%3A%2F%2Fauth.example.com%2Fproducts",
			);
		});

		it("should preserve existing redirect_to when redirecting to onboarding", async () => {
			const request = new NextRequest(
				"https://auth.example.com/login?redirect_to=https://custom.example.com/app",
			);
			const response = await middleware(request);

			expect(response.status).toBe(307);
			const location = response.headers.get("location");
			expect(location).toContain("/onboarding");
			expect(location).toContain(
				"redirect_to=https%3A%2F%2Fcustom.example.com%2Fapp",
			);
		});

		it("should allow access to onboarding page when name is not set", async () => {
			const request = new NextRequest("https://auth.example.com/onboarding");
			const response = await middleware(request);

			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});

		it("should allow access to onboarding page with redirect_to param", async () => {
			const request = new NextRequest(
				"https://auth.example.com/onboarding?redirect_to=https://app.example.com",
			);
			const response = await middleware(request);

			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});
	});

	describe("users with empty name string (needs onboarding)", () => {
		beforeEach(() => {
			mockGetSessionCookie.mockReturnValue("valid-session-token");
			// Mock both fetch calls: first for get-session, then for onboarding-status
			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							session: { id: "123" },
							user: { id: "u1", name: "   ", email: "john@example.com" },
						}),
					headers: {
						getSetCookie: () => [],
					},
				})
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							success: true,
							data: {
								profileComplete: false,
								hasOrganization: false,
								hasSubscription: false,
								subscriptionStatus: null,
								plan: null,
								pendingInvitation: null,
								canCreateOrganization: false,
							},
						}),
				});
		});

		it("should redirect to onboarding when name is empty/whitespace", async () => {
			const request = new NextRequest("https://auth.example.com/account");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			const location = response.headers.get("location");
			expect(location).toContain("/onboarding");
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
				headers: {
					getSetCookie: () => [],
				},
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
				headers: {
					getSetCookie: () => [],
				},
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
				headers: {
					getSetCookie: () => [],
				},
			});

			const request = new NextRequest("https://auth.example.com/login");
			const response = await middleware(request);

			expect(response.status).toBe(200);
			expect(response.headers.get("location")).toBeNull();
		});

		it("should redirect to login from onboarding with invalid session", async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({}),
				headers: {
					getSetCookie: () => [],
				},
			});

			const request = new NextRequest("https://auth.example.com/onboarding");
			const response = await middleware(request);

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/login",
			);
		});
	});

	describe("fetch timeout behavior", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		/**
		 * Returns a mock fetch implementation that honours the AbortSignal passed
		 * via `options.signal`. The returned promise rejects with an AbortError
		 * as soon as `controller.abort()` is called, which is what the real
		 * fetch() does. Without this the fake-timer tests would hang because
		 * the plain `new Promise(() => {})` mock ignores the signal entirely.
		 */
		function hangingFetch(
			_url: string,
			options?: RequestInit,
		): Promise<Response> {
			return new Promise<Response>((_resolve, reject) => {
				options?.signal?.addEventListener("abort", () => {
					reject(new DOMException("The operation was aborted.", "AbortError"));
				});
			});
		}

		it("should redirect to login when get-session fetch hangs past 8s timeout", async () => {
			mockGetSessionCookie.mockReturnValue("valid-session-token");
			mockFetch.mockImplementation(hangingFetch);

			const request = new NextRequest("https://auth.example.com/account");
			const responsePromise = middleware(request);

			// Advance past the 8s timeout so AbortController fires → signal aborts
			await vi.advanceTimersByTimeAsync(8001);

			const response = await responsePromise;

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/login",
			);
		});

		it("should redirect to login when onboarding-status fetch hangs past 8s timeout", async () => {
			mockGetSessionCookie.mockReturnValue("valid-session-token");
			// get-session resolves immediately with a user who has no name → triggers slow path
			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							session: { id: "123" },
							user: { id: "u1", name: null, email: "john@example.com" },
						}),
					headers: { getSetCookie: () => [] },
				})
				// onboarding-status hangs indefinitely
				.mockImplementationOnce(hangingFetch);

			const request = new NextRequest("https://auth.example.com/account");
			const responsePromise = middleware(request);

			await vi.advanceTimersByTimeAsync(8001);

			const response = await responsePromise;

			expect(response.status).toBe(307);
			expect(response.headers.get("location")).toBe(
				"https://auth.example.com/login",
			);
		});
	});

	describe("auth service URL configuration", () => {
		it("should use configured URL from environment variable", async () => {
			mockGetSessionCookie.mockReturnValue("session-token");
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						session: { id: "123", activeOrganizationId: "org123" },
						user: { id: "u1", name: "John", email: "john@example.com" },
					}),
				headers: {
					getSetCookie: () => [],
				},
			});

			const request = new NextRequest("https://auth.example.com/account");
			await middleware(request);

			expect(mockFetch).toHaveBeenCalledWith(
				"https://auth-svc.example.workers.dev/api/auth/get-session",
				expect.objectContaining({
					headers: expect.objectContaining({
						Origin: "https://auth.example.workers.dev",
					}),
				}),
			);
		});
	});
});
