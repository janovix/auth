import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LogoutView } from "./LogoutView";

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("LogoutView", () => {
	it("renders logout view", () => {
		renderWithTheme(<LogoutView />);

		// Check that component renders (React StrictMode renders twice)
		const titles = screen.getAllByText(/cerrar sesión/i, { exact: false });
		expect(titles.length).toBeGreaterThan(0);
		const buttons = screen.getAllByRole("button", { name: /reintentar/i });
		expect(buttons.length).toBeGreaterThan(0);
		const links = screen.getAllByRole("link", { name: /iniciar sesión/i });
		expect(links.length).toBeGreaterThan(0);
	});
});
