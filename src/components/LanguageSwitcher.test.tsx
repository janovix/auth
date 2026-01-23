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

	describe("default variant (segmented control)", () => {
		it("renders both language buttons", () => {
			vi.mocked(languageContext.useLanguage).mockReturnValue({
				language: "es",
				setLanguage: setLanguageMock,
				t: (key: string) => key,
			});

			render(<LanguageSwitcher />);
			expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "ES" })).toBeInTheDocument();
		});

		it("calls setLanguage when EN button is clicked", async () => {
			vi.mocked(languageContext.useLanguage).mockReturnValue({
				language: "es",
				setLanguage: setLanguageMock,
				t: (key: string) => key,
			});

			const user = userEvent.setup();
			render(<LanguageSwitcher />);

			// Get all EN buttons and click the last one (handles StrictMode double render)
			const enButtons = screen.getAllByRole("button", { name: "EN" });
			await user.click(enButtons[enButtons.length - 1]);
			expect(setLanguageMock).toHaveBeenCalledWith("en");
		});

		it("calls setLanguage when ES button is clicked", async () => {
			vi.mocked(languageContext.useLanguage).mockReturnValue({
				language: "en",
				setLanguage: setLanguageMock,
				t: (key: string) => key,
			});

			const user = userEvent.setup();
			render(<LanguageSwitcher />);

			// Get all ES buttons and click the last one (handles StrictMode double render)
			const esButtons = screen.getAllByRole("button", { name: "ES" });
			await user.click(esButtons[esButtons.length - 1]);
			expect(setLanguageMock).toHaveBeenCalledWith("es");
		});
	});

	describe("mini variant (dropdown)", () => {
		it("opens dropdown and shows language options with native names", async () => {
			vi.mocked(languageContext.useLanguage).mockReturnValue({
				language: "es",
				setLanguage: setLanguageMock,
				t: (key: string) => {
					const translations: Record<string, string> = {
						"language.label": "Language",
					};
					return translations[key] || key;
				},
			});

			const user = userEvent.setup();
			render(<LanguageSwitcher variant="mini" />);

			// Click the trigger button to open dropdown (get the last one for StrictMode)
			const triggerButtons = screen.getAllByRole("button");
			const triggerButton = triggerButtons[triggerButtons.length - 1];
			await user.click(triggerButton);

			// Both language options should be visible with native names
			const menuItems = await screen.findAllByRole("menuitem");
			expect(menuItems).toHaveLength(2);
			expect(menuItems[0]).toHaveTextContent("English");
			expect(menuItems[1]).toHaveTextContent("Español");
		});

		it("calls setLanguage with 'en' when English is selected", async () => {
			vi.mocked(languageContext.useLanguage).mockReturnValue({
				language: "es",
				setLanguage: setLanguageMock,
				t: (key: string) => {
					const translations: Record<string, string> = {
						"language.label": "Language",
					};
					return translations[key] || key;
				},
			});

			const user = userEvent.setup();
			render(<LanguageSwitcher variant="mini" />);

			// Open dropdown (get the last button for StrictMode)
			const triggerButtons = screen.getAllByRole("button");
			const triggerButton = triggerButtons[triggerButtons.length - 1];
			await user.click(triggerButton);

			// Click English option
			const enItem = await screen.findByRole("menuitem", { name: "English" });
			await user.click(enItem);

			expect(setLanguageMock).toHaveBeenCalledWith("en");
		});

		it("calls setLanguage with 'es' when Español is selected", async () => {
			vi.mocked(languageContext.useLanguage).mockReturnValue({
				language: "en",
				setLanguage: setLanguageMock,
				t: (key: string) => {
					const translations: Record<string, string> = {
						"language.label": "Language",
					};
					return translations[key] || key;
				},
			});

			const user = userEvent.setup();
			render(<LanguageSwitcher variant="mini" />);

			// Open dropdown (get the last button for StrictMode)
			const triggerButtons = screen.getAllByRole("button");
			const triggerButton = triggerButtons[triggerButtons.length - 1];
			await user.click(triggerButton);

			// Click Español option
			const esItem = await screen.findByRole("menuitem", { name: "Español" });
			await user.click(esItem);

			expect(setLanguageMock).toHaveBeenCalledWith("es");
		});
	});
});
