"use client";

import { useMemo } from "react";
import Link from "next/link";
import { LayoutGrid, LayoutDashboard, Search, ArrowRight } from "lucide-react";
import { ProductsViewSkeleton } from "@/components/ProductsViewSkeleton";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsPageHeader } from "@/components/settings";
import { useLanguage } from "@/contexts/language-context";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { useSettingsSidebarProductAccess } from "@/contexts/settings-sidebar-product-context";
import { getAmlAppUrl, getWatchlistAppUrl } from "@/lib/auth/authCoreConfig";

export function ProductsView() {
	const { t } = useLanguage();
	const { isPending: sessionPending } = useAuthSession();
	const {
		hasAmlAccess,
		hasWatchlistAccess,
		activeOrganizationName,
		hasResolvedEntitlements,
	} = useSettingsSidebarProductAccess();

	const access = useMemo(
		() => ({
			aml: hasAmlAccess,
			watchlist: hasWatchlistAccess,
		}),
		[hasAmlAccess, hasWatchlistAccess],
	);

	if (sessionPending) {
		return <ProductsViewSkeleton />;
	}

	if (!hasResolvedEntitlements) {
		return <ProductsViewSkeleton />;
	}

	const amlUrl = getAmlAppUrl();
	const watchlistUrl = getWatchlistAppUrl();

	const entitlementNote =
		activeOrganizationName != null && activeOrganizationName.length > 0
			? t("products.entitlementNote").replace(
					"{organizationName}",
					activeOrganizationName,
				)
			: null;

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<SettingsPageHeader
					icon={LayoutGrid}
					title={t("products.title")}
					description={t("products.description")}
				/>
				{entitlementNote ? (
					<p className="text-sm text-muted-foreground max-w-3xl">
						{entitlementNote}
					</p>
				) : null}
			</div>
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
								<a href={amlUrl}>
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
								<a href={watchlistUrl}>
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
