import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	AuthSessionProvider,
	createSessionStore,
	useAuthSession,
	type AuthSessionSnapshot,
} from "./useAuthSession";
import { atom } from "nanostores";

const createSnapshot = (
	overrides?: Partial<AuthSessionSnapshot>,
): AuthSessionSnapshot => ({
	data: null,
	error: null,
	isPending: false,
	...overrides,
});

describe("useAuthSession", () => {
	it("returns session data from store", () => {
		const snapshot = createSnapshot({
			data: {
				user: {
					id: "user-123",
					name: "Test User",
					email: "test@example.com",
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					emailVerified: true,
				},
				session: {
					id: "session-123",
					userId: "user-123",
					token: "token-123",
					createdAt: new Date(),
					updatedAt: new Date(),
					expiresAt: new Date(Date.now() + 3600 * 1000),
				},
			},
		});

		const store = createSessionStore(snapshot);

		const { result } = renderHook(() => useAuthSession(), {
			wrapper: ({ children }) => (
				<AuthSessionProvider store={store}>{children}</AuthSessionProvider>
			),
		});

		expect(result.current.data).toEqual(snapshot.data);
		expect(result.current.error).toBeNull();
		expect(result.current.isPending).toBe(false);
	});

	it("returns null data when no session exists", () => {
		const snapshot = createSnapshot();
		const store = createSessionStore(snapshot);

		const { result } = renderHook(() => useAuthSession(), {
			wrapper: ({ children }) => (
				<AuthSessionProvider store={store}>{children}</AuthSessionProvider>
			),
		});

		expect(result.current.data).toBeNull();
		expect(result.current.error).toBeNull();
		expect(result.current.isPending).toBe(false);
	});

	it("uses default store when no store is provided", () => {
		const { result } = renderHook(() => useAuthSession(), {
			wrapper: ({ children }) => (
				<AuthSessionProvider>{children}</AuthSessionProvider>
			),
		});

		// Should not throw and should return a snapshot
		expect(result.current).toBeDefined();
		expect(typeof result.current.data).toBeDefined();
	});
});

describe("createSessionStore", () => {
	it("creates a store from snapshot", () => {
		const snapshot = createSnapshot({
			data: {
				user: {
					id: "user-123",
					name: "Test",
					email: "test@example.com",
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					emailVerified: true,
				},
				session: {
					id: "session-123",
					userId: "user-123",
					token: "token",
					createdAt: new Date(),
					updatedAt: new Date(),
					expiresAt: new Date(),
				},
			},
		});

		const store = createSessionStore(snapshot);
		expect(store.get()).toEqual(snapshot);
	});
});
