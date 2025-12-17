import { RecoverView } from "@/components/auth/RecoverView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";
import { authClient } from "@/lib/auth/authClient";

// Mock router functions
const mockRouter = {
	push: () => {},
	replace: () => {},
	refresh: () => {},
	back: () => {},
	forward: () => {},
	prefetch: () => Promise.resolve(),
};

// Mock auth client methods
const mockRequestPasswordReset = async (_data: {
	email: string;
	redirectTo: string;
}) => {
	return Promise.resolve({
		data: { status: true, message: "Password reset email sent" },
		error: null,
	} as Awaited<ReturnType<typeof authClient.requestPasswordReset>>);
};

const meta = {
	title: "Pages/Auth/Recover",
	component: RecoverView,
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

			// Mock auth client for this story
			const originalRequestPasswordReset = authClient.requestPasswordReset;
			authClient.requestPasswordReset =
				mockRequestPasswordReset as unknown as typeof authClient.requestPasswordReset;

			return (
				<div className="min-h-screen flex items-center justify-center p-4 bg-background">
					<div className="w-full max-w-md">
						<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
							<Story />
						</ThemeProvider>
					</div>
				</div>
			);
		},
	],
} satisfies Meta<typeof RecoverView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <RecoverView />,
};

export const WithRedirect: Story = {
	render: () => <RecoverView redirectTo="/dashboard" />,
};
