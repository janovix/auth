import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Logo } from "./Logo";

// Mock @/lib/settings (used by ThemeProvider)
vi.mock("@/lib/settings", () => ({
	getResolvedSettings: vi.fn().mockResolvedValue({
		theme: "light",
		language: "es",
		timezone: "UTC",
		dateFormat: "DD/MM/YYYY",
		clockFormat: "12h",
		avatarUrl: null,
		sources: {
			theme: "default",
			language: "default",
			timezone: "default",
			dateFormat: "default",
			clockFormat: "default",
		},
	}),
	updateUserSettings: vi.fn().mockResolvedValue({}),
}));

// Mock the cookies module (used by ThemeProvider)
vi.mock("@/lib/cookies", () => ({
	getCookie: vi.fn(),
	setCookie: vi.fn(),
	COOKIE_NAMES: {
		THEME: "janovix-theme",
		LANGUAGE: "janovix-lang",
	},
}));

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("Logo", () => {
	it("renders logo variant by default", () => {
		renderWithTheme(<Logo />);
		const svg = document.querySelector("svg[viewBox='0 0 102 16']");
		expect(svg).toBeInTheDocument();
	});

	it("renders icon variant when specified", () => {
		renderWithTheme(<Logo variant="icon" />);
		const svg = document.querySelector("svg[viewBox='0 0 200 200']");
		expect(svg).toBeInTheDocument();
	});

	it("applies custom className", () => {
		const { container } = renderWithTheme(<Logo className="custom-class" />);
		const wrapper = container.querySelector("div");
		expect(wrapper).toHaveClass("custom-class");
	});

	it("applies custom width and height to icon", () => {
		renderWithTheme(<Logo variant="icon" width={300} height={50} />);
		const svgs = document.querySelectorAll("svg[viewBox='0 0 200 200']");
		expect(svgs.length).toBeGreaterThan(0);
		// Check the last rendered SVG (most recent in StrictMode)
		const svg = svgs[svgs.length - 1];
		if (svg) {
			expect(svg.getAttribute("width")).toBe("300");
			expect(svg.getAttribute("height")).toBe("50");
		}
	});

	it("uses CSS custom properties for colors", () => {
		const { container } = renderWithTheme(<Logo variant="logo" />);
		const svg = container.querySelector("svg");
		expect(svg?.innerHTML).toContain("var(--logo-text-primary)");
	});
});
