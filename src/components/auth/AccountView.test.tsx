import {
	AuthSessionProvider,
	createSessionStore,
	type AuthSessionSnapshot,
} from "@/lib/auth/useAuthSession";
import type { ServerSession } from "@/lib/auth/getServerSession";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

const renderWithSession = (
	snapshot: AuthSessionSnapshot,
	initialSession?: ServerSession,
) => {
	const store = createSessionStore(snapshot);
	return renderWithTheme(
		<AuthSessionProvider store={store}>
			<AccountView initialSession={initialSession} />
		</AuthSessionProvider>,
	);
};

describe("AccountView", () => {
	it("shows a helper when there is no active session", () => {
		renderWithSession(createSnapshot());
		expect(
			screen.getByText(/no encontramos una sesión activa/i, { exact: false }),
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

	it("uses initialSession when client session is not available", () => {
		// Provide initialSession from server, but no client session
		const initialSession: ServerSession = {
			user: {
				id: "server-user-123",
				name: "Server User",
				email: "server@example.com",
				image: null,
				createdAt: new Date(),
				updatedAt: new Date(),
				emailVerified: true,
			},
			session: {
				id: "server-session-123",
				userId: "server-user-123",
				token: "server-token-123",
				createdAt: new Date(),
				updatedAt: new Date(),
				expiresAt: new Date(Date.now() + 3600 * 1000),
			},
		};

		// Empty client session (null data)
		renderWithSession(createSnapshot(), initialSession);

		// Should show data from initialSession
		expect(
			screen.getByText(/server user/i, { exact: false }),
		).toBeInTheDocument();
		expect(screen.getByText(/server-token-123/)).toBeInTheDocument();
	});
});
