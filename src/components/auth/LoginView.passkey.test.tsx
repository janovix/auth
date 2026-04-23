import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
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
});
