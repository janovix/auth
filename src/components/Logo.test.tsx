import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Logo } from "./Logo";

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

	it("applies forceTheme when specified", () => {
		renderWithTheme(<Logo variant="logo" forceTheme="light" />);
		const svgs = document.querySelectorAll("svg[viewBox='0 0 102 16']");
		expect(svgs.length).toBeGreaterThan(0);
		const svg = svgs[svgs.length - 1];
		// Light theme should use dark text color (#1E2938)
		const path = svg?.querySelector("path");
		expect(path?.getAttribute("fill")).toBe("#1E2938");
	});

	it("applies dark forceTheme when specified", () => {
		renderWithTheme(<Logo variant="logo" forceTheme="dark" />);
		const svgs = document.querySelectorAll("svg[viewBox='0 0 102 16']");
		expect(svgs.length).toBeGreaterThan(0);
		const svg = svgs[svgs.length - 1];
		// Dark theme should use white text color (#FFFFFF)
		const path = svg?.querySelector("path");
		expect(path?.getAttribute("fill")).toBe("#FFFFFF");
	});
});
