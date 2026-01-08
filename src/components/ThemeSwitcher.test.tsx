import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ThemeSwitcher } from "./ThemeSwitcher";
import * as nextThemes from "next-themes";

const setThemeMock = vi.fn();

vi.mock("next-themes", () => ({
	useTheme: vi.fn(),
}));

describe("ThemeSwitcher", () => {
	beforeEach(() => {
		setThemeMock.mockReset();
	});

	it("renders ternary theme switcher with system, light, and dark options", () => {
		vi.mocked(nextThemes.useTheme).mockReturnValue({
			theme: "system",
			setTheme: setThemeMock,
			resolvedTheme: "light",
		} as unknown as ReturnType<typeof nextThemes.useTheme>);

		render(<ThemeSwitcher />);
		expect(screen.getAllByLabelText("System theme").length).toBeGreaterThan(0);
		expect(screen.getAllByLabelText("Light theme").length).toBeGreaterThan(0);
		expect(screen.getAllByLabelText("Dark theme").length).toBeGreaterThan(0);
	});

	it("sets theme to light when light button is clicked", async () => {
		vi.mocked(nextThemes.useTheme).mockReturnValue({
			theme: "system",
			setTheme: setThemeMock,
			resolvedTheme: "light",
		} as unknown as ReturnType<typeof nextThemes.useTheme>);

		const user = userEvent.setup();
		render(<ThemeSwitcher />);

		// Get the last matching element (handles StrictMode double render)
		const lightButtons = screen.getAllByLabelText("Light theme");
		const lightButton = lightButtons[lightButtons.length - 1];
		await user.click(lightButton);

		expect(setThemeMock).toHaveBeenCalledWith("light");
	});

	it("sets theme to dark when dark button is clicked", async () => {
		vi.mocked(nextThemes.useTheme).mockReturnValue({
			theme: "light",
			setTheme: setThemeMock,
			resolvedTheme: "light",
		} as unknown as ReturnType<typeof nextThemes.useTheme>);

		const user = userEvent.setup();
		render(<ThemeSwitcher />);

		// Get the last matching element (handles StrictMode double render)
		const darkButtons = screen.getAllByLabelText("Dark theme");
		const darkButton = darkButtons[darkButtons.length - 1];
		await user.click(darkButton);

		expect(setThemeMock).toHaveBeenCalledWith("dark");
	});

	it("sets theme to system when system button is clicked", async () => {
		vi.mocked(nextThemes.useTheme).mockReturnValue({
			theme: "dark",
			setTheme: setThemeMock,
			resolvedTheme: "dark",
		} as unknown as ReturnType<typeof nextThemes.useTheme>);

		const user = userEvent.setup();
		render(<ThemeSwitcher />);

		// Get the last matching element (handles StrictMode double render)
		const systemButtons = screen.getAllByLabelText("System theme");
		const systemButton = systemButtons[systemButtons.length - 1];
		await user.click(systemButton);

		expect(setThemeMock).toHaveBeenCalledWith("system");
	});
});
