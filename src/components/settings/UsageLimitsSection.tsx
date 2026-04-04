"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
	getUsageDetails,
	getOverageSettings,
	updateOverageSettings,
	formatCurrency,
	type UsageDetailsApi,
	type OverageSettingsData,
} from "@/lib/billing";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/language-context";

function pct(used: number, limit: number): number {
	if (limit <= 0) return 0;
	return Math.min(100, Math.round((used / limit) * 100));
}

function meteredExcessCents(
	usage: UsageDetailsApi["usage"],
	limits: NonNullable<UsageDetailsApi["limits"]>,
	pricing: NonNullable<UsageDetailsApi["overagePricing"]>,
): number {
	const keys = [
		"reports",
		"notices",
		"alerts",
		"operations",
		"clients",
	] as const;
	let sum = 0;
	for (const k of keys) {
		const limit = limits[k];
		const used = usage[k];
		const row = pricing[k];
		if (limit > 0 && row && used > limit) {
			sum += (used - limit) * row.unitCents;
		}
	}
	return sum;
}

function seatExcessCents(
	usage: UsageDetailsApi["usage"],
	limits: NonNullable<UsageDetailsApi["limits"]>,
	pricing: NonNullable<UsageDetailsApi["overagePricing"]>,
): number {
	if (limits.users <= 0 || !pricing.seat || usage.users <= limits.users)
		return 0;
	return (usage.users - limits.users) * pricing.seat.unitCents;
}

/** AML period metrics not shown for the watchlist-only Stripe plan. */
const WATCHLIST_HIDDEN_METRIC_KEYS = [
	"reports",
	"notices",
	"alerts",
	"operations",
	"clients",
] as const;

const FULL_METRIC_ROW_COUNT = 7;
const WATCHLIST_METRIC_ROW_COUNT = 2;

export type UsageLimitsSectionProps = {
	/** Current Stripe plan name; when `watchlist`, AML period rows are hidden. */
	subscriptionPlan?: string | null;
	/** Enterprise license: show limits but hide Stripe metered overage controls. */
	isLicenseBased?: boolean;
};

export function UsageLimitsSection({
	subscriptionPlan,
	isLicenseBased = false,
}: UsageLimitsSectionProps = {}) {
	const { t } = useLanguage();
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [details, setDetails] = useState<UsageDetailsApi | null>(null);
	const [overage, setOverage] = useState<OverageSettingsData | null>(null);
	const [enabled, setEnabled] = useState(false);
	const [spendLimitPesos, setSpendLimitPesos] = useState<string>("");

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const [d, o] = await Promise.all([
				getUsageDetails(),
				isLicenseBased
					? Promise.resolve(null)
					: getOverageSettings().catch(() => null),
			]);
			setDetails(d);
			if (o) {
				setOverage(o);
				setEnabled(o.overageEnabled);
				setSpendLimitPesos(
					o.spendLimitCents != null ? String(o.spendLimitCents / 100) : "",
				);
			} else if (isLicenseBased) {
				setOverage(null);
				setEnabled(false);
				setSpendLimitPesos("");
			}
		} catch (e) {
			toast({
				title: t("settings.billing.usageLimits.loadError"),
				description: e instanceof Error ? e.message : undefined,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [toast, isLicenseBased, t]);

	useEffect(() => {
		void load();
	}, [load]);

	const saveOverage = async () => {
		setSaving(true);
		try {
			const pesos = spendLimitPesos.trim();
			const spendLimitCents =
				pesos === "" ? null : Math.round(parseFloat(pesos) * 100);
			if (pesos !== "" && Number.isNaN(spendLimitCents!)) {
				throw new Error(t("settings.billing.usageLimits.invalidSpendLimit"));
			}
			const row = await updateOverageSettings({
				overageEnabled: enabled,
				spendLimitCents,
				spendLimitCurrency: "MXN",
			});
			setOverage(row);
			toast({ title: t("settings.billing.usageLimits.saveSuccess") });
			await load();
		} catch (e) {
			toast({
				title: t("settings.billing.usageLimits.saveFailed"),
				description: e instanceof Error ? e.message : undefined,
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<UsageLimitsSkeleton
				metricRowCount={
					subscriptionPlan === "watchlist"
						? WATCHLIST_METRIC_ROW_COUNT
						: FULL_METRIC_ROW_COUNT
				}
				showStripeOverageSkeleton={!isLicenseBased}
			/>
		);
	}

	if (!details?.limits) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t("settings.billing.usageLimits.title")}</CardTitle>
					<CardDescription>
						{t("settings.billing.usageLimits.noOrgDesc")}
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const { usage, limits, period, overage: ov } = details;

	const metrics: Array<{
		key: keyof typeof usage;
		label: string;
		limit: number;
	}> = [
		{
			key: "reports",
			label: t("settings.billing.usageLimits.metric.reports"),
			limit: limits.reports,
		},
		{
			key: "notices",
			label: t("settings.billing.usageLimits.metric.notices"),
			limit: limits.notices,
		},
		{
			key: "alerts",
			label: t("settings.billing.usageLimits.metric.alerts"),
			limit: limits.alerts,
		},
		{
			key: "operations",
			label: t("settings.billing.usageLimits.metric.operations"),
			limit: limits.operations,
		},
		{
			key: "clients",
			label: t("settings.billing.usageLimits.metric.clients"),
			limit: limits.clients,
		},
		{
			key: "users",
			label: t("settings.billing.usageLimits.metric.members"),
			limit: limits.users,
		},
		{
			key: "watchlistQueries",
			label: t("settings.billing.usageLimits.metric.watchlistQueries"),
			limit: limits.watchlistQueriesPerMonth,
		},
	];

	const displayMetrics =
		subscriptionPlan === "watchlist"
			? metrics.filter(
					(m) =>
						!(WATCHLIST_HIDDEN_METRIC_KEYS as readonly string[]).includes(
							m.key,
						),
				)
			: metrics;

	const periodStart = new Date(period.start).toLocaleDateString();
	const periodEnd = new Date(period.end).toLocaleDateString();

	const op = details.overagePricing;
	const meteredEst = op && limits ? meteredExcessCents(usage, limits, op) : 0;
	const seatEst = op && limits ? seatExcessCents(usage, limits, op) : 0;
	const hasExcessForSummary = meteredEst > 0 || seatEst > 0;
	const showEstimationSummary =
		!isLicenseBased && ov.enabled && hasExcessForSummary && Boolean(op);
	const spendCapRemainingCents =
		ov.spendLimitCents != null
			? Math.max(0, ov.spendLimitCents - ov.periodChargeCents)
			: null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("settings.billing.usageLimits.title")}</CardTitle>
				<CardDescription>
					{t("settings.billing.usageLimits.currentPeriod")
						.replace("{start}", periodStart)
						.replace("{end}", periodEnd)}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					{displayMetrics.map(({ key, label, limit }) => {
						const used = usage[key];
						const p = pct(used, limit);
						const unlimited = limit <= 0;
						let excessHint: string | null = null;
						if (!isLicenseBased && op && !unlimited && used > limit) {
							if (key === "users" && op.seat) {
								const excess = used - limit;
								const totalCents = excess * op.seat.unitCents;
								excessHint = t("settings.billing.usageLimits.excessSeatHint")
									.replace("{excess}", String(excess))
									.replace(
										"{unitPrice}",
										formatCurrency(op.seat.unitCents, op.seat.currency),
									)
									.replace(
										"{total}",
										formatCurrency(totalCents, op.seat.currency),
									);
							} else if (
								key === "reports" ||
								key === "notices" ||
								key === "alerts" ||
								key === "operations" ||
								key === "clients"
							) {
								const row = op[key];
								if (row) {
									const excess = used - limit;
									const totalCents = excess * row.unitCents;
									excessHint = t("settings.billing.usageLimits.excessHint")
										.replace("{excess}", String(excess))
										.replace(
											"{unitPrice}",
											formatCurrency(row.unitCents, row.currency),
										)
										.replace(
											"{total}",
											formatCurrency(totalCents, row.currency),
										);
								}
							}
						}
						return (
							<div key={key} className="space-y-1">
								<div className="flex justify-between text-sm">
									<span>{label}</span>
									<span className="text-muted-foreground">
										{used} {unlimited ? "" : `/ ${limit}`}
										{unlimited
											? ` ${t("settings.billing.usageLimits.unlimited")}`
											: ` (${p}%)`}
									</span>
								</div>
								{!unlimited ? <Progress value={p} className="h-2" /> : null}
								{excessHint ? (
									<p className="text-xs text-muted-foreground">{excessHint}</p>
								) : null}
							</div>
						);
					})}
				</div>

				{showEstimationSummary ? (
					<div className="rounded-md border bg-muted/40 p-3 text-sm space-y-2">
						<p className="font-medium">
							{t("settings.billing.usageLimits.estimatedOverageSummary")}
						</p>
						{meteredEst > 0 ? (
							<p className="text-muted-foreground">
								{t("settings.billing.usageLimits.estimatedMeteredLine").replace(
									"{amount}",
									formatCurrency(meteredEst, ov.currency),
								)}
							</p>
						) : null}
						{seatEst > 0 && op?.seat ? (
							<p className="text-muted-foreground">
								{t("settings.billing.usageLimits.extraSeatCharges").replace(
									"{amount}",
									formatCurrency(seatEst, op.seat.currency),
								)}
							</p>
						) : null}
						<p className="text-muted-foreground">
							{t("settings.billing.usageLimits.actualOverageSoFar").replace(
								"{amount}",
								formatCurrency(ov.periodChargeCents, ov.currency),
							)}
						</p>
						{spendCapRemainingCents != null && ov.spendLimitCents != null ? (
							<p className="text-muted-foreground">
								{t("settings.billing.usageLimits.spendCapRemaining")
									.replace(
										"{cap}",
										formatCurrency(ov.spendLimitCents, ov.currency),
									)
									.replace(
										"{remaining}",
										formatCurrency(spendCapRemainingCents, ov.currency),
									)}
							</p>
						) : null}
					</div>
				) : null}

				{isLicenseBased ? (
					<div className="border-t pt-4">
						<p className="text-sm text-muted-foreground">
							{t("settings.billing.usageLicenseOverageHint")}
						</p>
					</div>
				) : (
					<div className="border-t pt-4 space-y-4">
						<h3 className="text-sm font-medium">
							{t("settings.billing.usageLimits.meteredOverageTitle")}
						</h3>
						<p className="text-sm text-muted-foreground">
							{t("settings.billing.usageLimits.meteredOverageDesc")}
						</p>
						<div className="flex items-center justify-between gap-4">
							<Label htmlFor="overage-enabled">
								{t("settings.billing.usageLimits.enableMeteredOverage")}
							</Label>
							<Switch
								id="overage-enabled"
								checked={enabled}
								onCheckedChange={setEnabled}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="spend-cap">
								{t("settings.billing.usageLimits.monthlySpendLimit")}
							</Label>
							<Input
								id="spend-cap"
								type="number"
								min={0}
								step="1"
								placeholder={t("settings.billing.usageLimits.noCapPlaceholder")}
								value={spendLimitPesos}
								onChange={(e) => setSpendLimitPesos(e.target.value)}
							/>
							<p className="text-xs text-muted-foreground">
								{t("settings.billing.usageLimits.overageHelper").replace(
									"{amount}",
									formatCurrency(
										overage?.periodOverageChargeCents ??
											ov?.periodChargeCents ??
											0,
										ov?.currency ?? "MXN",
									),
								)}
							</p>
						</div>
						<Button onClick={() => void saveOverage()} disabled={saving}>
							{saving ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{t("settings.billing.usageLimits.saving")}
								</>
							) : (
								t("settings.billing.usageLimits.saveButton")
							)}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Skeleton matching UsageLimitsSection loaded state: header + metric rows + overage block.
 */
function UsageLimitsSkeleton({
	metricRowCount = FULL_METRIC_ROW_COUNT,
	showStripeOverageSkeleton = true,
}: {
	metricRowCount?: number;
	showStripeOverageSkeleton?: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-40 mb-2" />
				<Skeleton className="h-4 w-full max-w-md" />
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					{Array.from({ length: metricRowCount }, (_, i) => i + 1).map((i) => (
						<div key={i} className="space-y-1">
							<div className="flex justify-between">
								<Skeleton className="h-4 w-36" />
								<Skeleton className="h-4 w-24" />
							</div>
							<Skeleton className="h-2 w-full rounded-full" />
						</div>
					))}
				</div>
				{showStripeOverageSkeleton ? (
					<div className="border-t pt-4 space-y-4">
						<Skeleton className="h-5 w-48" />
						<Skeleton className="h-4 w-full max-w-xl" />
						<div className="flex items-center justify-between gap-4">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-5 w-9 rounded-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-44" />
							<Skeleton className="h-10 w-full max-w-xs rounded-md" />
							<Skeleton className="h-3 w-full max-w-lg" />
						</div>
						<Skeleton className="h-10 w-56 rounded-md" />
					</div>
				) : (
					<div className="border-t pt-4">
						<Skeleton className="h-4 w-full max-w-xl" />
						<Skeleton className="h-4 w-full max-w-lg mt-2" />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
