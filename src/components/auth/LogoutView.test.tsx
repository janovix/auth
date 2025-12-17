import type { AuthResult } from "@algenium/auth-next/client";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/ThemeProvider";

import { LogoutView } from "./LogoutView";

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

type SignOutFn = () => Promise<AuthResult<null>>;

const createSignOut = (): SignOutFn => vi.fn();

describe("LogoutView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders logout view", () => {
		const signOut = createSignOut();
		vi.mocked(signOut).mockResolvedValue({
			success: true,
			data: null,
			error: null,
		});

		renderWithTheme(<LogoutView signOut={signOut} />);

		const titles = screen.getAllByText(/cerrar sesión/i, { exact: false });
		expect(titles.length).toBeGreaterThan(0);
		const links = screen.getAllByRole("link", { name: /iniciar sesión/i });
		expect(links.length).toBeGreaterThan(0);
	});

	it("shows success message when sign out succeeds", async () => {
		const signOut = createSignOut();
		vi.mocked(signOut).mockResolvedValue({
			success: true,
			data: null,
			error: null,
		});

		renderWithTheme(<LogoutView signOut={signOut} />);

		await waitFor(
			() => {
				expect(signOut).toHaveBeenCalled();
			},
			{ timeout: 2000 },
		);

		const successMessages = await screen.findAllByText(/sesión cerrada/i, {
			exact: false,
		});
		expect(successMessages.length).toBeGreaterThan(0);
	});

	it("shows error message when sign out fails", async () => {
		const signOut = createSignOut();
		vi.mocked(signOut).mockResolvedValue({
			success: false,
			data: null,
			error: new Error("Error al cerrar sesión"),
		});

		renderWithTheme(<LogoutView signOut={signOut} />);

		await waitFor(
			() => {
				expect(signOut).toHaveBeenCalled();
			},
			{ timeout: 2000 },
		);

		const errorMessages = await screen.findAllByText(
			/error al cerrar sesión/i,
			{
				exact: false,
			},
		);
		expect(errorMessages.length).toBeGreaterThan(0);
	});

	it("allows retrying sign out", async () => {
		const signOut = createSignOut();
		vi.mocked(signOut)
			.mockResolvedValueOnce({
				success: false,
				data: null,
				error: new Error("Error"),
			})
			.mockResolvedValueOnce({
				success: true,
				data: null,
				error: null,
			});

		renderWithTheme(<LogoutView signOut={signOut} />);

		await waitFor(
			() => {
				expect(signOut).toHaveBeenCalledTimes(1);
			},
			{ timeout: 2000 },
		);

		await waitFor(
			() => {
				const retryButtons = screen.getAllByRole("button", {
					name: /reintentar/i,
				});
				expect(retryButtons.length).toBeGreaterThan(0);
			},
			{ timeout: 2000 },
		);

		const retryButtons = screen.getAllByRole("button", { name: /reintentar/i });
		const retryButton = retryButtons[retryButtons.length - 1];
		const user = userEvent.setup();
		await user.click(retryButton);

		await waitFor(
			() => {
				expect(signOut).toHaveBeenCalledTimes(2);
			},
			{ timeout: 2000 },
		);
	});

	// Note: With the SDK, the signOut function handles errors internally
	// and always returns AuthResult, so we don't test rejected promises.
});
