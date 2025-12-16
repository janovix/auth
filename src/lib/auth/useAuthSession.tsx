"use client";

import {
	createContext,
	useCallback,
	useContext,
	useRef,
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

const AuthSessionContext = createContext<SessionStore | null>(null);

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
 * Hydrates the Better Auth session store with server-side fetched session data.
 *
 * This component should wrap any page/component that receives session data from
 * the server. It sets the initial session in the store BEFORE children render,
 * preventing the "blink" effect where components first show no session then update.
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
	const hydrated = useRef(false);

	// Hydrate the store only once on first render
	if (!hydrated.current && session) {
		// Set the session data directly in the authClient's session store
		// Cast to WritableSessionStore since Better Auth's types are ReadableAtom
		// but the underlying store is writable
		const store = authClient.useSession as unknown as WritableSessionStore;
		store.set({
			data: session,
			error: null,
			isPending: false,
		});
		hydrated.current = true;
	}

	return <>{children}</>;
};

export const useAuthSession = () => {
	const store = useSessionStore();

	const subscribe = useCallback(
		(listener: () => void) => store.subscribe(() => listener()),
		[store],
	);

	const getSnapshot = useCallback(() => store.get(), [store]);

	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export const createSessionStore = (snapshot: SessionSnapshot) =>
	atom(snapshot) as SessionStore;

export type AuthSessionSnapshot = SessionSnapshot;
export type AuthSessionStore = SessionStore;
