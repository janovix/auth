"use client";

/**
 * React hook for cross-tab and cross-app session synchronization.
 *
 * Activates three sync mechanisms:
 * 1. BroadcastChannel listener - receives instant notifications from other same-origin tabs
 * 2. visibilitychange listener - revalidates session when tab becomes visible (hidden → visible)
 * 3. focus listener - revalidates session when window gains focus (handles side-by-side windows)
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
			if (message.type === "SESSION_SIGNED_OUT") {
				// Another tab signed out - clear local state and redirect
				clearSession();

				// Full page navigation to ensure middleware runs
				if (window.location.pathname !== "/login") {
					window.location.href = "/login";
				}
			} else if (message.type === "SESSION_UPDATED") {
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
							// Check for redirect_to query parameter (same as middleware logic)
							const urlParams = new URLSearchParams(window.location.search);
							const redirectTo = urlParams.get("redirect_to");
							const redirectUrl = redirectTo || getDefaultRedirectUrl();
							window.location.href = redirectUrl;
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

				console.log(
					`[SessionSync] Tab visible - time since last revalidation: ${timeSinceLastRevalidation}ms (throttle: ${REVALIDATION_THROTTLE_MS}ms)`,
				);

				if (timeSinceLastRevalidation >= REVALIDATION_THROTTLE_MS) {
					lastRevalidationRef.current = now;

					console.log("[SessionSync] Revalidating session...");

					// Revalidate session against server
					void revalidateSession().then((isValid) => {
						console.log(`[SessionSync] Revalidation result: ${isValid}`);

						if (!isValid) {
							// Session is invalid/expired - redirect to login
							if (window.location.pathname !== "/login") {
								console.log(
									"[SessionSync] Invalid session detected, redirecting to /login",
								);
								window.location.href = "/login";
							}
						}
					});
				} else {
					console.log(
						`[SessionSync] Throttled - skipping revalidation (${REVALIDATION_THROTTLE_MS - timeSinceLastRevalidation}ms remaining)`,
					);
				}
			}
		};

		// Handle window focus (for separate windows - visibilitychange doesn't fire for side-by-side windows)
		const handleFocus = () => {
			console.log("[SessionSync] Window focused");
			// Use the same logic as visibilitychange
			handleVisibilityChange();
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("focus", handleFocus);

		// Cleanup listeners on unmount
		return () => {
			cleanupSync();
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("focus", handleFocus);
		};
	}, []); // Empty deps - only run once on mount
}
