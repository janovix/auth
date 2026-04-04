import type { Meta, StoryObj } from "@storybook/react";
import { ProductsView } from "@/components/ProductsView";
import {
	AuthSessionProvider,
	createSessionStore,
	type SessionSnapshot,
} from "@/lib/auth/useAuthSession";
import { LanguageProvider } from "@/contexts/language-context";
import { SettingsSidebarProductProvider } from "@/contexts/settings-sidebar-product-context";

const STORY_SESSION_DATE = new Date("2023-01-01T00:00:00.000Z");
const STORY_SESSION_EXPIRES = new Date("2023-01-02T00:00:00.000Z");

function buildSessionSnapshot(
	overrides?: Partial<SessionSnapshot>,
): SessionSnapshot {
	return {
		data: {
			user: {
				id: "story-user",
				name: "Story User",
				email: "story@janovix.com",
				image: null,
				createdAt: STORY_SESSION_DATE,
				updatedAt: STORY_SESSION_DATE,
				emailVerified: true,
			},
			session: {
				id: "session-story",
				userId: "story-user",
				token: "storybook-token",
				createdAt: STORY_SESSION_DATE,
				updatedAt: STORY_SESSION_DATE,
				expiresAt: STORY_SESSION_EXPIRES,
				ipAddress: "127.0.0.1",
				userAgent: "Storybook",
			},
		},
		error: null,
		isPending: false,
		...overrides,
	};
}

const meta: Meta<typeof ProductsView> = {
	title: "Components/ProductsView",
	component: ProductsView,
	decorators: [
		(Story) => (
			<LanguageProvider>
				<SettingsSidebarProductProvider
					hasAmlAccess
					hasWatchlistAccess
					activeOrganizationName="Acme Corp"
					hasResolvedEntitlements={true}
				>
					<AuthSessionProvider
						store={createSessionStore(buildSessionSnapshot())}
					>
						<Story />
					</AuthSessionProvider>
				</SettingsSidebarProductProvider>
			</LanguageProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof ProductsView>;

export const Default: Story = {
	render: () => <ProductsView />,
};

export const WatchlistOnlyPlan: Story = {
	render: () => (
		<LanguageProvider>
			<SettingsSidebarProductProvider
				hasAmlAccess={false}
				hasWatchlistAccess
				activeOrganizationName="E Corp"
				hasResolvedEntitlements={true}
			>
				<AuthSessionProvider store={createSessionStore(buildSessionSnapshot())}>
					<ProductsView />
				</AuthSessionProvider>
			</SettingsSidebarProductProvider>
		</LanguageProvider>
	),
};
