import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrganizationSettingsView } from "./OrganizationSettingsView";
import * as settingsClient from "@/lib/settings/settingsClient";
import { authClient } from "@/lib/auth/authClient";

// Mock the settings client
vi.mock("@/lib/settings/settingsClient", () => ({
	getOrganizationSettings: vi.fn(),
	updateOrganizationSettings: vi.fn(),
	getOrganizationMembership: vi.fn(),
}));

// Mock the auth client
vi.mock("@/lib/auth/authClient", () => ({
	authClient: {
		organization: {
			getFullOrganization: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	},
}));

// Mock language context
vi.mock("@/contexts/language-context", () => ({
	useLanguage: vi.fn(() => ({
		t: (key: string) => key,
		language: "en",
		setLanguage: vi.fn(),
	})),
}));

// Mock the auth session hook - no org by default
const mockUseAuthSession = vi.fn(() => ({
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
}));

vi.mock("@/lib/auth/useAuthSession", () => ({
	useAuthSession: () => mockUseAuthSession(),
}));

const mockOrgData = {
	id: "org-1",
	name: "Test Organization",
	slug: "test-org",
	logo: "https://example.com/logo.png",
};

const mockOrgSettings = {
	id: "org-settings-1",
	organizationId: "org-1",
	theme: "dark" as const,
	timezone: "UTC",
	language: "en" as const,
	dateFormat: "MM/DD/YYYY" as const,
	avatarUrl: null,
	metadata: null,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

const mockOwnerMembership = {
	role: "owner" as const,
	organizationId: "org-1",
};

const mockMemberMembership = {
	role: "member" as const,
	organizationId: "org-1",
};

describe("OrganizationSettingsView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(async () => {
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("shows message when no active organization", async () => {
		render(<OrganizationSettingsView />);

		await waitFor(() => {
			expect(
				screen.getByText("settings.organization.noOrg"),
			).toBeInTheDocument();
		});
	});

	describe("with active organization", () => {
		beforeEach(() => {
			mockUseAuthSession.mockReturnValue({
				data: {
					user: {
						id: "user-1",
						name: "Test User",
						email: "test@example.com",
						emailVerified: true,
					},
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					session: { activeOrganizationId: "org-1" } as any,
				},
				error: null,
				isPending: false,
			});
		});

		it("shows loading spinner while fetching settings", async () => {
			vi.mocked(authClient.organization.getFullOrganization).mockImplementation(
				() => new Promise(() => {}),
			);
			vi.mocked(settingsClient.getOrganizationSettings).mockImplementation(
				() => new Promise(() => {}),
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockImplementation(
				() => new Promise(() => {}),
			);

			render(<OrganizationSettingsView />);

			expect(document.querySelector(".animate-spin")).toBeInTheDocument();
		});

		it("renders organization settings page header", async () => {
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: mockOrgData,
				error: null,
			});
			vi.mocked(settingsClient.getOrganizationSettings).mockResolvedValue(
				mockOrgSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<OrganizationSettingsView />);

			await waitFor(() => {
				expect(screen.getByText("settings.org.title")).toBeInTheDocument();
			});
		});

		it("renders organization name input", async () => {
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: mockOrgData,
				error: null,
			});
			vi.mocked(settingsClient.getOrganizationSettings).mockResolvedValue(
				mockOrgSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<OrganizationSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByDisplayValue("Test Organization"),
				).toBeInTheDocument();
			});
		});

		it("renders organization slug input", async () => {
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: mockOrgData,
				error: null,
			});
			vi.mocked(settingsClient.getOrganizationSettings).mockResolvedValue(
				mockOrgSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<OrganizationSettingsView />);

			await waitFor(() => {
				expect(screen.getByDisplayValue("test-org")).toBeInTheDocument();
			});
		});

		it("renders theme selector label", async () => {
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: mockOrgData,
				error: null,
			});
			vi.mocked(settingsClient.getOrganizationSettings).mockResolvedValue(
				mockOrgSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<OrganizationSettingsView />);

			// Check for the theme label - the Select options are in a dropdown
			await waitFor(() => {
				expect(
					screen.getByText("settings.appearance.theme"),
				).toBeInTheDocument();
			});
		});

		it("disables inputs for non-owners", async () => {
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: mockOrgData,
				error: null,
			});
			vi.mocked(settingsClient.getOrganizationSettings).mockResolvedValue(
				mockOrgSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockMemberMembership,
			);

			render(<OrganizationSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByDisplayValue("Test Organization"),
				).toBeInTheDocument();
			});

			const nameInput = screen.getByDisplayValue("Test Organization");
			expect(nameInput).toBeDisabled();
		});

		it("enables inputs for owners", async () => {
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: mockOrgData,
				error: null,
			});
			vi.mocked(settingsClient.getOrganizationSettings).mockResolvedValue(
				mockOrgSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<OrganizationSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByDisplayValue("Test Organization"),
				).toBeInTheDocument();
			});

			const nameInput = screen.getByDisplayValue("Test Organization");
			expect(nameInput).not.toBeDisabled();
		});

		it("shows danger zone section", async () => {
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: mockOrgData,
				error: null,
			});
			vi.mocked(settingsClient.getOrganizationSettings).mockResolvedValue(
				mockOrgSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<OrganizationSettingsView />);

			await waitFor(() => {
				expect(screen.getByText("settings.org.dangerZone")).toBeInTheDocument();
			});
		});

		// OrganizationSettingsView disables inputs for non-owners but doesn't show a "view only" message

		it("shows error message when settings fail to load", async () => {
			vi.mocked(authClient.organization.getFullOrganization).mockRejectedValue(
				new Error("Network error"),
			);
			vi.mocked(settingsClient.getOrganizationSettings).mockResolvedValue(null);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				null,
			);

			render(<OrganizationSettingsView />);

			await waitFor(() => {
				expect(screen.getByText("Network error")).toBeInTheDocument();
			});
		});

		it("shows organization ID with copy button", async () => {
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: mockOrgData,
				error: null,
			});
			vi.mocked(settingsClient.getOrganizationSettings).mockResolvedValue(
				mockOrgSettings,
			);
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);

			render(<OrganizationSettingsView />);

			await waitFor(() => {
				expect(screen.getByText("org-1")).toBeInTheDocument();
			});
		});
	});
});
