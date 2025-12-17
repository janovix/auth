import { ResetPasswordView } from "@/components/auth/ResetPasswordView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";
import { authClient } from "@/lib/auth/authClient";
import { mockRouter } from "../mocks/router";

// Mock auth client methods
const mockResetPassword = async (_data: {
	token: string;
	newPassword: string;
}) => {
	return Promise.resolve({
		data: { status: true },
		error: null,
	} as Awaited<ReturnType<typeof authClient.resetPassword>>);
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
			// Mock auth client for this story
			const originalResetPassword = authClient.resetPassword;
			authClient.resetPassword =
				mockResetPassword as unknown as typeof authClient.resetPassword;

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
	},
};

export const WithoutToken: Story = {
	args: {
		token: null,
	},
};

export const WithCustomRedirectDelay: Story = {
	args: {
		token: "valid-token-123",
		redirectDelayMs: 3000,
	},
};
