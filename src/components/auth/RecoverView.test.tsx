import type { AuthResult } from "@/lib/auth/authActions";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/ThemeProvider";

import { RecoverView } from "./RecoverView";

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

type RecoverFn = (
	email: string,
	turnstileToken?: string,
) => Promise<AuthResult<{ message: string }>>;

const createRecoverPassword = (): RecoverFn => vi.fn();

// Test site key for Turnstile
const TEST_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

describe("RecoverView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Ensure clean state between tests
		document.body.innerHTML = "";
	});

	describe("without Turnstile", () => {
		it("requests a password reset email for the given address", async () => {
			const recoverPassword = createRecoverPassword();
			vi.mocked(recoverPassword).mockResolvedValue({
				success: true,
				data: { message: "Email enviado" },
				error: null,
			});

			renderWithTheme(<RecoverView recoverPassword={recoverPassword} />);
			const user = userEvent.setup();

			await waitFor(() => {
				const forms = screen.getAllByTestId("recover-form");
				expect(forms.length).toBeGreaterThan(0);
			});

			const forms = screen.getAllByTestId("recover-form");
			const form = forms[forms.length - 1];

			const emailInputs = screen.getAllByLabelText(/correo/i);
			await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");
			const submitButtons = screen.getAllByRole("button", {
				name: /enviar enlace de recuperación/i,
			});
			const submitButton = submitButtons[submitButtons.length - 1];
			expect(submitButton).toHaveAttribute("type", "submit");
			fireEvent.submit(form);

			await waitFor(() => {
				expect(recoverPassword).toHaveBeenCalledWith(
					"ana@example.com",
					undefined,
				);
			});

			// Should show success message
			const successAlerts = await screen.findAllByTestId(
				"recover-success-alert",
			);
			expect(successAlerts.length).toBeGreaterThan(0);
		});

		it("shows the error returned by auth-core", async () => {
			const recoverPassword = createRecoverPassword();
			vi.mocked(recoverPassword).mockResolvedValue({
				success: false,
				data: null,
				error: new Error("Solicitud inválida"),
			});

			renderWithTheme(<RecoverView recoverPassword={recoverPassword} />);
			const user = userEvent.setup();

			await waitFor(() => {
				const forms = screen.getAllByTestId("recover-form");
				expect(forms.length).toBeGreaterThan(0);
			});

			const forms = screen.getAllByTestId("recover-form");
			const form = forms[forms.length - 1];

			const emailInputs = screen.getAllByLabelText(/correo/i);
			await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");
			const submitButtons = screen.getAllByRole("button", {
				name: /enviar enlace de recuperación/i,
			});
			const submitButton = submitButtons[submitButtons.length - 1];
			expect(submitButton).toHaveAttribute("type", "submit");
			fireEvent.submit(form);

			await waitFor(() => {
				expect(recoverPassword).toHaveBeenCalled();
			});

			expect(
				await screen.findByText(/solicitud inválida/i, { exact: false }),
			).toBeInTheDocument();
		});
	});

	describe("with Turnstile enabled", () => {
		it("renders Turnstile widget when site key is provided", async () => {
			const recoverPassword = createRecoverPassword();

			renderWithTheme(
				<RecoverView
					recoverPassword={recoverPassword}
					turnstileSiteKey={TEST_TURNSTILE_SITE_KEY}
				/>,
			);

			await waitFor(() => {
				expect(screen.getByTestId("turnstile-widget")).toBeInTheDocument();
			});
		});

		it("passes turnstile token when submitting with Turnstile enabled", async () => {
			const recoverPassword = createRecoverPassword();
			vi.mocked(recoverPassword).mockResolvedValue({
				success: true,
				data: { message: "Email enviado" },
				error: null,
			});

			renderWithTheme(
				<RecoverView
					recoverPassword={recoverPassword}
					turnstileSiteKey={TEST_TURNSTILE_SITE_KEY}
				/>,
			);
			const user = userEvent.setup();

			// Wait for Turnstile to verify (mocked to call onSuccess after 50ms)
			await waitFor(() => {
				expect(screen.getByTestId("turnstile-widget")).toBeInTheDocument();
			});

			// Give time for the mock Turnstile to call onSuccess
			await new Promise((r) => setTimeout(r, 100));

			const emailInputs = screen.getAllByLabelText(/correo/i);
			await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");

			const forms = screen.getAllByTestId("recover-form");
			const form = forms[forms.length - 1];
			fireEvent.submit(form);

			await waitFor(() => {
				expect(recoverPassword).toHaveBeenCalledWith(
					"ana@example.com",
					"mock-turnstile-token",
				);
			});
		});
	});

	// Note: With the SDK, the recoverPassword function handles errors internally
	// and always returns AuthResult, so we don't test rejected promises.
});
