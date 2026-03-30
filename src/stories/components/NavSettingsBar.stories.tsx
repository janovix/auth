import type { Meta, StoryObj } from "@storybook/react";
import { NavSettingsBar } from "@/components/layout/NavSettingsBar";
import { TooltipProvider } from "@/components/ui/tooltip";

const meta: Meta<typeof NavSettingsBar> = {
	title: "Components/NavSettingsBar",
	component: NavSettingsBar,
	decorators: [
		(Story) => (
			<TooltipProvider delayDuration={0}>
				<div className="relative min-h-[120px] w-full max-w-2xl rounded-lg border border-border bg-background">
					<Story />
				</div>
			</TooltipProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof NavSettingsBar>;

export const Default: Story = {
	render: () => <NavSettingsBar />,
};
