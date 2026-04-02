import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, type ReactNode } from "react";
import { ProductsView } from "@/components/ProductsView";
import type { UserSubscriptionStatus } from "@/lib/billing";
import {
	AuthSessionProvider,
	createSessionStore,
	type SessionSnapshot,
} from "@/lib/auth/useAuthSession";

const STORY_SESSION_DATE = new Date("2023-01-01T00:00:00.000Z");
const STORY_SESSION_EXPIRES = new Date("2023-01-02T00:00:00.000Z");

const mockSubscriptionStatus: UserSubscriptionStatus = {
	hasSubscription: true,
	status: "active",
	plan: "business",
	limits: {
		maxOrganizations: 5,
		usersPerOrg: 10,
		reportsPerMonth: 100,
		noticesPerMonth: 100,
		alertsPerMonth: 100,
		operationsPerMonth: 100,
		clientsPerMonth: 100,
		watchlistQueriesPerMonth: 1000,
	},
	isTrialing: false,
	trialDaysRemaining: null,
	currentPeriodStart: "2023-01-01T00:00:00.000Z",
	currentPeriodEnd: "2023-02-01T00:00:00.000Z",
	cancelAtPeriodEnd: false,
	organizationsOwned: 1,
	organizationsLimit: 5,
};

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

function BillingFetchMockBoundary({ children }: { children: ReactNode }) {
	useEffect(() => {
		const original = globalThis.fetch.bind(globalThis);
		globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
			const url =
				typeof input === "string"
					? input
					: input instanceof URL
						? input.href
						: input.url;
			if (url.endsWith("/api/subscription/status")) {
				return new Response(
					JSON.stringify({
						success: true,
						data: mockSubscriptionStatus,
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } },
				);
			}
			if (url.endsWith("/api/subscription/features")) {
				return new Response(
					JSON.stringify({
						success: true,
						data: {
							features: ["product_aml", "product_watchlist"],
						},
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } },
				);
			}
			return original(input, init);
		};
		return () => {
			globalThis.fetch = original;
		};
	}, []);
	return children;
}

const meta: Meta<typeof ProductsView> = {
	title: "Components/ProductsView",
	component: ProductsView,
	decorators: [
		(Story) => (
			<BillingFetchMockBoundary>
				<Story />
			</BillingFetchMockBoundary>
		),
		(Story) => (
			<AuthSessionProvider store={createSessionStore(buildSessionSnapshot())}>
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
