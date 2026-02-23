"use client";

import {
	createContext,
	useContext,
	useState,
	useRef,
	useCallback,
	useEffect,
	type ReactNode,
} from "react";

// Page profiles define the base aurora appearance for each page
export type PageProfile = "login" | "onboarding";

// State modifiers change colors but not blob positions
export type StateModifier = "default" | "error" | "loading" | "success";

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

interface BlobPosition {
	top?: string;
	bottom?: string;
	left?: string;
	right?: string;
	width: string;
	height: string;
}

interface BlobPositions {
	blob1: BlobPosition;
	blob2: BlobPosition;
	blob3: BlobPosition;
}

interface AuroraContextType {
	pageProfile: PageProfile;
	setPageProfile: (profile: PageProfile) => void;
	stateModifier: StateModifier;
	setStateModifier: (modifier: StateModifier) => void;
	currentPalette: ColorPalette;
	blobPositions: BlobPositions;
	animationSpeed: number;
}

const AuroraContext = createContext<AuroraContextType | undefined>(undefined);

// Color palettes for each page profile (base colors)
export const pageColorPalettes: Record<PageProfile, ColorPalette> = {
	// Login: Pure purple
	login: {
		blob1Start: { r: 168, g: 85, b: 247 }, // purple-500
		blob1End: { r: 124, g: 58, b: 237 }, // purple-600
		blob2Start: { r: 192, g: 132, b: 252 }, // purple-400
		blob2End: { r: 168, g: 85, b: 247 }, // purple-500
		blob3Start: { r: 217, g: 70, b: 239 }, // fuchsia-500
		blob3End: { r: 168, g: 85, b: 247 }, // purple-500
	},
	// Onboarding: Blue + Purple - welcoming and professional
	onboarding: {
		blob1Start: { r: 99, g: 102, b: 241 }, // indigo-500
		blob1End: { r: 79, g: 70, b: 229 }, // indigo-600
		blob2Start: { r: 139, g: 92, b: 246 }, // violet-500
		blob2End: { r: 147, g: 51, b: 234 }, // purple-600
		blob3Start: { r: 59, g: 130, b: 246 }, // blue-500
		blob3End: { r: 99, g: 102, b: 241 }, // indigo-500
	},
};

// Blob positions for each page profile (creates different "form" for each page)
export const pageBlobPositions: Record<PageProfile, BlobPositions> = {
	// Login: Centered, balanced layout
	login: {
		blob1: { top: "-200px", left: "-100px", width: "600px", height: "600px" },
		blob2: { top: "-100px", right: "-200px", width: "500px", height: "500px" },
		blob3: { bottom: "-300px", left: "33%", width: "700px", height: "700px" },
	},
	// Onboarding: Diagonal flow - suggests progress/completion
	onboarding: {
		blob1: { top: "-100px", left: "-150px", width: "550px", height: "550px" },
		blob2: { top: "-200px", right: "-150px", width: "650px", height: "650px" },
		blob3: { bottom: "-250px", left: "40%", width: "580px", height: "580px" },
	},
};

// State modifier color palettes (override page colors for specific states)
export const stateColorPalettes: Record<
	Exclude<StateModifier, "default">,
	ColorPalette
> = {
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

// Animation speeds for each state modifier (multiplier - lower = faster)
export const stateAnimationSpeeds: Record<StateModifier, number> = {
	default: 1,
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

const COLOR_TRANSITION_DURATION = 600; // ms

export function AuroraProvider({ children }: { children: ReactNode }) {
	const [pageProfile, setPageProfileState] = useState<PageProfile>("login");
	const [stateModifier, setStateModifierState] =
		useState<StateModifier>("default");
	const [currentPalette, setCurrentPalette] = useState<ColorPalette>(
		pageColorPalettes.login,
	);
	const [blobPositions, setBlobPositions] = useState<BlobPositions>(
		pageBlobPositions.login,
	);
	const [animationSpeed, setAnimationSpeed] = useState<number>(1);

	// Animation refs
	const animationRef = useRef<number | null>(null);
	const transitionStartTime = useRef<number | null>(null);
	const fromPalette = useRef<ColorPalette>(pageColorPalettes.login);
	const toPalette = useRef<ColorPalette>(pageColorPalettes.login);

	// Get target palette based on page profile and state modifier
	const getTargetPalette = useCallback(
		(profile: PageProfile, modifier: StateModifier): ColorPalette => {
			if (modifier !== "default") {
				return stateColorPalettes[modifier];
			}
			return pageColorPalettes[profile];
		},
		[],
	);

	// Animate color transition
	const animateColorTransition = useCallback(
		(targetPalette: ColorPalette) => {
			// Cancel any ongoing animation
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}

			// Start transition from current visible palette
			fromPalette.current = currentPalette;
			toPalette.current = targetPalette;
			transitionStartTime.current = performance.now();

			const animate = (currentTime: number) => {
				if (!transitionStartTime.current) return;

				const elapsed = currentTime - transitionStartTime.current;
				const progress = Math.min(elapsed / COLOR_TRANSITION_DURATION, 1);
				const easedProgress = easeInOutCubic(progress);

				const interpolated = interpolatePalette(
					fromPalette.current,
					toPalette.current,
					easedProgress,
				);

				setCurrentPalette(interpolated);

				if (progress < 1) {
					animationRef.current = requestAnimationFrame(animate);
				} else {
					setCurrentPalette(targetPalette);
					animationRef.current = null;
				}
			};

			animationRef.current = requestAnimationFrame(animate);
		},
		[currentPalette],
	);

	// Set page profile (changes both colors and blob positions)
	const setPageProfile = useCallback(
		(profile: PageProfile) => {
			if (profile === pageProfile) return;

			setPageProfileState(profile);
			// Reset state modifier when changing pages
			setStateModifierState("default");
			setAnimationSpeed(stateAnimationSpeeds.default);

			// Update blob positions immediately (CSS transitions will handle the animation)
			setBlobPositions(pageBlobPositions[profile]);

			// Animate color change
			const targetPalette = pageColorPalettes[profile];
			animateColorTransition(targetPalette);
		},
		[pageProfile, animateColorTransition],
	);

	// Set state modifier (only changes colors, not positions)
	const setStateModifier = useCallback(
		(modifier: StateModifier) => {
			if (modifier === stateModifier) return;

			setStateModifierState(modifier);
			setAnimationSpeed(stateAnimationSpeeds[modifier]);

			// Animate color change
			const targetPalette = getTargetPalette(pageProfile, modifier);
			animateColorTransition(targetPalette);
		},
		[stateModifier, pageProfile, getTargetPalette, animateColorTransition],
	);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, []);

	return (
		<AuroraContext.Provider
			value={{
				pageProfile,
				setPageProfile,
				stateModifier,
				setStateModifier,
				currentPalette,
				blobPositions,
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

// Legacy compatibility: map old mode names to new API
export type AuroraMode =
	| "login"
	| "onboarding"
	| "error"
	| "loading"
	| "success"
	| "default";

// Export palettes for tests
export const auroraColorPalettes = {
	...pageColorPalettes,
	...stateColorPalettes,
};

export const auroraAnimationSpeeds = stateAnimationSpeeds;
