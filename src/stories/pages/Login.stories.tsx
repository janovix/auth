import { LoginView } from "@/components/auth/LoginView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
	title: "Pages/Auth/Login",
	component: LoginView,
	parameters: {
		layout: "fullscreen",
		nextjs: {
			router: {
				push: () => {},
				replace: () => {},
				refresh: () => {},
			},
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
} satisfies Meta<typeof LoginView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <LoginView />,
};

export const WithRedirect: Story = {
	render: () => <LoginView redirectTo="/dashboard" />,
};

export const WithSuccessMessage: Story = {
	render: () => (
		<LoginView defaultSuccessMessage="Login successful! Redirecting..." />
	),
};
