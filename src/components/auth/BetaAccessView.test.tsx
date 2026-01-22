import {
	AuthSessionProvider,
	createSessionStore,
	type SessionSnapshot,
} from "@/lib/auth/useAuthSession";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/language-context";

import { BetaAccessView } from "./BetaAccessView";

const renderWithProviders = (ui: React.ReactElement) => {
	return render(
		<ThemeProvider>
			<LanguageProvider>{ui}</LanguageProvider>
		</ThemeProvider>,
	);
};

const createSnapshot = (
	overrides?: Partial<SessionSnapshot>,
): SessionSnapshot => ({
	data: null,
	error: null,
	isPending: false,
	...overrides,
});

const renderWithSession = (snapshot: SessionSnapshot) => {
	const store = createSessionStore(snapshot);
	return renderWithProviders(
		<AuthSessionProvider store={store}>
			<BetaAccessView />
		</AuthSessionProvider>,
	);
};

describe("BetaAccessView", () => {
	afterEach(async () => {
		// Flush all React updates before cleanup
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	const createMockSession = (
		overrides?: Partial<{ name: string; email: string }>,
	) => ({
		user: {
			id: "user-123",
			name: overrides?.name ?? "Test User",
			email: overrides?.email ?? "test@example.com",
			image: null,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			role: "visitor",
		},
		session: {
			id: "session-123",
			userId: "user-123",
			token: "token-abc",
			expiresAt: new Date(Date.now() + 86400000),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});

	it("renders the card with clock icon", () => {
		renderWithSession(createSnapshot({ data: createMockSession() }));
		// Check for the clock icon (lucide-clock class)
		expect(document.querySelector(".lucide-clock")).toBeInTheDocument();
	});

	it("renders the card structure with title and content areas", () => {
		renderWithSession(createSnapshot({ data: createMockSession() }));
		// Check for card structure using data-slot attributes
		expect(document.querySelector('[data-slot="card"]')).toBeInTheDocument();
		expect(
			document.querySelector('[data-slot="card-title"]'),
		).toBeInTheDocument();
		expect(
			document.querySelector('[data-slot="card-content"]'),
		).toBeInTheDocument();
	});

	it("renders a back to login link", () => {
		renderWithSession(createSnapshot({ data: createMockSession() }));
		// Check for link element with login icon
		const link = screen.getByRole("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/login");
		expect(document.querySelector(".lucide-log-in")).toBeInTheDocument();
	});

	it("renders mail icon for the message section", () => {
		renderWithSession(createSnapshot({ data: createMockSession() }));
		// Check for the mail icon indicating the message section
		expect(document.querySelector(".lucide-mail")).toBeInTheDocument();
	});

	it("renders without session (public access)", () => {
		renderWithSession(createSnapshot({ data: null }));
		// Page should still render with card structure
		expect(document.querySelector('[data-slot="card"]')).toBeInTheDocument();
		expect(document.querySelector(".lucide-clock")).toBeInTheDocument();
	});
});
