import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LogoutView } from "./LogoutView";
import { authClient } from "@/lib/auth/authClient";

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

vi.mock("@/lib/auth/authClient", () => ({
	authClient: {
		signOut: vi.fn(),
	},
}));

describe("LogoutView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders logout view", () => {
		vi.mocked(authClient.signOut).mockResolvedValue({
			data: {},
			error: null,
		});

		renderWithTheme(<LogoutView />);

		const titles = screen.getAllByText(/cerrar sesión/i, { exact: false });
		expect(titles.length).toBeGreaterThan(0);
		const buttons = screen.getAllByRole("button", { name: /reintentar/i });
		expect(buttons.length).toBeGreaterThan(0);
		const links = screen.getAllByRole("link", { name: /iniciar sesión/i });
		expect(links.length).toBeGreaterThan(0);
	});

	it("shows success message when sign out succeeds", async () => {
		vi.mocked(authClient.signOut).mockResolvedValue({
			data: {},
			error: null,
		});

		renderWithTheme(<LogoutView />);

		await waitFor(
			() => {
				expect(authClient.signOut).toHaveBeenCalled();
			},
			{ timeout: 2000 },
		);

		const successMessages = await screen.findAllByText(/sesión cerrada/i, {
			exact: false,
		});
		expect(successMessages.length).toBeGreaterThan(0);
	});

	it("shows error message when sign out fails", async () => {
		vi.mocked(authClient.signOut).mockResolvedValue({
			data: null,
			error: { message: "Error al cerrar sesión", status: 500 },
		});

		renderWithTheme(<LogoutView />);

		await waitFor(
			() => {
				expect(authClient.signOut).toHaveBeenCalled();
			},
			{ timeout: 2000 },
		);

		const errorMessages = await screen.findAllByText(
			/no se pudo cerrar la sesión/i,
			{
				exact: false,
			},
		);
		expect(errorMessages.length).toBeGreaterThan(0);
	});

	it("handles exception during sign out", async () => {
		vi.mocked(authClient.signOut).mockRejectedValue(new Error("Network error"));

		renderWithTheme(<LogoutView />);

		await waitFor(
			() => {
				expect(authClient.signOut).toHaveBeenCalled();
			},
			{ timeout: 2000 },
		);

		const errorMessages = await screen.findAllByText(
			/no se pudo cerrar la sesión/i,
			{
				exact: false,
			},
		);
		expect(errorMessages.length).toBeGreaterThan(0);
	});

	it("allows retrying sign out", async () => {
		vi.mocked(authClient.signOut)
			.mockResolvedValueOnce({
				data: null,
				error: { message: "Error", status: 500 },
			})
			.mockResolvedValueOnce({
				data: {},
				error: null,
			});

		renderWithTheme(<LogoutView />);

		await waitFor(
			() => {
				expect(authClient.signOut).toHaveBeenCalledTimes(1);
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
				expect(authClient.signOut).toHaveBeenCalledTimes(2);
			},
			{ timeout: 2000 },
		);
	});
});
