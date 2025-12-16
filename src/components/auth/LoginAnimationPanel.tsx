"use client";

import { useEffect, useState, useMemo } from "react";
import LightPillar from "../LightPillar";

/**
 * LoginAnimationPanel component that:
 * - Shows LightPillar animation in the right column on larger screens
 * - Only renders client-side with smooth fade-in
 * - Hides on small screens, mobile devices, and low-powered devices
 * - Lazy loads to avoid impacting web vitals
 */
export function LoginAnimationPanel() {
	const [mounted, setMounted] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	// Determine if device should show animated background
	const deviceCheck = useMemo(() => {
		if (typeof window === "undefined") return false;

		// Check screen size - hide on mobile/small screens (use md breakpoint ~768px)
		const isSmallScreen = window.innerWidth < 768;
		if (isSmallScreen) return false;

		// Check for mobile device indicators
		const isMobile =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent,
			) || "ontouchstart" in window;

		if (isMobile) return false;

		// Check device memory (if available) - hide on low-powered devices
		const hasLowMemory =
			// @ts-expect-error - navigator.deviceMemory is not in all browsers
			navigator.deviceMemory !== undefined &&
			// @ts-expect-error
			navigator.deviceMemory < 4;

		if (hasLowMemory) return false;

		// Check for reduced motion preference
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		if (prefersReducedMotion) return false;

		// Check hardware concurrency (CPU cores) - hide on devices with < 4 cores
		const hasLowConcurrency =
			navigator.hardwareConcurrency !== undefined &&
			navigator.hardwareConcurrency < 4;

		if (hasLowConcurrency) return false;

		return true;
	}, []);

	useEffect(() => {
		// Mark as mounted on client
		setMounted(true);

		// Defer rendering to avoid blocking initial paint
		// Use requestIdleCallback if available, otherwise setTimeout
		const scheduleRender = () => {
			if (typeof requestIdleCallback !== "undefined") {
				requestIdleCallback(
					() => {
						if (deviceCheck) {
							setShouldRender(true);
							// Small delay for fade-in effect
							setTimeout(() => setIsVisible(true), 50);
						}
					},
					{ timeout: 2000 },
				);
			} else {
				setTimeout(() => {
					if (deviceCheck) {
						setShouldRender(true);
						setTimeout(() => setIsVisible(true), 50);
					}
				}, 100);
			}
		};

		scheduleRender();
	}, [deviceCheck]);

	// Don't render anything server-side or if device check fails
	if (!mounted || !shouldRender) {
		return null;
	}

	return (
		<div
			className="absolute inset-0 w-full h-full"
			style={{
				opacity: isVisible ? 1 : 0,
				transition: "opacity 0.8s ease-in-out",
			}}
			aria-hidden="true"
		>
			{/* Animated background - full screen */}
			<div className="absolute inset-0 w-full h-full">
				<LightPillar
					topColor="#5227FF"
					bottomColor="#FF9FFC"
					intensity={1.0}
					rotationSpeed={0.3}
					glowAmount={0.005}
					pillarWidth={3.0}
					pillarHeight={0.4}
					noiseIntensity={0.5}
					pillarRotation={0}
					interactive={false}
					mixBlendMode="normal"
				/>
			</div>
		</div>
	);
}
