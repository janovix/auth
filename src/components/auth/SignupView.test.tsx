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

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
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
		"sends the registration payload to auth-core",
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

			renderWithTheme(
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
			const passwordInputs = screen.getAllByLabelText(/^contraseña$/i);
			await user.type(passwordInputs[passwordInputs.length - 1], "Secret123!");
			const confirmPasswordInputs =
				screen.getAllByLabelText(/confirmar contraseña/i);
			await user.type(
				confirmPasswordInputs[confirmPasswordInputs.length - 1],
				"Secret123!",
			);
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
				expect(signUp).toHaveBeenCalledWith({
					name: "Ana García",
					email: "ana@example.com",
					password: "Secret123!",
				});
				expect(window.location.href).toBe("https://app.example.com");
			});
		},
	);

	it("shows the backend error message when signup fails", async () => {
		const signUp = createSignUp();
		vi.mocked(signUp).mockResolvedValue({
			success: false,
			data: null,
			error: new Error("Usuario existente"),
		});

		renderWithTheme(<SignupView signUp={signUp} />);
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
		const passwordInputs = screen.getAllByLabelText(/^contraseña$/i);
		await user.type(passwordInputs[passwordInputs.length - 1], "Secret123!");
		const confirmPasswordInputs =
			screen.getAllByLabelText(/confirmar contraseña/i);
		await user.type(
			confirmPasswordInputs[confirmPasswordInputs.length - 1],
			"Secret123!",
		);
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
		// Should not redirect on error
		expect(window.location.href).toBe("");
	});

	it("shows validation errors for invalid password", async () => {
		const signUp = createSignUp();
		renderWithTheme(<SignupView signUp={signUp} />);
		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("signup-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("signup-form");
		const _form = forms[forms.length - 1];

		const firstNameInputs = screen.getAllByLabelText(/^nombre$/i);
		await user.type(firstNameInputs[firstNameInputs.length - 1], "Ana");
		const lastNameInputs = screen.getAllByLabelText(/apellido/i);
		await user.type(lastNameInputs[lastNameInputs.length - 1], "García");
		const emailInputs = screen.getAllByLabelText(/correo/i);
		await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");
		const passwordInputs = screen.getAllByLabelText(/^contraseña$/i);
		await user.type(passwordInputs[passwordInputs.length - 1], "weak");
		const confirmPasswordInputs =
			screen.getAllByLabelText(/confirmar contraseña/i);
		await user.type(
			confirmPasswordInputs[confirmPasswordInputs.length - 1],
			"weak",
		);

		// With onChange validation, the error appears immediately after typing
		// Find the error message specifically (not the description)
		const errorMessages = await screen.findAllByText(/al menos 8 caracteres/i, {
			exact: false,
		});
		// The error message should be visible (not sr-only)
		const visibleError = errorMessages.find(
			(el) => !el.classList.contains("sr-only"),
		);
		expect(visibleError).toBeInTheDocument();
	});

	it("shows error when passwords don't match", async () => {
		const signUp = createSignUp();
		renderWithTheme(<SignupView signUp={signUp} />);
		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("signup-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("signup-form");
		const form = forms[forms.length - 1];

		const passwordInputs = screen.getAllByLabelText(/^contraseña$/i);
		await user.type(passwordInputs[passwordInputs.length - 1], "Secret123!");
		const confirmPasswordInputs =
			screen.getAllByLabelText(/confirmar contraseña/i);
		await user.type(
			confirmPasswordInputs[confirmPasswordInputs.length - 1],
			"Different123!",
		);

		fireEvent.submit(form);

		expect(
			await screen.findByText(/no coinciden/i, { exact: false }),
		).toBeInTheDocument();
	});

	// Note: With the SDK, the signUp function handles errors internally
	// and always returns AuthResult, so we don't test rejected promises.
});
