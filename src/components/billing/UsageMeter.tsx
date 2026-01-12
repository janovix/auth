"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/language-context";
import type { UsageCheckResult } from "@/lib/billing";
import { formatDate } from "@/lib/billing";
import { AlertTriangle } from "lucide-react";

interface UsageMeterProps {
	usage: {
		notices: UsageCheckResult;
		users: UsageCheckResult;
		alerts?: UsageCheckResult;
		transactions?: UsageCheckResult;
	} | null;
	periodEnd: string | null;
}

function UsageBar({
	label,
	usage,
}: {
	label: string;
	usage: UsageCheckResult;
}) {
	const { t } = useLanguage();

	// Handle unlimited (-1)
	if (usage.included === -1) {
		return (
			<div className="space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span className="font-medium">{label}</span>
					<span className="text-muted-foreground">
						{usage.used} / {t("settings.billing.unlimited")}
					</span>
				</div>
				<Progress value={0} className="h-2" />
			</div>
		);
	}

	const percentage =
		usage.included > 0 ? (usage.used / usage.included) * 100 : 0;
	const isOverLimit = usage.overage > 0;

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-sm">
				<span className="font-medium flex items-center gap-1">
					{label}
					{isOverLimit && (
						<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
					)}
				</span>
				<span className="text-muted-foreground">
					{usage.used} / {usage.included}{" "}
					{isOverLimit && (
						<span className="text-amber-500">
							(+{usage.overage} {t("settings.billing.overage")})
						</span>
					)}
				</span>
			</div>
			<Progress
				value={Math.min(percentage, 100)}
				className={`h-2 ${isOverLimit ? "[&>div]:bg-amber-500" : ""}`}
			/>
		</div>
	);
}

export function UsageMeter({ usage, periodEnd }: UsageMeterProps) {
	const { t } = useLanguage();

	if (!usage) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("settings.billing.usage")}</CardTitle>
				{periodEnd && (
					<CardDescription>
						{t("settings.billing.resetDate").replace(
							"{date}",
							formatDate(periodEnd),
						)}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent className="space-y-4">
				<UsageBar label={t("settings.billing.notices")} usage={usage.notices} />
				<UsageBar label={t("settings.billing.users")} usage={usage.users} />
				{usage.alerts && (
					<UsageBar label={t("settings.billing.alerts")} usage={usage.alerts} />
				)}
				{usage.transactions && (
					<UsageBar
						label={t("settings.billing.transactions")}
						usage={usage.transactions}
					/>
				)}
			</CardContent>
		</Card>
	);
}
