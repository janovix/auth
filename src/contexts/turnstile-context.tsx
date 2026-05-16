"use client";

import * as Sentry from "@sentry/nextjs";
import {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	type ReactNode,
} from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

interface TurnstileContextValue {
	/** Cloudflare Turnstile site key (empty when provider is absent / no-op) */
	siteKey: string;
	/** Current captcha token (null if not yet verified) */
	token: string | null;
	/** Whether the captcha is currently being verified */
	isVerifying: boolean;
	/** Reset the captcha to get a new token */
	reset: () => void;
	/** Get fetch options with captcha header included */
	getCaptchaHeaders: () => Record<string, string>;
}

const TurnstileContext = createContext<TurnstileContextValue | null>(null);

interface TurnstileProviderProps {
	children: ReactNode;
	/** Cloudflare Turnstile site key */
	siteKey: string;
}

/**
 * Provider for Cloudflare Turnstile captcha
 *
 * Renders an invisible Turnstile widget that automatically verifies users
 * and provides a token for protected auth requests.
 */
export function TurnstileProvider({
	children,
	siteKey,
}: TurnstileProviderProps) {
	const [token, setToken] = useState<string | null>(null);
	const [isVerifying, setIsVerifying] = useState(true);
	const turnstileRef = useRef<TurnstileInstance>(null);

	const handleSuccess = useCallback((newToken: string) => {
		setToken(newToken);
		setIsVerifying(false);
	}, []);

	const handleExpire = useCallback(() => {
		setToken(null);
		setIsVerifying(true);
		// Auto-reset to get a new token
		turnstileRef.current?.reset();
	}, []);

	const handleError = useCallback(() => {
		setToken(null);
		setIsVerifying(false);
		Sentry.captureMessage("Turnstile verification failed", {
			level: "error",
			tags: { context: "turnstile-verification-failed" },
		});
	}, []);

	const reset = useCallback(() => {
		setToken(null);
		setIsVerifying(true);
		turnstileRef.current?.reset();
	}, []);

	const getCaptchaHeaders = useCallback((): Record<string, string> => {
		if (!token) return {};
		return { "x-captcha-response": token };
	}, [token]);

	return (
		<TurnstileContext.Provider
			value={{
				siteKey,
				token,
				isVerifying,
				reset,
				getCaptchaHeaders,
			}}
		>
			{children}
			{/* Invisible Turnstile widget - positioned off-screen with zero dimensions */}
			{siteKey ? (
				<div
					style={{
						position: "absolute",
						width: "0",
						height: "0",
						overflow: "hidden",
						visibility: "hidden",
						pointerEvents: "none",
					}}
				>
					<Turnstile
						ref={turnstileRef}
						siteKey={siteKey}
						onSuccess={handleSuccess}
						onExpire={handleExpire}
						onError={handleError}
						options={{
							size: "invisible",
							theme: "auto",
							appearance: "interaction-only",
						}}
					/>
				</div>
			) : null}
		</TurnstileContext.Provider>
	);
}

/**
 * Hook to access Turnstile captcha context
 *
 * @example
 * ```tsx
 * const { siteKey, token, getCaptchaHeaders } = useTurnstile();
 *
 * // Use with Better Auth
 * await authClient.signIn.email({
 *   email,
 *   password,
 *   fetchOptions: {
 *     headers: getCaptchaHeaders(),
 *   },
 * });
 * ```
 */
export function useTurnstile(): TurnstileContextValue {
	const context = useContext(TurnstileContext);

	if (!context) {
		// Return a no-op implementation if not wrapped in provider
		// This allows the app to work without Turnstile in development
		return {
			siteKey: "",
			token: null,
			isVerifying: false,
			reset: () => {},
			getCaptchaHeaders: () => ({}),
		};
	}

	return context;
}

/**
 * Visible Turnstile widget component for forms
 *
 * Use this when you want a visible captcha challenge
 */
export function TurnstileWidget({
	siteKey,
	onSuccess,
	onError,
	onExpire,
}: {
	siteKey: string;
	onSuccess?: (token: string) => void;
	onError?: () => void;
	onExpire?: () => void;
}) {
	return (
		<Turnstile
			siteKey={siteKey}
			onSuccess={onSuccess}
			onError={onError}
			onExpire={onExpire}
			options={{
				size: "normal",
				theme: "auto",
			}}
		/>
	);
}
