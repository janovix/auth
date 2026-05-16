"use client";

import { useMemo, type ReactNode } from "react";
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
import { SettingsPageHeader } from "@/components/settings";
import { useLanguage } from "@/contexts/language-context";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { useSettingsSidebarProductAccess } from "@/contexts/settings-sidebar-product-context";
import { getAmlAppUrl, getWatchlistAppUrl } from "@/lib/auth/authCoreConfig";
import { cn } from "@/lib/utils";

const productCardLinkClassName =
	"block no-underline text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl";

const productCardLinkHoverClassName =
	"cursor-pointer transition-shadow hover:shadow-md";

type ProductCTAProps = {
	access: boolean;
	productAppUrl: string;
	testId: "product-card-aml" | "product-card-watchlist";
	productName: string;
	renderCard: (linkHoverClass: string) => ReactNode;
};

function ProductCTA({
	access,
	productAppUrl,
	testId,
	productName,
	renderCard,
}: ProductCTAProps) {
	const { t } = useLanguage();

	const cta = access ? t("products.openProduct") : t("products.upgradeCta");
	const ariaLabel = `${cta} — ${productName}`;

	if (access) {
		return (
			<a
				href={productAppUrl}
				data-testid={testId}
				aria-label={ariaLabel}
				className={productCardLinkClassName}
			>
				{renderCard(productCardLinkHoverClassName)}
			</a>
		);
	}

	return (
		<Link
			href="/settings/billing"
			data-testid={testId}
			aria-label={ariaLabel}
			className={productCardLinkClassName}
		>
			{renderCard(productCardLinkHoverClassName)}
		</Link>
	);
}

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
				<ProductCTA
					access={access.aml}
					productAppUrl={amlUrl}
					testId="product-card-aml"
					productName={t("products.aml.name")}
					renderCard={(linkHoverClass) => (
						<Card
							className={cn(
								"h-full",
								access.aml
									? "border-border"
									: "border-muted bg-muted/30 opacity-90",
								linkHoverClass,
							)}
						>
							<CardHeader>
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<LayoutDashboard className="h-5 w-5 text-primary" />
								</div>
								<CardTitle>{t("products.aml.name")}</CardTitle>
								<CardDescription>
									{t("products.aml.description")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{!access.aml ? (
									<p className="text-sm text-muted-foreground">
										{t("products.notIncluded")}
									</p>
								) : null}
							</CardContent>
							<CardFooter className="mt-auto flex sm:justify-end">
								<span
									className="inline-flex items-center gap-2 text-sm font-medium text-primary"
									aria-hidden
								>
									{access.aml
										? t("products.openProduct")
										: t("products.upgradeCta")}
									<ArrowRight className="h-4 w-4" />
								</span>
							</CardFooter>
						</Card>
					)}
				/>

				<ProductCTA
					access={access.watchlist}
					productAppUrl={watchlistUrl}
					testId="product-card-watchlist"
					productName={t("products.watchlist.name")}
					renderCard={(linkHoverClass) => (
						<Card
							className={cn(
								"h-full",
								access.watchlist
									? "border-border"
									: "border-muted bg-muted/30 opacity-90",
								linkHoverClass,
							)}
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
							<CardFooter className="mt-auto flex sm:justify-end">
								<span
									className="inline-flex items-center gap-2 text-sm font-medium text-primary"
									aria-hidden
								>
									{access.watchlist
										? t("products.openProduct")
										: t("products.upgradeCta")}
									<ArrowRight className="h-4 w-4" />
								</span>
							</CardFooter>
						</Card>
					)}
				/>
			</div>
		</div>
	);
}
