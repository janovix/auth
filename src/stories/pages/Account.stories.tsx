import { AccountView } from "@/components/auth/AccountView";
import {
	AuthSessionProvider,
	createSessionStore,
} from "@algenium/auth-next/client";
import type { SessionSnapshot } from "@algenium/auth-next";
import type { Meta, StoryObj } from "@storybook/react";

const createSnapshot = (
	overrides?: Partial<SessionSnapshot>,
): SessionSnapshot => ({
	data: null,
	error: null,
	isPending: false,
	...overrides,
});

const meta = {
	title: "Pages/Auth/Account",
	component: AccountView,
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof AccountView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSession: Story = {
	render: () => (
		<AuthSessionProvider
			store={createSessionStore(
				createSnapshot({
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
				}),
			)}
		>
			<AccountView />
		</AuthSessionProvider>
	),
};

export const WithoutSession: Story = {
	render: () => (
		<AuthSessionProvider store={createSessionStore(createSnapshot())}>
			<AccountView />
		</AuthSessionProvider>
	),
};
