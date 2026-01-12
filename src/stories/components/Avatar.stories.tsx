import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const meta: Meta<typeof Avatar> = {
	title: "UI/Avatar",
	component: Avatar,
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
	render: () => (
		<Avatar>
			<AvatarFallback>JD</AvatarFallback>
		</Avatar>
	),
};

export const WithImage: Story = {
	render: () => (
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
			<AvatarFallback>CN</AvatarFallback>
		</Avatar>
	),
};

export const WithInitials: Story = {
	render: () => (
		<Avatar>
			<AvatarFallback>AG</AvatarFallback>
		</Avatar>
	),
};

export const Large: Story = {
	render: () => (
		<Avatar className="size-16">
			<AvatarFallback className="text-lg">JD</AvatarFallback>
		</Avatar>
	),
};

export const Small: Story = {
	render: () => (
		<Avatar className="size-6">
			<AvatarFallback className="text-xs">JD</AvatarFallback>
		</Avatar>
	),
};
