"use client";

import { type ReactNode, useEffect, useState } from "react";

import { initAuthSdk } from "@/lib/auth/sdkConfig";

// Initialize SDK immediately when this module loads
initAuthSdk();

/**
 * Provider that ensures the Auth SDK is initialized before rendering children.
 *
 * This provider guarantees that:
 * 1. The SDK is initialized when this module loads (module-level call)
 * 2. Children only render after SDK is ready
 */
export function AuthSdkProvider({ children }: { children: ReactNode }) {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		// Re-initialize in case this is a client navigation
		initAuthSdk();
		setIsReady(true);
	}, []);

	// On server render, we render children immediately
	// On client, we wait for useEffect to confirm initialization
	if (typeof window === "undefined") {
		return <>{children}</>;
	}

	// On client, only render once SDK is confirmed ready
	if (!isReady) {
		return null;
	}

	return <>{children}</>;
}
