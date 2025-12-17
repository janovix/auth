import {
	AuthSessionProvider,
	createSessionStore,
	type AuthSessionSnapshot,
} from "@/lib/auth/useAuthSession";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccountView } from "./AccountView";

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

const createSnapshot = (
	overrides?: Partial<AuthSessionSnapshot>,
): AuthSessionSnapshot => ({
	data: null,
	error: null,
	isPending: false,
	...overrides,
});

const renderWithSession = (snapshot: AuthSessionSnapshot) => {
	const store = createSessionStore(snapshot);
	return renderWithTheme(
		<AuthSessionProvider store={store}>
			<AccountView />
		</AuthSessionProvider>,
	);
};

describe("AccountView", () => {
	afterEach(async () => {
		// Flush all React updates before cleanup
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("shows a helper when there is no active session", () => {
		renderWithSession(createSnapshot());
		expect(
			screen.getByText(/sesión no encontrada/i, { exact: false }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /iniciar sesión/i }),
		).toBeInTheDocument();
	});

	it("lists user and session metadata when available", () => {
		const snapshot = createSnapshot({
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
					createdAt: new Date(),
					updatedAt: new Date(),
					expiresAt: new Date(Date.now() + 3600 * 1000),
					ipAddress: "127.0.0.1",
					userAgent: "Vitest",
				},
			},
		});

		renderWithSession(snapshot);
		expect(
			screen.getByText(/ana garcía/i, { exact: false }),
		).toBeInTheDocument();
		expect(screen.getByText(/token-123/)).toBeInTheDocument();
	});

	it("shows ipAddress and userAgent when available", () => {
		const snapshot = createSnapshot({
			data: {
				user: {
					id: "user-123",
					name: "Test User",
					email: "test@example.com",
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					emailVerified: true,
				},
				session: {
					id: "session-123",
					userId: "user-123",
					token: "token-123",
					createdAt: new Date(),
					updatedAt: new Date(),
					expiresAt: new Date(Date.now() + 3600 * 1000),
					ipAddress: "192.168.1.1",
					userAgent: "Mozilla/5.0",
				},
			},
		});

		renderWithSession(snapshot);
		expect(screen.getByText(/192.168.1.1/)).toBeInTheDocument();
		expect(screen.getByText(/Mozilla\/5.0/)).toBeInTheDocument();
	});

	// Note: Session hydration is now handled by SessionHydrator component
	// in the page.tsx Server Component, not via props to AccountView
});
