import type { Meta, StoryObj } from "@storybook/react";
import { PersonalSettingsView } from "@/components/settings/PersonalSettingsView";
import { OrganizationSettingsView } from "@/components/settings/OrganizationSettingsView";
import { ComplianceSettingsView } from "@/components/settings/ComplianceSettingsView";
import { TeamSettingsView } from "@/components/settings/TeamSettingsView";
import { BillingSettingsView } from "@/components/settings/BillingSettingsView";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/language-context";
import {
	AuthSessionProvider,
	createSessionStore,
	type SessionSnapshot,
} from "@/lib/auth/useAuthSession";

const createSnapshot = (
	overrides?: Partial<SessionSnapshot>,
): SessionSnapshot => ({
	data: {
		user: {
			id: "story-user",
			name: "Usuario Storybook",
			email: "storybook@janovix.com",
			image: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			emailVerified: true,
		},
		session: {
			id: "session-story",
			userId: "story-user",
			token: "storybook-token",
			createdAt: new Date(),
			updatedAt: new Date(),
			expiresAt: new Date(Date.now() + 7200 * 1000),
			ipAddress: "127.0.0.1",
			userAgent: "Storybook",
		},
	},
	error: null,
	isPending: false,
	...overrides,
});

const decorators = [
	(Story: any) => (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<LanguageProvider>
				<AuthSessionProvider store={createSessionStore(createSnapshot())}>
					<div className="min-h-screen p-4 sm:p-6 lg:p-8">
						<div className="max-w-4xl mx-auto">
							<Story />
						</div>
					</div>
				</AuthSessionProvider>
			</LanguageProvider>
		</ThemeProvider>
	),
];

const meta = {
	title: "Pages/Settings",
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Personal: Story = {
	render: () => <PersonalSettingsView />,
	decorators,
};

export const Organization: Story = {
	render: () => <OrganizationSettingsView />,
	decorators,
};

export const Compliance: Story = {
	render: () => <ComplianceSettingsView />,
	decorators,
};

export const Team: Story = {
	render: () => <TeamSettingsView />,
	decorators,
};

export const Billing: Story = {
	render: () => <BillingSettingsView />,
	decorators,
};
