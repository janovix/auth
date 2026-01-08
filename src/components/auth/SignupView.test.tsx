import type { AuthResult, SignUpCredentials } from "@/lib/auth/authActions";
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

import { SignupView } from "./SignupView";

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

// Mock window.location
const originalLocation = window.location;

const renderWithProviders = (ui: React.ReactElement) => {
	return render(
		<ThemeProvider>
			<AuroraProvider>{ui}</AuroraProvider>
		</ThemeProvider>,
	);
};

type SignUpFn = (credentials: SignUpCredentials) => Promise<AuthResult>;

const createSignUp = (): SignUpFn => vi.fn();

describe("SignupView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPush.mockClear();
		// Mock window.location.href as a writable property
		Object.defineProperty(window, "location", {
			value: { ...originalLocation, href: "" },
			writable: true,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it(
		"sends the registration payload to auth-core (passwordless)",
		{ timeout: 15000 },
		async () => {
			const signUp = createSignUp();
			vi.mocked(signUp).mockResolvedValue({
				success: true,
				data: {
					user: {
						id: "user-123",
						name: "Ana García",
						email: "ana@example.com",
						image: null,
						createdAt: new Date(),
						updatedAt: new Date(),
						emailVerified: true, // Already verified - should redirect immediately
					},
					session: {
						id: "session-123",
						userId: "user-123",
						token: "token-123",
						expiresAt: new Date(Date.now() + 3600 * 1000),
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				},
				error: null,
			});

			renderWithProviders(
				<SignupView redirectTo="https://app.example.com" signUp={signUp} />,
			);
			const user = userEvent.setup();

			await waitFor(() => {
				const forms = screen.getAllByTestId("signup-form");
				expect(forms.length).toBeGreaterThan(0);
			});

			const forms = screen.getAllByTestId("signup-form");
			const form = forms[forms.length - 1];

			const firstNameInputs = screen.getAllByLabelText(/^nombre$/i);
			await user.type(firstNameInputs[firstNameInputs.length - 1], "Ana");
			const lastNameInputs = screen.getAllByLabelText(/apellido/i);
			await user.type(lastNameInputs[lastNameInputs.length - 1], "García");
			const emailInputs = screen.getAllByLabelText(/correo/i);
			await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");
			const checkboxes = screen.getAllByRole("checkbox", {
				name: /acepto los términos/i,
			});
			await user.click(checkboxes[checkboxes.length - 1]);

			const submitButtons = screen.getAllByRole("button", {
				name: /crear cuenta/i,
			});
			const submitButton = submitButtons[submitButtons.length - 1];
			expect(submitButton).toHaveAttribute("type", "submit");
			fireEvent.submit(form);

			await waitFor(() => {
				// Passwordless signup - no password field
				expect(signUp).toHaveBeenCalledWith({
					name: "Ana García",
					email: "ana@example.com",
				});
			});

			// Should redirect to login after success
			await waitFor(
				() => {
					expect(mockPush).toHaveBeenCalledWith(
						"/login?redirect_to=https%3A%2F%2Fapp.example.com",
					);
				},
				{ timeout: 3000 },
			);
		},
	);

	it("shows OTP verification when email needs verification", async () => {
		const signUp = createSignUp();
		vi.mocked(signUp).mockResolvedValue({
			success: true,
			data: {
				user: {
					id: "user-123",
					name: "Ana García",
					email: "ana@example.com",
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					emailVerified: false, // Needs verification
				},
				session: {
					id: "session-123",
					userId: "user-123",
					token: "token-123",
					expiresAt: new Date(Date.now() + 3600 * 1000),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			},
			error: null,
		});

		renderWithProviders(<SignupView signUp={signUp} />);
		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("signup-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("signup-form");
		const form = forms[forms.length - 1];

		const firstNameInputs = screen.getAllByLabelText(/^nombre$/i);
		await user.type(firstNameInputs[firstNameInputs.length - 1], "Ana");
		const lastNameInputs = screen.getAllByLabelText(/apellido/i);
		await user.type(lastNameInputs[lastNameInputs.length - 1], "García");
		const emailInputs = screen.getAllByLabelText(/correo/i);
		await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");
		const checkboxes = screen.getAllByRole("checkbox", {
			name: /acepto los términos/i,
		});
		await user.click(checkboxes[checkboxes.length - 1]);

		fireEvent.submit(form);

		await waitFor(() => {
			expect(signUp).toHaveBeenCalled();
		});

		// Should show OTP input for verification
		await waitFor(() => {
			expect(
				screen.getByLabelText(/código de verificación/i),
			).toBeInTheDocument();
		});
	});

	it("shows the backend error message when signup fails", async () => {
		const signUp = createSignUp();
		vi.mocked(signUp).mockResolvedValue({
			success: false,
			data: null,
			error: new Error("Usuario existente"),
		});

		renderWithProviders(<SignupView signUp={signUp} />);
		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("signup-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("signup-form");
		const form = forms[forms.length - 1];

		const firstNameInputs = screen.getAllByLabelText(/^nombre$/i);
		await user.type(firstNameInputs[firstNameInputs.length - 1], "Ana");
		const lastNameInputs = screen.getAllByLabelText(/apellido/i);
		await user.type(lastNameInputs[lastNameInputs.length - 1], "García");
		const emailInputs = screen.getAllByLabelText(/correo/i);
		await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");
		const checkboxes = screen.getAllByRole("checkbox", {
			name: /acepto los términos/i,
		});
		await user.click(checkboxes[checkboxes.length - 1]);

		const submitButtons = screen.getAllByRole("button", {
			name: /crear cuenta/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		expect(submitButton).toHaveAttribute("type", "submit");
		fireEvent.submit(form);

		await waitFor(() => {
			expect(signUp).toHaveBeenCalled();
		});

		expect(
			await screen.findByText(/usuario existente/i, { exact: false }),
		).toBeInTheDocument();
	});

	it("requires terms acceptance", async () => {
		const signUp = createSignUp();
		renderWithProviders(<SignupView signUp={signUp} />);
		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("signup-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("signup-form");
		const form = forms[forms.length - 1];

		// Fill all fields except terms
		const firstNameInputs = screen.getAllByLabelText(/^nombre$/i);
		await user.type(firstNameInputs[firstNameInputs.length - 1], "Ana");
		const lastNameInputs = screen.getAllByLabelText(/apellido/i);
		await user.type(lastNameInputs[lastNameInputs.length - 1], "García");
		const emailInputs = screen.getAllByLabelText(/correo/i);
		await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");

		fireEvent.submit(form);

		// Should show terms validation error
		expect(
			await screen.findByText(/debes aceptar/i, { exact: false }),
		).toBeInTheDocument();

		// Should NOT call signUp
		expect(signUp).not.toHaveBeenCalled();
	});
});
