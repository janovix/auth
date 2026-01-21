import type { AuthResult } from "@/lib/auth/authActions";
import type { Meta, StoryObj } from "@storybook/react";

import { GlobalAuroraBackground } from "@/components/aurora";
import { LoginView } from "@/components/auth/LoginView";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuroraProvider } from "@/contexts/aurora-context";
import { LanguageProvider } from "@/contexts/language-context";

import { mockRouter } from "../mocks/router";

// Mock sendOtp function that returns success
const mockSendOtp = async (
	_email: string,
	_type: "sign-in",
): Promise<AuthResult<{ message: string }>> => {
	return Promise.resolve({
		success: true,
		data: { message: "OTP sent" },
		error: null,
	});
};

// Mock signInWithOtp function that returns success
const mockSignInWithOtp = async (
	_email: string,
	_otp: string,
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
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<LanguageProvider>
					<AuroraProvider>
						<div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
							<GlobalAuroraBackground />
							<div className="w-full max-w-md relative z-10">
								<Story />
							</div>
						</div>
					</AuroraProvider>
				</LanguageProvider>
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof LoginView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<LoginView sendOtp={mockSendOtp} signInWithOtp={mockSignInWithOtp} />
	),
};

export const WithRedirect: Story = {
	render: () => (
		<LoginView
			sendOtp={mockSendOtp}
			signInWithOtp={mockSignInWithOtp}
			redirectTo="https://app.example.workers.dev/dashboard"
		/>
	),
};

export const WithSuccessMessage: Story = {
	render: () => (
		<LoginView
			sendOtp={mockSendOtp}
			signInWithOtp={mockSignInWithOtp}
			defaultSuccessMessage="Login successful! Redirecting..."
		/>
	),
};
