import type { AuthResult } from "@algenium/auth-next/client";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/ThemeProvider";

import { RecoverView } from "./RecoverView";

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

type RecoverFn = (email: string) => Promise<AuthResult<{ message: string }>>;

const createRecoverPassword = (): RecoverFn => vi.fn();

describe("RecoverView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Ensure clean state between tests
		document.body.innerHTML = "";
	});

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
			expect(recoverPassword).toHaveBeenCalledWith("ana@example.com");
		});

		// Should show success message
		const successAlerts = await screen.findAllByTestId("recover-success-alert");
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

	// Note: With the SDK, the recoverPassword function handles errors internally
	// and always returns AuthResult, so we don't test rejected promises.
});
