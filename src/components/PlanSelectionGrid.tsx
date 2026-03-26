"use client";

import { Check, Lock, Loader2, Zap, Crown, Rocket, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import {
	getSubscriptionPrice,
	formatPriceMXN,
	type PublicPlanInfo,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

const planIcons: Record<string, typeof Zap> = {
	watchlist: Search,
	business: Zap,
	pro: Crown,
	ultra: Rocket,
};

/** Plans with launch promo: show strikethrough regular price when current price is lower */
const PLAN_PROMO_CONFIG: Record<string, { regularAmount: number }> = {
	business: { regularAmount: 499999 }, // $5,000.00/mes regular vs promo from API (e.g. $2,999.99)
};

interface PlanSelectionGridProps {
	plans: PublicPlanInfo[];
	onSelectPlan: (plan: PublicPlanInfo) => void;
	isLoading?: boolean;
	isActionLoading?: boolean;
	currentPlan?: string | null;
	recommendedPlan?: string;
}

export function PlanSelectionGrid({
	plans,
	onSelectPlan,
	isLoading = false,
	isActionLoading = false,
	currentPlan,
	recommendedPlan = "pro",
}: PlanSelectionGridProps) {
	const { t } = useLanguage();

	const planFeatures: Record<string, string[]> = {
		watchlist: [
			t("onboarding.plans.features.watchlist.1"),
			t("onboarding.plans.features.watchlist.2"),
			t("onboarding.plans.features.watchlist.3"),
			t("onboarding.plans.features.watchlist.4"),
			t("onboarding.plans.features.watchlist.5"),
		],
		business: [
			t("onboarding.plans.features.business.1"),
			t("onboarding.plans.features.business.2"),
			t("onboarding.plans.features.business.3"),
			t("onboarding.plans.features.business.4"),
			t("onboarding.plans.features.business.5"),
			t("onboarding.plans.features.business.6"),
		],
		pro: [
			t("onboarding.plans.features.pro.1"),
			t("onboarding.plans.features.pro.2"),
			t("onboarding.plans.features.pro.3"),
			t("onboarding.plans.features.pro.4"),
			t("onboarding.plans.features.pro.5"),
			t("onboarding.plans.features.pro.6"),
		],
		ultra: [
			t("onboarding.plans.features.ultra.1"),
			t("onboarding.plans.features.ultra.2"),
			t("onboarding.plans.features.ultra.3"),
			t("onboarding.plans.features.ultra.4"),
			t("onboarding.plans.features.ultra.5"),
			t("onboarding.plans.features.ultra.6"),
		],
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{plans
				.filter((plan) => plan.name !== "watchlist")
				.map((plan) => {
					const Icon = planIcons[plan.name] ?? Zap;
					const features = planFeatures[plan.name] ?? [];
					const subscriptionPrice = getSubscriptionPrice(plan);
					const isRecommended = plan.name === recommendedPlan;
					const isCurrent = currentPlan === plan.name;

					return (
						<Card
							key={plan.id}
							className={cn(
								"relative border-2 transition-all flex flex-col",
								isRecommended
									? "border-primary shadow-lg shadow-primary/10"
									: "border-border hover:border-muted-foreground/30",
							)}
						>
							{isRecommended && (
								<Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
									{t("onboarding.plans.recommended")}
								</Badge>
							)}
							<CardContent className="p-6 flex flex-col h-full">
								<div className="text-center mb-6">
									<div
										className={cn(
											"h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3",
											isRecommended ? "bg-primary/10" : "bg-muted",
										)}
									>
										<Icon
											className={cn(
												"h-6 w-6",
												isRecommended
													? "text-primary"
													: "text-muted-foreground",
											)}
										/>
									</div>
									<div className="flex items-center justify-center gap-2">
										<h3 className="text-xl font-semibold text-foreground">
											{plan.displayName}
										</h3>
										{isCurrent && (
											<Badge variant="secondary" className="text-xs">
												{t("settings.billing.currentPlanBadge")}
											</Badge>
										)}
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{t(`settings.billing.plans.${plan.name}.description`)}
									</p>
									<div className="mt-3">
										{subscriptionPrice ? (
											<>
												{(() => {
													const promoConfig = PLAN_PROMO_CONFIG[plan.name];
													const hasPromo =
														promoConfig &&
														subscriptionPrice.amount <
															promoConfig.regularAmount;
													const intervalKey =
														subscriptionPrice.interval || "month";
													const intervalLabel = t(
														`settings.billing.interval.${intervalKey}`,
													);
													return (
														<>
															{hasPromo && (
																<div className="text-sm text-muted-foreground line-through">
																	{formatPriceMXN(promoConfig.regularAmount)}/
																	{intervalLabel}
																</div>
															)}
															<div>
																<span className="text-3xl lg:text-4xl font-bold text-foreground">
																	{formatPriceMXN(subscriptionPrice.amount)}
																</span>
																<span className="text-muted-foreground">
																	/{intervalLabel}
																</span>
															</div>
														</>
													);
												})()}
											</>
										) : (
											<span className="text-2xl font-bold text-foreground">
												{t("onboarding.plans.watchlist.contact")}
											</span>
										)}
									</div>
									{subscriptionPrice && (
										<>
											{PLAN_PROMO_CONFIG[plan.name] &&
												subscriptionPrice.amount <
													PLAN_PROMO_CONFIG[plan.name].regularAmount && (
													<p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
														{t("onboarding.plans.launchPromo")}
													</p>
												)}
											<p className="text-xs text-muted-foreground mt-1">
												{t("onboarding.plans.meteredNote")}
											</p>
										</>
									)}
								</div>

								<div className="space-y-3 mb-6 grow">
									{features.slice(0, 6).map((feature, index) => (
										<div
											key={index}
											className="flex items-center gap-2 text-sm"
										>
											<Check className="h-4 w-4 text-success shrink-0" />
											<span className="text-muted-foreground">{feature}</span>
										</div>
									))}
								</div>

								<Button
									className="w-full mt-auto"
									size="lg"
									variant={isRecommended ? "default" : "outline"}
									onClick={() => onSelectPlan(plan)}
									disabled={isActionLoading || isCurrent || !subscriptionPrice}
								>
									{isActionLoading ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									) : (
										<Lock className="h-4 w-4 mr-2" />
									)}
									{isCurrent
										? t("settings.billing.currentPlanBadge")
										: t("onboarding.plans.subscribe").replace(
												"{plan}",
												plan.displayName,
											)}
								</Button>
							</CardContent>
						</Card>
					);
				})}
		</div>
	);
}
