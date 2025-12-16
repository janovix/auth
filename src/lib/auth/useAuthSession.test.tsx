import { render, renderHook, cleanup } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
	AuthSessionProvider,
	createSessionStore,
	getWritableSessionStore,
	SessionHydrator,
	useAuthSession,
	type AuthSessionSnapshot,
} from "./useAuthSession";
import type { ServerSession } from "./getServerSession";

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
		getWritableSessionStore().set({
			data: null,
			error: null,
			isPending: false,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("provides session via context to useAuthSession hook", () => {
		// Component that uses the hook
		const SessionConsumer = () => {
			const session = useAuthSession();
			return <div data-testid="session-data">{session.data?.user.name}</div>;
		};

		const { getByTestId } = render(
			<SessionHydrator session={mockSession}>
				<SessionConsumer />
			</SessionHydrator>,
		);

		// The hook should return the hydrated session
		expect(getByTestId("session-data").textContent).toBe("Hydrated User");
	});

	it("renders children correctly", () => {
		const { getByText } = render(
			<SessionHydrator session={mockSession}>
				<div>Test Child Content</div>
			</SessionHydrator>,
		);

		expect(getByText("Test Child Content")).toBeInTheDocument();
	});

	it("useAuthSession returns empty session when hydrator has null", () => {
		const SessionConsumer = () => {
			const session = useAuthSession();
			return <div data-testid="has-data">{session.data ? "yes" : "no"}</div>;
		};

		const { getByTestId } = render(
			<SessionHydrator session={null}>
				<SessionConsumer />
			</SessionHydrator>,
		);

		expect(getByTestId("has-data").textContent).toBe("no");
	});

	it("prefers store data over hydrated session for real-time updates", () => {
		// Set some data in the store
		getWritableSessionStore().set({
			data: {
				user: {
					id: "store-user",
					name: "Store User",
					email: "store@example.com",
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					emailVerified: true,
				},
				session: {
					id: "store-session",
					userId: "store-user",
					token: "store-token",
					createdAt: new Date(),
					updatedAt: new Date(),
					expiresAt: new Date(Date.now() + 3600 * 1000),
				},
			},
			error: null,
			isPending: false,
		});

		const SessionConsumer = () => {
			const session = useAuthSession();
			return (
				<div data-testid="store-priority-user">{session.data?.user.name}</div>
			);
		};

		const { getByTestId } = render(
			<SessionHydrator session={mockSession}>
				<SessionConsumer />
			</SessionHydrator>,
		);

		// Should use store data (Store User) instead of hydrated (Hydrated User)
		expect(getByTestId("store-priority-user").textContent).toBe("Store User");
	});
});
