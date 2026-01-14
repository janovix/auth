import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "./language-context";

// Create mock functions with vi.hoisted so they exist when vi.mock runs
const {
	mockGetCookie,
	mockSetCookie,
	mockGetResolvedSettings,
	mockUpdateUserSettings,
} = vi.hoisted(() => ({
	mockGetCookie: vi.fn(),
	mockSetCookie: vi.fn(),
	mockGetResolvedSettings: vi.fn(),
	mockUpdateUserSettings: vi.fn(),
}));

// Mock modules with controllable functions
vi.mock("@/lib/cookies", () => ({
	getCookie: mockGetCookie,
	setCookie: mockSetCookie,
	COOKIE_NAMES: {
		THEME: "janovix-theme",
		LANGUAGE: "janovix-lang",
	},
}));

vi.mock("@/lib/settings", () => ({
	getResolvedSettings: mockGetResolvedSettings,
	updateUserSettings: mockUpdateUserSettings,
}));

// Test component that uses the language context
function TestConsumer() {
	const { language, t } = useLanguage();
	return (
		<div>
			<span data-testid="current-language">{language}</span>
			<span data-testid="translated-text">{t("login.title")}</span>
		</div>
	);
}

describe("LanguageProvider", () => {
	const originalNavigator = global.navigator;

	beforeEach(() => {
		vi.clearAllMocks();
		// Default mock: API rejects (not logged in)
		mockGetResolvedSettings.mockRejectedValue(new Error("Not authenticated"));
		mockUpdateUserSettings.mockResolvedValue({});

		// Default: no cookie, Spanish browser
		mockGetCookie.mockReturnValue(undefined);

		// Default navigator is Spanish
		Object.defineProperty(global, "navigator", {
			value: {
				language: "es-MX",
			},
			writable: true,
			configurable: true,
		});
	});

	afterEach(() => {
		cleanup();
		Object.defineProperty(global, "navigator", {
			value: originalNavigator,
			writable: true,
			configurable: true,
		});
	});

	it("renders children", async () => {
		render(
			<LanguageProvider>
				<div data-testid="child">Test Content</div>
			</LanguageProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("child")).toBeInTheDocument();
		});
	});

	it("provides default language (es) when browser is Spanish", async () => {
		render(
			<LanguageProvider>
				<TestConsumer />
			</LanguageProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("current-language")).toHaveTextContent("es");
		});
	});

	it("translates text correctly for Spanish", async () => {
		render(
			<LanguageProvider>
				<TestConsumer />
			</LanguageProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("translated-text")).toHaveTextContent(
				"Bienvenido",
			);
		});
	});

	it("returns key for missing translation", async () => {
		function MissingKeyConsumer() {
			const { t } = useLanguage();
			return <span data-testid="missing">{t("non.existent.key")}</span>;
		}

		render(
			<LanguageProvider>
				<MissingKeyConsumer />
			</LanguageProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("missing")).toHaveTextContent(
				"non.existent.key",
			);
		});
	});
});
