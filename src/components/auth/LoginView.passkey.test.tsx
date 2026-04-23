import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuroraProvider } from "@/contexts/aurora-context";
import { LanguageProvider } from "@/contexts/language-context";

const mockSignInPasskey = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/authClient", async (importOriginal) => {
	const mod = await importOriginal<typeof import("@/lib/auth/authClient")>();
	return {
		...mod,
		authClient: {
			...mod.authClient,
			signIn: {
				...mod.authClient.signIn,
				passkey: (opts?: { autoFill?: boolean }) => mockSignInPasskey(opts),
			},
		},
	};
});

import { LoginView } from "./LoginView";

const renderWithProviders = (ui: React.ReactElement) => {
	return render(
		<ThemeProvider>
			<LanguageProvider>
				<AuroraProvider>{ui}</AuroraProvider>
			</LanguageProvider>
		</ThemeProvider>,
	);
};

/** Matches `t("login.passkey.error")` in en or default es (tests may flip language on mount). */
const PASSKEY_FAILURE_PATTERN =
	/Passkey sign-in failed|Error al iniciar sesión con llave de acceso/i;

describe("LoginView passkey autofill", () => {
	const originalLocation = window.location;
	const originalPkc = globalThis.PublicKeyCredential;

	beforeEach(() => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		Object.defineProperty(window, "location", {
			value: { ...originalLocation, href: "" },
			writable: true,
		});
		mockSignInPasskey.mockResolvedValue({ data: null, error: null });
	});

	afterEach(async () => {
		await act(async () => {
			vi.runOnlyPendingTimers();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		vi.useRealTimers();
		cleanup();
		if (originalPkc === undefined) {
			delete (globalThis as { PublicKeyCredential?: unknown })
				.PublicKeyCredential;
		} else {
			globalThis.PublicKeyCredential = originalPkc;
		}
	});

	it("runs the same success UI as the CTA when conditional passkey autofill completes with a session", async () => {
		(
			globalThis as { PublicKeyCredential?: typeof PublicKeyCredential }
		).PublicKeyCredential = {
			isConditionalMediationAvailable: () => Promise.resolve(true),
		} as unknown as typeof PublicKeyCredential;

		mockSignInPasskey.mockResolvedValue({
			data: {
				user: { id: "u1", email: "user@example.com" },
				session: { id: "s1" },
			},
			error: null,
		});

		renderWithProviders(<LoginView />);

		await waitFor(() => {
			expect(mockSignInPasskey).toHaveBeenCalledWith({ autoFill: true });
		});

		await waitFor(() => {
			expect(screen.getByText(/Redirigiendo/i)).toBeInTheDocument();
		});
	});

	it("does not show serverError when autofill returns AUTH_CANCELLED (Better Auth wraps startAuthentication failure)", async () => {
		(
			globalThis as { PublicKeyCredential?: typeof PublicKeyCredential }
		).PublicKeyCredential = {
			isConditionalMediationAvailable: () => Promise.resolve(true),
		} as unknown as typeof PublicKeyCredential;

		mockSignInPasskey.mockResolvedValue({
			data: null,
			error: {
				code: "AUTH_CANCELLED",
				message: "auth cancelled",
				status: 400,
				statusText: "BAD_REQUEST",
			},
		});

		renderWithProviders(<LoginView />);

		await waitFor(() => {
			expect(mockSignInPasskey).toHaveBeenCalledWith({ autoFill: true });
		});

		await waitFor(() => {
			expect(
				screen.queryByText(PASSKEY_FAILURE_PATTERN),
			).not.toBeInTheDocument();
		});
	});

	it("does not show serverError when autofill returns Error with name AbortError (safety net)", async () => {
		(
			globalThis as { PublicKeyCredential?: typeof PublicKeyCredential }
		).PublicKeyCredential = {
			isConditionalMediationAvailable: () => Promise.resolve(true),
		} as unknown as typeof PublicKeyCredential;

		const abortError = Object.assign(
			new Error("Cancelling existing WebAuthn API call for new one"),
			{ name: "AbortError" },
		);
		mockSignInPasskey.mockResolvedValue({
			data: null,
			error: abortError,
		});

		renderWithProviders(<LoginView />);

		await waitFor(() => {
			expect(mockSignInPasskey).toHaveBeenCalledWith({ autoFill: true });
		});

		await waitFor(() => {
			expect(
				screen.queryByText(PASSKEY_FAILURE_PATTERN),
			).not.toBeInTheDocument();
		});
	});

	it("does not show serverError when CTA sign-in returns AUTH_CANCELLED", async () => {
		mockSignInPasskey.mockResolvedValue({
			data: null,
			error: {
				code: "AUTH_CANCELLED",
				message: "auth cancelled",
				status: 400,
				statusText: "BAD_REQUEST",
			},
		});
		const user = userEvent.setup();
		renderWithProviders(<LoginView />);

		await user.click(screen.getByRole("button", { name: /passkey/i }));

		await waitFor(() => {
			expect(mockSignInPasskey).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(
				screen.queryByText(PASSKEY_FAILURE_PATTERN),
			).not.toBeInTheDocument();
		});
	});
});
