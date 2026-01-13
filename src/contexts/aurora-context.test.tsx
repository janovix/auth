import { render, screen, act, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
	AuroraProvider,
	useAurora,
	pageColorPalettes,
	pageBlobPositions,
	stateColorPalettes,
	stateAnimationSpeeds,
	rgbToString,
	interpolateRGB,
	interpolatePalette,
	type PageProfile,
	type StateModifier,
} from "./aurora-context";

// Test component that exposes aurora context
function TestComponent() {
	const {
		pageProfile,
		setPageProfile,
		stateModifier,
		setStateModifier,
		currentPalette,
		blobPositions,
		animationSpeed,
	} = useAurora();

	return (
		<div>
			<span data-testid="page-profile">{pageProfile}</span>
			<span data-testid="state-modifier">{stateModifier}</span>
			<span data-testid="animation-speed">{animationSpeed}</span>
			<span data-testid="palette-blob1-start">
				{rgbToString(currentPalette.blob1Start)}
			</span>
			<span data-testid="blob1-width">{blobPositions.blob1.width}</span>
			<button onClick={() => setStateModifier("error")} data-testid="set-error">
				Set Error
			</button>
			<button
				onClick={() => setStateModifier("loading")}
				data-testid="set-loading"
			>
				Set Loading
			</button>
			<button
				onClick={() => setStateModifier("success")}
				data-testid="set-success"
			>
				Set Success
			</button>
			<button
				onClick={() => setStateModifier("default")}
				data-testid="set-default"
			>
				Set Default
			</button>
			<button
				onClick={() => setPageProfile("onboarding")}
				data-testid="set-onboarding-page"
			>
				Set Onboarding Page
			</button>
			<button
				onClick={() => setPageProfile("login")}
				data-testid="set-login-page"
			>
				Set Login Page
			</button>
		</div>
	);
}

describe("aurora-context", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	describe("AuroraProvider", () => {
		it("provides default login page profile", () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			expect(screen.getByTestId("page-profile")).toHaveTextContent("login");
		});

		it("provides default state modifier", () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			expect(screen.getByTestId("state-modifier")).toHaveTextContent("default");
		});

		it("provides default animation speed of 1", () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			expect(screen.getByTestId("animation-speed")).toHaveTextContent("1");
		});

		it("changes state modifier when setStateModifier is called", () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			act(() => {
				screen.getByTestId("set-error").click();
			});

			expect(screen.getByTestId("state-modifier")).toHaveTextContent("error");
		});

		it("changes page profile when setPageProfile is called", () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			act(() => {
				screen.getByTestId("set-onboarding-page").click();
			});

			expect(screen.getByTestId("page-profile")).toHaveTextContent("onboarding");
		});

		it("changes animation speed for loading state", () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			act(() => {
				screen.getByTestId("set-loading").click();
			});

			// Loading mode has 0.5 speed (2x faster)
			expect(screen.getByTestId("animation-speed")).toHaveTextContent("0.5");
		});

		it("changes blob positions when page profile changes", () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			// Initial blob width should be login profile
			expect(screen.getByTestId("blob1-width")).toHaveTextContent(
				pageBlobPositions.login.blob1.width,
			);

			act(() => {
				screen.getByTestId("set-onboarding-page").click();
			});

			// After changing to onboarding, blob width should change
			expect(screen.getByTestId("blob1-width")).toHaveTextContent(
				pageBlobPositions.onboarding.blob1.width,
			);
		});

		it("starts with login palette colors", () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			// Initial palette should be login (purple)
			const initialColor = screen.getByTestId(
				"palette-blob1-start",
			).textContent;
			expect(initialColor).toBe(
				rgbToString(pageColorPalettes.login.blob1Start),
			);
		});
	});

	describe("useAurora", () => {
		it("throws error when used outside AuroraProvider", () => {
			// Suppress console.error for this test
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			expect(() => {
				render(<TestComponent />);
			}).toThrow("useAurora must be used within an AuroraProvider");

			consoleSpy.mockRestore();
		});
	});

	describe("pageColorPalettes", () => {
		it("has palettes for all page profiles", () => {
			const profiles: PageProfile[] = ["login", "onboarding"];

			profiles.forEach((profile) => {
				expect(pageColorPalettes[profile]).toBeDefined();
				expect(pageColorPalettes[profile].blob1Start).toBeDefined();
				expect(pageColorPalettes[profile].blob1End).toBeDefined();
				expect(pageColorPalettes[profile].blob2Start).toBeDefined();
				expect(pageColorPalettes[profile].blob2End).toBeDefined();
				expect(pageColorPalettes[profile].blob3Start).toBeDefined();
				expect(pageColorPalettes[profile].blob3End).toBeDefined();
			});
		});

		it("has correct purple colors for login page", () => {
			const palette = pageColorPalettes.login;
			// Purple-500
			expect(palette.blob1Start).toEqual({ r: 168, g: 85, b: 247 });
		});

		it("has correct blue/purple colors for onboarding page", () => {
			const palette = pageColorPalettes.onboarding;
			// Indigo-500
			expect(palette.blob1Start).toEqual({ r: 99, g: 102, b: 241 });
		});
	});

	describe("stateColorPalettes", () => {
		it("has correct red colors for error state", () => {
			const palette = stateColorPalettes.error;
			// Red-500
			expect(palette.blob1Start).toEqual({ r: 239, g: 68, b: 68 });
		});

		it("has correct blue colors for loading state", () => {
			const palette = stateColorPalettes.loading;
			// Blue-500
			expect(palette.blob1Start).toEqual({ r: 59, g: 130, b: 246 });
		});

		it("has correct green colors for success state", () => {
			const palette = stateColorPalettes.success;
			// Green-500
			expect(palette.blob1Start).toEqual({ r: 34, g: 197, b: 94 });
		});
	});

	describe("pageBlobPositions", () => {
		it("has different positions for login and onboarding", () => {
			const loginPositions = pageBlobPositions.login;
			const onboardingPositions = pageBlobPositions.onboarding;

			// Login and onboarding should have different blob1 positions
			expect(loginPositions.blob1.width).not.toBe(onboardingPositions.blob1.width);
			expect(loginPositions.blob1.left).not.toBe(onboardingPositions.blob1.left);
		});
	});

	describe("stateAnimationSpeeds", () => {
		it("has speed multiplier for all states", () => {
			const states: StateModifier[] = [
				"default",
				"error",
				"loading",
				"success",
			];

			states.forEach((state) => {
				expect(typeof stateAnimationSpeeds[state]).toBe("number");
			});
		});

		it("has faster animation for loading state", () => {
			// Loading should be 2x faster (0.5 multiplier)
			expect(stateAnimationSpeeds.loading).toBe(0.5);
		});

		it("has normal animation for other states", () => {
			expect(stateAnimationSpeeds.default).toBe(1);
			expect(stateAnimationSpeeds.error).toBe(1);
			expect(stateAnimationSpeeds.success).toBe(1);
		});
	});

	describe("utility functions", () => {
		describe("rgbToString", () => {
			it("converts RGB object to string", () => {
				expect(rgbToString({ r: 255, g: 128, b: 0 })).toBe("rgb(255, 128, 0)");
			});
		});

		describe("interpolateRGB", () => {
			it("returns first color at t=0", () => {
				const color1 = { r: 0, g: 0, b: 0 };
				const color2 = { r: 255, g: 255, b: 255 };

				expect(interpolateRGB(color1, color2, 0)).toEqual(color1);
			});

			it("returns second color at t=1", () => {
				const color1 = { r: 0, g: 0, b: 0 };
				const color2 = { r: 255, g: 255, b: 255 };

				expect(interpolateRGB(color1, color2, 1)).toEqual(color2);
			});

			it("returns midpoint color at t=0.5", () => {
				const color1 = { r: 0, g: 0, b: 0 };
				const color2 = { r: 254, g: 254, b: 254 };

				const result = interpolateRGB(color1, color2, 0.5);
				expect(result.r).toBe(127);
				expect(result.g).toBe(127);
				expect(result.b).toBe(127);
			});
		});

		describe("interpolatePalette", () => {
			it("interpolates all palette colors", () => {
				const palette1 = pageColorPalettes.login;
				const palette2 = stateColorPalettes.error;

				const result = interpolatePalette(palette1, palette2, 0.5);

				// Should have all palette properties
				expect(result.blob1Start).toBeDefined();
				expect(result.blob1End).toBeDefined();
				expect(result.blob2Start).toBeDefined();
				expect(result.blob2End).toBeDefined();
				expect(result.blob3Start).toBeDefined();
				expect(result.blob3End).toBeDefined();

				// Blob1Start should be midpoint between purple and red
				const expectedR = Math.round(
					(palette1.blob1Start.r + palette2.blob1Start.r) / 2,
				);
				expect(result.blob1Start.r).toBe(expectedR);
			});
		});
	});
});
