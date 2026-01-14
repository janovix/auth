"use client";

import { useEffect, useState, useCallback } from "react";
import {
	CreditCard,
	Check,
	Building2,
	Users,
	FileText,
	Zap,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import {
	getSubscriptionStatus,
	getPlans,
	startSubscription,
	cancelSubscription,
	getPortalUrl,
	type UserSubscriptionStatus,
	type PlanLimits,
	isSubscriptionActive,
	getStatusBadgeInfo,
	formatDate,
} from "@/lib/billing";
import { Spinner } from "@/components/ui";
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
import { SettingsPageHeader } from "@/components/settings";

interface PlanInfo {
	name: string;
	priceId: string;
	limits: PlanLimits;
}

export function BillingSettingsView() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const { data: session } = useAuthSession();

	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [subscription, setSubscription] =
		useState<UserSubscriptionStatus | null>(null);
	const [plans, setPlans] = useState<PlanInfo[]>([]);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

	// Load billing data
	const loadBillingData = useCallback(async () => {
		setLoading(true);
		try {
			const [subStatus, planList] = await Promise.all([
				getSubscriptionStatus().catch(() => null),
				getPlans().catch(() => []),
			]);

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
	const handleSelectPlan = async (planName: "business" | "pro") => {
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

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner className="h-8 w-8" />
			</div>
		);
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
									: "No Active Subscription"}
							</CardTitle>
							<CardDescription>
								{subscription?.hasSubscription
									? subscription.isTrialing
										? `Trial - ${subscription.trialDaysRemaining} days remaining`
										: `Active since ${subscription.currentPeriodStart ? formatDate(subscription.currentPeriodStart) : "N/A"}`
									: "Subscribe to create organizations and access features"}
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
								Organizations: {subscription?.organizationsOwned ?? 0} /{" "}
								{subscription?.organizationsLimit ?? 0}
							</span>
						</div>
						{subscription?.currentPeriodEnd && (
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm">
									{subscription.cancelAtPeriodEnd ? "Ends" : "Renews"}:{" "}
									{formatDate(subscription.currentPeriodEnd)}
								</span>
							</div>
						)}
					</div>

					{/* Organization Usage Progress */}
					{subscription?.hasSubscription &&
						subscription.organizationsLimit > 0 && (
							<div className="mt-4">
								<div className="flex justify-between text-sm mb-1">
									<span>Organization Usage</span>
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
					<CardFooter className="flex gap-2">
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
							Cancel Subscription
						</Button>
					</CardFooter>
				)}
			</Card>

			{/* Plan Selection */}
			<div id="plan-selection" className="space-y-4">
				<h3 className="text-lg font-semibold">Choose Your Plan</h3>
				<div className="grid md:grid-cols-2 gap-6">
					{plans.map((plan) => {
						const isCurrent = subscription?.plan === plan.name;
						const isPro = plan.name === "pro";

						return (
							<Card
								key={plan.name}
								className={`relative ${isPro ? "border-primary" : ""}`}
							>
								{isPro && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2">
										<Badge className="bg-primary">Recommended</Badge>
									</div>
								)}
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										{plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
										{isCurrent && <Badge variant="secondary">Current</Badge>}
									</CardTitle>
									<CardDescription>
										{isPro
											? "For growing teams with multiple projects"
											: "For individuals and small teams"}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<ul className="space-y-2">
										<li className="flex items-center gap-2">
											<Check className="h-4 w-4 text-green-500" />
											<span>
												{plan.limits.maxOrganizations} Organization
												{plan.limits.maxOrganizations > 1 ? "s" : ""}
											</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="h-4 w-4 text-green-500" />
											<span>{plan.limits.noticesPerMonth} Notices/month</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="h-4 w-4 text-green-500" />
											<span>{plan.limits.usersPerOrg} Users per org</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="h-4 w-4 text-green-500" />
											<span>14-day free trial</span>
										</li>
										{isPro && (
											<>
												<li className="flex items-center gap-2">
													<Zap className="h-4 w-4 text-yellow-500" />
													<span>Priority support</span>
												</li>
												<li className="flex items-center gap-2">
													<Zap className="h-4 w-4 text-yellow-500" />
													<span>Advanced features</span>
												</li>
											</>
										)}
									</ul>
								</CardContent>
								<CardFooter>
									<Button
										className="w-full"
										variant={isPro ? "default" : "outline"}
										onClick={() =>
											handleSelectPlan(plan.name as "business" | "pro")
										}
										disabled={actionLoading || isCurrent}
									>
										{isCurrent
											? "Current Plan"
											: subscription?.hasSubscription
												? "Switch to " +
													plan.name.charAt(0).toUpperCase() +
													plan.name.slice(1)
												: "Start Free Trial"}
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Cancel Confirmation Dialog */}
			<AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
						<AlertDialogDescription>
							Your subscription will remain active until{" "}
							{subscription?.currentPeriodEnd
								? formatDate(subscription.currentPeriodEnd)
								: "the end of your billing period"}
							. You can reactivate anytime before then.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Keep Subscription</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleCancel}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Cancel Subscription
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
