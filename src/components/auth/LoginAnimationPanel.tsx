"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import LightPillar from "../LightPillar";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

/**
 * LoginAnimationPanel component that:
 * - Shows LightPillar animation in the right column on larger screens
 * - Only renders client-side with smooth fade-in
 * - Shows on iOS devices (if high-end or has enough performance)
 * - Hides on low-powered devices and when reduced motion is preferred
 * - Lazy loads to avoid impacting web vitals
 */
export function LoginAnimationPanel() {
	const { theme, systemTheme } = useTheme();
	const resolvedTheme = theme === "system" ? systemTheme : theme;
	const [mounted, setMounted] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const deviceInfo = useDeviceDetection();

	// Determine if device should show animated background
	const deviceCheck = deviceInfo.hasEnoughPerformance;

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
			{/* Theme-aware background */}
			<div className="absolute inset-0 w-full h-full bg-background" />

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
