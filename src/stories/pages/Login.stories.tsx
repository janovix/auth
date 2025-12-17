import type { AuthResult, SignInCredentials } from "@/lib/auth/authActions";
import type { Meta, StoryObj } from "@storybook/react";

import { LoginView } from "@/components/auth/LoginView";
import { ThemeProvider } from "@/components/ThemeProvider";

import { mockRouter } from "../mocks/router";

// Mock signIn function that returns immediately with success
const mockSignIn = async (
	_credentials: SignInCredentials,
): Promise<AuthResult> => {
	return Promise.resolve({
		success: true,
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
				expiresAt: new Date(Date.now() + 3600 * 1000),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		},
		error: null,
	});
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
		(Story) => (
			<div className="min-h-screen flex items-center justify-center p-4 bg-background">
				<div className="w-full max-w-md">
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						<Story />
					</ThemeProvider>
				</div>
			</div>
		),
	],
} satisfies Meta<typeof LoginView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <LoginView signIn={mockSignIn} />,
};

export const WithRedirect: Story = {
	render: () => <LoginView signIn={mockSignIn} redirectTo="/dashboard" />,
};

export const WithSuccessMessage: Story = {
	render: () => (
		<LoginView
			signIn={mockSignIn}
			defaultSuccessMessage="Login successful! Redirecting..."
		/>
	),
};
