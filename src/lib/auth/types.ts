/**
 * Session user data from the auth service.
 */
export type SessionUser = {
	id: string;
	name: string;
	email: string;
	image: string | null;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * Session data from the auth service.
 */
export type SessionData = {
	id: string;
	userId: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	ipAddress?: string;
	userAgent?: string;
};

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
 * Credentials for email/password sign in.
 */
export type SignInCredentials = {
	email: string;
	password: string;
	/**
	 * Whether to remember the user (longer session).
	 * @default false
	 */
	rememberMe?: boolean;
};

/**
 * Credentials for email/password sign up.
 */
export type SignUpCredentials = {
	email: string;
	password: string;
	name: string;
	/**
	 * Optional profile image URL.
	 */
	image?: string;
};

/**
 * Result of an auth operation.
 */
export type AuthResult<T = Session> =
	| { success: true; data: T; error: null }
	| { success: false; data: null; error: Error };
