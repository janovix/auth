import { ResetPasswordView } from "@/components/auth/ResetPasswordView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
	title: "Pages/Auth/ResetPassword",
	component: ResetPasswordView,
	parameters: {
		layout: "fullscreen",
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
