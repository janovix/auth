import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "@/components/ui/spinner";

const meta: Meta<typeof Spinner> = {
	title: "UI/Spinner",
	component: Spinner,
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
	render: () => <Spinner />,
};

export const Small: Story = {
	render: () => <Spinner className="h-4 w-4" />,
};

export const Large: Story = {
	render: () => <Spinner className="h-8 w-8" />,
};

export const WithText: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Spinner className="h-4 w-4" />
			<span>Loading...</span>
		</div>
	),
};
