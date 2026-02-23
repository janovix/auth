import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TeamSettingsView } from "./TeamSettingsView";
import * as settingsClient from "@/lib/settings/settingsClient";
import { authClient } from "@/lib/auth/authClient";
import { mockToast } from "@/test/setup";

// Mock the settings client
vi.mock("@/lib/settings/settingsClient", () => ({
	getOrganizationMembership: vi.fn(),
}));

// Mock the auth client
vi.mock("@/lib/auth/authClient", () => ({
	authClient: {
		organization: {
			getFullOrganization: vi.fn(),
			inviteMember: vi.fn(),
			removeMember: vi.fn(),
			updateMemberRole: vi.fn(),
			cancelInvitation: vi.fn(),
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

const mockMembers = [
	{
		id: "member-1",
		userId: "user-1",
		role: "owner",
		createdAt: new Date().toISOString(),
		user: {
			id: "user-1",
			name: "Test User",
			email: "test@example.com",
			image: null,
		},
	},
	{
		id: "member-2",
		userId: "user-2",
		role: "admin",
		createdAt: new Date().toISOString(),
		user: {
			id: "user-2",
			name: "Admin User",
			email: "admin@example.com",
			image: null,
		},
	},
];

const mockOwnerMembership = {
	role: "owner" as const,
	organizationId: "org-1",
};

const mockMemberMembership = {
	role: "member" as const,
	organizationId: "org-1",
};

describe("TeamSettingsView", () => {
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
		render(<TeamSettingsView />);

		await waitFor(() => {
			// Component shows settings.organization.noOrg when no active org
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

		it("shows skeleton loader while fetching data", async () => {
			vi.mocked(settingsClient.getOrganizationMembership).mockImplementation(
				() => new Promise(() => {}),
			);
			vi.mocked(authClient.organization.getFullOrganization).mockImplementation(
				() => new Promise(() => {}),
			);

			render(<TeamSettingsView />);

			// Skeleton uses animate-pulse and data-testid="skeleton"
			expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
		});

		it("renders team settings page header", async () => {
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: { members: mockMembers, invitations: [] },
				error: null,
			});

			render(<TeamSettingsView />);

			await waitFor(() => {
				expect(screen.getByText("settings.team.title")).toBeInTheDocument();
			});
		});

		it("renders members list", async () => {
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: { members: mockMembers, invitations: [] },
				error: null,
			});

			render(<TeamSettingsView />);

			await waitFor(() => {
				expect(screen.getByText("Test User")).toBeInTheDocument();
			});

			expect(screen.getByText("Admin User")).toBeInTheDocument();
		});

		it("renders member emails", async () => {
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: { members: mockMembers, invitations: [] },
				error: null,
			});

			render(<TeamSettingsView />);

			await waitFor(() => {
				expect(screen.getByText("test@example.com")).toBeInTheDocument();
			});

			expect(screen.getByText("admin@example.com")).toBeInTheDocument();
		});

		it("shows invite button for owners", async () => {
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: { members: mockMembers, invitations: [] },
				error: null,
			});

			render(<TeamSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByText("settings.team.inviteMember"),
				).toBeInTheDocument();
			});
		});

		it("hides invite button for regular members", async () => {
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockMemberMembership,
			);
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: { members: mockMembers, invitations: [] },
				error: null,
			});

			render(<TeamSettingsView />);

			await waitFor(() => {
				expect(screen.getByText("settings.team.title")).toBeInTheDocument();
			});

			expect(
				screen.queryByText("settings.team.inviteMember"),
			).not.toBeInTheDocument();
		});

		it("shows role permissions section", async () => {
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: { members: mockMembers, invitations: [] },
				error: null,
			});

			render(<TeamSettingsView />);

			await waitFor(() => {
				expect(
					screen.getByText("settings.team.rolePermissions"),
				).toBeInTheDocument();
			});
		});

		it("shows error message when data fails to load", async () => {
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);
			vi.mocked(authClient.organization.getFullOrganization).mockRejectedValue(
				new Error("Network error"),
			);

			render(<TeamSettingsView />);

			await waitFor(() => {
				expect(mockToast.error).toHaveBeenCalledWith("Network error");
			});
		});

		it("shows members count", async () => {
			vi.mocked(settingsClient.getOrganizationMembership).mockResolvedValue(
				mockOwnerMembership,
			);
			vi.mocked(authClient.organization.getFullOrganization).mockResolvedValue({
				data: { members: mockMembers, invitations: [] },
				error: null,
			});

			render(<TeamSettingsView />);

			await waitFor(() => {
				// Should show "(2)" for members count
				expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
			});
		});
	});
});
