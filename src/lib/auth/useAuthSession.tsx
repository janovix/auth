"use client";

import {
	createContext,
	useCallback,
	useContext,
	useSyncExternalStore,
} from "react";
import { atom } from "nanostores";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth/authClient";

type SessionStore = typeof authClient.useSession;
type SessionSnapshot = ReturnType<SessionStore["get"]>;

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
