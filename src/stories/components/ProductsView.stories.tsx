import type { Meta, StoryObj } from "@storybook/react";
import { ProductsView } from "@/components/ProductsView";
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
			name: "Story User",
			email: "story@janovix.com",
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

const meta: Meta<typeof ProductsView> = {
	title: "Components/ProductsView",
	component: ProductsView,
	decorators: [
		(Story) => (
			<AuthSessionProvider store={createSessionStore(createSnapshot())}>
				<Story />
			</AuthSessionProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof ProductsView>;

export const Default: Story = {
	render: () => <ProductsView />,
};
