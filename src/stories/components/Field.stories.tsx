import type { Meta, StoryObj } from "@storybook/react";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Field> = {
	title: "UI/Field",
	component: Field,
};

export default meta;

type Story = StoryObj<typeof Field>;

export const Default: Story = {
	render: () => (
		<Field>
			<FieldLabel>Email</FieldLabel>
			<FieldDescription>Enter your email address</FieldDescription>
			<Input type="email" placeholder="email@example.com" />
		</Field>
	),
};

export const WithGroup: Story = {
	render: () => (
		<FieldGroup>
			<Field>
				<FieldLabel>First Name</FieldLabel>
				<Input placeholder="John" />
			</Field>
			<Field>
				<FieldLabel>Last Name</FieldLabel>
				<Input placeholder="Doe" />
			</Field>
		</FieldGroup>
	),
};

export const WithFieldSet: Story = {
	render: () => (
		<FieldSet>
			<FieldLegend>Personal Information</FieldLegend>
			<Field>
				<FieldLabel>Email</FieldLabel>
				<Input type="email" placeholder="email@example.com" />
			</Field>
			<Field>
				<FieldLabel>Phone</FieldLabel>
				<Input type="tel" placeholder="+1 (555) 000-0000" />
			</Field>
		</FieldSet>
	),
};
