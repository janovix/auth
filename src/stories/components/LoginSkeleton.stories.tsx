import type { Meta, StoryObj } from "@storybook/react";
import { LoginSkeleton } from "@/components/auth/LoginSkeleton";
import { ThemeProvider } from "@/components/ThemeProvider";

const meta: Meta<typeof LoginSkeleton> = {
	title: "Components/Auth/LoginSkeleton",
	component: LoginSkeleton,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<div className="w-full max-w-md">
					<Story />
				</div>
			</ThemeProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof LoginSkeleton>;

export const Default: Story = {};
