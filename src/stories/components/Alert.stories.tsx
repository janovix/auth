import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

const meta: Meta<typeof Alert> = {
	title: "UI/Alert",
	component: Alert,
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
	render: () => (
		<Alert>
			<CheckCircle2 className="h-4 w-4" />
			<AlertTitle>Success</AlertTitle>
			<AlertDescription>
				Your changes have been saved successfully.
			</AlertDescription>
		</Alert>
	),
};

export const Destructive: Story = {
	render: () => (
		<Alert variant="destructive">
			<AlertCircle className="h-4 w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>
				There was an error processing your request. Please try again.
			</AlertDescription>
		</Alert>
	),
};

export const WithoutIcon: Story = {
	render: () => (
		<Alert>
			<AlertTitle>Information</AlertTitle>
			<AlertDescription>This alert doesn't have an icon.</AlertDescription>
		</Alert>
	),
};
