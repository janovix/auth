"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import type { SubscriptionStatus } from "@/lib/billing";
import { formatDate } from "@/lib/billing";
import { Crown, AlertCircle, Clock } from "lucide-react";

interface CurrentPlanCardProps {
	subscription: SubscriptionStatus | null;
	onUpgrade?: () => void;
	onCancel?: () => void;
	onReactivate?: () => void;
	isOwner: boolean;
	loading?: boolean;
}

export function CurrentPlanCard({
	subscription,
	onUpgrade,
	onCancel,
	onReactivate,
	isOwner,
	loading,
}: CurrentPlanCardProps) {
	const { t } = useLanguage();

	const getStatusBadge = () => {
		if (!subscription?.hasSubscription) {
			return (
				<Badge variant="secondary" className="text-muted-foreground">
					{t("settings.billing.noPlan")}
				</Badge>
			);
		}

		if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
			return (
				<Badge variant="destructive" className="flex items-center gap-1">
					<Clock className="h-3 w-3" />
					{t("settings.billing.canceledBadge").replace(
						"{date}",
						formatDate(subscription.currentPeriodEnd),
					)}
				</Badge>
			);
		}

		switch (subscription.status) {
			case "active":
				return (
					<Badge className="bg-emerald-500 hover:bg-emerald-600">
						{t("settings.billing.active")}
					</Badge>
				);
			case "trialing":
				return (
					<Badge className="bg-blue-500 hover:bg-blue-600">
						{t("settings.billing.trialing")}
					</Badge>
				);
			case "past_due":
				return (
					<Badge variant="destructive" className="flex items-center gap-1">
						<AlertCircle className="h-3 w-3" />
						{t("settings.billing.pastDue")}
					</Badge>
				);
			default:
				return null;
		}
	};

	const getPlanIcon = () => {
		if (subscription?.isEnterprise) {
			return <Crown className="h-5 w-5 text-amber-500" />;
		}
		if (subscription?.planTier === "pro") {
			return <Crown className="h-5 w-5 text-purple-500" />;
		}
		return null;
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{getPlanIcon()}
						<CardTitle>{t("settings.billing.currentPlan")}</CardTitle>
					</div>
					{getStatusBadge()}
				</div>
				<CardDescription>
					{subscription?.hasSubscription
						? subscription.planName || subscription.planTier.toUpperCase()
						: t("settings.billing.noPlanDesc")}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{subscription?.hasSubscription && subscription.currentPeriodEnd && (
					<p className="text-sm text-muted-foreground mb-4">
						{t("settings.billing.periodEnd").replace(
							"{date}",
							formatDate(subscription.currentPeriodEnd),
						)}
					</p>
				)}

				{isOwner && (
					<div className="flex flex-wrap gap-2">
						{!subscription?.hasSubscription && (
							<Button onClick={onUpgrade} disabled={loading}>
								{t("settings.billing.subscribe")}
							</Button>
						)}

						{subscription?.hasSubscription &&
							!subscription.cancelAtPeriodEnd && (
								<>
									{subscription.planTier !== "enterprise" && (
										<Button
											variant="outline"
											onClick={onUpgrade}
											disabled={loading}
										>
											{t("settings.billing.upgrade")}
										</Button>
									)}
									<Button
										variant="ghost"
										className="text-destructive hover:text-destructive"
										onClick={onCancel}
										disabled={loading}
									>
										{t("settings.billing.cancel")}
									</Button>
								</>
							)}

						{subscription?.hasSubscription &&
							subscription.cancelAtPeriodEnd && (
								<Button onClick={onReactivate} disabled={loading}>
									{t("settings.billing.reactivate")}
								</Button>
							)}
					</div>
				)}

				{!isOwner && (
					<p className="text-sm text-muted-foreground">
						{t("settings.billing.ownerOnly")}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
