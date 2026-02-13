"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import {
	Loader2,
	Users,
	Building2,
	FileText,
	Bell,
	AlertTriangle,
	Receipt,
	UserPlus,
	Info,
} from "lucide-react";
import {
	getPublicPlans,
	formatPriceMXN,
	type PublicPlanInfo,
	type PublicPlanPrice,
} from "@/lib/billing";
import { useLanguage } from "@/contexts/language-context";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Price type icons and translation keys
const priceTypeConfig: Record<
	string,
	{ labelKey: string; descriptionKey: string; icon: typeof FileText }
> = {
	subscription: {
		labelKey: "settings.billing.pricing.subscription.label",
		descriptionKey: "settings.billing.pricing.subscription.description",
		icon: Receipt,
	},
	seat: {
		labelKey: "settings.billing.pricing.seat.label",
		descriptionKey: "settings.billing.pricing.seat.description",
		icon: UserPlus,
	},
	extra_org: {
		labelKey: "settings.billing.pricing.extraOrg.label",
		descriptionKey: "settings.billing.pricing.extraOrg.description",
		icon: Building2,
	},
	overage_report: {
		labelKey: "settings.billing.pricing.overageReport.label",
		descriptionKey: "settings.billing.pricing.overageReport.description",
		icon: FileText,
	},
	overage_notice: {
		labelKey: "settings.billing.pricing.overageNotice.label",
		descriptionKey: "settings.billing.pricing.overageNotice.description",
		icon: Bell,
	},
	overage_alert: {
		labelKey: "settings.billing.pricing.overageAlert.label",
		descriptionKey: "settings.billing.pricing.overageAlert.description",
		icon: AlertTriangle,
	},
	overage_operation: {
		labelKey: "settings.billing.pricing.overageOperation.label",
		descriptionKey: "settings.billing.pricing.overageOperation.description",
		icon: Receipt,
	},
	overage_client: {
		labelKey: "settings.billing.pricing.overageClient.label",
		descriptionKey: "settings.billing.pricing.overageClient.description",
		icon: Users,
	},
};

// Limit icons and translation keys
const limitConfig: Record<string, { labelKey: string; icon: typeof Users }> = {
	maxOrganizations: {
		labelKey: "settings.billing.limits.organizations",
		icon: Building2,
	},
	usersPerOrg: {
		labelKey: "settings.billing.limits.usersPerOrg",
		icon: Users,
	},
	reportsPerMonth: {
		labelKey: "settings.billing.limits.reportsPerMonth",
		icon: FileText,
	},
	noticesPerMonth: {
		labelKey: "settings.billing.limits.noticesPerMonth",
		icon: Bell,
	},
	alertsPerMonth: {
		labelKey: "settings.billing.limits.alertsPerMonth",
		icon: AlertTriangle,
	},
	operationsPerMonth: {
		labelKey: "settings.billing.limits.operationsPerMonth",
		icon: Receipt,
	},
	clientsPerMonth: {
		labelKey: "settings.billing.limits.clientsPerMonth",
		icon: Users,
	},
	watchlistQueriesPerDay: {
		labelKey: "settings.billing.limits.watchlistQueries",
		icon: Users,
	},
};

interface PricingTableProps {
	currentPlan?: string | null;
}

export function PricingTable({ currentPlan }: PricingTableProps) {
	const { t } = useLanguage();
	const [plans, setPlans] = useState<PublicPlanInfo[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadPlans() {
			try {
				const fetchedPlans = await getPublicPlans();
				// Sort plans by subscription price
				fetchedPlans.sort((a, b) => {
					const priceA =
						a.prices.find((p) => p.priceType === "subscription")?.amount ?? 0;
					const priceB =
						b.prices.find((p) => p.priceType === "subscription")?.amount ?? 0;
					return priceA - priceB;
				});
				setPlans(fetchedPlans);
			} catch (err) {
				Sentry.captureException(err, {
					tags: { context: "pricing-plans-load-failed" },
				});
				setError("Failed to load pricing information");
			} finally {
				setIsLoading(false);
			}
		}
		loadPlans();
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<p>{t("settings.billing.pricing.loadError")}</p>
			</div>
		);
	}

	// Get all unique price types across all plans
	const allPriceTypes = Array.from(
		new Set(plans.flatMap((plan) => plan.prices.map((p) => p.priceType))),
	);

	// Get price for a plan by type
	const getPriceByType = (
		plan: PublicPlanInfo,
		priceType: string,
	): PublicPlanPrice | undefined => {
		return plan.prices.find((p) => p.priceType === priceType);
	};

	return (
		<div className="space-y-8">
			{/* Plan Limits Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						{t("settings.billing.pricing.planLimitsTitle")}
					</CardTitle>
					<CardDescription>
						{t("settings.billing.pricing.planLimitsDesc")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Desktop Table */}
					<div className="hidden md:block overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[200px]">
										{t("settings.billing.pricing.limitHeader")}
									</TableHead>
									{plans.map((plan) => (
										<TableHead
											key={plan.id}
											className={cn(
												"text-center",
												currentPlan === plan.name &&
													"bg-primary/5 font-semibold",
											)}
										>
											<div className="flex flex-col items-center gap-1">
												<span>{plan.displayName}</span>
												{currentPlan === plan.name && (
													<Badge variant="secondary" className="text-xs">
														{t("settings.billing.currentPlanBadge")}
													</Badge>
												)}
											</div>
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{Object.entries(limitConfig).map(
									([key, { labelKey, icon: Icon }]) => (
										<TableRow key={key}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													<Icon className="h-4 w-4 text-muted-foreground" />
													{t(labelKey)}
												</div>
											</TableCell>
											{plans.map((plan) => {
												const value =
													plan.limits?.[key as keyof typeof plan.limits];
												return (
													<TableCell
														key={plan.id}
														className={cn(
															"text-center",
															currentPlan === plan.name && "bg-primary/5",
														)}
													>
														{value !== undefined ? (
															<span className="font-medium">{value}</span>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</TableCell>
												);
											})}
										</TableRow>
									),
								)}
							</TableBody>
						</Table>
					</div>

					{/* Mobile Cards */}
					<div className="md:hidden space-y-4">
						{plans.map((plan) => (
							<Card
								key={plan.id}
								className={cn(currentPlan === plan.name && "border-primary")}
							>
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg">
											{plan.displayName}
										</CardTitle>
										{currentPlan === plan.name && (
											<Badge variant="secondary">
												{t("settings.billing.currentPlanBadge")}
											</Badge>
										)}
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-3 text-sm">
										{Object.entries(limitConfig).map(
											([key, { labelKey, icon: Icon }]) => {
												const value =
													plan.limits?.[key as keyof typeof plan.limits];
												return (
													<div
														key={key}
														className="flex items-center justify-between gap-2"
													>
														<div className="flex items-center gap-1.5 text-muted-foreground">
															<Icon className="h-3.5 w-3.5" />
															<span className="text-xs">{t(labelKey)}</span>
														</div>
														<span className="font-medium">{value ?? "—"}</span>
													</div>
												);
											},
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Pricing Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Receipt className="h-5 w-5" />
						{t("settings.billing.pricing.pricingTitle")}
					</CardTitle>
					<CardDescription>
						{t("settings.billing.pricing.pricingDesc")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Desktop Table */}
					<div className="hidden md:block overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[250px]">
										{t("settings.billing.pricing.priceTypeHeader")}
									</TableHead>
									{plans.map((plan) => (
										<TableHead
											key={plan.id}
											className={cn(
												"text-center",
												currentPlan === plan.name &&
													"bg-primary/5 font-semibold",
											)}
										>
											{plan.displayName}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{allPriceTypes.map((priceType) => {
									const config = priceTypeConfig[priceType];
									const Icon = config?.icon ?? Receipt;

									return (
										<TableRow key={priceType}>
											<TableCell className="font-medium">
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<div className="flex items-center gap-2 cursor-help">
																<Icon className="h-4 w-4 text-muted-foreground" />
																<span>
																	{config ? t(config.labelKey) : priceType}
																</span>
																<Info className="h-3.5 w-3.5 text-muted-foreground" />
															</div>
														</TooltipTrigger>
														<TooltipContent>
															<p>
																{config
																	? t(config.descriptionKey)
																	: t("settings.billing.pricing.pricePerUnit")}
															</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</TableCell>
											{plans.map((plan) => {
												const price = getPriceByType(plan, priceType);
												return (
													<TableCell
														key={plan.id}
														className={cn(
															"text-center",
															currentPlan === plan.name && "bg-primary/5",
														)}
													>
														{price ? (
															<div className="flex flex-col">
																<span className="font-medium">
																	{formatPriceMXN(price.amount)}
																</span>
																{price.interval && (
																	<span className="text-xs text-muted-foreground">
																		/
																		{t(
																			`settings.billing.interval.${price.interval}`,
																		)}
																	</span>
																)}
															</div>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</TableCell>
												);
											})}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>

					{/* Mobile Cards */}
					<div className="md:hidden space-y-4">
						{plans.map((plan) => (
							<Card
								key={plan.id}
								className={cn(currentPlan === plan.name && "border-primary")}
							>
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<CardTitle className="text-lg">
											{plan.displayName}
										</CardTitle>
										{currentPlan === plan.name && (
											<Badge variant="secondary">
												{t("settings.billing.currentPlanBadge")}
											</Badge>
										)}
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{allPriceTypes.map((priceType) => {
											const price = getPriceByType(plan, priceType);
											const config = priceTypeConfig[priceType];
											const Icon = config?.icon ?? Receipt;

											if (!price) return null;

											return (
												<div
													key={priceType}
													className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0"
												>
													<div className="flex items-center gap-2 text-muted-foreground">
														<Icon className="h-4 w-4" />
														<span className="text-sm">
															{config ? t(config.labelKey) : priceType}
														</span>
													</div>
													<div className="text-right">
														<span className="font-medium">
															{formatPriceMXN(price.amount)}
														</span>
														{price.interval && (
															<span className="text-xs text-muted-foreground ml-1">
																/
																{t(
																	`settings.billing.interval.${price.interval}`,
																)}
															</span>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Pricing Notes */}
			<Card className="bg-muted/30">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
						<div className="space-y-2 text-sm text-muted-foreground">
							<p>
								<strong>
									{t("settings.billing.pricing.howBillingWorks")}:
								</strong>{" "}
								{t("settings.billing.pricing.howBillingWorksDesc")}
							</p>
							<p>
								<strong>{t("settings.billing.pricing.trialPeriod")}:</strong>{" "}
								{t("settings.billing.pricing.trialPeriodDesc")}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
