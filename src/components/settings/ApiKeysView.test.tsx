import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiKeysView } from "./ApiKeysView";
import * as apiKeysClient from "@/lib/settings/apiKeysClient";
import { mockToast } from "@/test/setup";

// Mock the API keys client
vi.mock("@/lib/settings/apiKeysClient", () => ({
	getApiKeys: vi.fn(),
	createApiKey: vi.fn(),
	revokeApiKey: vi.fn(),
	rotateApiKey: vi.fn(),
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

const mockActiveKeys = [
	{
		id: "key-1",
		name: "Production",
		keyPrefix: "jnvx_abc123",
		organizationId: "org-1",
		environment: "production" as const,
		createdById: "user-1",
		lastUsedAt: "2026-01-15T10:00:00.000Z",
		expiresAt: null,
		revokedAt: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-15T10:00:00.000Z",
	},
	{
		id: "key-2",
		name: "Staging",
		keyPrefix: "jnvx_def456",
		organizationId: "org-1",
		environment: "production" as const,
		createdById: "user-1",
		lastUsedAt: null,
		expiresAt: null,
		revokedAt: null,
		createdAt: "2026-01-02T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
	},
];

const mockRevokedKey = {
	id: "key-3",
	name: "Old Key",
	keyPrefix: "jnvx_ghi789",
	organizationId: "org-1",
	environment: "production" as const,
	createdById: "user-1",
	lastUsedAt: null,
	expiresAt: null,
	revokedAt: "2026-01-05T00:00:00.000Z",
	createdAt: "2025-12-01T00:00:00.000Z",
	updatedAt: "2026-01-05T00:00:00.000Z",
};

describe("ApiKeysView", () => {
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
		render(<ApiKeysView />);

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

		it("renders page header with title", async () => {
			vi.mocked(apiKeysClient.getApiKeys).mockResolvedValue([]);

			render(<ApiKeysView />);

			await waitFor(() => {
				expect(screen.getByText("settings.apiKeys.title")).toBeInTheDocument();
			});
		});

		it("shows create button", async () => {
			vi.mocked(apiKeysClient.getApiKeys).mockResolvedValue([]);

			render(<ApiKeysView />);

			await waitFor(() => {
				expect(screen.getByText("settings.apiKeys.create")).toBeInTheDocument();
			});
		});

		it("shows empty state when no keys exist", async () => {
			vi.mocked(apiKeysClient.getApiKeys).mockResolvedValue([]);

			render(<ApiKeysView />);

			await waitFor(() => {
				expect(screen.getByText("settings.apiKeys.noKeys")).toBeInTheDocument();
			});
		});

		it("renders active keys list", async () => {
			vi.mocked(apiKeysClient.getApiKeys).mockResolvedValue(mockActiveKeys);

			render(<ApiKeysView />);

			await waitFor(() => {
				expect(screen.getByText("Production")).toBeInTheDocument();
			});

			expect(screen.getByText("Staging")).toBeInTheDocument();
		});

		it("shows key prefixes with mask", async () => {
			vi.mocked(apiKeysClient.getApiKeys).mockResolvedValue(mockActiveKeys);

			render(<ApiKeysView />);

			await waitFor(() => {
				expect(screen.getByText("jnvx_abc123••••")).toBeInTheDocument();
			});

			expect(screen.getByText("jnvx_def456••••")).toBeInTheDocument();
		});

		it("shows rotate and revoke buttons for active keys", async () => {
			vi.mocked(apiKeysClient.getApiKeys).mockResolvedValue([
				mockActiveKeys[0],
			]);

			render(<ApiKeysView />);

			await waitFor(() => {
				expect(screen.getByText("settings.apiKeys.rotate")).toBeInTheDocument();
				expect(screen.getByText("settings.apiKeys.revoke")).toBeInTheDocument();
			});
		});

		it("shows active keys count", async () => {
			vi.mocked(apiKeysClient.getApiKeys).mockResolvedValue(mockActiveKeys);

			render(<ApiKeysView />);

			await waitFor(() => {
				expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
			});
		});

		it("shows revoked keys section when revoked keys exist", async () => {
			vi.mocked(apiKeysClient.getApiKeys).mockResolvedValue([
				...mockActiveKeys,
				mockRevokedKey,
			]);

			render(<ApiKeysView />);

			await waitFor(() => {
				expect(
					screen.getByText("settings.apiKeys.revokedBadge"),
				).toBeInTheDocument();
			});
		});

		it("shows error toast on load failure", async () => {
			vi.mocked(apiKeysClient.getApiKeys).mockRejectedValue(
				new Error("Network error"),
			);

			render(<ApiKeysView />);

			await waitFor(() => {
				expect(mockToast.error).toHaveBeenCalledWith("Network error");
			});
		});

		it("shows loading state initially", () => {
			vi.mocked(apiKeysClient.getApiKeys).mockImplementation(
				() => new Promise(() => {}),
			);

			render(<ApiKeysView />);

			// Skeleton layout reserves space while keys load
			expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
		});
	});
});
