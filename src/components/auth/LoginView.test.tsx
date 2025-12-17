import type { AuthResult, SignInCredentials } from "@/lib/auth/authActions";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/ThemeProvider";

import { LoginView } from "./LoginView";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

type SignInFn = (credentials: SignInCredentials) => Promise<AuthResult>;

const createSignIn = (): SignInFn => vi.fn();

describe("LoginView", () => {
	beforeEach(() => {
		pushMock.mockReset();
	});

	it("submits credentials and redirects on success", async () => {
		const signIn = createSignIn();
		vi.mocked(signIn).mockResolvedValue({
			success: true,
			data: {
				user: {
					id: "user-123",
					name: "Ana García",
					email: "ana@example.com",
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
			},
			error: null,
		});

		renderWithTheme(<LoginView redirectTo="/account" signIn={signIn} />);
		const user = userEvent.setup();

		const forms = screen.getAllByTestId("login-form");
		const form = forms[0];
		const emailInputs = screen.getAllByPlaceholderText("tu@empresa.com");
		await user.type(emailInputs[0], "ana@example.com");
		const passwordInputs = screen.getAllByPlaceholderText(
			/ingresa tu contraseña/i,
		);
		await user.type(passwordInputs[0], "Secret123!");
		const checkboxes = screen.getAllByRole("checkbox", {
			name: /recordar sesión/i,
		});
		await user.click(checkboxes[0]);
		const submitButtons = screen.getAllByRole("button", {
			name: /iniciar sesión/i,
		});
		const submitButton = submitButtons[0];
		expect(submitButton).toHaveAttribute("type", "submit");
		fireEvent.submit(form);

		await waitFor(() => {
			expect(signIn).toHaveBeenCalledWith({
				email: "ana@example.com",
				password: "Secret123!",
				rememberMe: false,
			});
			expect(pushMock).toHaveBeenCalledWith("/account");
		});
	});

	it("shows the error returned by auth-core", async () => {
		const signIn = createSignIn();
		vi.mocked(signIn).mockResolvedValue({
			success: false,
			data: null,
			error: new Error("Credenciales inválidas"),
		});

		renderWithTheme(<LoginView signIn={signIn} />);
		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("login-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("login-form");
		const form = forms[forms.length - 1];

		const emailInputs = screen.getAllByPlaceholderText("tu@empresa.com");
		await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");
		const passwordInputs = screen.getAllByPlaceholderText(
			/ingresa tu contraseña/i,
		);
		await user.type(passwordInputs[passwordInputs.length - 1], "Secret123!");

		const submitButtons = screen.getAllByRole("button", {
			name: /iniciar sesión/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		expect(submitButton).toHaveAttribute("type", "submit");

		fireEvent.submit(form);

		await waitFor(
			() => {
				expect(signIn).toHaveBeenCalled();
			},
			{ timeout: 3000 },
		);

		const errorAlert = await screen.findByRole("alert", {}, { timeout: 3000 });
		expect(errorAlert).toBeInTheDocument();
		expect(errorAlert).toHaveTextContent(/credenciales inválidas/i);
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("shows default success message when provided", () => {
		renderWithTheme(
			<LoginView
				defaultSuccessMessage="Login exitoso"
				signIn={createSignIn()}
			/>,
		);

		expect(
			screen.getByText(/login exitoso/i, { exact: false }),
		).toBeInTheDocument();
	});

	// Note: With the SDK, the signIn function handles errors internally
	// and always returns AuthResult, so we don't test rejected promises.

	// Note: Redirect for already logged-in users is now handled by proxy.ts middleware
	// at the edge level, before the page renders. No client-side redirect tests needed.
});
