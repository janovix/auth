import type { Meta, StoryObj } from "@storybook/react";
import { LoginPageWrapper } from "@/components/auth/LoginPageWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuroraProvider } from "@/contexts/aurora-context";
import { GlobalAuroraBackground } from "@/components/aurora";
import { mockRouter } from "../mocks/router";

const meta: Meta<typeof LoginPageWrapper> = {
	title: "Components/Auth/LoginPageWrapper",
	component: LoginPageWrapper,
	parameters: {
		layout: "fullscreen",
		nextjs: {
			router: mockRouter,
		},
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<AuroraProvider>
					<div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
						<GlobalAuroraBackground />
						<div className="w-full max-w-md relative z-10">
							<Story />
						</div>
					</div>
				</AuroraProvider>
			</ThemeProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof LoginPageWrapper>;

export const Default: Story = {};

export const WithRedirect: Story = {
	args: {
		redirectTo: "https://app.example.workers.dev/dashboard",
	},
};

export const WithSuccessMessage: Story = {
	args: {
		defaultSuccessMessage: "Login successful! Redirecting...",
	},
};
