import type { Meta, StoryObj } from "@storybook/react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Sheet> = {
	title: "UI/Sheet",
	component: Sheet,
};

export default meta;

type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Open Sheet</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Edit Profile</SheetTitle>
					<SheetDescription>
						Make changes to your profile here. Click save when you're done.
					</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	),
};

export const RightSide: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Open Right Sheet</Button>
			</SheetTrigger>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Settings</SheetTitle>
					<SheetDescription>Configure your settings here.</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	),
};

export const LeftSide: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Open Left Sheet</Button>
			</SheetTrigger>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>Navigation</SheetTitle>
					<SheetDescription>Navigate through the application.</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	),
};
