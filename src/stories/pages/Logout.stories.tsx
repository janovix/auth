import type { AuthResult } from "@algenium/auth-next/client";
import type { Meta, StoryObj } from "@storybook/react";

import { LogoutView } from "@/components/auth/LogoutView";
import { ThemeProvider } from "@/components/ThemeProvider";

import { mockRouter } from "../mocks/router";

// Mock signOut function that returns immediately with success for stable visual tests
const mockSignOut = async (): Promise<AuthResult<null>> => {
	return Promise.resolve({
		success: true,
		data: null,
		error: null,
	});
};

const meta: Meta<typeof LogoutView> = {
	title: "Pages/Auth/Logout",
	component: LogoutView,
	parameters: {
		layout: "fullscreen",
		nextjs: {
			router: mockRouter,
		},
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<Story />
			</ThemeProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof LogoutView>;

export const Default: Story = {
	render: () => <LogoutView signOut={mockSignOut} />,
};
