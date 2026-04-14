"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { formatPriceMXN } from "@/lib/billing";

interface WatchlistCardProps {
	displayPrice: number;
	interval: string;
	onSelect: () => void;
	isLoading: boolean;
	canSubscribe: boolean;
	isCurrent?: boolean;
}

export function WatchlistCard({
	displayPrice,
	interval,
	onSelect,
	isLoading,
	canSubscribe,
	isCurrent = false,
}: WatchlistCardProps) {
	const { t } = useLanguage();

	return (
		<Card className="border-border bg-card">
			<CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
						<Search className="h-5 w-5 text-foreground" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="text-base font-semibold text-foreground">
								{t("onboarding.plans.watchlist.title")}
							</h3>
							{isCurrent && (
								<Badge variant="secondary" className="text-xs">
									{t("settings.billing.currentPlanBadge")}
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground">
							{t("onboarding.plans.watchlist.description")}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="text-right">
						<div className="text-xl font-bold">
							{formatPriceMXN(displayPrice)}
						</div>
						<span className="text-xs text-muted-foreground">
							/{t(`settings.billing.interval.${interval}`)}
						</span>
					</div>
					<Button
						variant={isCurrent ? "secondary" : "outline"}
						onClick={onSelect}
						loading={isLoading}
						disabled={isCurrent || !canSubscribe}
					>
						{!isLoading &&
							(isCurrent
								? t("settings.billing.currentPlanBadge")
								: canSubscribe
									? t("onboarding.plans.watchlist.cta")
									: t("onboarding.plans.watchlist.contact"))}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
