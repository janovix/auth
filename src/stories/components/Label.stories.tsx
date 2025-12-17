import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const meta: Meta<typeof Label> = {
	title: "UI/Label",
	component: Label,
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
	render: () => (
		<div className="space-y-2">
			<Label htmlFor="email">Email</Label>
			<Input id="email" type="email" placeholder="Enter your email" />
		</div>
	),
};

export const WithIcon: Story = {
	render: () => (
		<div className="space-y-2">
			<Label htmlFor="password" className="flex items-center gap-2">
				<span>Password</span>
			</Label>
			<Input id="password" type="password" placeholder="Enter your password" />
		</div>
	),
};

export const Required: Story = {
	render: () => (
		<div className="space-y-2">
			<Label htmlFor="name">
				Name <span className="text-destructive">*</span>
			</Label>
			<Input id="name" type="text" placeholder="Enter your name" required />
		</div>
	),
};
