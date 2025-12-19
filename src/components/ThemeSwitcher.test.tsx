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

	it("renders theme switcher button", () => {
		vi.mocked(nextThemes.useTheme).mockReturnValue({
			theme: "light",
			setTheme: setThemeMock,
			resolvedTheme: "light",
		} as unknown as ReturnType<typeof nextThemes.useTheme>);

		render(<ThemeSwitcher />);
		const buttons = screen.getAllByRole("button", { name: /toggle theme/i });
		expect(buttons.length).toBeGreaterThan(0);
	});

	it("toggles from light to dark when clicked", async () => {
		vi.mocked(nextThemes.useTheme).mockReturnValue({
			theme: "light",
			setTheme: setThemeMock,
			resolvedTheme: "light",
		} as unknown as ReturnType<typeof nextThemes.useTheme>);

		const user = userEvent.setup();
		render(<ThemeSwitcher />);

		const buttons = screen.getAllByRole("button", { name: /toggle theme/i });
		const button = buttons[buttons.length - 1];
		await user.click(button);

		expect(setThemeMock).toHaveBeenCalledWith("dark");
	});

	it("toggles from dark to light when clicked", async () => {
		vi.mocked(nextThemes.useTheme).mockReturnValue({
			theme: "dark",
			setTheme: setThemeMock,
			resolvedTheme: "dark",
		} as unknown as ReturnType<typeof nextThemes.useTheme>);

		const user = userEvent.setup();
		render(<ThemeSwitcher />);

		const buttons = screen.getAllByRole("button", { name: /toggle theme/i });
		const button = buttons[buttons.length - 1];
		await user.click(button);

		expect(setThemeMock).toHaveBeenCalledWith("light");
	});
});
