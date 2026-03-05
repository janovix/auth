import type { serverAuthClient } from "./serverAuthClient";

/**
 * The raw inferred session type from the Better Auth client.
 * This captures all plugin augmentations (organization, stripe, etc.)
 * automatically, so it stays in sync as plugins evolve.
 */
type InferredSession = NonNullable<typeof serverAuthClient.$Infer.Session>;

/**
 * Session user data from the auth service.
 *
 * Derived from the Better Auth client's inferred session type so that
 * plugin-augmented fields (e.g. activeOrganizationId from organizationClient)
 * are included automatically.
 *
 * `role` is added here because the admin plugin operates server-side only
 * and is not reflected in the client-side type inference.
 */
export type SessionUser = InferredSession["user"] & {
	/** User role: 'visitor' (beta waiting), 'user' (active), or 'admin' */
	role?: string;
};

/**
 * Session data from the auth service.
 * Includes organizationClient augmentations such as activeOrganizationId.
 */
export type SessionData = InferredSession["session"];

/**
 * Complete session object returned from the auth service.
 */
export type Session = {
	user: SessionUser;
	session: SessionData;
} | null;

/**
 * Session snapshot used by the useAuthSession hook.
 */
export type SessionSnapshot = {
	data: Session;
	error: Error | null;
	isPending: boolean;
};

/**
 * Result of an auth operation.
 */
export type AuthResult<T = Session> =
	| { success: true; data: T; error: null }
	| { success: false; data: null; error: Error };
