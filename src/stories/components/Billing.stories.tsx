import type { Meta, StoryObj } from "@storybook/react";
import { CurrentPlanCard } from "@/components/billing/CurrentPlanCard";
import { UsageMeter } from "@/components/billing/UsageMeter";
import { PlanComparisonGrid as PlanComparisonGridComponent } from "@/components/billing/PlanComparisonGrid";
import { InvoiceHistory } from "@/components/billing/InvoiceHistory";
import { LicenseActivation } from "@/components/billing/LicenseActivation";
import { CustomerPortalButton } from "@/components/billing/CustomerPortalButton";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/language-context";
import type {
	SubscriptionStatus,
	UsageCheckResult,
	Plan,
	Invoice,
	LicenseStatus,
} from "@/lib/billing";

const decorators = [
	(Story: any) => (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<LanguageProvider>
				<div className="p-4 max-w-4xl mx-auto">
					<Story />
				</div>
			</LanguageProvider>
		</ThemeProvider>
	),
];

const meta = {
	title: "Components/Billing",
	parameters: {
		layout: "centered",
	},
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const CurrentPlanCardActive: Story = {
	render: () => (
		<CurrentPlanCard
			subscription={{
				hasSubscription: true,
				isEnterprise: false,
				status: "active",
				planTier: "pro",
				planName: "Pro Plan",
				currentPeriodStart: new Date().toISOString(),
				currentPeriodEnd: new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000,
				).toISOString(),
				cancelAtPeriodEnd: false,
				usage: null,
				features: [],
				stripeCustomerId: "cus_test",
			}}
			isOwner={true}
		/>
	),
	decorators,
};

export const CurrentPlanCardTrialing: Story = {
	render: () => (
		<CurrentPlanCard
			subscription={{
				hasSubscription: true,
				isEnterprise: false,
				status: "trialing",
				planTier: "pro",
				planName: "Pro Plan",
				currentPeriodStart: new Date().toISOString(),
				currentPeriodEnd: new Date(
					Date.now() + 14 * 24 * 60 * 60 * 1000,
				).toISOString(),
				cancelAtPeriodEnd: false,
				usage: null,
				features: [],
				stripeCustomerId: "cus_test",
			}}
			isOwner={true}
		/>
	),
	decorators,
};

export const CurrentPlanCardCanceled: Story = {
	render: () => (
		<CurrentPlanCard
			subscription={{
				hasSubscription: true,
				isEnterprise: false,
				status: "active",
				planTier: "pro",
				planName: "Pro Plan",
				currentPeriodStart: new Date().toISOString(),
				currentPeriodEnd: new Date(
					Date.now() + 15 * 24 * 60 * 60 * 1000,
				).toISOString(),
				cancelAtPeriodEnd: true,
				usage: null,
				features: [],
				stripeCustomerId: "cus_test",
			}}
			isOwner={true}
		/>
	),
	decorators,
};

export const CurrentPlanCardNoPlan: Story = {
	render: () => <CurrentPlanCard subscription={null} isOwner={true} />,
	decorators,
};

export const UsageMeterDefault: Story = {
	render: () => {
		const noticesUsage: UsageCheckResult = {
			allowed: true,
			used: 45,
			included: 100,
			remaining: 55,
			overage: 0,
			planTier: "pro",
		};
		const usersUsage: UsageCheckResult = {
			allowed: true,
			used: 3,
			included: 10,
			remaining: 7,
			overage: 0,
			planTier: "pro",
		};
		const alertsUsage: UsageCheckResult = {
			allowed: true,
			used: 120,
			included: 100,
			remaining: 0,
			overage: 20,
			planTier: "pro",
		};
		return (
			<UsageMeter
				usage={{
					notices: noticesUsage,
					users: usersUsage,
					alerts: alertsUsage,
				}}
				periodEnd={new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000,
				).toISOString()}
			/>
		);
	},
	decorators,
};

export const UsageMeterUnlimited: Story = {
	render: () => {
		const noticesUsage: UsageCheckResult = {
			allowed: true,
			used: 500,
			included: -1,
			remaining: -1,
			overage: 0,
			planTier: "enterprise",
		};
		const usersUsage: UsageCheckResult = {
			allowed: true,
			used: 50,
			included: -1,
			remaining: -1,
			overage: 0,
			planTier: "enterprise",
		};
		return (
			<UsageMeter
				usage={{
					notices: noticesUsage,
					users: usersUsage,
				}}
				periodEnd={new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000,
				).toISOString()}
			/>
		);
	},
	decorators,
};

export const PlanComparisonGridStory: Story = {
	render: () => {
		const plans: Plan[] = [
			{
				id: "plan-business",
				name: "Business",
				tier: "business",
				monthlyPrice: 0,
				noticesIncluded: 10,
				usersIncluded: 3,
				overagePrice: null,
				features: ["data_capture", "compliance_validation"],
				recommended: false,
			},
			{
				id: "plan-pro",
				name: "Pro",
				tier: "pro",
				monthlyPrice: 99,
				noticesIncluded: 100,
				usersIncluded: 10,
				overagePrice: 0.5,
				features: [
					"data_capture",
					"compliance_validation",
					"report_generation",
					"acknowledgment_tracking",
					"advanced_roles",
				],
				recommended: true,
			},
			{
				id: "plan-enterprise",
				name: "Enterprise",
				tier: "enterprise",
				monthlyPrice: 299,
				noticesIncluded: -1,
				usersIncluded: -1,
				overagePrice: null,
				features: [
					"data_capture",
					"compliance_validation",
					"report_generation",
					"acknowledgment_tracking",
					"advanced_roles",
					"approval_flows",
					"report_templates",
					"priority_support",
					"sso",
					"custom_branding",
				],
				recommended: false,
			},
		];
		return (
			<PlanComparisonGridComponent
				plans={plans}
				currentPlanId="plan-pro"
				onSelectPlan={(planId: string) => console.log("Selected plan:", planId)}
			/>
		);
	},
	decorators,
};

export const InvoiceHistoryWithInvoices: Story = {
	render: () => {
		const invoices: Invoice[] = [
			{
				id: "inv_1",
				number: "INV-001",
				status: "paid",
				amountDue: 0,
				amountPaid: 9900,
				currency: "usd",
				periodStart: Date.now() - 60 * 24 * 60 * 60 * 1000,
				periodEnd: Date.now() - 30 * 24 * 60 * 60 * 1000,
				created: Date.now() - 30 * 24 * 60 * 60 * 1000,
				hostedInvoiceUrl: "https://example.com/invoice/1",
				invoicePdf: "https://example.com/invoice/1.pdf",
			},
			{
				id: "inv_2",
				number: "INV-002",
				status: "open",
				amountDue: 9900,
				amountPaid: 0,
				currency: "usd",
				periodStart: Date.now() - 30 * 24 * 60 * 60 * 1000,
				periodEnd: Date.now(),
				created: Date.now(),
				hostedInvoiceUrl: "https://example.com/invoice/2",
				invoicePdf: "https://example.com/invoice/2.pdf",
			},
		];
		return <InvoiceHistory invoices={invoices} />;
	},
	decorators,
};

export const InvoiceHistoryEmpty: Story = {
	render: () => <InvoiceHistory invoices={[]} />,
	decorators,
};

export const LicenseActivationActive: Story = {
	render: () => {
		const license: LicenseStatus = {
			id: "license-1",
			customerName: "Acme Corp",
			isActive: true,
			isExpired: false,
			isRevoked: false,
			expiresAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
			daysUntilExpiry: 300,
			limits: {
				noticesPerMonth: -1,
				maxUsers: -1,
				maxTransactions: -1,
				maxAlerts: -1,
			},
			features: ["all"],
			activatedAt: new Date(
				Date.now() - 60 * 24 * 60 * 60 * 1000,
			).toISOString(),
			organizationId: "org-123",
		};
		return (
			<LicenseActivation
				license={license}
				onActivate={async () => {}}
				isOwner={true}
			/>
		);
	},
	decorators,
};

export const LicenseActivationInactive: Story = {
	render: () => (
		<LicenseActivation
			license={null}
			onActivate={async (key) => {
				console.log("Activating license:", key);
			}}
			isOwner={true}
		/>
	),
	decorators,
};

export const CustomerPortalButtonDefault: Story = {
	render: () => <CustomerPortalButton />,
	decorators,
};

export const CustomerPortalButtonDisabled: Story = {
	render: () => <CustomerPortalButton disabled />,
	decorators,
};
