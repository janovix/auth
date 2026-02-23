import type { AuthResult } from "@/lib/auth/authActions";
import {
	act,
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
import { LanguageProvider } from "@/contexts/language-context";

import { LoginView } from "./LoginView";

// Mock window.location
const originalLocation = window.location;

const renderWithProviders = (ui: React.ReactElement) => {
	return render(
		<ThemeProvider>
			<LanguageProvider>
				<AuroraProvider>{ui}</AuroraProvider>
			</LanguageProvider>
		</ThemeProvider>,
	);
};

type SendOtpOptions = { captchaToken?: string };
type SendOtpFn = (
	email: string,
	type: "sign-in",
	options?: SendOtpOptions,
) => Promise<AuthResult<{ message: string }>>;
type SignInWithOtpFn = (email: string, otp: string) => Promise<AuthResult>;

const createSendOtp = (): SendOtpFn => vi.fn();
const createSignInWithOtp = (): SignInWithOtpFn => vi.fn();

describe("LoginView", () => {
	beforeEach(() => {
		// Use fake timers to control async behavior
		vi.useFakeTimers({ shouldAdvanceTime: true });
		// Mock window.location.href as a writable property
		Object.defineProperty(window, "location", {
			value: { ...originalLocation, href: "" },
			writable: true,
		});
	});

	afterEach(async () => {
		// Flush all pending React updates and timers before cleanup
		await act(async () => {
			vi.runOnlyPendingTimers();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		vi.useRealTimers();
		cleanup();
	});

	it("sends OTP and shows OTP input on success", async () => {
		const sendOtp = createSendOtp();
		const signInWithOtp = createSignInWithOtp();

		vi.mocked(sendOtp).mockResolvedValue({
			success: true,
			data: { message: "OTP sent" },
			error: null,
		});

		renderWithProviders(
			<LoginView sendOtp={sendOtp} signInWithOtp={signInWithOtp} />,
		);
		const user = userEvent.setup();

		// Enter email and submit
		const emailInputs = screen.getAllByPlaceholderText("tu@empresa.com");
		const emailInput = emailInputs[emailInputs.length - 1];
		await user.type(emailInput, "ana@example.com");

		const submitButtons = screen.getAllByRole("button", {
			name: /enviar código/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(sendOtp).toHaveBeenCalledWith("ana@example.com", "sign-in", {
				captchaToken: undefined,
			});
		});

		// Should show OTP input after sending
		await waitFor(() => {
			expect(
				screen.getByLabelText(/código de verificación/i),
			).toBeInTheDocument();
		});
	});

	it("verifies OTP and redirects on success", async () => {
		const sendOtp = createSendOtp();
		const signInWithOtp = createSignInWithOtp();

		vi.mocked(sendOtp).mockResolvedValue({
			success: true,
			data: { message: "OTP sent" },
			error: null,
		});

		vi.mocked(signInWithOtp).mockResolvedValue({
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

		renderWithProviders(
			<LoginView
				redirectTo="https://app.example.com"
				sendOtp={sendOtp}
				signInWithOtp={signInWithOtp}
			/>,
		);
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		// Step 1: Enter email
		const emailInputs = screen.getAllByPlaceholderText("tu@empresa.com");
		const emailInput = emailInputs[emailInputs.length - 1];
		await user.type(emailInput, "ana@example.com");

		const submitButtons = screen.getAllByRole("button", {
			name: /enviar código/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		fireEvent.click(submitButton);

		// Wait for OTP input to appear
		await waitFor(() => {
			expect(
				screen.getByLabelText(/código de verificación/i),
			).toBeInTheDocument();
		});

		// Step 2: Enter OTP (6 digits)
		const otpInput = screen.getByLabelText(/código de verificación/i);
		await user.type(otpInput, "123456");

		// Verify OTP was submitted
		await waitFor(() => {
			expect(signInWithOtp).toHaveBeenCalledWith("ana@example.com", "123456");
		});

		// Should show success animation with redirecting message
		await waitFor(() => {
			expect(screen.getByText(/redirigiendo/i)).toBeInTheDocument();
		});

		// Advance timers to trigger redirect after success animation
		await vi.advanceTimersByTimeAsync(3000);

		// Check redirect happened
		expect(window.location.href).toBe("https://app.example.com");
	});

	it("shows error when OTP sending fails", async () => {
		const sendOtp = createSendOtp();
		const signInWithOtp = createSignInWithOtp();

		vi.mocked(sendOtp).mockResolvedValue({
			success: false,
			data: null,
			error: new Error("Usuario no encontrado"),
		});

		renderWithProviders(
			<LoginView sendOtp={sendOtp} signInWithOtp={signInWithOtp} />,
		);
		const user = userEvent.setup();

		const emailInputs = screen.getAllByPlaceholderText("tu@empresa.com");
		const emailInput = emailInputs[emailInputs.length - 1];
		await user.type(emailInput, "ana@example.com");

		const submitButtons = screen.getAllByRole("button", {
			name: /enviar código/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(sendOtp).toHaveBeenCalled();
		});

		const errorAlert = await screen.findByRole("alert");
		expect(errorAlert).toBeInTheDocument();
		// Should not show OTP input on error
		expect(
			screen.queryByLabelText(/código de verificación/i),
		).not.toBeInTheDocument();
	});

	it("shows default success message when provided", () => {
		const sendOtp = createSendOtp();
		const signInWithOtp = createSignInWithOtp();

		renderWithProviders(
			<LoginView
				defaultSuccessMessage="Login exitoso"
				sendOtp={sendOtp}
				signInWithOtp={signInWithOtp}
			/>,
		);

		expect(
			screen.getByText(/login exitoso/i, { exact: false }),
		).toBeInTheDocument();
	});

	it("allows changing email after OTP is sent", async () => {
		const sendOtp = createSendOtp();
		const signInWithOtp = createSignInWithOtp();

		vi.mocked(sendOtp).mockResolvedValue({
			success: true,
			data: { message: "OTP sent" },
			error: null,
		});

		renderWithProviders(
			<LoginView sendOtp={sendOtp} signInWithOtp={signInWithOtp} />,
		);
		const user = userEvent.setup();

		// Send OTP
		const emailInputs = screen.getAllByPlaceholderText("tu@empresa.com");
		const emailInput = emailInputs[emailInputs.length - 1];
		await user.type(emailInput, "ana@example.com");
		const submitButtons = screen.getAllByRole("button", {
			name: /enviar código/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		fireEvent.click(submitButton);

		// Wait for OTP view
		await waitFor(() => {
			expect(
				screen.getByLabelText(/código de verificación/i),
			).toBeInTheDocument();
		});

		// Click "Change email" button
		const changeEmailButton = screen.getByRole("button", {
			name: /cambiar correo/i,
		});
		await user.click(changeEmailButton);

		// Should go back to email input
		await waitFor(() => {
			const inputs = screen.getAllByPlaceholderText("tu@empresa.com");
			expect(inputs.length).toBeGreaterThan(0);
		});
	});

	it("shows banned user error and allows trying different email", async () => {
		const sendOtp = createSendOtp();
		const signInWithOtp = createSignInWithOtp();

		vi.mocked(sendOtp).mockResolvedValue({
			success: true,
			data: { message: "OTP sent" },
			error: null,
		});

		// Create error with BANNED code
		const bannedError = new Error(
			"You have been banned from this application",
		) as Error & { code: string };
		bannedError.code = "BANNED";

		vi.mocked(signInWithOtp).mockResolvedValue({
			success: false,
			data: null,
			error: bannedError,
		});

		renderWithProviders(
			<LoginView sendOtp={sendOtp} signInWithOtp={signInWithOtp} />,
		);
		const user = userEvent.setup();

		// Step 1: Enter email
		const emailInputs = screen.getAllByPlaceholderText("tu@empresa.com");
		const emailInput = emailInputs[emailInputs.length - 1];
		await user.type(emailInput, "banned@example.com");

		const submitButtons = screen.getAllByRole("button", {
			name: /enviar código/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		fireEvent.click(submitButton);

		// Wait for OTP input to appear
		await waitFor(() => {
			expect(
				screen.getByLabelText(/código de verificación/i),
			).toBeInTheDocument();
		});

		// Step 2: Enter OTP (6 digits)
		const otpInput = screen.getByLabelText(/código de verificación/i);
		await user.type(otpInput, "123456");

		// Wait for banned error to be shown
		await waitFor(() => {
			expect(signInWithOtp).toHaveBeenCalledWith(
				"banned@example.com",
				"123456",
			);
		});

		// Should show banned error alert (OTP fields are hidden when banned)
		await waitFor(() => {
			expect(screen.getByText(/cuenta suspendida/i)).toBeInTheDocument();
		});

		// OTP input should be hidden when banned
		expect(
			screen.queryByLabelText(/código de verificación/i),
		).not.toBeInTheDocument();

		// "Código enviado" success alert should also be hidden
		expect(screen.queryByText(/código enviado/i)).not.toBeInTheDocument();

		// Should show "Try different email" button
		const tryDifferentButton = screen.getByRole("button", {
			name: /probar con otro correo/i,
		});
		expect(tryDifferentButton).toBeInTheDocument();

		// Click "Try different email" to go back to email input
		await user.click(tryDifferentButton);

		// Should go back to email input
		await waitFor(() => {
			const inputs = screen.getAllByPlaceholderText("tu@empresa.com");
			expect(inputs.length).toBeGreaterThan(0);
		});
	});

	it("clears OTP input on invalid OTP error to prevent auto-submit loop", async () => {
		const sendOtp = createSendOtp();
		const signInWithOtp = createSignInWithOtp();

		vi.mocked(sendOtp).mockResolvedValue({
			success: true,
			data: { message: "OTP sent" },
			error: null,
		});

		// Create error with INVALID code
		const invalidError = new Error("Invalid OTP") as Error & { code: string };
		invalidError.code = "INVALID";

		vi.mocked(signInWithOtp).mockResolvedValue({
			success: false,
			data: null,
			error: invalidError,
		});

		renderWithProviders(
			<LoginView sendOtp={sendOtp} signInWithOtp={signInWithOtp} />,
		);
		const user = userEvent.setup();

		// Step 1: Enter email
		const emailInputs = screen.getAllByPlaceholderText("tu@empresa.com");
		const emailInput = emailInputs[emailInputs.length - 1];
		await user.type(emailInput, "ana@example.com");

		const submitButtons = screen.getAllByRole("button", {
			name: /enviar código/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		fireEvent.click(submitButton);

		// Wait for OTP input to appear
		await waitFor(() => {
			expect(
				screen.getByLabelText(/código de verificación/i),
			).toBeInTheDocument();
		});

		// Step 2: Enter invalid OTP (6 digits)
		const otpInput = screen.getByLabelText(/código de verificación/i);
		await user.type(otpInput, "123456");

		// Wait for signInWithOtp to be called
		await waitFor(() => {
			expect(signInWithOtp).toHaveBeenCalledWith("ana@example.com", "123456");
		});

		// Should show error alert (destructive variant contains the error message)
		await waitFor(() => {
			expect(screen.getByText(/error de verificación/i)).toBeInTheDocument();
		});

		// OTP should have been called only once (not in a loop)
		// Give time for any potential loop to occur
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(signInWithOtp).toHaveBeenCalledTimes(1);
	});

	it("allows multiple OTP attempts without infinite loop", async () => {
		const sendOtp = createSendOtp();
		const signInWithOtp = createSignInWithOtp();

		vi.mocked(sendOtp).mockResolvedValue({
			success: true,
			data: { message: "OTP sent" },
			error: null,
		});

		// Create error with INVALID code
		const invalidError = new Error("Invalid OTP") as Error & { code: string };
		invalidError.code = "INVALID";

		vi.mocked(signInWithOtp).mockResolvedValue({
			success: false,
			data: null,
			error: invalidError,
		});

		renderWithProviders(
			<LoginView sendOtp={sendOtp} signInWithOtp={signInWithOtp} />,
		);
		const user = userEvent.setup();

		// Step 1: Enter email
		const emailInputs = screen.getAllByPlaceholderText("tu@empresa.com");
		const emailInput = emailInputs[emailInputs.length - 1];
		await user.type(emailInput, "ana@example.com");

		const submitButtons = screen.getAllByRole("button", {
			name: /enviar código/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		fireEvent.click(submitButton);

		// Wait for OTP input to appear
		await waitFor(() => {
			expect(
				screen.getByLabelText(/código de verificación/i),
			).toBeInTheDocument();
		});

		// First failed attempt
		let otpInput = screen.getByLabelText(/código de verificación/i);
		await user.type(otpInput, "111111");

		await waitFor(() => {
			expect(signInWithOtp).toHaveBeenCalledTimes(1);
		});

		// Should show error message after first attempt
		await waitFor(() => {
			expect(screen.getByText(/error de verificación/i)).toBeInTheDocument();
		});

		// Second failed attempt - verify we can type again after error (OTP was cleared)
		otpInput = screen.getByLabelText(/código de verificación/i);
		await user.type(otpInput, "222222");

		await waitFor(() => {
			expect(signInWithOtp).toHaveBeenCalledTimes(2);
		});

		// Verify no infinite loop - signInWithOtp should only be called twice
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(signInWithOtp).toHaveBeenCalledTimes(2);
	});

	it("shows resend button when server returns TOO_MANY_ATTEMPTS", async () => {
		const sendOtp = createSendOtp();
		const signInWithOtp = createSignInWithOtp();

		vi.mocked(sendOtp).mockResolvedValue({
			success: true,
			data: { message: "OTP sent" },
			error: null,
		});

		// Create error with TOO_MANY_ATTEMPTS code (server-side limit exceeded)
		const tooManyAttemptsError = new Error(
			"Too many attempts. Request a new code.",
		) as Error & { code: string };
		tooManyAttemptsError.code = "TOO_MANY_ATTEMPTS";

		vi.mocked(signInWithOtp).mockResolvedValue({
			success: false,
			data: null,
			error: tooManyAttemptsError,
		});

		renderWithProviders(
			<LoginView sendOtp={sendOtp} signInWithOtp={signInWithOtp} />,
		);
		const user = userEvent.setup();

		// Step 1: Enter email
		const emailInputs = screen.getAllByPlaceholderText("tu@empresa.com");
		const emailInput = emailInputs[emailInputs.length - 1];
		await user.type(emailInput, "ana@example.com");

		const submitButtons = screen.getAllByRole("button", {
			name: /enviar código/i,
		});
		const submitButton = submitButtons[submitButtons.length - 1];
		fireEvent.click(submitButton);

		// Wait for OTP input to appear
		await waitFor(() => {
			expect(
				screen.getByLabelText(/código de verificación/i),
			).toBeInTheDocument();
		});

		// Enter OTP (server will return TOO_MANY_ATTEMPTS)
		const otpInput = screen.getByLabelText(/código de verificación/i);
		await user.type(otpInput, "123456");

		// Wait for the error to be shown
		await waitFor(() => {
			expect(signInWithOtp).toHaveBeenCalledTimes(1);
		});

		// Should show the error message for TOO_MANY_ATTEMPTS
		await waitFor(() => {
			expect(
				screen.getByText(/has excedido el número de intentos/i),
			).toBeInTheDocument();
		});

		// The resend button should be visible (may show cooldown timer or request new button)
		// When otpNeedsResend is true, a prominent button appears for requesting new code
		const allButtons = screen.getAllByRole("button");
		const resendButton = allButtons.find(
			(btn) =>
				btn.textContent?.includes("Espera") ||
				btn.textContent?.includes("Solicitar nuevo código"),
		);
		expect(resendButton).toBeInTheDocument();
	});
});
