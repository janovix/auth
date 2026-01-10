import type { Meta, StoryObj } from "@storybook/react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LanguageProvider } from "@/contexts/language-context";
import { ThemeProvider } from "@/components/ThemeProvider";

const meta: Meta<typeof LanguageSwitcher> = {
	title: "Components/LanguageSwitcher",
	component: LanguageSwitcher,
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<LanguageProvider>
					<div className="p-4">
						<Story />
					</div>
				</LanguageProvider>
			</ThemeProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof LanguageSwitcher>;

export const Default: Story = {
	render: () => <LanguageSwitcher />,
};

export const WithDescription: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<LanguageSwitcher />
			<p className="text-sm text-muted-foreground">
				Switch between English, Spanish, and Portuguese
			</p>
		</div>
	),
};
