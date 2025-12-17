"use client";

import { atom, type WritableAtom } from "nanostores";

import type { Session, SessionSnapshot } from "./types";

/**
 * Session store type using nanostores.
 */
export type SessionStore = WritableAtom<SessionSnapshot>;

/**
 * Default session snapshot (no session).
 */
const defaultSnapshot: SessionSnapshot = {
	data: null,
	error: null,
	isPending: false,
};

/**
 * Global session store - single source of truth for client-side session state.
 */
export const sessionStore: SessionStore = atom(defaultSnapshot);

/**
 * Updates the session store with new session data.
 * Call this after successful login/signup.
 */
export function setSession(session: Session): void {
	sessionStore.set({
		data: session,
		error: null,
		isPending: false,
	});
}

/**
 * Clears the session from the store.
 * Call this after logout.
 */
export function clearSession(): void {
	sessionStore.set({
		data: null,
		error: null,
		isPending: false,
	});
}

/**
 * Sets the session store to pending state.
 */
export function setSessionPending(): void {
	sessionStore.set({
		...sessionStore.get(),
		isPending: true,
	});
}

/**
 * Sets an error on the session store.
 */
export function setSessionError(error: Error): void {
	sessionStore.set({
		data: null,
		error,
		isPending: false,
	});
}

/**
 * Creates a new session store with initial data.
 * Useful for testing.
 */
export function createSessionStore(snapshot: SessionSnapshot): SessionStore {
	return atom(snapshot);
}
