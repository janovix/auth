import { LogoutView } from "@/components/auth/LogoutView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";
import { authClient } from "@/lib/auth/authClient";

// Mock router functions (LogoutView doesn't use router, but included for consistency)
const mockRouter = {
	push: () => {},
	replace: () => {},
	refresh: () => {},
	back: () => {},
	forward: () => {},
	prefetch: () => Promise.resolve(),
};

// Mock auth client methods
const mockSignOut = async () => {
	return Promise.resolve({
		data: {},
		error: null,
	} as Awaited<ReturnType<typeof authClient.signOut>>);
};

const meta = {
	title: "Pages/Auth/Logout",
	component: LogoutView,
	parameters: {
		layout: "fullscreen",
		nextjs: {
			router: mockRouter,
		},
	},
	decorators: [
		(Story) => {
			// Ensure router mocks are available before rendering
			if (typeof window !== "undefined") {
				(window as any).__NEXT_ROUTER_MOCKS__ = mockRouter;
			}

			// Mock authClient.signOut to return immediately with success for stable visual tests
			// This ensures the component stabilizes quickly to the success state
			authClient.signOut = mockSignOut;

			return (
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<Story />
				</ThemeProvider>
			);
		},
	],
} satisfies Meta<typeof LogoutView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <LogoutView />,
};
