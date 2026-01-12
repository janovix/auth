import type { Meta, StoryObj } from "@storybook/react";
import { VerifyEmailView } from "@/components/auth/VerifyEmailView";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/language-context";

const meta = {
	title: "Pages/Auth/VerifyEmail",
	component: VerifyEmailView,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<LanguageProvider>
					<div className="min-h-screen flex items-center justify-center p-4">
						<div className="w-full max-w-md">
							<Story />
						</div>
					</div>
				</LanguageProvider>
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof VerifyEmailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
	args: {
		success: true,
	},
};

export const Error: Story = {
	args: {
		error: "Invalid verification token",
	},
};

export const Default: Story = {
	args: {},
};
