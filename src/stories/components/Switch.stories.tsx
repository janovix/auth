import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Switch> = {
	title: "UI/Switch",
	component: Switch,
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
	render: () => <Switch />,
};

export const Checked: Story = {
	render: () => <Switch defaultChecked />,
};

export const Disabled: Story = {
	render: () => <Switch disabled />,
};

export const WithLabel: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Switch id="airplane-mode" />
			<Label htmlFor="airplane-mode">Airplane Mode</Label>
		</div>
	),
};

export const WithLabelChecked: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Switch id="notifications" defaultChecked />
			<Label htmlFor="notifications">Enable Notifications</Label>
		</div>
	),
};
