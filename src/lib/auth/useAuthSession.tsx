"use client";

import {
	createContext,
	useCallback,
	useContext,
	useSyncExternalStore,
} from "react";
import { atom, type WritableAtom } from "nanostores";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth/authClient";
import type { ServerSession } from "./getServerSession";

type SessionStore = typeof authClient.useSession;
type SessionSnapshot = ReturnType<SessionStore["get"]>;

// Better Auth's useSession is typed as ReadableAtom but is actually writable
type WritableSessionStore = WritableAtom<SessionSnapshot>;

// Context for custom store (used in tests)
const AuthSessionContext = createContext<SessionStore | null>(null);

// Context for server-side hydrated session
const HydratedSessionContext = createContext<ServerSession | null>(null);

const useSessionStore = () =>
	useContext(AuthSessionContext) ?? authClient.useSession;

export const AuthSessionProvider = ({
	children,
	store,
}: {
	children: ReactNode;
	store?: SessionStore;
}) => {
	return (
		<AuthSessionContext.Provider value={store ?? authClient.useSession}>
			{children}
		</AuthSessionContext.Provider>
	);
};

/**
 * Provides server-side session data to child components via React Context.
 *
 * This component should wrap any page/component that receives session data from
 * the server. It provides the session through context so that `useAuthSession()`
 * can return the server data immediately, preventing the "blink" effect.
 *
 * @example
 * ```tsx
 * // In a Server Component (page.tsx)
 * export default async function AccountPage() {
 *   const session = await getServerSession();
 *   return (
 *     <SessionHydrator session={session}>
 *       <AccountView />
 *     </SessionHydrator>
 *   );
 * }
 * ```
 */
export const SessionHydrator = ({
	children,
	session,
}: {
	children: ReactNode;
	session: ServerSession;
}) => {
	return (
		<HydratedSessionContext.Provider value={session}>
			{children}
		</HydratedSessionContext.Provider>
	);
};

/**
 * Hook to access the current auth session.
 *
 * Returns session data from one of these sources (in priority order):
 * 1. Server-hydrated session from `SessionHydrator` context (prevents blink)
 * 2. Client-side session store from Better Auth
 *
 * The server-hydrated session is used as fallback when the client store
 * doesn't have data yet, ensuring seamless SSR hydration without flicker.
 */
export const useAuthSession = (): SessionSnapshot => {
	const store = useSessionStore();
	const hydratedSession = useContext(HydratedSessionContext);

	const subscribe = useCallback(
		(listener: () => void) => store.subscribe(() => listener()),
		[store],
	);

	const getSnapshot = useCallback(() => store.get(), [store]);

	const storeSnapshot = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getSnapshot,
	);

	// If the store has data, use it (for real-time updates)
	// Otherwise, fall back to the hydrated server session
	if (storeSnapshot.data) {
		return storeSnapshot;
	}

	// Use hydrated session if store is empty but we have server data
	if (hydratedSession) {
		return {
			data: hydratedSession,
			error: null,
			isPending: false,
		};
	}

	// No session available
	return storeSnapshot;
};

export const createSessionStore = (snapshot: SessionSnapshot) =>
	atom(snapshot) as SessionStore;

// Export the writable store helper for tests
export const getWritableSessionStore = () =>
	authClient.useSession as unknown as WritableSessionStore;

export type AuthSessionSnapshot = SessionSnapshot;
export type AuthSessionStore = SessionStore;
