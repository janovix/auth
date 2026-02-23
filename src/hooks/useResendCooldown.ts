"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to manage a resend cooldown timer.
 * Provides a countdown timer that prevents users from spamming resend requests.
 *
 * @returns Object with cooldown state and controls
 */
export function useResendCooldown() {
	const [secondsRemaining, setSecondsRemaining] = useState(0);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Clear interval on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	// Start the cooldown timer with a specific duration
	const startCooldown = useCallback((cooldownSeconds: number) => {
		// Clear any existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		setSecondsRemaining(cooldownSeconds);

		intervalRef.current = setInterval(() => {
			setSecondsRemaining((prev) => {
				if (prev <= 1) {
					if (intervalRef.current) {
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, []);

	// Reset the cooldown (e.g., when going back to email input)
	const resetCooldown = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setSecondsRemaining(0);
	}, []);

	return {
		/** Number of seconds remaining in the cooldown */
		secondsRemaining,
		/** Whether the cooldown is currently active */
		isOnCooldown: secondsRemaining > 0,
		/** Start the cooldown timer with a specific duration */
		startCooldown,
		/** Reset/cancel the cooldown */
		resetCooldown,
	};
}
