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

function pct(used: number, limit: number): number {
	if (limit <= 0) return 0;
	return Math.min(100, Math.round((used / limit) * 100));
}

export function UsageLimitsSection() {
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
				getOverageSettings().catch(() => null),
			]);
			setDetails(d);
			if (o) {
				setOverage(o);
				setEnabled(o.overageEnabled);
				setSpendLimitPesos(
					o.spendLimitCents != null ? String(o.spendLimitCents / 100) : "",
				);
			}
		} catch (e) {
			toast({
				title: "Could not load usage",
				description: e instanceof Error ? e.message : undefined,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [toast]);

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
				throw new Error("Invalid spend limit");
			}
			const row = await updateOverageSettings({
				overageEnabled: enabled,
				spendLimitCents,
				spendLimitCurrency: "MXN",
			});
			setOverage(row);
			toast({ title: "Usage billing settings saved" });
			await load();
		} catch (e) {
			toast({
				title: "Save failed",
				description: e instanceof Error ? e.message : undefined,
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <UsageLimitsSkeleton />;
	}

	if (!details?.limits) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Usage & limits</CardTitle>
					<CardDescription>
						Select an organization and ensure you have an active subscription to
						see usage.
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
		{ key: "reports", label: "Reports (period)", limit: limits.reports },
		{ key: "notices", label: "Notices (period)", limit: limits.notices },
		{ key: "alerts", label: "Alerts (period)", limit: limits.alerts },
		{
			key: "operations",
			label: "Operations (period)",
			limit: limits.operations,
		},
		{ key: "clients", label: "Clients (period)", limit: limits.clients },
		{ key: "users", label: "Members (this org)", limit: limits.users },
		{
			key: "watchlistQueries",
			label: "Watchlist queries (period)",
			limit: limits.watchlistQueriesPerMonth,
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Usage & limits</CardTitle>
				<CardDescription>
					Current billing period {new Date(period.start).toLocaleDateString()} —{" "}
					{new Date(period.end).toLocaleDateString()}.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					{metrics.map(({ key, label, limit }) => {
						const used = usage[key];
						const p = pct(used, limit);
						const unlimited = limit <= 0;
						return (
							<div key={key} className="space-y-1">
								<div className="flex justify-between text-sm">
									<span>{label}</span>
									<span className="text-muted-foreground">
										{used} {unlimited ? "" : `/ ${limit}`}
										{unlimited ? " (unlimited)" : ` (${p}%)`}
									</span>
								</div>
								{!unlimited ? <Progress value={p} className="h-2" /> : null}
							</div>
						);
					})}
				</div>

				<div className="border-t pt-4 space-y-4">
					<h3 className="text-sm font-medium">Metered overage (Stripe)</h3>
					<p className="text-sm text-muted-foreground">
						When enabled, actions beyond included quotas can continue and are
						billed as usage. You can set an optional monthly spend cap.
					</p>
					<div className="flex items-center justify-between gap-4">
						<Label htmlFor="overage-enabled">Enable metered overage</Label>
						<Switch
							id="overage-enabled"
							checked={enabled}
							onCheckedChange={setEnabled}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="spend-cap">Monthly spend limit (MXN)</Label>
						<Input
							id="spend-cap"
							type="number"
							min={0}
							step="1"
							placeholder="No cap"
							value={spendLimitPesos}
							onChange={(e) => setSpendLimitPesos(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Leave empty for no cap. Overage charges in this period so far:{" "}
							{formatCurrency(
								overage?.periodOverageChargeCents ?? ov?.periodChargeCents ?? 0,
								ov?.currency ?? "MXN",
							)}
						</p>
					</div>
					<Button onClick={() => void saveOverage()} disabled={saving}>
						{saving ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Saving…
							</>
						) : (
							"Save usage billing settings"
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Skeleton matching UsageLimitsSection loaded state: header + metric rows + overage block.
 */
function UsageLimitsSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-40 mb-2" />
				<Skeleton className="h-4 w-full max-w-md" />
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					{[1, 2, 3, 4, 5, 6, 7].map((i) => (
						<div key={i} className="space-y-1">
							<div className="flex justify-between">
								<Skeleton className="h-4 w-36" />
								<Skeleton className="h-4 w-24" />
							</div>
							<Skeleton className="h-2 w-full rounded-full" />
						</div>
					))}
				</div>
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
			</CardContent>
		</Card>
	);
}
