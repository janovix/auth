import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/headers
const mockCookieStore = {
	toString: vi.fn(),
	get: vi.fn(),
};
vi.mock("next/headers", () => ({
	cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock authCoreConfig
vi.mock("./authCoreConfig", () => ({
	getAuthCoreBaseUrl: vi.fn(() => "https://auth-svc.test.dev"),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { getServerSession, hasSessionCookie } from "./getServerSession";

describe("getServerSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it("returns null when no cookies are present", async () => {
		mockCookieStore.toString.mockReturnValue("");

		const session = await getServerSession();

		expect(session).toBeNull();
		expect(mockFetch).not.toHaveBeenCalled();
	});

	it("returns null when fetch fails", async () => {
		mockCookieStore.toString.mockReturnValue("session=abc123");
		mockFetch.mockRejectedValue(new Error("Network error"));

		const session = await getServerSession();

		expect(session).toBeNull();
	});

	it("returns null when response is not ok", async () => {
		mockCookieStore.toString.mockReturnValue("session=abc123");
		mockFetch.mockResolvedValue({
			ok: false,
			status: 401,
		});

		const session = await getServerSession();

		expect(session).toBeNull();
	});

	it("returns null when response body is empty", async () => {
		mockCookieStore.toString.mockReturnValue("session=abc123");
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(null),
		});

		const session = await getServerSession();

		expect(session).toBeNull();
	});

	it("returns null when response is missing user or session", async () => {
		mockCookieStore.toString.mockReturnValue("session=abc123");
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ user: { id: "123" } }), // Missing session
		});

		const session = await getServerSession();

		expect(session).toBeNull();
	});

	it("returns session data when fetch succeeds", async () => {
		const mockSessionData = {
			user: {
				id: "user-123",
				name: "Test User",
				email: "test@example.com",
				image: null,
				emailVerified: true,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-02T00:00:00Z",
			},
			session: {
				id: "session-123",
				userId: "user-123",
				token: "token-abc",
				expiresAt: "2024-12-31T23:59:59Z",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-02T00:00:00Z",
				ipAddress: "127.0.0.1",
				userAgent: "Test Agent",
			},
		};

		mockCookieStore.toString.mockReturnValue("session=abc123");
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockSessionData),
		});

		const session = await getServerSession();

		expect(session).not.toBeNull();
		expect(session?.user.id).toBe("user-123");
		expect(session?.user.name).toBe("Test User");
		expect(session?.session.token).toBe("token-abc");
		// Verify dates are converted to Date objects
		expect(session?.user.createdAt).toBeInstanceOf(Date);
		expect(session?.session.expiresAt).toBeInstanceOf(Date);
	});

	it("calls fetch with correct URL and headers", async () => {
		mockCookieStore.toString.mockReturnValue("better-auth.session_token=xyz");
		mockFetch.mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					user: {
						id: "1",
						name: "Test",
						email: "test@test.com",
						image: null,
						emailVerified: true,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
					session: {
						id: "1",
						userId: "1",
						token: "t",
						expiresAt: new Date().toISOString(),
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				}),
		});

		await getServerSession();

		expect(mockFetch).toHaveBeenCalledWith(
			"https://auth-svc.test.dev/api/auth/get-session",
			{
				method: "GET",
				headers: {
					cookie: "better-auth.session_token=xyz",
				},
				cache: "no-store",
			},
		);
	});
});

describe("hasSessionCookie", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns true when session cookie exists", async () => {
		mockCookieStore.get.mockReturnValue({ value: "abc123" });

		const result = await hasSessionCookie();

		expect(result).toBe(true);
		expect(mockCookieStore.get).toHaveBeenCalledWith(
			"better-auth.session_token",
		);
	});

	it("returns true when secure session cookie exists", async () => {
		mockCookieStore.get
			.mockReturnValueOnce(undefined) // First call for regular cookie
			.mockReturnValueOnce({ value: "abc123" }); // Second call for secure cookie

		const result = await hasSessionCookie();

		expect(result).toBe(true);
	});

	it("returns false when no session cookie exists", async () => {
		mockCookieStore.get.mockReturnValue(undefined);

		const result = await hasSessionCookie();

		expect(result).toBe(false);
	});
});
