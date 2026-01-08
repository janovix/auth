"use client";

import {
	createContext,
	useContext,
	useState,
	useRef,
	useCallback,
	type ReactNode,
} from "react";

export type AuroraMode =
	| "login" // purple (default)
	| "signup" // purple/pink
	| "error" // red
	| "loading" // blue (faster animation)
	| "success"; // green

interface RGB {
	r: number;
	g: number;
	b: number;
}

interface ColorPalette {
	blob1Start: RGB;
	blob1End: RGB;
	blob2Start: RGB;
	blob2End: RGB;
	blob3Start: RGB;
	blob3End: RGB;
}

interface AuroraContextType {
	mode: AuroraMode;
	setMode: (mode: AuroraMode) => void;
	currentPalette: ColorPalette;
	animationSpeed: number; // multiplier for animation duration
}

const AuroraContext = createContext<AuroraContextType | undefined>(undefined);

// Color palettes for each mode
export const auroraColorPalettes: Record<AuroraMode, ColorPalette> = {
	// Login: Pure purple
	login: {
		blob1Start: { r: 168, g: 85, b: 247 }, // purple-500
		blob1End: { r: 124, g: 58, b: 237 }, // purple-600
		blob2Start: { r: 192, g: 132, b: 252 }, // purple-400
		blob2End: { r: 168, g: 85, b: 247 }, // purple-500
		blob3Start: { r: 217, g: 70, b: 239 }, // fuchsia-500
		blob3End: { r: 168, g: 85, b: 247 }, // purple-500
	},
	// Signup: Pink + Purple mix
	signup: {
		blob1Start: { r: 236, g: 72, b: 153 }, // pink-500
		blob1End: { r: 168, g: 85, b: 247 }, // purple-500
		blob2Start: { r: 244, g: 114, b: 182 }, // pink-400
		blob2End: { r: 192, g: 132, b: 252 }, // purple-400
		blob3Start: { r: 219, g: 39, b: 119 }, // pink-600
		blob3End: { r: 168, g: 85, b: 247 }, // purple-500
	},
	// Error: Red
	error: {
		blob1Start: { r: 239, g: 68, b: 68 }, // red-500
		blob1End: { r: 185, g: 28, b: 28 }, // red-700
		blob2Start: { r: 248, g: 113, b: 113 }, // red-400
		blob2End: { r: 220, g: 38, b: 38 }, // red-600
		blob3Start: { r: 252, g: 165, b: 165 }, // red-300
		blob3End: { r: 239, g: 68, b: 68 }, // red-500
	},
	// Loading: Blue
	loading: {
		blob1Start: { r: 59, g: 130, b: 246 }, // blue-500
		blob1End: { r: 37, g: 99, b: 235 }, // blue-600
		blob2Start: { r: 96, g: 165, b: 250 }, // blue-400
		blob2End: { r: 59, g: 130, b: 246 }, // blue-500
		blob3Start: { r: 147, g: 197, b: 253 }, // blue-300
		blob3End: { r: 59, g: 130, b: 246 }, // blue-500
	},
	// Success: Green
	success: {
		blob1Start: { r: 34, g: 197, b: 94 }, // green-500
		blob1End: { r: 22, g: 163, b: 74 }, // green-600
		blob2Start: { r: 74, g: 222, b: 128 }, // green-400
		blob2End: { r: 34, g: 197, b: 94 }, // green-500
		blob3Start: { r: 134, g: 239, b: 172 }, // green-300
		blob3End: { r: 34, g: 197, b: 94 }, // green-500
	},
};

// Animation speeds for each mode (multiplier - lower = faster)
export const auroraAnimationSpeeds: Record<AuroraMode, number> = {
	login: 1,
	signup: 1,
	error: 1,
	loading: 0.5, // 2x faster
	success: 1,
};

export function interpolateRGB(color1: RGB, color2: RGB, t: number): RGB {
	return {
		r: Math.round(color1.r + (color2.r - color1.r) * t),
		g: Math.round(color1.g + (color2.g - color1.g) * t),
		b: Math.round(color1.b + (color2.b - color1.b) * t),
	};
}

export function interpolatePalette(
	palette1: ColorPalette,
	palette2: ColorPalette,
	t: number,
): ColorPalette {
	return {
		blob1Start: interpolateRGB(palette1.blob1Start, palette2.blob1Start, t),
		blob1End: interpolateRGB(palette1.blob1End, palette2.blob1End, t),
		blob2Start: interpolateRGB(palette1.blob2Start, palette2.blob2Start, t),
		blob2End: interpolateRGB(palette1.blob2End, palette2.blob2End, t),
		blob3Start: interpolateRGB(palette1.blob3Start, palette2.blob3Start, t),
		blob3End: interpolateRGB(palette1.blob3End, palette2.blob3End, t),
	};
}

export function rgbToString(rgb: RGB): string {
	return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const TRANSITION_DURATION = 600; // ms

export function AuroraProvider({ children }: { children: ReactNode }) {
	const [mode, setModeState] = useState<AuroraMode>("login");
	const [currentPalette, setCurrentPalette] = useState<ColorPalette>(
		auroraColorPalettes.login,
	);
	const [animationSpeed, setAnimationSpeed] = useState<number>(
		auroraAnimationSpeeds.login,
	);

	// Animation refs
	const animationRef = useRef<number | null>(null);
	const transitionStartTime = useRef<number | null>(null);
	const fromPalette = useRef<ColorPalette>(auroraColorPalettes.login);
	const toPalette = useRef<ColorPalette>(auroraColorPalettes.login);

	const setMode = useCallback(
		(newMode: AuroraMode) => {
			if (newMode === mode) return;

			// Cancel any ongoing animation
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}

			// Start transition from current visible palette
			fromPalette.current = currentPalette;
			toPalette.current = auroraColorPalettes[newMode];
			transitionStartTime.current = performance.now();

			// Update animation speed immediately
			setAnimationSpeed(auroraAnimationSpeeds[newMode]);
			setModeState(newMode);

			// Animate colors
			const animateTransition = (currentTime: number) => {
				if (!transitionStartTime.current) return;

				const elapsed = currentTime - transitionStartTime.current;
				const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
				const easedProgress = easeInOutCubic(progress);

				const interpolated = interpolatePalette(
					fromPalette.current,
					toPalette.current,
					easedProgress,
				);

				setCurrentPalette(interpolated);

				if (progress < 1) {
					animationRef.current = requestAnimationFrame(animateTransition);
				} else {
					setCurrentPalette(auroraColorPalettes[newMode]);
					animationRef.current = null;
				}
			};

			animationRef.current = requestAnimationFrame(animateTransition);
		},
		[mode, currentPalette],
	);

	return (
		<AuroraContext.Provider
			value={{
				mode,
				setMode,
				currentPalette,
				animationSpeed,
			}}
		>
			{children}
		</AuroraContext.Provider>
	);
}

export function useAurora() {
	const context = useContext(AuroraContext);
	if (context === undefined) {
		throw new Error("useAurora must be used within an AuroraProvider");
	}
	return context;
}
