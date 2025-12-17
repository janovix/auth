import type { AuthResult } from "@/lib/auth/authActions";
import type { Meta, StoryObj } from "@storybook/react";

import { RecoverView } from "@/components/auth/RecoverView";
import { ThemeProvider } from "@/components/ThemeProvider";

import { mockRouter } from "../mocks/router";

// Mock recoverPassword function that returns immediately with success
const mockRecoverPassword = async (
	_email: string,
): Promise<AuthResult<{ message: string }>> => {
	return Promise.resolve({
		success: true,
		data: { message: "Password reset email sent" },
		error: null,
	});
};

const meta: Meta<typeof RecoverView> = {
	title: "Pages/Auth/Recover",
	component: RecoverView,
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
};

export default meta;
type Story = StoryObj<typeof RecoverView>;

export const Default: Story = {
	render: () => <RecoverView recoverPassword={mockRecoverPassword} />,
};
