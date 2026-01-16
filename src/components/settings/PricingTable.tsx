"use client";

import { useEffect, useState } from "react";
import {
	Check,
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

// Price type labels and descriptions
const priceTypeInfo: Record<
	string,
	{ label: string; description: string; icon: typeof FileText }
> = {
	subscription: {
		label: "Monthly Subscription",
		description: "Base monthly fee",
		icon: Receipt,
	},
	seat: {
		label: "Extra Seat",
		description: "Per additional user beyond plan limit",
		icon: UserPlus,
	},
	extra_org: {
		label: "Extra Organization",
		description: "Per additional organization beyond plan limit",
		icon: Building2,
	},
	overage_report: {
		label: "Extra Report",
		description: "Per report beyond monthly limit",
		icon: FileText,
	},
	overage_notice: {
		label: "Extra Notice",
		description: "Per notice beyond monthly limit",
		icon: Bell,
	},
	overage_alert: {
		label: "Extra Alert",
		description: "Per alert beyond monthly limit",
		icon: AlertTriangle,
	},
	overage_transaction: {
		label: "Extra Transaction",
		description: "Per transaction beyond monthly limit",
		icon: Receipt,
	},
	overage_client: {
		label: "Extra Client",
		description: "Per client beyond monthly limit",
		icon: Users,
	},
};

// Limit labels
const limitLabels: Record<string, { label: string; icon: typeof Users }> = {
	maxOrganizations: { label: "Organizations", icon: Building2 },
	usersPerOrg: { label: "Users per org", icon: Users },
	reportsPerMonth: { label: "Reports/month", icon: FileText },
	noticesPerMonth: { label: "Notices/month", icon: Bell },
	alertsPerMonth: { label: "Alerts/month", icon: AlertTriangle },
	transactionsPerMonth: { label: "Transactions/month", icon: Receipt },
	clientsPerMonth: { label: "Clients/month", icon: Users },
	watchlistQueriesPerDay: { label: "Watchlist queries/day/user", icon: Users },
};

interface PricingTableProps {
	currentPlan?: string | null;
}

export function PricingTable({ currentPlan }: PricingTableProps) {
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
				console.error("Failed to load plans:", err);
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
				<p>{error}</p>
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
						Plan Limits
					</CardTitle>
					<CardDescription>
						Monthly included limits for each subscription plan
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Desktop Table */}
					<div className="hidden md:block overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[200px]">Limit</TableHead>
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
														Current
													</Badge>
												)}
											</div>
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{Object.entries(limitLabels).map(
									([key, { label, icon: Icon }]) => (
										<TableRow key={key}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													<Icon className="h-4 w-4 text-muted-foreground" />
													{label}
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
											<Badge variant="secondary">Current</Badge>
										)}
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-3 text-sm">
										{Object.entries(limitLabels).map(
											([key, { label, icon: Icon }]) => {
												const value =
													plan.limits?.[key as keyof typeof plan.limits];
												return (
													<div
														key={key}
														className="flex items-center justify-between gap-2"
													>
														<div className="flex items-center gap-1.5 text-muted-foreground">
															<Icon className="h-3.5 w-3.5" />
															<span className="text-xs">{label}</span>
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
						Pricing & Extra Fees
					</CardTitle>
					<CardDescription>
						Monthly subscription prices and overage fees (prices in MXN)
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Desktop Table */}
					<div className="hidden md:block overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[250px]">Price Type</TableHead>
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
									const info = priceTypeInfo[priceType];
									const Icon = info?.icon ?? Receipt;

									return (
										<TableRow key={priceType}>
											<TableCell className="font-medium">
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<div className="flex items-center gap-2 cursor-help">
																<Icon className="h-4 w-4 text-muted-foreground" />
																<span>{info?.label ?? priceType}</span>
																<Info className="h-3.5 w-3.5 text-muted-foreground" />
															</div>
														</TooltipTrigger>
														<TooltipContent>
															<p>{info?.description ?? "Price per unit"}</p>
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
																		/{price.interval}
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
											<Badge variant="secondary">Current</Badge>
										)}
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{allPriceTypes.map((priceType) => {
											const price = getPriceByType(plan, priceType);
											const info = priceTypeInfo[priceType];
											const Icon = info?.icon ?? Receipt;

											if (!price) return null;

											return (
												<div
													key={priceType}
													className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0"
												>
													<div className="flex items-center gap-2 text-muted-foreground">
														<Icon className="h-4 w-4" />
														<span className="text-sm">
															{info?.label ?? priceType}
														</span>
													</div>
													<div className="text-right">
														<span className="font-medium">
															{formatPriceMXN(price.amount)}
														</span>
														{price.interval && (
															<span className="text-xs text-muted-foreground ml-1">
																/{price.interval}
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
								<strong>How billing works:</strong> You pay the monthly
								subscription fee upfront, then any overages (extra users,
								reports, notices, etc.) are calculated at the end of each
								billing cycle and charged automatically.
							</p>
							<p>
								<strong>Trial period:</strong> All plans include a 14-day free
								trial. You won&apos;t be charged until the trial ends.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
