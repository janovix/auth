import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsSidebarProductProvider } from "@/contexts/settings-sidebar-product-context";
import { AppSwitcher } from "./AppSwitcher";

const mockUsePathname = vi.fn(() => "/settings");

vi.mock("next/navigation", () => ({
	usePathname: () => mockUsePathname(),
}));

// Mock the useSidebar hook
vi.mock("@/components/ui/sidebar", () => ({
	useSidebar: vi.fn(() => ({
		isMobile: false,
		state: "expanded",
	})),
	SidebarMenu: ({ children }: { children: React.ReactNode }) => (
		<ul>{children}</ul>
	),
	SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
		<li>{children}</li>
	),
	SidebarMenuButton: ({
		children,
		...props
	}: {
		children: React.ReactNode;
	}) => <button {...props}>{children}</button>,
}));

// Mock next-themes (used by Logo component)
vi.mock("next-themes", () => ({
	useTheme: () => ({
		theme: "light",
		setTheme: vi.fn(),
		resolvedTheme: "light",
	}),
}));

// Mock the Logo component
vi.mock("@/components/Logo", () => ({
	Logo: ({ variant }: { variant: string }) => (
		<div data-testid={`logo-${variant}`}>
			{variant === "logo" && (
				<svg viewBox="0 0 102 16" data-testid="logo-svg-logo">
					Logo SVG
				</svg>
			)}
			{variant === "icon" && (
				<svg viewBox="0 0 200 200" data-testid="logo-svg-icon">
					Icon SVG
				</svg>
			)}
		</div>
	),
}));

// Mock the language context
vi.mock("@/contexts/language-context", () => ({
	useLanguage: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				"appSwitcher.title": "Janovix Apps",
				"appSwitcher.homepage": "Homepage",
				"appSwitcher.homepageDescription": "Main website",
				"appSwitcher.products": "Products",
				"appSwitcher.productsDescription": "Your apps",
				"appSwitcher.aml": "AML Platform",
				"appSwitcher.amlDescription": "Anti-money laundering",
				"appSwitcher.watchlist": "Watchlist",
				"appSwitcher.watchlistDescription": "Screening service",
				"appSwitcher.settings": "Settings",
				"appSwitcher.settingsDescription": "Account & organization",
				"appSwitcher.currentApp": "Current",
			};
			return translations[key] || key;
		},
	}),
}));

// Mock the auth config
vi.mock("@/lib/auth/authCoreConfig", () => ({
	getHomepageUrl: () => "https://www.janovix.com",
	getAmlAppUrl: () => "https://aml.janovix.workers.dev",
	getWatchlistAppUrl: () => "https://watchlist.janovix.workers.dev",
}));

function renderWithProductAccess(
	ui: ReactElement,
	hasAmlAccess = true,
	hasWatchlistAccess = true,
) {
	return render(
		<SettingsSidebarProductProvider
			hasAmlAccess={hasAmlAccess}
			hasWatchlistAccess={hasWatchlistAccess}
			activeOrganizationName={null}
			hasResolvedEntitlements={true}
		>
			{ui}
		</SettingsSidebarProductProvider>,
	);
}

describe("AppSwitcher", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUsePathname.mockReturnValue("/settings");
	});

	it("renders the logo in expanded sidebar mode", () => {
		renderWithProductAccess(<AppSwitcher />);

		// Should show the logo SVG
		expect(screen.getByTestId("logo-svg-logo")).toBeInTheDocument();
	});

	it("renders mobile fullscreen variant with larger logo", () => {
		renderWithProductAccess(<AppSwitcher variant="mobile-fullscreen" />);

		// Should show the logo SVG (get all and check the last one for StrictMode)
		const logos = screen.getAllByTestId("logo-svg-logo");
		expect(logos.length).toBeGreaterThan(0);
		expect(logos[logos.length - 1]).toBeInTheDocument();
	});

	it("opens dropdown menu when clicked", async () => {
		const user = userEvent.setup();
		renderWithProductAccess(<AppSwitcher variant="mobile-fullscreen" />);

		// Find and click the dropdown trigger (get the last one for StrictMode)
		const triggers = screen.getAllByRole("button");
		const trigger = triggers[triggers.length - 1];
		await user.click(trigger);

		// Check that app options are displayed
		expect(await screen.findByText("Janovix Apps")).toBeInTheDocument();
		expect(await screen.findByText("Homepage")).toBeInTheDocument();
		expect(await screen.findByText("Products")).toBeInTheDocument();
		expect(await screen.findByText("AML Platform")).toBeInTheDocument();
		expect(await screen.findByText("Watchlist")).toBeInTheDocument();
		expect(await screen.findByText("Settings")).toBeInTheDocument();
	});

	it("shows current app badge for Settings", async () => {
		const user = userEvent.setup();
		const { container } = renderWithProductAccess(
			<AppSwitcher variant="mobile-fullscreen" />,
		);

		// Find the dropdown trigger button - it's the button that contains the Logo
		// Look for button with class that includes "flex items-center gap-2" (the trigger button)
		const trigger = container.querySelector(
			"button.flex.items-center.gap-2.rounded-xl",
		) as HTMLElement;
		expect(trigger).not.toBeNull();

		// Use fireEvent to avoid pointer-events issues with userEvent
		fireEvent.click(trigger);

		// Wait for dropdown to open and check for "Current" badge
		// First wait for the menu to appear, then check for Current badge
		await screen.findByText("Janovix Apps");
		expect(await screen.findByText("Current")).toBeInTheDocument();
	});

	it("renders cross-app links without opening a new tab", async () => {
		const { container } = renderWithProductAccess(
			<AppSwitcher variant="mobile-fullscreen" />,
		);

		// Find the dropdown trigger button - it's the button that contains the Logo
		const trigger = container.querySelector(
			"button.flex.items-center.gap-2.rounded-xl",
		) as HTMLElement;
		expect(trigger).not.toBeNull();

		// Use fireEvent to avoid pointer-events issues with userEvent
		fireEvent.click(trigger);

		// Wait for dropdown to open - first wait for menu label
		await screen.findByText("Janovix Apps");

		// Then find all menu items (links)
		const links = await screen.findAllByRole("menuitem");
		const crossAppHrefs = new Set([
			"https://www.janovix.com",
			"https://aml.janovix.workers.dev",
			"https://watchlist.janovix.workers.dev",
		]);
		const crossAppLinks = links.filter((link) =>
			crossAppHrefs.has(link.getAttribute("href") ?? ""),
		);
		expect(crossAppLinks.length).toBe(3);
		for (const link of crossAppLinks) {
			expect(link.getAttribute("target")).toBeNull();
		}
	});

	it("hides AML from menu when product access is disabled", async () => {
		cleanup();
		const user = userEvent.setup();
		const { container } = renderWithProductAccess(
			<AppSwitcher variant="mobile-fullscreen" />,
			false,
		);

		const trigger = container.querySelector(
			"button.flex.items-center.gap-2.rounded-xl",
		) as HTMLElement;
		expect(trigger).not.toBeNull();
		await user.click(trigger);

		await screen.findByText("Janovix Apps");
		expect(screen.queryByText("AML Platform")).not.toBeInTheDocument();
		expect(await screen.findByText("Watchlist")).toBeInTheDocument();
	});

	it("does not include AML app URL when AML is hidden", async () => {
		cleanup();
		const user = userEvent.setup();
		const { container } = renderWithProductAccess(
			<AppSwitcher variant="mobile-fullscreen" />,
			false,
		);

		const trigger = container.querySelector(
			"button.flex.items-center.gap-2.rounded-xl",
		) as HTMLElement;
		await user.click(trigger);

		await screen.findByText("Janovix Apps");
		const links = await screen.findAllByRole("menuitem");
		const hrefs = new Set(
			links.map((link) => link.getAttribute("href")).filter(Boolean),
		);
		expect(hrefs.has("https://aml.janovix.workers.dev")).toBe(false);
		expect(hrefs.has("https://www.janovix.com")).toBe(true);
		expect(hrefs.has("https://watchlist.janovix.workers.dev")).toBe(true);
	});

	it("hides Watchlist from menu when Watchlist product access is disabled", async () => {
		cleanup();
		const user = userEvent.setup();
		const { container } = renderWithProductAccess(
			<AppSwitcher variant="mobile-fullscreen" />,
			true,
			false,
		);

		const trigger = container.querySelector(
			"button.flex.items-center.gap-2.rounded-xl",
		) as HTMLElement;
		expect(trigger).not.toBeNull();
		await user.click(trigger);

		await screen.findByText("Janovix Apps");
		expect(screen.queryByText("Watchlist")).not.toBeInTheDocument();
		expect(await screen.findByText("AML Platform")).toBeInTheDocument();
	});
});
