"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
	LayoutGrid,
	LayoutDashboard,
	Search,
	ArrowRight,
	Loader2,
	RefreshCw,
} from "lucide-react";
import { ProductsViewSkeleton } from "@/components/ProductsViewSkeleton";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { SettingsPageHeader } from "@/components/settings";
import { useLanguage } from "@/contexts/language-context";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import {
	getSubscriptionStatus,
	getFeatures,
	hasAmlProductAccess,
	hasWatchlistProductAccess,
	type Feature,
	type UserSubscriptionStatus,
} from "@/lib/billing";
import { getAmlAppUrl, getWatchlistAppUrl } from "@/lib/auth/authCoreConfig";

type ProductAccess = {
	aml: boolean;
	watchlist: boolean;
};

function computeProductAccess(
	subscription: UserSubscriptionStatus | null,
	features: Feature[],
): ProductAccess {
	return {
		aml: hasAmlProductAccess(subscription, features),
		watchlist: hasWatchlistProductAccess(subscription, features),
	};
}

export function ProductsView() {
	const { t } = useLanguage();
	const { isPending: sessionPending } = useAuthSession();
	const [subscription, setSubscription] =
		useState<UserSubscriptionStatus | null>(null);
	const [features, setFeatures] = useState<Feature[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			setLoading(true);
			setError(null);
			try {
				const [sub, feats] = await Promise.all([
					getSubscriptionStatus(),
					getFeatures().catch(() => [] as Feature[]),
				]);
				if (!cancelled) {
					setSubscription(sub);
					setFeatures(feats);
				}
			} catch (e) {
				if (!cancelled) {
					setError(e instanceof Error ? e.message : "Failed to load");
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [retryKey]);

	const handleRetry = useCallback(() => {
		setRetryKey((k) => k + 1);
	}, []);

	const access = useMemo(
		() => computeProductAccess(subscription, features),
		[subscription, features],
	);

	if (sessionPending) {
		return <ProductsViewSkeleton />;
	}

	if (error) {
		return (
			<div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
				<p>{error}</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="border-destructive/40"
					disabled={loading}
					onClick={handleRetry}
				>
					{loading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<RefreshCw className="mr-2 h-4 w-4" />
					)}
					{t("products.retry")}
				</Button>
			</div>
		);
	}

	if (loading) {
		return <ProductsViewSkeleton />;
	}

	const amlUrl = getAmlAppUrl();
	const watchlistUrl = getWatchlistAppUrl();

	return (
		<div className="space-y-8">
			<SettingsPageHeader
				icon={LayoutGrid}
				title={t("products.title")}
				description={t("products.description")}
			/>
			<div className="grid gap-6 sm:grid-cols-2">
				<Card
					className={
						access.aml
							? "h-full border-border"
							: "h-full border-muted bg-muted/30 opacity-90"
					}
				>
					<CardHeader>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<LayoutDashboard className="h-5 w-5 text-primary" />
						</div>
						<CardTitle>{t("products.aml.name")}</CardTitle>
						<CardDescription>{t("products.aml.description")}</CardDescription>
					</CardHeader>
					<CardContent>
						{!access.aml ? (
							<p className="text-sm text-muted-foreground">
								{t("products.notIncluded")}
							</p>
						) : null}
					</CardContent>
					<CardFooter className="mt-auto flex flex-col gap-2 sm:flex-row sm:justify-end">
						{access.aml ? (
							<Button asChild className="w-full sm:w-auto">
								<a href={amlUrl} target="_blank" rel="noopener noreferrer">
									{t("products.openProduct")}
									<ArrowRight className="ml-2 h-4 w-4" />
								</a>
							</Button>
						) : (
							<Button asChild variant="secondary" className="w-full sm:w-auto">
								<Link href="/settings/billing">
									{t("products.upgradeCta")}
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						)}
					</CardFooter>
				</Card>

				<Card
					className={
						access.watchlist
							? "h-full border-border"
							: "h-full border-muted bg-muted/30 opacity-90"
					}
				>
					<CardHeader>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<Search className="h-5 w-5 text-primary" />
						</div>
						<CardTitle>{t("products.watchlist.name")}</CardTitle>
						<CardDescription>
							{t("products.watchlist.description")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{!access.watchlist ? (
							<p className="text-sm text-muted-foreground">
								{t("products.notIncluded")}
							</p>
						) : null}
					</CardContent>
					<CardFooter className="mt-auto flex flex-col gap-2 sm:flex-row sm:justify-end">
						{access.watchlist ? (
							<Button asChild className="w-full sm:w-auto">
								<a
									href={watchlistUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{t("products.openProduct")}
									<ArrowRight className="ml-2 h-4 w-4" />
								</a>
							</Button>
						) : (
							<Button asChild variant="secondary" className="w-full sm:w-auto">
								<Link href="/settings/billing">
									{t("products.upgradeCta")}
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						)}
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
