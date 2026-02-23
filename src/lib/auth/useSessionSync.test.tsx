import { renderHook, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { useSessionSync } from "./useSessionSync";
import { sessionStore, clearSession, setSession } from "./sessionStore";
import * as sessionSync from "./sessionSync";

// Mock sessionSync module
vi.mock("./sessionSync", async () => {
	const actual = await vi.importActual("./sessionSync");
	return {
		...actual,
		initSessionSync: vi.fn(),
		revalidateSession: vi.fn(),
	};
});

describe("useSessionSync", () => {
	let mockCleanup: () => void;
	let mockOnMessage: (message: sessionSync.SessionSyncMessage) => void;

	beforeEach(() => {
		// Reset session store
		clearSession();

		// Setup mock cleanup function
		mockCleanup = vi.fn();

		// Mock initSessionSync to capture the callback
		vi.mocked(sessionSync.initSessionSync).mockImplementation((callback) => {
			mockOnMessage = callback;
			return mockCleanup;
		});

		// Mock revalidateSession
		vi.mocked(sessionSync.revalidateSession).mockResolvedValue(true);

		// Setup document mock
		Object.defineProperty(document, "visibilityState", {
			writable: true,
			configurable: true,
			value: "visible",
		});

		// Mock window.location
		delete (window as any).location;
		(window as any).location = {
			href: "",
			pathname: "/",
		};

		// Clear all mocks
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("initializes session sync on mount", () => {
		renderHook(() => useSessionSync());

		expect(sessionSync.initSessionSync).toHaveBeenCalledTimes(1);
		expect(sessionSync.initSessionSync).toHaveBeenCalledWith(
			expect.any(Function),
		);
	});

	it("cleans up on unmount", () => {
		const { unmount } = renderHook(() => useSessionSync());

		unmount();

		expect(mockCleanup).toHaveBeenCalledTimes(1);
	});

	it("clears session and redirects on SESSION_SIGNED_OUT message", () => {
		// Set initial session
		setSession({
			user: {
				id: "user-123",
				name: "Test User",
				email: "test@example.com",
				image: null,
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			session: {
				id: "session-123",
				userId: "user-123",
				token: "token-123",
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		renderHook(() => useSessionSync());

		// Simulate receiving SESSION_SIGNED_OUT message
		mockOnMessage({
			type: "SESSION_SIGNED_OUT",
			timestamp: Date.now(),
		});

		// Session should be cleared
		expect(sessionStore.get().data).toBeNull();

		// Should redirect to login
		expect(window.location.href).toBe("/login");
	});

	it("does not redirect if already on login page", () => {
		(window as any).location.pathname = "/login";

		renderHook(() => useSessionSync());

		// Simulate receiving SESSION_SIGNED_OUT message
		mockOnMessage({
			type: "SESSION_SIGNED_OUT",
			timestamp: Date.now(),
		});

		// Session should be cleared
		expect(sessionStore.get().data).toBeNull();

		// Should not change href (already on login)
		expect(window.location.href).toBe("");
	});

	it("revalidates session on SESSION_UPDATED message", async () => {
		renderHook(() => useSessionSync());

		// Simulate receiving SESSION_UPDATED message
		mockOnMessage({
			type: "SESSION_UPDATED",
			timestamp: Date.now(),
		});

		await waitFor(() => {
			expect(sessionSync.revalidateSession).toHaveBeenCalledTimes(1);
		});
	});

	it("revalidates session when tab becomes visible", async () => {
		renderHook(() => useSessionSync());

		// Simulate visibilitychange event
		Object.defineProperty(document, "visibilityState", {
			value: "visible",
		});
		document.dispatchEvent(new Event("visibilitychange"));

		await waitFor(() => {
			expect(sessionSync.revalidateSession).toHaveBeenCalledTimes(1);
		});
	});

	it("does not revalidate when tab becomes hidden", async () => {
		renderHook(() => useSessionSync());

		// Simulate visibilitychange event with hidden state
		Object.defineProperty(document, "visibilityState", {
			value: "hidden",
		});
		document.dispatchEvent(new Event("visibilitychange"));

		// Wait a bit to ensure no revalidation happens
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(sessionSync.revalidateSession).not.toHaveBeenCalled();
	});

	it("throttles revalidation on rapid visibility changes", async () => {
		renderHook(() => useSessionSync());

		// Simulate multiple rapid visibility changes
		Object.defineProperty(document, "visibilityState", {
			value: "visible",
		});

		for (let i = 0; i < 5; i++) {
			document.dispatchEvent(new Event("visibilitychange"));
		}

		// Should only revalidate once due to throttling
		await waitFor(() => {
			expect(sessionSync.revalidateSession).toHaveBeenCalledTimes(1);
		});
	});

	it("redirects to login when revalidation returns false", async () => {
		vi.mocked(sessionSync.revalidateSession).mockResolvedValue(false);

		renderHook(() => useSessionSync());

		// Simulate visibilitychange event
		Object.defineProperty(document, "visibilityState", {
			value: "visible",
		});
		document.dispatchEvent(new Event("visibilitychange"));

		await waitFor(() => {
			expect(sessionSync.revalidateSession).toHaveBeenCalledTimes(1);
			expect(window.location.href).toBe("/login");
		});
	});

	it("does not redirect when revalidation returns true", async () => {
		vi.mocked(sessionSync.revalidateSession).mockResolvedValue(true);

		renderHook(() => useSessionSync());

		// Simulate visibilitychange event
		Object.defineProperty(document, "visibilityState", {
			value: "visible",
		});
		document.dispatchEvent(new Event("visibilitychange"));

		await waitFor(() => {
			expect(sessionSync.revalidateSession).toHaveBeenCalledTimes(1);
		});

		// Should not redirect
		expect(window.location.href).toBe("");
	});

	it("allows revalidation after throttle period", async () => {
		const { unmount } = renderHook(() => useSessionSync());

		// First visibility change
		Object.defineProperty(document, "visibilityState", {
			value: "visible",
		});
		document.dispatchEvent(new Event("visibilitychange"));

		await waitFor(() => {
			expect(sessionSync.revalidateSession).toHaveBeenCalledTimes(1);
		});

		// Wait for throttle period to pass (2100ms)
		await new Promise((resolve) => setTimeout(resolve, 2100));

		// Second visibility change should trigger revalidation
		document.dispatchEvent(new Event("visibilitychange"));

		await waitFor(() => {
			expect(sessionSync.revalidateSession).toHaveBeenCalledTimes(2);
		});

		unmount();
	}, 10000); // Increase timeout to 10 seconds for this test

	it("removes visibilitychange listener on unmount", () => {
		const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

		const { unmount } = renderHook(() => useSessionSync());

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			"visibilitychange",
			expect.any(Function),
		);
	});
});
