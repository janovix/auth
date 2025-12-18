import { SignupView } from "@/components/auth/SignupView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";
import { mockRouter } from "../mocks/router";
import type { SignUpCredentials, AuthResult } from "@/lib/auth/authActions";

// Mock signUp function for stories
const mockSignUp = async (
	_credentials: SignUpCredentials,
): Promise<AuthResult> => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));
	return Promise.resolve({
		success: true,
		data: {
			user: {
				id: "mock-user-id",
				name: "Test User",
				email: _credentials.email,
				image: null,
				emailVerified: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			session: {
				id: "mock-session-id",
				userId: "mock-user-id",
				token: "mock-token",
				expiresAt: new Date(Date.now() + 3600000),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		},
		error: null,
	});
};

const meta = {
	title: "Pages/Auth/Signup",
	component: SignupView,
	parameters: {
		layout: "fullscreen",
		nextjs: {
			router: mockRouter,
		},
	},
	decorators: [
		(Story) => {
			return (
				<div className="min-h-screen flex items-center justify-center p-4 bg-background">
					<div className="w-full max-w-2xl">
						<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
							<Story />
						</ThemeProvider>
					</div>
				</div>
			);
		},
	],
} satisfies Meta<typeof SignupView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		signUp: mockSignUp,
	},
};

export const WithRedirect: Story = {
	args: {
		redirectTo: "https://app.example.workers.dev/dashboard",
		signUp: mockSignUp,
	},
};
