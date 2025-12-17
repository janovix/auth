import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "@/components/ui/separator";

const meta: Meta<typeof Separator> = {
	title: "UI/Separator",
	component: Separator,
};

export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
	render: () => (
		<div className="space-y-4">
			<div>Content above</div>
			<Separator />
			<div>Content below</div>
		</div>
	),
};

export const Vertical: Story = {
	render: () => (
		<div className="flex h-5 items-center gap-4">
			<div>Left</div>
			<Separator orientation="vertical" />
			<div>Right</div>
		</div>
	),
};

export const WithText: Story = {
	render: () => (
		<div className="space-y-4">
			<div>Section 1</div>
			<div className="flex items-center gap-4">
				<Separator className="flex-1" />
				<span className="text-sm text-muted-foreground">OR</span>
				<Separator className="flex-1" />
			</div>
			<div>Section 2</div>
		</div>
	),
};
