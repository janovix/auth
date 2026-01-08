import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LanguageSwitcher } from "./LanguageSwitcher";
import * as languageContext from "@/contexts/language-context";

const setLanguageMock = vi.fn();

// Override the mock for this specific test file
vi.mock("@/contexts/language-context", () => ({
	useLanguage: vi.fn(),
	LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("LanguageSwitcher", () => {
	beforeEach(() => {
		setLanguageMock.mockReset();
	});

	it("renders with current language ES", () => {
		vi.mocked(languageContext.useLanguage).mockReturnValue({
			language: "es",
			setLanguage: setLanguageMock,
			t: (key: string) => key,
		});

		render(<LanguageSwitcher />);
		const buttons = screen.getAllByRole("button");
		const button = buttons[buttons.length - 1];
		expect(button).toHaveTextContent("ES");
	});

	it("renders with current language EN", () => {
		vi.mocked(languageContext.useLanguage).mockReturnValue({
			language: "en",
			setLanguage: setLanguageMock,
			t: (key: string) => key,
		});

		render(<LanguageSwitcher />);
		const buttons = screen.getAllByRole("button");
		const button = buttons[buttons.length - 1];
		expect(button).toHaveTextContent("EN");
	});

	it("opens dropdown and shows language options", async () => {
		vi.mocked(languageContext.useLanguage).mockReturnValue({
			language: "es",
			setLanguage: setLanguageMock,
			t: (key: string) => key,
		});

		const user = userEvent.setup();
		render(<LanguageSwitcher />);

		const buttons = screen.getAllByRole("button");
		const button = buttons[buttons.length - 1];
		await user.click(button);

		// Both language options should be visible in the dropdown
		const menuItems = screen.getAllByRole("menuitem");
		expect(menuItems.length).toBeGreaterThanOrEqual(2);
	});

	it("calls setLanguage with 'en' when EN is selected", async () => {
		vi.mocked(languageContext.useLanguage).mockReturnValue({
			language: "es",
			setLanguage: setLanguageMock,
			t: (key: string) => key,
		});

		const user = userEvent.setup();
		render(<LanguageSwitcher />);

		const buttons = screen.getAllByRole("button");
		const button = buttons[buttons.length - 1];
		await user.click(button);

		const menuItems = screen.getAllByRole("menuitem");
		const enItem = menuItems.find((item) => item.textContent === "EN");
		await user.click(enItem!);

		expect(setLanguageMock).toHaveBeenCalledWith("en");
	});

	it("calls setLanguage with 'es' when ES is selected", async () => {
		vi.mocked(languageContext.useLanguage).mockReturnValue({
			language: "en",
			setLanguage: setLanguageMock,
			t: (key: string) => key,
		});

		const user = userEvent.setup();
		render(<LanguageSwitcher />);

		const buttons = screen.getAllByRole("button");
		const button = buttons[buttons.length - 1];
		await user.click(button);

		const menuItems = screen.getAllByRole("menuitem");
		const esItem = menuItems.find((item) => item.textContent === "ES");
		await user.click(esItem!);

		expect(setLanguageMock).toHaveBeenCalledWith("es");
	});
});
