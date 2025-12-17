import { RecoverView } from "@/components/auth/RecoverView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
	title: "Pages/Auth/Recover",
	component: RecoverView,
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
} satisfies Meta<typeof RecoverView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <RecoverView />,
};

export const WithRedirect: Story = {
	render: () => <RecoverView redirectTo="/dashboard" />,
};
