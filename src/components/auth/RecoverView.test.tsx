import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";

import type { AuthClient } from "@/lib/auth/authClient";
import { RecoverView } from "./RecoverView";

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

type RecoverClient = Pick<AuthClient, "requestPasswordReset">;

const createClient = (): RecoverClient => ({
	requestPasswordReset: vi.fn() as RecoverClient["requestPasswordReset"],
});

describe("RecoverView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("requests a password reset email for the given address", async () => {
		const client = createClient();
		vi.mocked(client.requestPasswordReset).mockResolvedValue({
			data: { status: true, message: "Email enviado" },
			error: null,
		});

		renderWithTheme(<RecoverView redirectTo="/login" client={client} />);
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
			expect(client.requestPasswordReset).toHaveBeenCalledWith({
				email: "ana@example.com",
				redirectTo: "/login",
			});
		});
	});

	it("shows the error returned by auth-core", async () => {
		const client = createClient();
		vi.mocked(client.requestPasswordReset).mockResolvedValue({
			data: null,
			error: {
				message: "Solicitud inválida",
				status: 400,
				statusText: "Bad Request",
			},
		});

		renderWithTheme(<RecoverView redirectTo="/recover/reset" client={client} />);
		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("recover-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("recover-form");
		const form = forms[forms.length - 1];

		const emailInputs = screen.getAllByLabelText(/correo/i);
		await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");
		
		// Wait a bit for form validation to complete
		await waitFor(() => {
			expect(emailInputs[emailInputs.length - 1]).toHaveValue("ana@example.com");
		});
		
		fireEvent.submit(form);

		await waitFor(() => {
			expect(client.requestPasswordReset).toHaveBeenCalled();
		}, { timeout: 3000 });

		expect(
			await screen.findByText(/solicitud inválida/i, { exact: false }),
		).toBeInTheDocument();
	});

	it("handles response with status false", async () => {
		const client = createClient();
		vi.mocked(client.requestPasswordReset).mockResolvedValue({
			data: { status: false, message: "Error en el servidor" },
			error: null,
		});

		renderWithTheme(<RecoverView redirectTo="/recover/reset" client={client} />);
		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("recover-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("recover-form");
		const form = forms[forms.length - 1];

		const emailInputs = screen.getAllByLabelText(/correo/i);
		await user.type(emailInputs[emailInputs.length - 1], "ana@example.com");
		
		// Wait for form to be ready and submit button to be available
		await waitFor(() => {
			const submitButtons = screen.getAllByRole("button", {
				name: /enviar enlace de recuperación/i,
			});
			expect(submitButtons.length).toBeGreaterThan(0);
		});
		
		const submitButtons = screen.getAllByRole("button", {
			name: /enviar enlace de recuperación/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		
		// Click the button instead of submitting form directly
		await user.click(submitButton);

		await waitFor(() => {
			expect(client.requestPasswordReset).toHaveBeenCalled();
		}, { timeout: 3000 });

		expect(
			await screen.findByText(/error en el servidor/i, { exact: false }),
		).toBeInTheDocument();
	});
});
