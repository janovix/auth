import { SignupView } from "@/components/auth/SignupView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
	title: "Pages/Auth/Signup",
	component: SignupView,
	parameters: {
		layout: "fullscreen",
		nextjs: {
			router: {
				push: () => {},
				replace: () => {},
				refresh: () => {},
				back: () => {},
				forward: () => {},
				prefetch: () => Promise.resolve(),
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="min-h-screen flex items-center justify-center p-4 bg-background">
				<div className="w-full max-w-2xl">
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						<Story />
					</ThemeProvider>
				</div>
			</div>
		),
	],
} satisfies Meta<typeof SignupView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <SignupView />,
};

export const WithRedirect: Story = {
	render: () => <SignupView redirectTo="/dashboard" />,
};
