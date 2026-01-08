import { render, screen, act, waitFor, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
	AuroraProvider,
	useAurora,
	auroraColorPalettes,
	auroraAnimationSpeeds,
	rgbToString,
	interpolateRGB,
	interpolatePalette,
	type AuroraMode,
} from "./aurora-context";

// Test component that exposes aurora context
function TestComponent({
	onModeChange,
}: {
	onModeChange?: (mode: AuroraMode) => void;
}) {
	const { mode, setMode, currentPalette, animationSpeed } = useAurora();

	return (
		<div>
			<span data-testid="mode">{mode}</span>
			<span data-testid="animation-speed">{animationSpeed}</span>
			<span data-testid="palette-blob1-start">
				{rgbToString(currentPalette.blob1Start)}
			</span>
			<button onClick={() => setMode("error")} data-testid="set-error">
				Set Error
			</button>
			<button onClick={() => setMode("loading")} data-testid="set-loading">
				Set Loading
			</button>
			<button onClick={() => setMode("success")} data-testid="set-success">
				Set Success
			</button>
			<button onClick={() => setMode("signup")} data-testid="set-signup">
				Set Signup
			</button>
			<button onClick={() => setMode("login")} data-testid="set-login">
				Set Login
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
		it("provides default login mode", () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			expect(screen.getByTestId("mode")).toHaveTextContent("login");
		});

		it("provides default animation speed of 1", () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			expect(screen.getByTestId("animation-speed")).toHaveTextContent("1");
		});

		it("changes mode when setMode is called", async () => {
			render(
				<AuroraProvider>
					<TestComponent />
				</AuroraProvider>,
			);

			act(() => {
				screen.getByTestId("set-error").click();
			});

			expect(screen.getByTestId("mode")).toHaveTextContent("error");
		});

		it("changes animation speed for loading mode", async () => {
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
				rgbToString(auroraColorPalettes.login.blob1Start),
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

	describe("auroraColorPalettes", () => {
		it("has palettes for all modes", () => {
			const modes: AuroraMode[] = [
				"login",
				"signup",
				"error",
				"loading",
				"success",
			];

			modes.forEach((mode) => {
				expect(auroraColorPalettes[mode]).toBeDefined();
				expect(auroraColorPalettes[mode].blob1Start).toBeDefined();
				expect(auroraColorPalettes[mode].blob1End).toBeDefined();
				expect(auroraColorPalettes[mode].blob2Start).toBeDefined();
				expect(auroraColorPalettes[mode].blob2End).toBeDefined();
				expect(auroraColorPalettes[mode].blob3Start).toBeDefined();
				expect(auroraColorPalettes[mode].blob3End).toBeDefined();
			});
		});

		it("has correct purple colors for login mode", () => {
			const palette = auroraColorPalettes.login;
			// Purple-500
			expect(palette.blob1Start).toEqual({ r: 168, g: 85, b: 247 });
		});

		it("has correct pink/purple colors for signup mode", () => {
			const palette = auroraColorPalettes.signup;
			// Pink-500
			expect(palette.blob1Start).toEqual({ r: 236, g: 72, b: 153 });
		});

		it("has correct red colors for error mode", () => {
			const palette = auroraColorPalettes.error;
			// Red-500
			expect(palette.blob1Start).toEqual({ r: 239, g: 68, b: 68 });
		});

		it("has correct blue colors for loading mode", () => {
			const palette = auroraColorPalettes.loading;
			// Blue-500
			expect(palette.blob1Start).toEqual({ r: 59, g: 130, b: 246 });
		});

		it("has correct green colors for success mode", () => {
			const palette = auroraColorPalettes.success;
			// Green-500
			expect(palette.blob1Start).toEqual({ r: 34, g: 197, b: 94 });
		});
	});

	describe("auroraAnimationSpeeds", () => {
		it("has speed multiplier for all modes", () => {
			const modes: AuroraMode[] = [
				"login",
				"signup",
				"error",
				"loading",
				"success",
			];

			modes.forEach((mode) => {
				expect(typeof auroraAnimationSpeeds[mode]).toBe("number");
			});
		});

		it("has faster animation for loading mode", () => {
			// Loading should be 2x faster (0.5 multiplier)
			expect(auroraAnimationSpeeds.loading).toBe(0.5);
		});

		it("has normal animation for other modes", () => {
			expect(auroraAnimationSpeeds.login).toBe(1);
			expect(auroraAnimationSpeeds.signup).toBe(1);
			expect(auroraAnimationSpeeds.error).toBe(1);
			expect(auroraAnimationSpeeds.success).toBe(1);
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
				const palette1 = auroraColorPalettes.login;
				const palette2 = auroraColorPalettes.error;

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
