import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SettingsView } from "./SettingsView";
import * as settingsClient from "@/lib/settings/settingsClient";

// Mock the settings client
vi.mock("@/lib/settings/settingsClient", () => ({
	getUserSettings: vi.fn(),
	updateUserSettings: vi.fn(),
	getResolvedSettings: vi.fn(),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
	useTheme: vi.fn(() => ({
		theme: "light",
		setTheme: vi.fn(),
	})),
	ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

const mockSettings = {
	id: "settings-1",
	userId: "user-1",
	theme: "light" as const,
	timezone: "America/Mexico_City",
	language: "es" as const,
	dateFormat: "DD/MM/YYYY" as const,
	avatarUrl: "https://example.com/avatar.jpg",
	paymentMethods: [],
	metadata: null,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

describe("SettingsView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(async () => {
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("shows loading spinner while fetching settings", async () => {
		vi.mocked(settingsClient.getUserSettings).mockImplementation(
			() => new Promise(() => {}), // Never resolves
		);

		renderWithTheme(<SettingsView />);

		// Should show loading spinner
		expect(document.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("renders settings page with all sections when loaded", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);

		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("Configuración")).toBeInTheDocument();
		});

		// Check for all section titles (Spanish translations)
		expect(screen.getByText("Apariencia")).toBeInTheDocument();
		expect(screen.getByText("Localización")).toBeInTheDocument();
		expect(screen.getByText("Perfil")).toBeInTheDocument();
		expect(screen.getByText("Métodos de pago")).toBeInTheDocument();
	});

	it("renders theme buttons (light, dark, system)", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);

		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("Claro")).toBeInTheDocument();
		});

		expect(screen.getByText("Oscuro")).toBeInTheDocument();
		expect(screen.getByText("Sistema")).toBeInTheDocument();
	});

	it("renders language buttons (English, Español)", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);

		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("English")).toBeInTheDocument();
		});

		expect(screen.getByText("Español")).toBeInTheDocument();
	});

	it("renders timezone selector with options", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);

		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByRole("combobox")).toBeInTheDocument();
		});

		const select = screen.getByRole("combobox");
		expect(select).toHaveValue("America/Mexico_City");
	});

	it("renders date format buttons", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);

		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("MM/DD/YYYY")).toBeInTheDocument();
		});

		expect(screen.getByText("DD/MM/YYYY")).toBeInTheDocument();
		expect(screen.getByText("YYYY-MM-DD")).toBeInTheDocument();
		expect(screen.getByText("DD.MM.YYYY")).toBeInTheDocument();
	});

	it("calls updateUserSettings when theme button is clicked", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);
		vi.mocked(settingsClient.updateUserSettings).mockResolvedValue(
			mockSettings,
		);

		const user = userEvent.setup();
		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("Oscuro")).toBeInTheDocument();
		});

		await user.click(screen.getByText("Oscuro"));

		await waitFor(() => {
			expect(settingsClient.updateUserSettings).toHaveBeenCalledWith({
				theme: "dark",
			});
		});
	});

	it("calls updateUserSettings when language button is clicked", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);
		vi.mocked(settingsClient.updateUserSettings).mockResolvedValue(
			mockSettings,
		);

		const user = userEvent.setup();
		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("English")).toBeInTheDocument();
		});

		await user.click(screen.getByText("English"));

		await waitFor(() => {
			expect(settingsClient.updateUserSettings).toHaveBeenCalledWith({
				language: "en",
			});
		});
	});

	it("calls updateUserSettings when timezone is changed", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);
		vi.mocked(settingsClient.updateUserSettings).mockResolvedValue(
			mockSettings,
		);

		const user = userEvent.setup();
		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByRole("combobox")).toBeInTheDocument();
		});

		await user.selectOptions(screen.getByRole("combobox"), "UTC");

		await waitFor(() => {
			expect(settingsClient.updateUserSettings).toHaveBeenCalledWith({
				timezone: "UTC",
			});
		});
	});

	it("calls updateUserSettings when date format is changed", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);
		vi.mocked(settingsClient.updateUserSettings).mockResolvedValue(
			mockSettings,
		);

		const user = userEvent.setup();
		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("YYYY-MM-DD")).toBeInTheDocument();
		});

		await user.click(screen.getByText("YYYY-MM-DD"));

		await waitFor(() => {
			expect(settingsClient.updateUserSettings).toHaveBeenCalledWith({
				dateFormat: "YYYY-MM-DD",
			});
		});
	});

	it("shows error message when settings fail to load", async () => {
		vi.mocked(settingsClient.getUserSettings).mockRejectedValue(
			new Error("Network error"),
		);

		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("Network error")).toBeInTheDocument();
		});
	});

	it("shows success message after saving", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);
		vi.mocked(settingsClient.updateUserSettings).mockResolvedValue(
			mockSettings,
		);

		const user = userEvent.setup();
		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("Oscuro")).toBeInTheDocument();
		});

		await user.click(screen.getByText("Oscuro"));

		await waitFor(() => {
			expect(screen.getByText("Configuración guardada")).toBeInTheDocument();
		});
	});

	it("renders avatar input and save button", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);

		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByLabelText("URL del avatar")).toBeInTheDocument();
		});

		const input = screen.getByLabelText("URL del avatar");
		expect(input).toHaveValue("https://example.com/avatar.jpg");
		expect(screen.getByText("Guardar")).toBeInTheDocument();
	});

	it("shows payments coming soon message", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(mockSettings);

		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("Próximamente")).toBeInTheDocument();
		});
	});

	it("handles null settings gracefully", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(null);

		renderWithTheme(<SettingsView />);

		await waitFor(() => {
			expect(screen.getByText("Configuración")).toBeInTheDocument();
		});

		// Should use defaults
		const select = screen.getByRole("combobox");
		expect(select).toBeInTheDocument();
	});
});
