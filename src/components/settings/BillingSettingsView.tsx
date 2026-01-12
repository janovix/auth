"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import {
	getSubscriptionStatus,
	getPlans,
	getInvoices,
	getLicenseStatus,
	createCheckoutSession,
	cancelSubscription,
	reactivateSubscription,
	activateLicense,
	type SubscriptionStatus,
	type Plan,
	type Invoice,
	type LicenseStatus,
} from "@/lib/billing";
import { Spinner } from "@/components/ui";
import {
	CurrentPlanCard,
	UsageMeter,
	PlanComparisonGrid,
	InvoiceHistory,
	LicenseActivation,
	CustomerPortalButton,
} from "@/components/billing";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/billing";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";

export function BillingSettingsView() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const { data: session } = useAuthSession();

	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
		null,
	);
	const [plans, setPlans] = useState<Plan[]>([]);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [license, setLicense] = useState<LicenseStatus | null>(null);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	// Check if user is org owner
	const [isOwner, setIsOwner] = useState(false);

	useEffect(() => {
		async function checkOwnership() {
			if (!activeOrgId || !session?.user?.id) return;

			try {
				const authServiceUrl = getAuthCoreBaseUrl();
				const response = await fetch(
					`${authServiceUrl}/api/settings/organization/${activeOrgId}/membership`,
					{ credentials: "include" },
				);

				if (response.ok) {
					const result = (await response.json()) as {
						data?: { role?: string };
					};
					setIsOwner(result.data?.role === "owner");
				}
			} catch {
				setIsOwner(false);
			}
		}

		checkOwnership();
	}, [activeOrgId, session?.user?.id]);

	// Load billing data
	const loadBillingData = useCallback(async () => {
		setLoading(true);
		try {
			const [subStatus, planList, invoiceList, licenseStatus] =
				await Promise.all([
					getSubscriptionStatus().catch(() => null),
					getPlans().catch(() => []),
					getInvoices().catch(() => []),
					getLicenseStatus().catch(() => null),
				]);

			setSubscription(subStatus);
			setPlans(planList);
			setInvoices(invoiceList);
			setLicense(licenseStatus);
		} catch (error) {
			console.error("Failed to load billing data:", error);
			toast({
				title: t("settings.billing.error"),
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [t, toast]);

	useEffect(() => {
		if (activeOrgId) {
			loadBillingData();
		}
	}, [activeOrgId, loadBillingData]);

	// Handle plan selection / upgrade
	const handleSelectPlan = async (planId: string) => {
		setActionLoading(true);
		try {
			const successUrl = `${window.location.origin}/settings/billing?success=true`;
			const cancelUrl = `${window.location.origin}/settings/billing?canceled=true`;

			const { url } = await createCheckoutSession(
				planId,
				successUrl,
				cancelUrl,
			);
			window.location.href = url;
		} catch (error) {
			console.error("Checkout error:", error);
			toast({
				title: t("settings.billing.error"),
				description: error instanceof Error ? error.message : undefined,
				variant: "destructive",
			});
		} finally {
			setActionLoading(false);
		}
	};

	// Handle cancel subscription
	const handleCancel = async () => {
		setActionLoading(true);
		setCancelDialogOpen(false);
		try {
			await cancelSubscription();
			toast({
				title: t("settings.billing.cancelSuccess"),
			});
			await loadBillingData();
		} catch (error) {
			console.error("Cancel error:", error);
			toast({
				title: t("settings.billing.error"),
				description: error instanceof Error ? error.message : undefined,
				variant: "destructive",
			});
		} finally {
			setActionLoading(false);
		}
	};

	// Handle reactivate subscription
	const handleReactivate = async () => {
		setActionLoading(true);
		try {
			await reactivateSubscription();
			toast({
				title: t("settings.billing.reactivateSuccess"),
			});
			await loadBillingData();
		} catch (error) {
			console.error("Reactivate error:", error);
			toast({
				title: t("settings.billing.error"),
				description: error instanceof Error ? error.message : undefined,
				variant: "destructive",
			});
		} finally {
			setActionLoading(false);
		}
	};

	// Handle license activation
	const handleActivateLicense = async (licenseKey: string) => {
		setActionLoading(true);
		try {
			await activateLicense(licenseKey);
			toast({
				title: t("settings.billing.licenseSuccess"),
			});
			await loadBillingData();
		} catch (error) {
			console.error("License activation error:", error);
			throw error; // Re-throw so the component can display the error
		} finally {
			setActionLoading(false);
		}
	};

	if (!activeOrgId) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				{t("settings.organization.noOrg")}
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner className="h-8 w-8" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-bold tracking-tight">
					{t("settings.billing.title")}
				</h2>
				<p className="text-muted-foreground">
					{t("settings.billing.description")}
				</p>
			</div>

			{/* Current Plan */}
			<CurrentPlanCard
				subscription={subscription}
				onUpgrade={() => {
					document
						.getElementById("plan-selection")
						?.scrollIntoView({ behavior: "smooth" });
				}}
				onCancel={() => setCancelDialogOpen(true)}
				onReactivate={handleReactivate}
				isOwner={isOwner}
				loading={actionLoading}
			/>

			{/* Usage - show for both active subscriptions and free tier */}
			{(subscription?.hasSubscription || subscription?.planTier === "free") &&
				subscription?.usage && (
					<UsageMeter
						usage={subscription.usage}
						periodEnd={subscription.currentPeriodEnd}
					/>
				)}

			{/* Enterprise License */}
			{(!subscription?.hasSubscription ||
				subscription.isEnterprise ||
				license) && (
				<LicenseActivation
					license={license}
					onActivate={handleActivateLicense}
					isOwner={isOwner}
					loading={actionLoading}
				/>
			)}

			{/* Stripe Portal Button */}
			{subscription?.hasSubscription && isOwner && (
				<div className="flex justify-end">
					<CustomerPortalButton disabled={actionLoading} />
				</div>
			)}

			{/* Plan Selection */}
			{!subscription?.isEnterprise && (
				<div id="plan-selection">
					<PlanComparisonGrid
						plans={plans}
						currentPlanId={
							subscription?.hasSubscription
								? plans.find((p) => p.tier === subscription.planTier)?.id
								: null
						}
						onSelectPlan={handleSelectPlan}
						loading={actionLoading}
					/>
				</div>
			)}

			{/* Invoice History */}
			{invoices.length > 0 && <InvoiceHistory invoices={invoices} />}

			{/* Cancel Confirmation Dialog */}
			<AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("settings.billing.cancel")}?</AlertDialogTitle>
						<AlertDialogDescription>
							{t("settings.billing.cancelConfirm").replace(
								"{date}",
								subscription?.currentPeriodEnd
									? formatDate(subscription.currentPeriodEnd)
									: "",
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleCancel}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{t("settings.billing.cancel")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
