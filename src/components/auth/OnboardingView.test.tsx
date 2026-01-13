import type { AuthResult, Session } from "@/lib/auth/authActions";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuroraProvider } from "@/contexts/aurora-context";

import { OnboardingView } from "./OnboardingView";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush,
		refresh: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
	}),
}));

// Mock auth actions
const mockUpdateProfile = vi.fn();
vi.mock("@/lib/auth/authActions", () => ({
	updateProfile: (updates: { name?: string; image?: string }) =>
		mockUpdateProfile(updates),
}));

// Mock auth config
vi.mock("@/lib/auth/authCoreConfig", () => ({
	getAuthCoreBaseUrl: () => "https://auth-svc.example.workers.dev",
}));

// Mock redirect config
vi.mock("@/lib/auth/redirectConfig", () => ({
	getAuthRedirectUrl: (redirectTo?: string) =>
		redirectTo || "https://app.example.workers.dev",
}));

// Mock global fetch for avatar uploads
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock window.location
const originalLocation = window.location;

const renderWithProviders = (ui: React.ReactElement) => {
	return render(
		<ThemeProvider>
			<AuroraProvider>{ui}</AuroraProvider>
		</ThemeProvider>,
	);
};

const createMockSession = (name: string): Session => ({
	user: {
		id: "user-123",
		name,
		email: "test@example.com",
		image: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		emailVerified: true,
	},
	session: {
		id: "session-123",
		userId: "user-123",
		token: "token-123",
		expiresAt: new Date(Date.now() + 3600 * 1000),
		createdAt: new Date(),
		updatedAt: new Date(),
	},
});

describe("OnboardingView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPush.mockClear();
		mockUpdateProfile.mockClear();
		mockFetch.mockClear();
		// Mock window.location.href as a writable property
		Object.defineProperty(window, "location", {
			value: { ...originalLocation, href: "" },
			writable: true,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders the onboarding form", async () => {
		renderWithProviders(<OnboardingView />);

		await waitFor(() => {
			expect(screen.getByTestId("onboarding-form")).toBeInTheDocument();
		});

		// Check for name fields by placeholder (Spanish)
		expect(screen.getByPlaceholderText("Mariana")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("López")).toBeInTheDocument();

		// Check for avatar section
		expect(screen.getByText(/foto de perfil/i)).toBeInTheDocument();

		// Check for submit button
		expect(
			screen.getByRole("button", { name: /continuar/i }),
		).toBeInTheDocument();
	});

	it("renders the avatar editor component", async () => {
		renderWithProviders(<OnboardingView />);

		await waitFor(() => {
			expect(screen.getByTestId("onboarding-form")).toBeInTheDocument();
		});

		// AvatarEditor should render with upload placeholder showing initials
		expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
		// The placeholder shows "?" as initials when no name is entered
		expect(screen.getByText("?")).toBeInTheDocument();
	});

	it(
		"submits profile update with name only",
		{ timeout: 15000 },
		async () => {
			mockUpdateProfile.mockResolvedValue({
				success: true,
				data: createMockSession("Ana García"),
				error: null,
			} as AuthResult<Session>);

			renderWithProviders(
				<OnboardingView redirectTo="https://app.example.com" />,
			);
			const user = userEvent.setup();

			await waitFor(() => {
				expect(screen.getByTestId("onboarding-form")).toBeInTheDocument();
			});

			// Fill in name fields by placeholder
			const firstNameInput = screen.getByPlaceholderText("Mariana");
			await user.type(firstNameInput, "Ana");

			const lastNameInput = screen.getByPlaceholderText("López");
			await user.type(lastNameInput, "García");

			// Submit form
			const form = screen.getByTestId("onboarding-form");
			fireEvent.submit(form);

			await waitFor(() => {
				expect(mockUpdateProfile).toHaveBeenCalledWith({
					name: "Ana García",
				});
			});

			// Should redirect after success
			await waitFor(
				() => {
					expect(window.location.href).toBe("https://app.example.com");
				},
				{ timeout: 3000 },
			);
		},
	);

	it("uses default redirect URL when none provided", async () => {
		mockUpdateProfile.mockResolvedValue({
			success: true,
			data: createMockSession("John Doe"),
			error: null,
		} as AuthResult<Session>);

		renderWithProviders(<OnboardingView />);
		const user = userEvent.setup();

		await waitFor(() => {
			expect(screen.getByTestId("onboarding-form")).toBeInTheDocument();
		});

		// Fill in name fields
		await user.type(screen.getByPlaceholderText("Mariana"), "John");
		await user.type(screen.getByPlaceholderText("López"), "Doe");

		// Submit form
		fireEvent.submit(screen.getByTestId("onboarding-form"));

		await waitFor(() => {
			expect(mockUpdateProfile).toHaveBeenCalledWith({
				name: "John Doe",
			});
		});

		// Should redirect to default URL
		await waitFor(
			() => {
				expect(window.location.href).toBe("https://app.example.workers.dev");
			},
			{ timeout: 3000 },
		);
	});

	it("shows error message when profile update fails", async () => {
		mockUpdateProfile.mockResolvedValue({
			success: false,
			data: null,
			error: new Error("Update failed"),
		} as AuthResult<Session>);

		renderWithProviders(<OnboardingView />);
		const user = userEvent.setup();

		await waitFor(() => {
			expect(screen.getByTestId("onboarding-form")).toBeInTheDocument();
		});

		// Fill in name fields
		await user.type(screen.getByPlaceholderText("Mariana"), "Ana");
		await user.type(screen.getByPlaceholderText("López"), "García");

		// Submit form
		fireEvent.submit(screen.getByTestId("onboarding-form"));

		// Should show error message
		await waitFor(() => {
			expect(screen.getByText(/update failed/i)).toBeInTheDocument();
		});
	});

	it("shows validation errors for empty name fields", async () => {
		renderWithProviders(<OnboardingView />);

		await waitFor(() => {
			expect(screen.getByTestId("onboarding-form")).toBeInTheDocument();
		});

		// Try to submit without filling in fields
		const form = screen.getByTestId("onboarding-form");
		fireEvent.submit(form);

		// Should show validation errors (Spanish)
		await waitFor(() => {
			expect(screen.getByText(/tu nombre es obligatorio/i)).toBeInTheDocument();
		});

		// Profile update should not have been called
		expect(mockUpdateProfile).not.toHaveBeenCalled();
	});

	it("trims whitespace from names before submission", async () => {
		mockUpdateProfile.mockResolvedValue({
			success: true,
			data: createMockSession("Ana García"),
			error: null,
		} as AuthResult<Session>);

		renderWithProviders(<OnboardingView />);
		const user = userEvent.setup();

		await waitFor(() => {
			expect(screen.getByTestId("onboarding-form")).toBeInTheDocument();
		});

		// Fill in name fields with extra whitespace
		await user.type(screen.getByPlaceholderText("Mariana"), "  Ana  ");
		await user.type(screen.getByPlaceholderText("López"), "  García  ");

		// Submit form
		fireEvent.submit(screen.getByTestId("onboarding-form"));

		// Should submit trimmed name
		await waitFor(() => {
			expect(mockUpdateProfile).toHaveBeenCalledWith({
				name: "Ana García",
			});
		});
	});

	it("shows optional label for avatar", async () => {
		renderWithProviders(<OnboardingView />);

		await waitFor(() => {
			expect(screen.getByTestId("onboarding-form")).toBeInTheDocument();
		});

		// Check for optional label (Spanish)
		expect(
			screen.getByText(/opcional.*puedes agregar una foto después/i),
		).toBeInTheDocument();
	});
});
