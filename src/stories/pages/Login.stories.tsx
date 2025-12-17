import { LoginView } from "@/components/auth/LoginView";
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
const mockSignIn = async (_data: {
	email: string;
	password: string;
	rememberMe?: boolean;
	callbackURL?: string;
}) => {
	return Promise.resolve({
		data: {},
		error: null,
	} as Awaited<ReturnType<typeof authClient.signIn.email>>);
};

const meta = {
	title: "Pages/Auth/Login",
	component: LoginView,
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
			const originalSignIn = authClient.signIn.email;
			authClient.signIn.email =
				mockSignIn as unknown as typeof authClient.signIn.email;

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
} satisfies Meta<typeof LoginView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <LoginView />,
};

export const WithRedirect: Story = {
	render: () => <LoginView redirectTo="/dashboard" />,
};

export const WithSuccessMessage: Story = {
	render: () => (
		<LoginView defaultSuccessMessage="Login successful! Redirecting..." />
	),
};
