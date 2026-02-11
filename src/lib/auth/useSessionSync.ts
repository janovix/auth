"use client";

/**
 * React hook for cross-tab and cross-app session synchronization.
 *
 * Activates two sync mechanisms:
 * 1. BroadcastChannel listener - receives instant notifications from other same-origin tabs
 * 2. visibilitychange listener - revalidates session when tab gains focus
 *
 * Usage:
 * Call this hook once in your app's root client component (e.g., ClientLayout).
 */

import { useEffect, useRef } from "react";

import {
	initSessionSync,
	revalidateSession,
	type SessionSyncMessage,
} from "./sessionSync";
import { clearSession } from "./sessionStore";
import { getDefaultRedirectUrl } from "./redirectConfig";

/**
 * Minimum interval (ms) between revalidations triggered by visibilitychange.
 * Prevents hammering the server when rapidly switching tabs.
 */
const REVALIDATION_THROTTLE_MS = 2000;

/**
 * Hook to enable cross-tab session synchronization.
 *
 * Handles:
 * - SESSION_SIGNED_OUT from another tab -> clear local state and redirect to login
 * - SESSION_UPDATED from another tab -> revalidate to pick up changes
 * - Tab becomes visible -> revalidate session (detects cross-app sign-outs)
 *
 * @example
 * ```tsx
 * export default function ClientLayout({ children }) {
 *   useSessionSync();
 *   return <div>{children}</div>;
 * }
 * ```
 */
export function useSessionSync(): void {
	const lastRevalidationRef = useRef<number>(0);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		// Handle messages from other tabs (BroadcastChannel or localStorage)
		const handleMessage = (message: SessionSyncMessage) => {
			console.log("[useSessionSync] Handling message:", message);

			if (message.type === "SESSION_SIGNED_OUT") {
				console.log(
					"[useSessionSync] SESSION_SIGNED_OUT received - clearing session and redirecting",
				);
				// Another tab signed out - clear local state and redirect
				clearSession();

				// Full page navigation to ensure middleware runs
				if (window.location.pathname !== "/login") {
					console.log("[useSessionSync] Redirecting to /login");
					window.location.href = "/login";
				} else {
					console.log("[useSessionSync] Already on /login, skipping redirect");
				}
			} else if (message.type === "SESSION_UPDATED") {
				console.log(
					"[useSessionSync] SESSION_UPDATED received - revalidating session",
				);
				// Another tab updated the session - revalidate to pick up changes
				void revalidateSession().then((isValid) => {
					if (isValid) {
						// Session is now valid - if we're on a public auth route, redirect to app
						const publicAuthRoutes = [
							"/login",
							"/",
							"/verify",
							"/recover",
							"/beta-access",
						];
						const isOnPublicRoute = publicAuthRoutes.some((route) =>
							window.location.pathname.startsWith(route),
						);

						if (isOnPublicRoute) {
							const redirectUrl = getDefaultRedirectUrl();
							console.log(
								`[useSessionSync] Valid session detected on public route, redirecting to ${redirectUrl}`,
							);
							window.location.href = redirectUrl;
						} else {
							console.log(
								"[useSessionSync] Valid session detected, staying on current page",
							);
						}
					}
				});
			}
		};

		// Initialize BroadcastChannel and storage listeners
		const cleanupSync = initSessionSync(handleMessage);

		// Handle tab visibility changes
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				// Throttle revalidation to avoid rapid requests
				const now = Date.now();
				const timeSinceLastRevalidation = now - lastRevalidationRef.current;

				if (timeSinceLastRevalidation >= REVALIDATION_THROTTLE_MS) {
					lastRevalidationRef.current = now;

					// Revalidate session against server
					void revalidateSession().then((isValid) => {
						if (!isValid) {
							// Session is invalid/expired - redirect to login
							if (window.location.pathname !== "/login") {
								window.location.href = "/login";
							}
						}
					});
				}
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		// Cleanup listeners on unmount
		return () => {
			cleanupSync();
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []); // Empty deps - only run once on mount
}
