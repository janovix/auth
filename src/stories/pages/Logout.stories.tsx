import { LogoutView } from "@/components/auth/LogoutView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";
import { authClient } from "@/lib/auth/authClient";

const meta = {
	title: "Pages/Auth/Logout",
	component: LogoutView,
	parameters: {
		layout: "fullscreen",
		// Mock Next.js router
		nextjs: {
			router: {
				push: () => {},
				replace: () => {},
				refresh: () => {},
			},
		},
	},
	decorators: [
		(Story) => {
			// Mock authClient.signOut to return immediately with success for stable visual tests
			// This ensures the component stabilizes quickly to the success state
			authClient.signOut = async () => {
				return Promise.resolve({
					data: {},
					error: null,
				} as Awaited<ReturnType<typeof authClient.signOut>>);
			};

			return (
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<Story />
				</ThemeProvider>
			);
		},
	],
} satisfies Meta<typeof LogoutView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <LogoutView />,
};
