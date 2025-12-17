import { ResetPasswordView } from "@/components/auth/ResetPasswordView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";
import { mockRouter } from "../mocks/router";
import type { AuthResult } from "@algenium/auth-next/client";

// Mock resetPassword function for stories
const mockResetPassword = async (
	_token: string,
	_newPassword: string,
): Promise<AuthResult<{ message: string }>> => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));
	return Promise.resolve({
		success: true,
		data: { message: "Password reset successfully" },
		error: null,
	});
};

const meta = {
	title: "Pages/Auth/ResetPassword",
	component: ResetPasswordView,
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
					<div className="w-full max-w-md">
						<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
							<Story />
						</ThemeProvider>
					</div>
				</div>
			);
		},
	],
} satisfies Meta<typeof ResetPasswordView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithToken: Story = {
	args: {
		token: "valid-token-123",
		resetPassword: mockResetPassword,
	},
};

export const WithoutToken: Story = {
	args: {
		token: null,
		resetPassword: mockResetPassword,
	},
};

export const WithCustomRedirectDelay: Story = {
	args: {
		token: "valid-token-123",
		redirectDelayMs: 3000,
		resetPassword: mockResetPassword,
	},
};
