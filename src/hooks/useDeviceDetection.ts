"use client";

import { useEffect, useState, useMemo } from "react";

export type DeviceTier = "high-end" | "low-end" | "unknown";

export interface DeviceInfo {
	isIOS: boolean;
	isMobile: boolean;
	isTablet: boolean;
	deviceTier: DeviceTier;
	hasEnoughPerformance: boolean;
}

/**
 * Hook to detect device capabilities and characteristics
 * - iOS detection (iPhone, iPad, iPod)
 * - Mobile vs Tablet detection
 * - High-end vs Low-end device classification
 * - Performance capabilities assessment
 */
export function useDeviceDetection(): DeviceInfo {
	const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
		if (typeof window === "undefined") {
			return {
				isIOS: false,
				isMobile: false,
				isTablet: false,
				deviceTier: "unknown",
				hasEnoughPerformance: false,
			};
		}

		return calculateDeviceInfo();
	});

	useEffect(() => {
		// Recalculate on mount and resize
		const updateDeviceInfo = () => {
			setDeviceInfo(calculateDeviceInfo());
		};

		updateDeviceInfo();
		window.addEventListener("resize", updateDeviceInfo);
		return () => window.removeEventListener("resize", updateDeviceInfo);
	}, []);

	return deviceInfo;
}

function calculateDeviceInfo(): DeviceInfo {
	if (typeof window === "undefined") {
		return {
			isIOS: false,
			isMobile: false,
			isTablet: false,
			deviceTier: "unknown",
			hasEnoughPerformance: false,
		};
	}

	const userAgent = navigator.userAgent;
	const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
	const isAndroid = /Android/i.test(userAgent);
	const isMobileUA =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			userAgent,
		);
	const hasTouch = "ontouchstart" in window;
	const isMobile = isMobileUA || hasTouch;

	// Detect tablet (iPad, Android tablets)
	const isTablet =
		(/iPad/i.test(userAgent) && !/iPhone/i.test(userAgent)) ||
		(/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) ||
		(window.innerWidth >= 768 && window.innerWidth < 1024 && isMobile);

	// Determine device tier
	const deviceTier = determineDeviceTier(userAgent, isIOS, isAndroid);

	// Check if device has enough performance for animations
	const hasEnoughPerformance = checkPerformanceCapabilities(deviceTier, isIOS);

	return {
		isIOS,
		isMobile,
		isTablet,
		deviceTier,
		hasEnoughPerformance,
	};
}

function determineDeviceTier(
	userAgent: string,
	isIOS: boolean,
	isAndroid: boolean,
): DeviceTier {
	// iOS device detection - check for newer models (generally high-end)
	if (isIOS) {
		// iPhone models (newer ones are high-end)
		if (/iPhone/i.test(userAgent)) {
			// iPhone 12 and later are generally high-end
			// iPhone 11 Pro/Max and later
			if (
				/iPhone1[2-9]|iPhone2[0-9]/i.test(userAgent) ||
				/iPhone11Pro/i.test(userAgent)
			) {
				return "high-end";
			}
			// iPhone X, XS, XR, 11 (mid to high-end)
			if (/iPhone1[01]|iPhoneX/i.test(userAgent)) {
				return "high-end";
			}
			// Older iPhones - check by device memory if available
			// @ts-expect-error - navigator.deviceMemory is not in all browsers
			if (navigator.deviceMemory !== undefined) {
				// @ts-expect-error
				return navigator.deviceMemory >= 3 ? "high-end" : "low-end";
			}
			// Default to high-end for iOS devices (they're generally well-optimized)
			return "high-end";
		}

		// iPad models
		if (/iPad/i.test(userAgent)) {
			// iPad Pro models are high-end
			if (/iPad.*Pro/i.test(userAgent)) {
				return "high-end";
			}
			// iPad Air and newer are generally high-end
			if (/iPad.*Air|iPad[5-9]|iPad1[0-9]/i.test(userAgent)) {
				return "high-end";
			}
			// Older iPads - check memory
			// @ts-expect-error
			if (navigator.deviceMemory !== undefined) {
				// @ts-expect-error
				return navigator.deviceMemory >= 2 ? "high-end" : "low-end";
			}
			return "high-end";
		}

		// Default iOS devices
		return "high-end";
	}

	// Android device detection
	if (isAndroid) {
		// Check device memory (if available)
		// @ts-expect-error
		if (navigator.deviceMemory !== undefined) {
			// @ts-expect-error
			const memory = navigator.deviceMemory;
			if (memory >= 6) return "high-end";
			if (memory >= 4) return "high-end";
			if (memory >= 3) return "low-end";
			return "low-end";
		}

		// Check hardware concurrency (CPU cores)
		if (navigator.hardwareConcurrency !== undefined) {
			const cores = navigator.hardwareConcurrency;
			if (cores >= 8) return "high-end";
			if (cores >= 6) return "high-end";
			if (cores >= 4) return "low-end";
			return "low-end";
		}

		// Check device pixel ratio (higher = better display, often correlates with better device)
		const dpr = window.devicePixelRatio || 1;
		if (dpr >= 3) return "high-end"; // Very high DPI (flagship devices)
		if (dpr >= 2.5) return "high-end"; // High DPI
		if (dpr >= 2) return "low-end"; // Standard retina
		return "low-end";

		// Could also check for known high-end Android brands/models
		// Samsung Galaxy S/Note series, Google Pixel, OnePlus flagships, etc.
	}

	// Desktop/other devices - check performance metrics
	// @ts-expect-error
	if (navigator.deviceMemory !== undefined) {
		// @ts-expect-error
		const memory = navigator.deviceMemory;
		if (memory >= 8) return "high-end";
		if (memory >= 4) return "high-end";
		return "low-end";
	}

	if (navigator.hardwareConcurrency !== undefined) {
		const cores = navigator.hardwareConcurrency;
		if (cores >= 8) return "high-end";
		if (cores >= 4) return "high-end";
		return "low-end";
	}

	return "unknown";
}

function checkPerformanceCapabilities(
	deviceTier: DeviceTier,
	isIOS: boolean,
): boolean {
	if (typeof window === "undefined") return false;

	// High-end devices can handle animations
	if (deviceTier === "high-end") {
		// Check for reduced motion preference
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReducedMotion) return false;

		// iOS devices are generally well-optimized, allow animations
		if (isIOS) return true;

		// For other high-end devices, check additional metrics
		// @ts-expect-error
		if (navigator.deviceMemory !== undefined) {
			// @ts-expect-error
			if (navigator.deviceMemory < 4) return false;
		}

		if (navigator.hardwareConcurrency !== undefined) {
			if (navigator.hardwareConcurrency < 4) return false;
		}

		return true;
	}

	// Low-end devices - be more conservative
	if (deviceTier === "low-end") {
		// Still allow on iOS low-end devices (they're optimized)
		if (isIOS) {
			const prefersReducedMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			return !prefersReducedMotion;
		}

		// For other low-end devices, disable animations
		return false;
	}

	// Unknown tier - conservative approach
	return false;
}
