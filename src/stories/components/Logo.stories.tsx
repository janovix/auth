import type { Meta, StoryObj } from "@storybook/react";
import { Logo } from "@/components/Logo";

const meta: Meta<typeof Logo> = {
	title: "Components/Logo",
	component: Logo,
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const LogoVariant: Story = {
	render: () => <Logo variant="logo" />,
};

export const IconVariant: Story = {
	render: () => <Logo variant="icon" />,
};

export const LightTheme: Story = {
	render: () => <Logo variant="logo" forceTheme="light" />,
};

export const DarkTheme: Story = {
	render: () => <Logo variant="logo" forceTheme="dark" />,
};

export const CustomSize: Story = {
	render: () => <Logo variant="logo" width={200} height={32} />,
};
