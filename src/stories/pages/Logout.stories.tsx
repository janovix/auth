import { LogoutView } from "@/components/auth/LogoutView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
	title: "Pages/Auth/Logout",
	component: LogoutView,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<Story />
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof LogoutView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <LogoutView />,
};
