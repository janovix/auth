"use client";

import { useEffect, useState, useCallback } from "react";
import {
	CreditCard,
	Check,
	Building2,
	FileText,
	Zap,
	Rocket,
	Crown,
	Loader2,
	Search,
	Shield,
	KeyRound,
	Mail,
	ChevronDown,
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
	getPortalUrl,
	activateLicenseKey,
	type UserSubscriptionStatus,
	type PublicPlanInfo,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	SettingsPageHeader,
	PricingTable,
	BillingSettingsViewSkeleton,
} from "@/components/settings";

// Plan icons and styling (descriptions use translation keys)
const planConfig: Record<
	string,
	{
		icon: typeof Zap;
		descriptionKey: string;
		highlight?: boolean;
		color?: string;
	}
> = {
	watchlist: {
		icon: Search,
		descriptionKey: "settings.billing.plans.watchlist.description",
		color: "text-blue-500",
	},
	business: {
		icon: Zap,
		descriptionKey: "settings.billing.plans.business.description",
		color: "text-primary",
	},
	pro: {
		icon: Crown,
		descriptionKey: "settings.billing.plans.pro.description",
		highlight: true,
		color: "text-primary",
	},
	ultra: {
		icon: Rocket,
		descriptionKey: "settings.billing.plans.ultra.description",
		color: "text-purple-500",
	},
};

export function BillingSettingsView() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const { data: session } = useAuthSession();

	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [subscription, setSubscription] =
		useState<UserSubscriptionStatus | null>(null);
	const [plans, setPlans] = useState<PublicPlanInfo[]>([]);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);

	// Load billing data
	const loadBillingData = useCallback(async () => {
		setLoading(true);
		try {
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
		loadBillingData();
	}, [loadBillingData]);

	// Handle plan selection / upgrade
	const handleSelectPlan = async (
		planName: "watchlist" | "business" | "pro" | "ultra",
	) => {
		setActionLoading(true);
		try {
			// If user already has a subscription, use Customer Portal for plan changes
			if (subscription?.hasSubscription) {
				const returnUrl = `${window.location.origin}/settings/billing?success=true`;
				const { url } = await getPortalUrl(returnUrl);
				window.location.href = url;
			} else {
				// New subscription - use checkout
				const successUrl = `${window.location.origin}/settings/billing?success=true`;
				const cancelUrl = `${window.location.origin}/settings/billing?canceled=true`;
				const { url } = await startSubscription(
					planName,
					successUrl,
					cancelUrl,
				);
				window.location.href = url;
			}
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

	// State for license redemption
	const [licenseKey, setLicenseKey] = useState("");
	const [redeemingLicense, setRedeemingLicense] = useState(false);

	// Initiate license redemption: if user has an active subscription show
	// confirmation dialog first, otherwise proceed directly.
	const handleRedeemLicenseClick = () => {
		if (!licenseKey.trim()) return;
		if (isSubscriptionActive(subscription)) {
			setRedeemDialogOpen(true);
		} else {
			handleRedeemLicense();
		}
	};

	const handleRedeemLicense = async () => {
		if (!licenseKey.trim()) return;
		setRedeemDialogOpen(false);
		setRedeemingLicense(true);
		try {
			const result = await activateLicenseKey(licenseKey.trim());

			const description = result.previousPlanCancelled
				? `${t("settings.billing.licenseRedeemedDesc")} ${t("settings.billing.previousPlanCancelled")}`
				: t("settings.billing.licenseRedeemedDesc");

			toast({
				title: t("settings.billing.licenseRedeemed"),
				description,
			});
			setLicenseKey("");
			await loadBillingData();
		} catch (error) {
			toast({
				title: t("settings.billing.error"),
				description: error instanceof Error ? error.message : undefined,
				variant: "destructive",
			});
		} finally {
			setRedeemingLicense(false);
		}
	};

	if (loading) {
		return <BillingSettingsViewSkeleton />;
	}

	const isActive = isSubscriptionActive(subscription);
	const statusInfo = getStatusBadgeInfo(subscription?.status ?? null);

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
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>
								{subscription?.plan
									? `${subscription.plan.charAt(0).toUpperCase()}${subscription.plan.slice(1)} Plan`
									: t("settings.billing.noSubscription")}
							</CardTitle>
							<CardDescription>
								{subscription?.hasSubscription
									? subscription.isTrialing
										? `${t("settings.billing.trial")} - ${subscription.trialDaysRemaining} ${t("settings.billing.daysRemaining")}`
										: `${t("settings.billing.activeSince")} ${subscription.currentPeriodStart ? formatDate(subscription.currentPeriodStart) : "N/A"}`
									: t("settings.billing.subscribePrompt")}
							</CardDescription>
						</div>
						{subscription?.status && (
							<Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-2">
							<Building2 className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">
								{t("settings.billing.organizations")}:{" "}
								{subscription?.organizationsOwned ?? 0} /{" "}
								{subscription?.organizationsLimit ?? 0}
							</span>
						</div>
						{subscription?.currentPeriodEnd && (
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
				{isActive && (
					<CardFooter className="flex flex-wrap gap-2 px-6 py-4 border-t">
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
						>
							{t("settings.billing.managePortal")}
						</Button>
						<Button
							variant="outline"
							onClick={() => setCancelDialogOpen(true)}
							disabled={actionLoading}
						>
							{t("settings.billing.cancel")}
						</Button>
					</CardFooter>
				)}
			</Card>

			{/* AML Plans Section - Simplified Cards */}
			<div id="plan-selection" className="space-y-3">
				<div className="flex items-center gap-2">
					<Shield className="h-5 w-5 text-primary" />
					<h3 className="text-lg font-semibold">
						{t("settings.billing.amlPlans")}
					</h3>
				</div>
				<p className="text-sm text-muted-foreground">
					{t("settings.billing.amlPlansDesc")}
				</p>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{plans
						.filter((plan) => plan.name !== "watchlist")
						.map((plan) => {
							const isCurrent = subscription?.plan === plan.name;
							const config = planConfig[plan.name] ?? {
								icon: Zap,
								description: "Subscription plan",
								color: "text-primary",
							};
							const isHighlighted = config.highlight;
							const PlanIcon = config.icon;
							const subscriptionPrice = getSubscriptionPrice(plan);

							return (
								<Card
									key={plan.name}
									className={`relative ${isHighlighted ? "border-primary" : ""}`}
								>
									{isHighlighted && (
										<div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
											<Badge className="bg-primary text-xs">
												{t("settings.billing.recommended")}
											</Badge>
										</div>
									)}
									<CardContent className="p-4 pt-5">
										<div className="space-y-3">
											{/* Header */}
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<PlanIcon className={`h-4 w-4 ${config.color}`} />
													<span className="font-semibold">
														{plan.name.charAt(0).toUpperCase() +
															plan.name.slice(1)}
													</span>
													{isCurrent && (
														<Badge variant="secondary" className="text-xs">
															{t("settings.billing.currentPlanBadge")}
														</Badge>
													)}
												</div>
											</div>
											<p className="text-xs text-muted-foreground">
												{t(config.descriptionKey)}
											</p>

											{/* Price */}
											{subscriptionPrice && (
												<div className="text-xl font-bold">
													{formatPriceMXN(subscriptionPrice.amount)}
													<span className="text-xs font-normal text-muted-foreground">
														{t("settings.billing.month")}
													</span>
												</div>
											)}

											{/* Key Features Only */}
											<ul className="space-y-1 text-sm">
												<li className="flex items-center gap-2">
													<Check className="h-3.5 w-3.5 text-green-500" />
													<span>
														{plan.limits?.maxOrganizations ?? 1}{" "}
														{t("settings.billing.orgs")}
													</span>
												</li>
												<li className="flex items-center gap-2">
													<Check className="h-3.5 w-3.5 text-green-500" />
													<span>
														{plan.limits?.usersPerOrg ?? 2}{" "}
														{t("settings.billing.usersPerOrg")}
													</span>
												</li>
											</ul>

											{/* See More Link */}
											<a
												href="#detailed-pricing"
												className="text-xs text-primary hover:underline inline-flex items-center gap-1"
											>
												{t("settings.billing.seeMore")}
												<ChevronDown className="h-3 w-3" />
											</a>

											{/* Button */}
											<Button
												className="w-full"
												size="sm"
												variant={isHighlighted ? "default" : "outline"}
												onClick={() =>
													handleSelectPlan(
														plan.name as
															| "watchlist"
															| "business"
															| "pro"
															| "ultra",
													)
												}
												disabled={actionLoading || isCurrent}
											>
												{actionLoading ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : isCurrent ? (
													t("settings.billing.currentPlanBadge")
												) : (
													t("settings.billing.select")
												)}
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
				</div>
			</div>

			{/* Enterprise License Section */}
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<KeyRound className="h-5 w-5 text-amber-500" />
					<h3 className="text-lg font-semibold">
						{t("settings.billing.enterprise")}
					</h3>
				</div>
				<Card className="border-border bg-card">
					<CardContent className="p-6">
						<div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
									<Building2 className="h-6 w-6 text-foreground" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-foreground">
										{t("settings.billing.enterprise")}
									</h3>
									<p className="text-sm text-muted-foreground">
										{t("settings.billing.enterpriseDesc")}
									</p>
								</div>
							</div>
							<div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
								<Button
									variant="outline"
									className="gap-2 bg-transparent w-full lg:w-auto"
									asChild
								>
									<a href="mailto:sales@janovix.com">
										<Mail className="h-4 w-4" />
										{t("settings.billing.contactSales")}
									</a>
								</Button>
								<AlertDialog>
									<Button
										variant="default"
										className="gap-2 w-full lg:w-auto"
										onClick={() => {
											// Show license redemption dialog
											const dialog = document.getElementById("license-dialog");
											if (dialog) dialog.click();
										}}
									>
										<KeyRound className="h-4 w-4" />
										{t("settings.billing.redeemLicense")}
									</Button>
								</AlertDialog>
							</div>
						</div>
						{/* License Redemption Input */}
						<div className="mt-4 pt-4 border-t border-border">
							<div className="flex gap-2">
								<div className="flex-1">
									<Label htmlFor="license-key" className="sr-only">
										{t("settings.billing.licenseKey")}
									</Label>
									<Input
										id="license-key"
										placeholder={t("settings.billing.licenseKeyPlaceholder")}
										value={licenseKey}
										onChange={(e) => setLicenseKey(e.target.value)}
										disabled={redeemingLicense}
									/>
								</div>
								<Button
									onClick={handleRedeemLicenseClick}
									disabled={!licenseKey.trim() || redeemingLicense}
								>
									{redeemingLicense ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										t("settings.billing.redeem")
									)}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Watchlist Only Plan - At the bottom */}
			{(() => {
				const watchlistPlan = plans.find((p) => p.name === "watchlist");
				const isCurrent = subscription?.plan === "watchlist";
				const subscriptionPrice = watchlistPlan
					? getSubscriptionPrice(watchlistPlan)
					: null;
				const displayPrice = subscriptionPrice?.amount ?? 49900;

				return (
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Search className="h-5 w-5 text-blue-500" />
							<h3 className="text-lg font-semibold">
								{t("settings.billing.watchlistOnly")}
							</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							{t("settings.billing.watchlistOnlyDesc")}
						</p>
						<Card className="border-border bg-card">
							<CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									<div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
										<Search className="h-5 w-5 text-foreground" />
									</div>
									<div>
										<div className="flex items-center gap-2">
											<span className="font-semibold">Watchlist</span>
											{isCurrent && (
												<Badge variant="secondary" className="text-xs">
													{t("settings.billing.currentPlanBadge")}
												</Badge>
											)}
										</div>
										<p className="text-sm text-muted-foreground">
											{t("settings.billing.watchlistOnlyNoAml")}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-4">
									<div className="text-right">
										<div className="text-xl font-bold">
											{formatPriceMXN(displayPrice)}
										</div>
										<span className="text-xs text-muted-foreground">
											/{t("settings.billing.month")}
										</span>
									</div>
									<Button
										variant={isCurrent ? "secondary" : "outline"}
										onClick={() => handleSelectPlan("watchlist")}
										disabled={actionLoading || isCurrent}
									>
										{actionLoading ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : isCurrent ? (
											t("settings.billing.currentPlanBadge")
										) : (
											t("settings.billing.select")
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				);
			})()}

			{/* Detailed Pricing Table */}
			<div id="detailed-pricing" className="scroll-mt-4">
				<Accordion type="single" collapsible>
					<AccordionItem value="pricing">
						<AccordionTrigger className="text-base font-semibold">
							{t("settings.billing.detailedPricing")}
						</AccordionTrigger>
						<AccordionContent>
							<PricingTable currentPlan={subscription?.plan} />
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>

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
						<AlertDialogAction onClick={handleRedeemLicense}>
							{t("settings.billing.redeemConfirmAction")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
