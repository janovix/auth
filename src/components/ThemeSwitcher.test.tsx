import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ThemeSwitcher } from "./ThemeSwitcher";
import * as nextThemes from "next-themes";

const setThemeMock = vi.fn();

vi.mock("next-themes", () => ({
	useTheme: vi.fn(),
}));

// Mock language context with proper translations
vi.mock("@/contexts/language-context", () => ({
	useLanguage: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				"theme.system": "System",
				"theme.light": "Light",
				"theme.dark": "Dark",
				"theme.label": "Theme",
			};
			return translations[key] || key;
		},
	}),
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
		expect(screen.getAllByLabelText("System").length).toBeGreaterThan(0);
		expect(screen.getAllByLabelText("Light").length).toBeGreaterThan(0);
		expect(screen.getAllByLabelText("Dark").length).toBeGreaterThan(0);
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
		const lightButtons = screen.getAllByLabelText("Light");
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
		const darkButtons = screen.getAllByLabelText("Dark");
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
		const systemButtons = screen.getAllByLabelText("System");
		const systemButton = systemButtons[systemButtons.length - 1];
		await user.click(systemButton);

		expect(setThemeMock).toHaveBeenCalledWith("system");
	});
});
