import type { Meta, StoryObj } from "@storybook/react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/language-context";
import {
	AuthSessionProvider,
	createSessionStore,
	type SessionSnapshot,
} from "@/lib/auth/useAuthSession";
import { SettingsSidebarProductProvider } from "@/contexts/settings-sidebar-product-context";

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

const sampleOrg = {
	id: "org-1",
	name: "Acme Corp",
	slug: "acme",
	logo: null as string | null,
	role: "owner" as const,
};

const decorators = [
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(Story: any) => (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<LanguageProvider>
				<AuthSessionProvider store={createSessionStore(createSnapshot())}>
					<div className="flex min-h-screen w-full">
						<Story />
					</div>
				</AuthSessionProvider>
			</LanguageProvider>
		</ThemeProvider>
	),
];

const meta = {
	title: "Components/AppSidebar",
	component: AppSidebar,
	parameters: {
		layout: "fullscreen",
	},
	decorators,
} satisfies Meta<typeof AppSidebar>;

export default meta;

type Story = StoryObj<typeof AppSidebar>;

export const AmlProductEnabled: Story = {
	render: (args) => (
		<SettingsSidebarProductProvider
			hasAmlAccess
			hasWatchlistAccess
			activeOrganizationName={null}
			hasResolvedEntitlements={true}
		>
			<SidebarProvider>
				<AppSidebar {...args} />
			</SidebarProvider>
		</SettingsSidebarProductProvider>
	),
	args: {
		organizations: [sampleOrg],
		activeOrganization: sampleOrg,
		onOrganizationChange: () => {},
		completionStatus: {
			personal: true,
			billing: true,
			organization: true,
			compliance: false,
			team: true,
		},
	},
};

export const WatchlistOnlyNoComplianceNav: Story = {
	render: (args) => (
		<SettingsSidebarProductProvider
			hasAmlAccess={false}
			hasWatchlistAccess
			activeOrganizationName={null}
			hasResolvedEntitlements={true}
		>
			<SidebarProvider>
				<AppSidebar {...args} />
			</SidebarProvider>
		</SettingsSidebarProductProvider>
	),
	args: {
		...AmlProductEnabled.args,
	},
};
