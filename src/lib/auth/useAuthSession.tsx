"use client";

import {
	createContext,
	useCallback,
	useContext,
	useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import {
	sessionStore,
	createSessionStore as createStore,
	setSession,
	clearSession,
	type SessionStore,
} from "./sessionStore";
import type { Session, SessionSnapshot } from "./types";

// Re-export for convenience
export { setSession, clearSession };
export type { SessionStore, SessionSnapshot };

/**
 * Context for custom session store (used in tests).
 */
const AuthSessionContext = createContext<SessionStore | null>(null);

/**
 * Context for server-side hydrated session.
 */
const HydratedSessionContext = createContext<Session>(null);

/**
 * Gets the session store from context or falls back to global store.
 */
const useSessionStore = () => useContext(AuthSessionContext) ?? sessionStore;

/**
 * Provider for a custom session store.
 * Mainly used for testing purposes.
 */
export const AuthSessionProvider = ({
	children,
	store,
}: {
	children: ReactNode;
	store?: SessionStore;
}) => {
	return (
		<AuthSessionContext.Provider value={store ?? sessionStore}>
			{children}
		</AuthSessionContext.Provider>
	);
};

/**
 * Provides server-side session data to child components via React Context.
 *
 * This component should wrap your app (typically in the root layout) to provide
 * the server-fetched session to all components. This ensures that `useAuthSession()`
 * returns the server data immediately, preventing the "blink" effect.
 *
 * @example
 * ```tsx
 * // In layout.tsx (Server Component)
 * import { getServerSession } from "@/lib/auth/getServerSession";
 * import { SessionHydrator } from "@/lib/auth/useAuthSession";
 *
 * export default async function RootLayout({ children }) {
 *   const session = await getServerSession();
 *
 *   return (
 *     <html>
 *       <body>
 *         <SessionHydrator session={session}>
 *           {children}
 *         </SessionHydrator>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export const SessionHydrator = ({
	children,
	session,
}: {
	children: ReactNode;
	session: Session;
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
 * 1. Client-side session store (for real-time updates after login/logout)
 * 2. Server-hydrated session from `SessionHydrator` context (prevents blink)
 *
 * @example
 * ```tsx
 * "use client";
 * import { useAuthSession } from "@/lib/auth/useAuthSession";
 *
 * export function UserGreeting() {
 *   const { data: session, isPending } = useAuthSession();
 *
 *   if (isPending) return <Spinner />;
 *   if (!session) return <p>Not logged in</p>;
 *
 *   return <p>Hello, {session.user.name}!</p>;
 * }
 * ```
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

/**
 * Creates a new session store with initial data.
 * Useful for testing.
 */
export const createSessionStore = createStore;

// Re-export types
export type { Session } from "./types";
export type AuthSessionSnapshot = SessionSnapshot;
