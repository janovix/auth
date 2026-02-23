import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	MobileSidebarFullscreen,
	MobileNavItem,
	MobileNavSection,
} from "./MobileSidebarFullscreen";

// Mock framer-motion
vi.mock("motion/react", () => ({
	motion: {
		div: ({
			children,
			className,
			onClick,
			role,
			...props
		}: {
			children?: React.ReactNode;
			className?: string;
			onClick?: () => void;
			role?: string;
		}) => (
			<div
				className={className}
				onClick={onClick}
				role={role}
				data-testid="motion-div"
				{...props}
			>
				{children}
			</div>
		),
	},
	AnimatePresence: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

// Mock the language context
vi.mock("@/contexts/language-context", () => ({
	useLanguage: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				"mobileSidebar.close": "Close menu",
				"mobileSidebar.navigation": "Navigation",
			};
			return translations[key] || key;
		},
	}),
}));

// Mock the AppSwitcher component
vi.mock("./AppSwitcher", () => ({
	AppSwitcher: ({ variant }: { variant?: string }) => (
		<div data-testid="app-switcher" data-variant={variant}>
			AppSwitcher
		</div>
	),
}));

describe("MobileSidebarFullscreen", () => {
	const mockOnOpenChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders nothing when closed", () => {
		const { container } = render(
			<MobileSidebarFullscreen open={false} onOpenChange={mockOnOpenChange}>
				<div>Content</div>
			</MobileSidebarFullscreen>,
		);

		expect(container.textContent).toBe("");
	});

	it("renders content when open", () => {
		render(
			<MobileSidebarFullscreen open={true} onOpenChange={mockOnOpenChange}>
				<div data-testid="sidebar-content">Content</div>
			</MobileSidebarFullscreen>,
		);

		expect(screen.getByTestId("sidebar-content")).toBeInTheDocument();
	});

	it("renders AppSwitcher component", () => {
		render(
			<MobileSidebarFullscreen open={true} onOpenChange={mockOnOpenChange}>
				<div>Content</div>
			</MobileSidebarFullscreen>,
		);

		// Get all app switchers and check the last one (handles StrictMode double render)
		const appSwitchers = screen.getAllByTestId("app-switcher");
		expect(appSwitchers.length).toBeGreaterThan(0);
		expect(appSwitchers[appSwitchers.length - 1]).toBeInTheDocument();
	});

	it("renders close button", () => {
		render(
			<MobileSidebarFullscreen open={true} onOpenChange={mockOnOpenChange}>
				<div>Content</div>
			</MobileSidebarFullscreen>,
		);

		// Get all close buttons and check the last one (handles StrictMode double render)
		const closeButtons = screen.getAllByRole("button", { name: /close menu/i });
		expect(closeButtons.length).toBeGreaterThan(0);
		expect(closeButtons[closeButtons.length - 1]).toBeInTheDocument();
	});

	it("calls onOpenChange when close button is clicked", async () => {
		const user = userEvent.setup();
		render(
			<MobileSidebarFullscreen open={true} onOpenChange={mockOnOpenChange}>
				<div>Content</div>
			</MobileSidebarFullscreen>,
		);

		// Get the last close button (handles StrictMode double render)
		const closeButtons = screen.getAllByRole("button", { name: /close menu/i });
		const closeButton = closeButtons[closeButtons.length - 1];
		await user.click(closeButton);

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	it("has proper aria attributes", () => {
		render(
			<MobileSidebarFullscreen open={true} onOpenChange={mockOnOpenChange}>
				<div>Content</div>
			</MobileSidebarFullscreen>,
		);

		// Should find a dialog role (get all and check the last one for StrictMode)
		const dialogs = screen.getAllByRole("dialog");
		expect(dialogs.length).toBeGreaterThan(0);
		const dialog = dialogs[dialogs.length - 1];
		expect(dialog).toBeInTheDocument();
		expect(dialog).toHaveAttribute("aria-modal", "true");
	});
});

describe("MobileNavItem", () => {
	it("renders with icon and label", () => {
		render(
			<MobileNavItem
				icon={<span data-testid="icon">Icon</span>}
				label="Test Item"
			/>,
		);

		expect(screen.getByTestId("icon")).toBeInTheDocument();
		expect(screen.getByText("Test Item")).toBeInTheDocument();
	});

	it("renders with description", () => {
		render(
			<MobileNavItem
				icon={<span>Icon</span>}
				label="Test Item"
				description="Test description"
			/>,
		);

		expect(screen.getByText("Test description")).toBeInTheDocument();
	});

	it("renders as link when href is provided", () => {
		render(
			<MobileNavItem
				icon={<span>Icon</span>}
				label="Test Link"
				href="https://example.com"
			/>,
		);

		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "https://example.com");
	});

	it("renders external links with target blank", () => {
		render(
			<MobileNavItem
				icon={<span>Icon</span>}
				label="External Link"
				href="https://example.com"
				external
			/>,
		);

		// Get all links and check the last one (handles StrictMode double render)
		const links = screen.getAllByRole("link");
		const link = links[links.length - 1];
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("renders as button when no href", () => {
		const handleClick = vi.fn();
		render(
			<MobileNavItem
				icon={<span>Icon</span>}
				label="Button Item"
				onClick={handleClick}
			/>,
		);

		// Get all buttons and check the last one (handles StrictMode double render)
		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
		expect(buttons[buttons.length - 1]).toBeInTheDocument();
	});

	it("shows completion indicator when isComplete is defined", () => {
		const { container } = render(
			<MobileNavItem
				icon={<span>Icon</span>}
				label="Completed Item"
				isComplete={true}
			/>,
		);

		// Check for completion dot (green)
		const completionDot = container.querySelector(".bg-green-500");
		expect(completionDot).toBeInTheDocument();
	});

	it("shows incomplete indicator when isComplete is false", () => {
		const { container } = render(
			<MobileNavItem
				icon={<span>Icon</span>}
				label="Incomplete Item"
				isComplete={false}
			/>,
		);

		// Check for incomplete dot (muted)
		const incompleteDot = container.querySelector(".bg-muted-foreground\\/30");
		expect(incompleteDot).toBeInTheDocument();
	});
});

describe("MobileNavSection", () => {
	it("renders title", () => {
		render(
			<MobileNavSection title="Test Section">
				<div>Content</div>
			</MobileNavSection>,
		);

		expect(screen.getByText("Test Section")).toBeInTheDocument();
	});

	it("renders children", () => {
		render(
			<MobileNavSection title="Test Section">
				<div data-testid="section-content">Section Content</div>
			</MobileNavSection>,
		);

		expect(screen.getByTestId("section-content")).toBeInTheDocument();
	});

	it("shows progress bar when progress is provided", () => {
		const { container } = render(
			<MobileNavSection
				title="Test Section"
				progress={{ completed: 2, total: 5 }}
			>
				<div>Content</div>
			</MobileNavSection>,
		);

		// Should show progress numbers
		expect(screen.getByText("2/5")).toBeInTheDocument();

		// Progress bar should exist
		const progressBar = container.querySelector(".bg-primary");
		expect(progressBar).toBeInTheDocument();
	});

	it("calculates progress percentage correctly", () => {
		const { container } = render(
			<MobileNavSection
				title="Test Section"
				progress={{ completed: 2, total: 4 }}
			>
				<div>Content</div>
			</MobileNavSection>,
		);

		// 2/4 = 50%
		const progressBar = container.querySelector(".bg-primary");
		expect(progressBar).toHaveStyle({ width: "50%" });
	});
});
