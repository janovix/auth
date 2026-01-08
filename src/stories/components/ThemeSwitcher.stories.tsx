import type { Meta, StoryObj } from "@storybook/react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ThemeProvider } from "@/components/ThemeProvider";

const meta: Meta<typeof ThemeSwitcher> = {
	title: "Components/ThemeSwitcher",
	component: ThemeSwitcher,
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<div className="p-4">
					<Story />
				</div>
			</ThemeProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof ThemeSwitcher>;

export const Default: Story = {
	render: () => <ThemeSwitcher />,
};

export const WithDescription: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<ThemeSwitcher />
			<p className="text-sm text-muted-foreground">
				Choose between System, Light, or Dark theme
			</p>
		</div>
	),
};
