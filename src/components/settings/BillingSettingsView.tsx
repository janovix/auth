"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState, useCallback } from "react";
import {
	CreditCard,
	Check,
	Building2,
	FileText,
	Loader2,
	KeyRound,
	CircleAlert,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import {
	getSubscriptionStatus,
	getPublicPlans,
	getSubscriptionPrice,
	formatPriceMXN,
	startSubscription,
	cancelSubscription,
	reactivateSubscription,
	getPortalUrl,
	activateLicenseKey,
	prepareDowngrade,
	changeSubscriptionPlan,
	type UserSubscriptionStatus,
	type PublicPlanInfo,
	type PrepareDowngradeResponse,
	hasActiveBillingForUsageLimits,
	isSubscriptionActive,
	getStatusBadgeInfo,
	formatDate,
} from "@/lib/billing";
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
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	SettingsPageHeader,
	SettingsSection,
	PricingTable,
	BillingSettingsViewSkeleton,
} from "@/components/settings";
import { getOrganizationMembership } from "@/lib/settings";
import { dispatchBillingEntitlementsUpdated } from "@/lib/settings/billingEntitlementsEvents";
import { PlanSelectionGrid } from "@/components/PlanSelectionGrid";
import { EnterpriseCard } from "@/components/EnterpriseCard";
import { WatchlistCard } from "@/components/WatchlistCard";
import { UsageLimitsSection } from "@/components/settings/UsageLimitsSection";
import { DowngradeWizard } from "@/components/settings/DowngradeWizard";
import { useFlags } from "@/hooks/useFlags";

export function BillingSettingsView() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const { data: session } = useAuthSession();

	const {
		flags: stripeFlags,
		error: stripeFlagsError,
		isLoading: flagsLoading,
	} = useFlags(["stripe-billing-enabled"]);
	const stripeBillingEnabled =
		stripeFlagsError !== null
			? true
			: stripeFlags["stripe-billing-enabled"] !== false;

	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [subscription, setSubscription] =
		useState<UserSubscriptionStatus | null>(null);
	const [plans, setPlans] = useState<PublicPlanInfo[]>([]);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
	const [downgradeOpen, setDowngradeOpen] = useState(false);
	const [downgradePlan, setDowngradePlan] = useState<
		"watchlist" | "business" | "pro" | "ultra" | null
	>(null);
	const [downgradePrep, setDowngradePrep] =
		useState<PrepareDowngradeResponse | null>(null);
	const [isOrgOwner, setIsOrgOwner] = useState(false);

	// Load billing data
	const loadBillingData = useCallback(async () => {
		setLoading(true);
		try {
			const activeOrgId = (
				session?.session as { activeOrganizationId?: string } | undefined
			)?.activeOrganizationId;

			if (activeOrgId) {
				const membership = await getOrganizationMembership(activeOrgId).catch(
					() => null,
				);
				setIsOrgOwner(membership?.role === "owner");
			} else {
				setIsOrgOwner(false);
			}

			const [subStatus, planList] = await Promise.all([
				getSubscriptionStatus().catch(() => null),
				getPublicPlans().catch(() => []),
			]);

			// Sort plans by subscription price (lowest first)
			planList.sort((a, b) => {
				const priceA = getSubscriptionPrice(a)?.amount ?? 0;
				const priceB = getSubscriptionPrice(b)?.amount ?? 0;
				return priceA - priceB;
			});

			setSubscription(subStatus);
			setPlans(planList);
		} catch (error) {
			Sentry.captureException(error, {
				tags: { context: "billing-data-load-failed" },
			});
			toast({
				title: t("settings.billing.error"),
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [t, toast, session?.session]);

	useEffect(() => {
		if (flagsLoading) return;
		if (!stripeBillingEnabled) {
			setLoading(false);
			return;
		}
		void loadBillingData();
	}, [loadBillingData, flagsLoading, stripeBillingEnabled]);

	// Handle plan selection / upgrade
	const handleSelectPlan = async (
		planName: "watchlist" | "business" | "pro" | "ultra",
	) => {
		if (subscription?.isLicenseBased) {
			toast({
				title: t("settings.billing.error"),
				description:
					t("settings.billing.licensePlanChangeHint") ||
					"Plan changes for enterprise licenses are handled by your account executive.",
				variant: "destructive",
			});
			return;
		}

		setActionLoading(true);
		try {
			if (subscription?.hasSubscription && !subscription.isLicenseBased) {
				const prep = await prepareDowngrade(planName);
				const needsWizard =
					prep.excessOrganizationSlots > 0 ||
					prep.organizations.some((o) => o.exceedsUsersPerOrgAfterDowngrade);
				if (needsWizard) {
					setDowngradePrep(prep);
					setDowngradePlan(planName);
					setDowngradeOpen(true);
					setActionLoading(false);
					return;
				}

				const { redirectUrl } = await changeSubscriptionPlan(planName);
				if (redirectUrl) {
					window.location.href = redirectUrl;
					return;
				}

				toast({
					title: t("settings.billing.planUpdated") || "Plan updated",
				});
				await loadBillingData();
				dispatchBillingEntitlementsUpdated();
				return;
			}

			const successUrl = `${window.location.origin}/settings/billing?success=true`;
			const cancelUrl = `${window.location.origin}/settings/billing?canceled=true`;
			const { url } = await startSubscription(planName, successUrl, cancelUrl);
			window.location.href = url;
		} catch (error) {
			Sentry.captureException(error, {
				tags: { context: "checkout-error" },
			});
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
			dispatchBillingEntitlementsUpdated();
		} catch (error) {
			Sentry.captureException(error, {
				tags: { context: "cancel-subscription-error" },
			});
			toast({
				title: t("settings.billing.error"),
				description: error instanceof Error ? error.message : undefined,
				variant: "destructive",
			});
		} finally {
			setActionLoading(false);
		}
	};

	// Reactivate subscription (undo cancel at period end)
	const handleReactivate = async () => {
		setActionLoading(true);
		try {
			await reactivateSubscription();
			toast({
				title: t("settings.billing.reactivateSuccess"),
			});
			await loadBillingData();
			dispatchBillingEntitlementsUpdated();
		} catch (error) {
			Sentry.captureException(error, {
				tags: { context: "reactivate-subscription-error" },
			});
			toast({
				title: t("settings.billing.error"),
				description: error instanceof Error ? error.message : undefined,
				variant: "destructive",
			});
		} finally {
			setActionLoading(false);
		}
	};

	// State for license redemption confirmation dialog
	const [pendingLicenseKey, setPendingLicenseKey] = useState("");

	const handleRedeemLicense = async (key: string) => {
		if (isSubscriptionActive(subscription)) {
			setPendingLicenseKey(key);
			setRedeemDialogOpen(true);
			return;
		}
		await doActivateLicense(key);
	};

	const doActivateLicense = async (key: string) => {
		setRedeemDialogOpen(false);
		try {
			const result = await activateLicenseKey(key);

			const description = result.previousPlanCancelled
				? `${t("settings.billing.licenseRedeemedDesc")} ${t("settings.billing.previousPlanCancelled")}`
				: t("settings.billing.licenseRedeemedDesc");

			toast({
				title: t("settings.billing.licenseRedeemed"),
				description,
			});
			await loadBillingData();
			dispatchBillingEntitlementsUpdated();
		} catch (error) {
			Sentry.captureException(error, {
				tags: { context: "license-activation-error" },
			});
			toast({
				title: t("settings.billing.error"),
				description: error instanceof Error ? error.message : undefined,
				variant: "destructive",
			});
		}
	};

	if (flagsLoading || loading) {
		return <BillingSettingsViewSkeleton />;
	}

	if (!stripeBillingEnabled) {
		return (
			<div className="space-y-8">
				<SettingsPageHeader
					icon={CreditCard}
					title={t("settings.billing.licenseOnlyTitle")}
					description={t("settings.billing.licenseOnlyDescription")}
				/>
				<Card>
					<CardHeader>
						<CardTitle>{t("settings.billing.licenseOnlyTitle")}</CardTitle>
						<CardDescription>
							{t("settings.billing.licenseOnlyDescription")}
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const isActive = isSubscriptionActive(subscription);
	const isPendingCancel =
		isActive &&
		!subscription?.isLicenseBased &&
		Boolean(subscription?.cancelAtPeriodEnd);
	const statusInfo = getStatusBadgeInfo(subscription?.status ?? null, {
		cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
	});

	return (
		<div className="space-y-8">
			{/* Header */}
			<SettingsPageHeader
				icon={CreditCard}
				title={t("settings.billing.title")}
				description={t("settings.billing.description")}
			/>

			{/* Current Subscription Status */}
			<Card>
				<CardHeader className={isActive ? undefined : "pb-4"}>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>
								{subscription?.plan
									? `${plans.find((p) => p.name === subscription.plan)?.displayName ?? `${subscription.plan.charAt(0).toUpperCase()}${subscription.plan.slice(1)}`} Plan`
									: t("settings.billing.noSubscription")}
							</CardTitle>
							<CardDescription>
								{isActive
									? subscription?.hasSubscription
										? subscription.isLicenseBased
											? subscription.licenseExpiresAt
												? `${t("settings.billing.licenseExpires")} ${formatDate(subscription.licenseExpiresAt)}`
												: t("settings.billing.licenseNoExpiry")
											: subscription.isTrialing
												? subscription.cancelAtPeriodEnd &&
													subscription.currentPeriodEnd
													? `${t("settings.billing.trial")} - ${subscription.trialDaysRemaining} ${t("settings.billing.daysRemaining")} — ${t("settings.billing.canceledBadge").replace("{date}", formatDate(subscription.currentPeriodEnd))}`
													: `${t("settings.billing.trial")} - ${subscription.trialDaysRemaining} ${t("settings.billing.daysRemaining")}`
												: subscription.cancelAtPeriodEnd &&
													  subscription.currentPeriodEnd
													? t("settings.billing.canceledBadge").replace(
															"{date}",
															formatDate(subscription.currentPeriodEnd),
														)
													: `${t("settings.billing.activeSince")} ${subscription.currentPeriodStart ? formatDate(subscription.currentPeriodStart) : "N/A"}`
										: t("settings.billing.subscribePrompt")
									: subscription?.hasSubscription
										? t("settings.billing.inactiveBillingSubtitle")
										: t("settings.billing.subscribePrompt")}
							</CardDescription>
						</div>
						{subscription?.status && (
							<Badge variant={statusInfo.variant}>
								{statusInfo.translationKey
									? t(statusInfo.translationKey)
									: statusInfo.label}
							</Badge>
						)}
					</div>
				</CardHeader>
				{isActive ? (
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center gap-2">
								<Building2 className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">
									{t("settings.billing.organizations")}:{" "}
									{subscription?.organizationsOwned ?? 0} /{" "}
									{subscription?.organizationsLimit === 0
										? t("settings.billing.unlimited")
										: (subscription?.organizationsLimit ?? 0)}
								</span>
							</div>
							{subscription?.isLicenseBased
								? subscription.licenseExpiresAt && (
										<div className="flex items-center gap-2">
											<KeyRound className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">
												{t("settings.billing.licenseExpires")}:{" "}
												{formatDate(subscription.licenseExpiresAt)}
											</span>
										</div>
									)
								: subscription?.currentPeriodEnd && (
										<div className="flex items-center gap-2">
											<FileText className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm">
												{subscription.cancelAtPeriodEnd
													? t("settings.billing.ends")
													: t("settings.billing.renews")}
												: {formatDate(subscription.currentPeriodEnd)}
											</span>
										</div>
									)}
						</div>

						{/* Organization Usage Progress */}
						{subscription?.hasSubscription &&
							subscription.organizationsLimit > 0 && (
								<div className="mt-4">
									<div className="flex justify-between text-sm mb-1">
										<span>{t("settings.billing.orgUsage")}</span>
										<span>
											{subscription.organizationsOwned} /{" "}
											{subscription.organizationsLimit}
										</span>
									</div>
									<Progress
										value={
											(subscription.organizationsOwned /
												subscription.organizationsLimit) *
											100
										}
										className="h-2"
									/>
								</div>
							)}
					</CardContent>
				) : null}
				{isActive && !subscription?.isLicenseBased && (
					<CardFooter className="flex flex-col gap-4 px-6 py-4 border-t">
						{isPendingCancel && subscription?.currentPeriodEnd != null ? (
							<Alert className="border-amber-500/50 bg-amber-500/5 text-foreground">
								<CircleAlert className="text-amber-600 dark:text-amber-500" />
								<AlertDescription className="text-muted-foreground">
									{t("settings.billing.pendingCancelDesc").replace(
										"{date}",
										formatDate(subscription.currentPeriodEnd),
									)}
								</AlertDescription>
							</Alert>
						) : null}
						<div className="flex flex-wrap gap-2">
							<Button
								variant="default"
								onClick={async () => {
									setActionLoading(true);
									try {
										const { url } = await getPortalUrl(
											`${window.location.origin}/settings/billing`,
										);
										window.location.href = url;
									} catch (error) {
										toast({
											title: t("settings.billing.error"),
											description:
												error instanceof Error ? error.message : undefined,
											variant: "destructive",
										});
									} finally {
										setActionLoading(false);
									}
								}}
								disabled={actionLoading}
								title={
									t("settings.billing.managePortalHint") ||
									"Payment methods, invoices, and billing history"
								}
							>
								{t("settings.billing.managePortal")}
							</Button>
							{isPendingCancel ? (
								<Button
									variant="outline"
									onClick={handleReactivate}
									disabled={actionLoading}
								>
									{t("settings.billing.reactivate")}
								</Button>
							) : (
								<Button
									variant="outline"
									onClick={() => setCancelDialogOpen(true)}
									disabled={actionLoading}
								>
									{t("settings.billing.cancel")}
								</Button>
							)}
						</div>
					</CardFooter>
				)}
				{isActive && subscription?.isLicenseBased && (
					<CardFooter className="px-6 py-4 border-t">
						<p className="text-sm text-muted-foreground">
							{t("settings.billing.licenseManagedExternally")}
						</p>
					</CardFooter>
				)}
			</Card>

			{isOrgOwner && hasActiveBillingForUsageLimits(subscription) ? (
				<UsageLimitsSection
					subscriptionPlan={subscription?.plan ?? null}
					isLicenseBased={subscription?.isLicenseBased ?? false}
				/>
			) : null}

			{/* Plan Selection + Enterprise + Watchlist */}
			<SettingsSection
				title={t("onboarding.plans.select.title")}
				description={t("onboarding.plans.select.description")}
			>
				<div className="space-y-6">
					<PlanSelectionGrid
						plans={plans}
						onSelectPlan={(plan) =>
							handleSelectPlan(
								plan.name as "watchlist" | "business" | "pro" | "ultra",
							)
						}
						isActionLoading={actionLoading}
						currentPlan={subscription?.plan ?? null}
					/>

					<EnterpriseCard onRedeem={handleRedeemLicense} />

					{(() => {
						const watchlistPlan = plans.find((p) => p.name === "watchlist");
						const subscriptionPrice = watchlistPlan
							? getSubscriptionPrice(watchlistPlan)
							: null;
						return (
							<WatchlistCard
								displayPrice={subscriptionPrice?.amount ?? 49900}
								interval={subscriptionPrice?.interval ?? "month"}
								onSelect={() => handleSelectPlan("watchlist")}
								isLoading={actionLoading}
								canSubscribe={Boolean(watchlistPlan && subscriptionPrice)}
								isCurrent={subscription?.plan === "watchlist"}
							/>
						);
					})()}
				</div>
			</SettingsSection>

			{/* Detailed Pricing Table */}
			<SettingsSection
				title={t("onboarding.plans.detailed.title")}
				description={t("onboarding.plans.detailed.description")}
			>
				<Accordion type="single" collapsible>
					<AccordionItem value="pricing">
						<AccordionTrigger className="text-sm font-semibold">
							{t("onboarding.plans.detailed.trigger")}
						</AccordionTrigger>
						<AccordionContent>
							<PricingTable currentPlan={subscription?.plan} />
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</SettingsSection>

			{/* Cancel Confirmation Dialog */}
			<AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("settings.billing.cancelTitle")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("settings.billing.cancelDesc")}{" "}
							{subscription?.currentPeriodEnd
								? formatDate(subscription.currentPeriodEnd)
								: t("settings.billing.endOfPeriod")}
							. {t("settings.billing.reactivateAnytime")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							{t("settings.billing.keepSubscription")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleCancel}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{t("settings.billing.cancelSubscription")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* License Redeem Confirmation Dialog */}
			<AlertDialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("settings.billing.redeemConfirmTitle")}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t("settings.billing.redeemConfirmDesc")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							{t("settings.billing.redeemKeepSubscription")}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => doActivateLicense(pendingLicenseKey)}
						>
							{t("settings.billing.redeemConfirmAction")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{downgradePlan && downgradePrep ? (
				<DowngradeWizard
					open={downgradeOpen}
					onOpenChange={(open) => {
						setDowngradeOpen(open);
						if (!open) {
							setDowngradePlan(null);
							setDowngradePrep(null);
						}
					}}
					targetPlan={downgradePlan}
					prep={downgradePrep}
					onFinished={async () => {
						await loadBillingData();
						dispatchBillingEntitlementsUpdated();
						toast({
							title: t("settings.billing.planUpdated") || "Plan updated",
						});
					}}
					onError={(message) => {
						toast({
							title: t("settings.billing.error"),
							description: message,
							variant: "destructive",
						});
					}}
				/>
			) : null}
		</div>
	);
}
