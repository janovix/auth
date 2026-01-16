import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
	getUserSettings,
	updateUserSettings,
	getResolvedSettings,
	getOrganizationSettings,
	updateOrganizationSettings,
	getOrganizationMembership,
	getAmlComplianceSettings,
	createOrUpdateAmlComplianceSettings,
	updateAmlComplianceSettings,
} from "./settingsClient";
import type {
	UserSettings,
	ResolvedSettings,
	OrganizationSettings,
	OrganizationMembership,
	AmlComplianceSettings,
} from "./types";

// Mock the auth core config
vi.mock("../auth/authCoreConfig", () => ({
	getAuthCoreBaseUrl: () => "http://localhost:8787",
}));

const mockUserSettings: UserSettings = {
	id: "settings-1",
	userId: "user-1",
	theme: "light",
	timezone: "America/Mexico_City",
	language: "es",
	dateFormat: "DD/MM/YYYY",
	clockFormat: "12h",
	avatarUrl: "https://example.com/avatar.jpg",
	paymentMethods: [],
	metadata: null,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
};

const mockResolvedSettings: ResolvedSettings = {
	theme: "light",
	timezone: "America/Mexico_City",
	language: "es",
	dateFormat: "DD/MM/YYYY",
	clockFormat: "12h",
	avatarUrl: "https://example.com/avatar.jpg",
	paymentMethods: [],
	sources: {
		theme: "user",
		timezone: "user",
		language: "user",
		dateFormat: "user",
		clockFormat: "user",
	},
};

const mockOrgSettings: OrganizationSettings = {
	id: "org-settings-1",
	organizationId: "org-1",
	theme: "dark",
	timezone: "UTC",
	language: "en",
	dateFormat: "MM/DD/YYYY",
	clockFormat: "12h",
	avatarUrl: null,
	metadata: null,
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
};

const mockMembership: OrganizationMembership = {
	role: "owner",
	organizationId: "org-1",
};

const mockAmlSettings: AmlComplianceSettings = {
	id: "aml-1",
	organizationId: "org-1",
	obligatedSubjectKey: "ABC010101XYZ",
	activityKey: "VEH",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
};

describe("settingsClient", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	describe("getUserSettings", () => {
		it("fetches user settings successfully", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: mockUserSettings }),
			});

			const result = await getUserSettings();

			expect(result).toEqual(mockUserSettings);
			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:8787/api/settings/user",
				{ credentials: "include" },
			);
		});

		it("returns null when user has no settings", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: null }),
			});

			const result = await getUserSettings();

			expect(result).toBeNull();
		});

		it("throws error when request fails", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
			});

			await expect(getUserSettings()).rejects.toThrow(
				"Failed to fetch user settings",
			);
		});
	});

	describe("updateUserSettings", () => {
		it("updates user settings successfully", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: mockUserSettings }),
			});

			const input = { theme: "dark" as const };
			const result = await updateUserSettings(input);

			expect(result).toEqual(mockUserSettings);
			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:8787/api/settings/user",
				{
					method: "PATCH",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(input),
				},
			);
		});

		it("throws error with server message when update fails", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				json: async () => ({ error: "Invalid theme value" }),
			});

			await expect(
				updateUserSettings({ theme: "invalid" as any }),
			).rejects.toThrow("Invalid theme value");
		});

		it("throws default error when response has no error message", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: async () => {
					throw new Error("Parse error");
				},
			});

			await expect(updateUserSettings({ theme: "dark" })).rejects.toThrow(
				"Unknown error",
			);
		});
	});

	describe("getResolvedSettings", () => {
		it("fetches resolved settings with browser hints", async () => {
			// Mock browser APIs
			Object.defineProperty(global, "navigator", {
				value: { language: "es-MX" },
				writable: true,
			});
			Object.defineProperty(global, "Intl", {
				value: {
					DateTimeFormat: () => ({
						resolvedOptions: () => ({ timeZone: "America/Mexico_City" }),
					}),
				},
				writable: true,
			});
			Object.defineProperty(global, "window", {
				value: {
					matchMedia: () => ({ matches: false }),
				},
				writable: true,
			});

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: mockResolvedSettings }),
			});

			const result = await getResolvedSettings();

			expect(result).toEqual(mockResolvedSettings);
			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining(
					"http://localhost:8787/api/settings/resolved?headers=",
				),
				{ credentials: "include" },
			);
		});

		it("throws error when request fails", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
			});

			await expect(getResolvedSettings()).rejects.toThrow(
				"Failed to fetch resolved settings",
			);
		});
	});

	describe("getOrganizationSettings", () => {
		it("fetches organization settings successfully", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: mockOrgSettings }),
			});

			const result = await getOrganizationSettings("org-1");

			expect(result).toEqual(mockOrgSettings);
			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:8787/api/settings/organization/org-1",
				{ credentials: "include" },
			);
		});

		it("returns null when organization has no settings", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: null }),
			});

			const result = await getOrganizationSettings("org-1");

			expect(result).toBeNull();
		});

		it("throws error when request fails", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
			});

			await expect(getOrganizationSettings("org-1")).rejects.toThrow(
				"Failed to fetch organization settings",
			);
		});
	});

	describe("updateOrganizationSettings", () => {
		it("updates organization settings successfully", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: mockOrgSettings }),
			});

			const input = { theme: "light" as const };
			const result = await updateOrganizationSettings("org-1", input);

			expect(result).toEqual(mockOrgSettings);
			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:8787/api/settings/organization/org-1",
				{
					method: "PATCH",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(input),
				},
			);
		});

		it("throws error with server message when update fails", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 403,
				json: async () => ({ error: "Only owners can update" }),
			});

			await expect(
				updateOrganizationSettings("org-1", { theme: "dark" }),
			).rejects.toThrow("Only owners can update");
		});
	});

	describe("getOrganizationMembership", () => {
		it("fetches organization membership successfully", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: mockMembership }),
			});

			const result = await getOrganizationMembership("org-1");

			expect(result).toEqual(mockMembership);
			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:8787/api/settings/organization/org-1/membership",
				{ credentials: "include" },
			);
		});

		it("returns null when user is not a member", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: null }),
			});

			const result = await getOrganizationMembership("org-1");

			expect(result).toBeNull();
		});

		it("throws error when request fails", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
			});

			await expect(getOrganizationMembership("org-1")).rejects.toThrow(
				"Failed to fetch organization membership",
			);
		});
	});

	describe("getAmlComplianceSettings", () => {
		it("fetches AML compliance settings successfully", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: mockAmlSettings }),
			});

			const result = await getAmlComplianceSettings("org-1");

			expect(result).toEqual(mockAmlSettings);
			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:8787/api/settings/aml-compliance/org-1",
				{ credentials: "include" },
			);
		});

		it("returns null when organization has no AML settings (404)", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
			});

			const result = await getAmlComplianceSettings("org-1");

			expect(result).toBeNull();
		});

		it("throws error when request fails with non-404 error", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: async () => ({
					error: "Failed to fetch AML compliance settings",
				}),
			});

			await expect(getAmlComplianceSettings("org-1")).rejects.toThrow(
				"Failed to fetch AML compliance settings",
			);
		});
	});

	describe("createOrUpdateAmlComplianceSettings", () => {
		it("creates or updates AML compliance settings successfully", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: mockAmlSettings }),
			});

			const input = {
				obligatedSubjectKey: "ABC010101XYZ",
				activityKey: "VEH",
			};
			const result = await createOrUpdateAmlComplianceSettings("org-1", input);

			expect(result).toEqual(mockAmlSettings);
			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:8787/api/settings/aml-compliance/org-1",
				{
					method: "PUT",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(input),
				},
			);
		});

		it("throws error with server message when create/update fails", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				json: async () => ({ error: "Invalid RFC format" }),
			});

			await expect(
				createOrUpdateAmlComplianceSettings("org-1", {
					obligatedSubjectKey: "INVALID",
					activityKey: "VEH",
				}),
			).rejects.toThrow("Invalid RFC format");
		});

		it("throws default error when response has no error message", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: async () => {
					throw new Error("Parse error");
				},
			});

			await expect(
				createOrUpdateAmlComplianceSettings("org-1", {
					obligatedSubjectKey: "ABC010101XYZ",
					activityKey: "VEH",
				}),
			).rejects.toThrow("Unknown error");
		});
	});

	describe("updateAmlComplianceSettings", () => {
		it("partially updates AML compliance settings successfully", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: mockAmlSettings }),
			});

			const input = { activityKey: "INM" };
			const result = await updateAmlComplianceSettings("org-1", input);

			expect(result).toEqual(mockAmlSettings);
			expect(fetch).toHaveBeenCalledWith(
				"http://localhost:8787/api/settings/aml-compliance/org-1",
				{
					method: "PATCH",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(input),
				},
			);
		});

		it("throws error with server message when update fails", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 403,
				json: async () => ({ error: "Only owners can update" }),
			});

			await expect(
				updateAmlComplianceSettings("org-1", { activityKey: "INM" }),
			).rejects.toThrow("Only owners can update");
		});

		it("throws default error when response has no error message", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: async () => {
					throw new Error("Parse error");
				},
			});

			await expect(
				updateAmlComplianceSettings("org-1", { activityKey: "INM" }),
			).rejects.toThrow("Unknown error");
		});
	});
});
