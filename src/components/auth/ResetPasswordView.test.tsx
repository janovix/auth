import type { AuthResult } from "@/lib/auth/authActions";
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

import { ResetPasswordView } from "./ResetPasswordView";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
		refresh: refreshMock,
	}),
}));

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

type ResetPasswordFn = (
	token: string,
	newPassword: string,
) => Promise<AuthResult<{ message: string }>>;

const createResetPassword = (): ResetPasswordFn => vi.fn();

describe("ResetPasswordView", () => {
	beforeEach(() => {
		pushMock.mockReset();
		refreshMock.mockReset();
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("submits new password and redirects to login", async () => {
		const resetPassword = createResetPassword();
		vi.mocked(resetPassword).mockResolvedValue({
			success: true,
			data: { message: "Password reset successful" },
			error: null,
		});

		renderWithTheme(
			<ResetPasswordView
				token="token-123"
				resetPassword={resetPassword}
				redirectDelayMs={0}
			/>,
		);

		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("reset-password-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("reset-password-form");
		const form = forms[forms.length - 1];

		const newPasswordInputs = screen.getAllByLabelText(/nueva contraseña/i);
		await user.type(
			newPasswordInputs[newPasswordInputs.length - 1],
			"Secret123!",
		);
		const confirmPasswordInputs =
			screen.getAllByLabelText(/confirmar contraseña/i);
		await user.type(
			confirmPasswordInputs[confirmPasswordInputs.length - 1],
			"Secret123!",
		);
		const submitButtons = screen.getAllByRole("button", {
			name: /actualizar contraseña/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		expect(submitButton).toHaveAttribute("type", "submit");
		fireEvent.submit(form);

		await waitFor(() => {
			expect(resetPassword).toHaveBeenCalledWith("token-123", "Secret123!");
		});

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/login?reset=success");
		});
	});

	it("shows server error when auth-core rejects the token", async () => {
		const resetPassword = createResetPassword();
		vi.mocked(resetPassword).mockResolvedValue({
			success: false,
			data: null,
			error: new Error("Token inválido"),
		});

		renderWithTheme(
			<ResetPasswordView token="token-123" resetPassword={resetPassword} />,
		);

		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("reset-password-form");
			expect(forms.length).toBeGreaterThan(0);
			const successAlerts = screen.queryAllByTestId("reset-success-alert");
			expect(successAlerts.length).toBe(0);
		});

		const forms = screen.getAllByTestId("reset-password-form");
		const form = forms[forms.length - 1];

		const newPasswordInputs = screen.getAllByLabelText(/nueva contraseña/i);
		await user.type(
			newPasswordInputs[newPasswordInputs.length - 1],
			"Secret123!",
		);
		const confirmPasswordInputs =
			screen.getAllByLabelText(/confirmar contraseña/i);
		await user.type(
			confirmPasswordInputs[confirmPasswordInputs.length - 1],
			"Secret123!",
		);
		const submitButtons = screen.getAllByRole("button", {
			name: /actualizar contraseña/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		expect(submitButton).toHaveAttribute("type", "submit");
		fireEvent.submit(form);

		await waitFor(() => {
			expect(resetPassword).toHaveBeenCalled();
		});

		expect(
			await screen.findByText(/token inválido/i, { exact: false }),
		).toBeInTheDocument();
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("shows error when token is missing", () => {
		renderWithTheme(<ResetPasswordView token={null} />);

		expect(
			screen.getByText(/token inválido o expirado/i, { exact: false }),
		).toBeInTheDocument();
	});

	it("shows validation error when passwords don't match", async () => {
		const resetPassword = createResetPassword();
		renderWithTheme(
			<ResetPasswordView token="token-123" resetPassword={resetPassword} />,
		);
		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("reset-password-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("reset-password-form");
		const form = forms[forms.length - 1];

		const newPasswordInputs = screen.getAllByLabelText(/nueva contraseña/i);
		await user.type(
			newPasswordInputs[newPasswordInputs.length - 1],
			"Secret123!",
		);
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

	it("shows error when submitting without token", async () => {
		const resetPassword = createResetPassword();
		renderWithTheme(
			<ResetPasswordView token={null} resetPassword={resetPassword} />,
		);
		const user = userEvent.setup();

		await waitFor(() => {
			const forms = screen.getAllByTestId("reset-password-form");
			expect(forms.length).toBeGreaterThan(0);
		});

		const forms = screen.getAllByTestId("reset-password-form");
		const form = forms[forms.length - 1];

		const newPasswordInputs = screen.getAllByLabelText(/nueva contraseña/i);
		await user.type(
			newPasswordInputs[newPasswordInputs.length - 1],
			"Secret123!",
		);
		const confirmPasswordInputs =
			screen.getAllByLabelText(/confirmar contraseña/i);
		await user.type(
			confirmPasswordInputs[confirmPasswordInputs.length - 1],
			"Secret123!",
		);
		const submitButtons = screen.getAllByRole("button", {
			name: /actualizar contraseña/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		expect(submitButton).toHaveAttribute("type", "submit");
		fireEvent.submit(form);

		const errorMessages = await screen.findAllByText(
			/necesitas abrir el enlace/i,
			{
				exact: false,
			},
		);
		expect(errorMessages.length).toBeGreaterThan(0);
		expect(resetPassword).not.toHaveBeenCalled();
	});

	// Note: With the SDK, the resetPassword function handles errors internally
	// and always returns AuthResult, so we don't test rejected promises.
});
