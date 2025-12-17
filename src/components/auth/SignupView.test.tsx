import {
	fireEvent,
	render,
	screen,
	waitFor,
	cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

import type { AuthClient } from "@/lib/auth/authClient";
import { SignupView } from "./SignupView";

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

type SignupClient = {
	signUp: {
		email: AuthClient["signUp"]["email"];
	};
};

const createClient = (): SignupClient => ({
	signUp: {
		email: vi.fn() as SignupClient["signUp"]["email"],
	},
});

describe("SignupView", () => {
	beforeEach(() => {
		pushMock.mockReset();
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("sends the registration payload to auth-core", async () => {
		const client = createClient();
		vi.mocked(client.signUp.email).mockResolvedValue({
			data: {},
			error: null,
		});

		renderWithTheme(<SignupView client={client} />);
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
			expect(client.signUp.email).toHaveBeenCalledWith({
				name: "Ana García",
				email: "ana@example.com",
				password: "Secret123!",
			});
			expect(pushMock).toHaveBeenCalledWith("/account");
		});
	});

	it("shows the backend error message when signup fails", async () => {
		const client = createClient();
		vi.mocked(client.signUp.email).mockResolvedValue({
			data: null,
			error: {
				message: "Usuario existente",
				status: 409,
				statusText: "Conflict",
			},
		});

		renderWithTheme(<SignupView client={client} />);
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
			expect(client.signUp.email).toHaveBeenCalled();
		});

		expect(
			await screen.findByText(/usuario existente/i, { exact: false }),
		).toBeInTheDocument();
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("shows validation errors for invalid password", async () => {
		const client = createClient();
		renderWithTheme(<SignupView client={client} />);
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
		const client = createClient();
		renderWithTheme(<SignupView client={client} />);
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

	it("handles exception during signup", async () => {
		const client = createClient();
		vi.mocked(client.signUp.email).mockRejectedValue(
			new Error("Network error"),
		);

		renderWithTheme(<SignupView client={client} />);
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

		fireEvent.submit(form);

		await waitFor(() => {
			expect(client.signUp.email).toHaveBeenCalled();
		});

		expect(
			await screen.findByText(/network error/i, { exact: false }),
		).toBeInTheDocument();
		expect(pushMock).not.toHaveBeenCalled();
	});
});
