import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
		refresh: refreshMock,
	}),
}));

import type { AuthClient } from "@/lib/auth/authClient";
import { ResetPasswordView } from "./ResetPasswordView";

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

type ResetClient = Pick<AuthClient, "resetPassword">;

const createClient = (): ResetClient => ({
	resetPassword: vi.fn() as ResetClient["resetPassword"],
});

describe("ResetPasswordView", () => {
	beforeEach(() => {
		pushMock.mockReset();
		refreshMock.mockReset();
	});

	it("submits new password and redirects to login", async () => {
		const client = createClient();
		vi.mocked(client.resetPassword).mockResolvedValue({
			data: { status: true },
			error: null,
		});

		renderWithTheme(
			<ResetPasswordView
				token="token-123"
				client={client}
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
		const confirmPasswordInputs = screen.getAllByLabelText(
			/confirma tu contraseña/i,
		);
		await user.type(
			confirmPasswordInputs[confirmPasswordInputs.length - 1],
			"Secret123!",
		);

		fireEvent.submit(form);

		await waitFor(() => {
			expect(client.resetPassword).toHaveBeenCalledWith({
				token: "token-123",
				newPassword: "Secret123!",
			});
		});

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/login?reset=success");
		});
	});

	it("shows server error when auth-core rejects the token", async () => {
		const client = createClient();
		vi.mocked(client.resetPassword).mockResolvedValue({
			data: null,
			error: {
				message: "Token inválido",
				status: 400,
				statusText: "Bad Request",
			},
		});

		renderWithTheme(<ResetPasswordView token="token-123" client={client} />);

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
		const confirmPasswordInputs = screen.getAllByLabelText(
			/confirma tu contraseña/i,
		);
		await user.type(
			confirmPasswordInputs[confirmPasswordInputs.length - 1],
			"Secret123!",
		);

		fireEvent.submit(form);

		await waitFor(() => {
			expect(client.resetPassword).toHaveBeenCalled();
		});

		expect(
			await screen.findByText(/token inválido/i, { exact: false }),
		).toBeInTheDocument();
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("shows error when token is missing", () => {
		renderWithTheme(<ResetPasswordView token={null} />);

		expect(
			screen.getByText(/no encontramos un token válido/i, { exact: false }),
		).toBeInTheDocument();
	});

	it("shows validation error when passwords don't match", async () => {
		const client = createClient();
		renderWithTheme(<ResetPasswordView token="token-123" client={client} />);
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
		const confirmPasswordInputs = screen.getAllByLabelText(
			/confirma tu contraseña/i,
		);
		await user.type(
			confirmPasswordInputs[confirmPasswordInputs.length - 1],
			"Different123!",
		);

		fireEvent.submit(form);

		expect(
			await screen.findByText(/no coinciden/i, { exact: false }),
		).toBeInTheDocument();
	});
});
