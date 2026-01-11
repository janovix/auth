import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PersonalSettingsView } from "./PersonalSettingsView";
import * as settingsClient from "@/lib/settings/settingsClient";

// Mock the settings client
vi.mock("@/lib/settings/settingsClient", () => ({
	getUserSettings: vi.fn(),
	updateUserSettings: vi.fn(),
	getOrganizationSettings: vi.fn(),
}));

// Mock the auth session hook
vi.mock("@/lib/auth/useAuthSession", () => ({
	useAuthSession: vi.fn(() => ({
		data: {
			user: {
				id: "user-1",
				name: "Test User",
				email: "test@example.com",
				emailVerified: true,
			},
			session: { activeOrganizationId: null },
		},
		error: null,
		isPending: false,
	})),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
	useTheme: vi.fn(() => ({
		theme: "light",
		setTheme: vi.fn(),
	})),
}));

// Mock language context
vi.mock("@/contexts/language-context", () => ({
	useLanguage: vi.fn(() => ({
		t: (key: string) => key, // Return the key as the translation for testing
		language: "en",
		setLanguage: vi.fn(),
	})),
}));

const mockUserSettings = {
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

describe("PersonalSettingsView", () => {
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
			() => new Promise(() => {}),
		);

		render(<PersonalSettingsView />);

		expect(document.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("renders personal settings page header", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(screen.getByText("settings.personal.title")).toBeInTheDocument();
		});
	});

	it("renders theme selection buttons", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(screen.getByText("settings.appearance.light")).toBeInTheDocument();
		});

		expect(screen.getByText("settings.appearance.dark")).toBeInTheDocument();
		expect(screen.getByText("settings.appearance.system")).toBeInTheDocument();
	});

	it("renders timezone section", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(
				screen.getByText("settings.localization.timezone"),
			).toBeInTheDocument();
		});
	});

	it("renders language section", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(
				screen.getByText("settings.localization.language"),
			).toBeInTheDocument();
		});
	});

	it("renders date format section", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(
				screen.getByText("settings.localization.dateFormat"),
			).toBeInTheDocument();
		});
	});

	it("calls updateUserSettings when theme button is clicked", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);
		vi.mocked(settingsClient.updateUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		const user = userEvent.setup();
		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(screen.getByText("settings.appearance.dark")).toBeInTheDocument();
		});

		await user.click(screen.getByText("settings.appearance.dark"));

		await waitFor(() => {
			expect(settingsClient.updateUserSettings).toHaveBeenCalledWith({
				theme: "dark",
			});
		});
	});

	it("shows error message when settings fail to load", async () => {
		vi.mocked(settingsClient.getUserSettings).mockRejectedValue(
			new Error("Network error"),
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(screen.getByText("Network error")).toBeInTheDocument();
		});
	});

	it("handles null settings gracefully", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(null);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(screen.getByText("settings.personal.title")).toBeInTheDocument();
		});
	});

	it("renders user profile section", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(screen.getByText("settings.personal.profile")).toBeInTheDocument();
		});
	});

	it("renders preferences section", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(
				screen.getByText("settings.personal.preferences"),
			).toBeInTheDocument();
		});
	});

	it("renders avatar URL input", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(
				screen.getByPlaceholderText("https://example.com/avatar.jpg"),
			).toBeInTheDocument();
		});
	});

	it("displays user name (disabled)", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
		});

		const nameInput = screen.getByDisplayValue("Test User");
		expect(nameInput).toBeDisabled();
	});

	it("displays user email (disabled)", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
		});

		const emailInput = screen.getByDisplayValue("test@example.com");
		expect(emailInput).toBeDisabled();
	});

	it("shows verified badge when email is verified", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(
				screen.getByText("settings.personal.verified"),
			).toBeInTheDocument();
		});
	});

	it("calls updateUserSettings when avatar save button is clicked", async () => {
		vi.mocked(settingsClient.getUserSettings).mockResolvedValue(
			mockUserSettings,
		);
		vi.mocked(settingsClient.updateUserSettings).mockResolvedValue(
			mockUserSettings,
		);

		const user = userEvent.setup();
		render(<PersonalSettingsView />);

		await waitFor(() => {
			expect(screen.getByText("settings.save")).toBeInTheDocument();
		});

		await user.click(screen.getByText("settings.save"));

		await waitFor(() => {
			expect(settingsClient.updateUserSettings).toHaveBeenCalledWith({
				avatarUrl: "https://example.com/avatar.jpg",
			});
		});
	});
});
