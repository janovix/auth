import type { Meta, StoryObj } from "@storybook/react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ThemeProvider } from "@/components/ThemeProvider";

const meta: Meta<typeof ThemeSwitcher> = {
	title: "Components/ThemeSwitcher",
	component: ThemeSwitcher,
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<Story />
			</ThemeProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof ThemeSwitcher>;

export const Default: Story = {
	render: () => <ThemeSwitcher />,
};
