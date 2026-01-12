import type { Meta, StoryObj } from "@storybook/react";
import { LoginAnimationPanel } from "@/components/auth/LoginAnimationPanel";
import { ThemeProvider } from "@/components/ThemeProvider";

const meta: Meta<typeof LoginAnimationPanel> = {
	title: "Components/Auth/LoginAnimationPanel",
	component: LoginAnimationPanel,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<div className="w-full h-96 flex items-center justify-center">
					<Story />
				</div>
			</ThemeProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof LoginAnimationPanel>;

export const Default: Story = {};
