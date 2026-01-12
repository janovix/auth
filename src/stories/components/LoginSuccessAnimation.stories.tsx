import type { Meta, StoryObj } from "@storybook/react";
import { LoginSuccessAnimation } from "@/components/auth/LoginSuccessAnimation";
import { ThemeProvider } from "@/components/ThemeProvider";

const meta: Meta<typeof LoginSuccessAnimation> = {
	title: "Components/Auth/LoginSuccessAnimation",
	component: LoginSuccessAnimation,
	parameters: {
		layout: "centered",
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

type Story = StoryObj<typeof LoginSuccessAnimation>;

export const Default: Story = {};

export const WithCustomDelay: Story = {
	args: {
		delay: 3000,
	},
};

export const WithOnComplete: Story = {
	args: {
		onComplete: () => {
			console.log("Animation completed");
		},
		delay: 5000,
	},
};
