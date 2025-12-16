import { render, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { WritableAtom } from "nanostores";
import {
	AuthSessionProvider,
	createSessionStore,
	SessionHydrator,
	useAuthSession,
	type AuthSessionSnapshot,
} from "./useAuthSession";
import { authClient } from "./authClient";
import type { ServerSession } from "./getServerSession";

// Helper to cast the session store to writable for testing
const getWritableStore = () =>
	authClient.useSession as unknown as WritableAtom<AuthSessionSnapshot>;

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

	it("uses provided store when available", () => {
		const snapshot = createSnapshot({
			data: {
				user: {
					id: "user-456",
					name: "Test User 2",
					email: "test2@example.com",
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					emailVerified: false,
				},
				session: {
					id: "session-456",
					userId: "user-456",
					token: "token-456",
					createdAt: new Date(),
					updatedAt: new Date(),
					expiresAt: new Date(),
				},
			},
		});

		const store = createSessionStore(snapshot);

		const { result } = renderHook(() => useAuthSession(), {
			wrapper: ({ children }) => (
				<AuthSessionProvider store={store}>{children}</AuthSessionProvider>
			),
		});

		expect(result.current.data?.user.id).toBe("user-456");
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

describe("SessionHydrator", () => {
	const mockSession: ServerSession = {
		user: {
			id: "hydrated-user-123",
			name: "Hydrated User",
			email: "hydrated@example.com",
			image: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			emailVerified: true,
		},
		session: {
			id: "hydrated-session-123",
			userId: "hydrated-user-123",
			token: "hydrated-token",
			createdAt: new Date(),
			updatedAt: new Date(),
			expiresAt: new Date(Date.now() + 3600 * 1000),
		},
	};

	beforeEach(() => {
		// Reset the session store before each test
		getWritableStore().set({
			data: null,
			error: null,
			isPending: false,
		});
	});

	it("hydrates the session store with server session data", () => {
		render(
			<SessionHydrator session={mockSession}>
				<div>Test Child</div>
			</SessionHydrator>,
		);

		// The store should now have the hydrated session
		const storeValue = authClient.useSession.get();
		expect(storeValue.data).toEqual(mockSession);
		expect(storeValue.error).toBeNull();
		expect(storeValue.isPending).toBe(false);
	});

	it("renders children correctly", () => {
		const { getByText } = render(
			<SessionHydrator session={mockSession}>
				<div>Test Child Content</div>
			</SessionHydrator>,
		);

		expect(getByText("Test Child Content")).toBeInTheDocument();
	});

	it("does not hydrate when session is null", () => {
		// Set some existing data
		getWritableStore().set({
			data: mockSession,
			error: null,
			isPending: false,
		});

		render(
			<SessionHydrator session={null}>
				<div>Test Child</div>
			</SessionHydrator>,
		);

		// The store should still have the original data (not overwritten with null)
		const storeValue = authClient.useSession.get();
		expect(storeValue.data).toEqual(mockSession);
	});

	it("only hydrates once even with re-renders", () => {
		const store = getWritableStore();
		const setSpy = vi.spyOn(store, "set");

		const { rerender } = render(
			<SessionHydrator session={mockSession}>
				<div>Test Child</div>
			</SessionHydrator>,
		);

		// Re-render the component
		rerender(
			<SessionHydrator session={mockSession}>
				<div>Test Child Updated</div>
			</SessionHydrator>,
		);

		// Should only have been called once (on first render)
		expect(setSpy).toHaveBeenCalledTimes(1);

		setSpy.mockRestore();
	});
});
