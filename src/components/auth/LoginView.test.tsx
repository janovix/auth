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
import { AuroraProvider } from "@/contexts/aurora-context";

import { LoginView } from "./LoginView";

// Mock window.location
const originalLocation = window.location;

const renderWithProviders = (ui: React.ReactElement) => {
	return render(
		<ThemeProvider>
			<AuroraProvider>{ui}</AuroraProvider>
		</ThemeProvider>,
	);
};

type SendOtpFn = (
	email: string,
	type: "sign-in",
) => Promise<AuthResult<{ message: string }>>;
type SignInWithOtpFn = (email: string, otp: string) => Promise<AuthResult>;

const createSendOtp = (): SendOtpFn => vi.fn();
const createSignInWithOtp = (): SignInWithOtpFn => vi.fn();

describe("LoginView", () => {
	beforeEach(() => {
		// Mock window.location.href as a writable property
		Object.defineProperty(window, "location", {
			value: { ...originalLocation, href: "" },
			writable: true,
		});
	});

	afterEach(() => {
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
			expect(sendOtp).toHaveBeenCalledWith("ana@example.com", "sign-in");
		});

		// Should show OTP input after sending
		await waitFor(() => {
			expect(
				screen.getByLabelText(/código de verificación/i),
			).toBeInTheDocument();
		});
	});

	it("verifies OTP and redirects on success", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
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

		vi.useRealTimers();
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
});
