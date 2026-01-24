import type { Meta, StoryObj } from "@storybook/react";
import { ThemeSwitcher } from "@janovix/blocks";
import { ThemeProvider } from "@/components/ThemeProvider";

const defaultLabels = {
	theme: "Theme",
	system: "System",
	light: "Light",
	dark: "Dark",
};

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
	render: () => <ThemeSwitcher labels={defaultLabels} />,
};

export const WithDescription: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<ThemeSwitcher labels={defaultLabels} />
			<p className="text-sm text-muted-foreground">
				Choose between System, Light, or Dark theme
			</p>
		</div>
	),
};

export const MiniVariant: Story = {
	render: () => <ThemeSwitcher variant="mini" labels={defaultLabels} />,
};

export const SmallSize: Story = {
	render: () => <ThemeSwitcher size="sm" labels={defaultLabels} />,
};

export const RoundedShape: Story = {
	render: () => <ThemeSwitcher shape="rounded" labels={defaultLabels} />,
};
