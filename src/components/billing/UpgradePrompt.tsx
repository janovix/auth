"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/language-context";
import { ArrowUpRight, Zap, AlertTriangle } from "lucide-react";
import Link from "next/link";

type PromptVariant = "card" | "alert" | "banner" | "inline";
type PromptSeverity = "info" | "warning" | "urgent";

interface UpgradePromptProps {
	/** The display variant of the prompt */
	variant?: PromptVariant;
	/** Severity level affects styling */
	severity?: PromptSeverity;
	/** What limit was reached or approaching */
	limitType?: "notices" | "users" | "alerts" | "transactions" | "general";
	/** Current usage (optional, for context) */
	currentUsage?: number;
	/** Limit (optional, for context) */
	limit?: number;
	/** Custom title override */
	title?: string;
	/** Custom description override */
	description?: string;
	/** Whether to show the upgrade button */
	showButton?: boolean;
	/** Custom button text */
	buttonText?: string;
	/** Link to billing page (default: /settings/billing) */
	billingUrl?: string;
	/** Additional className */
	className?: string;
}

export function UpgradePrompt({
	variant = "card",
	severity = "info",
	limitType = "general",
	currentUsage,
	limit,
	title,
	description,
	showButton = true,
	buttonText,
	billingUrl = "/settings/billing",
	className,
}: UpgradePromptProps) {
	const { t } = useLanguage();

	// Get default title and description based on limit type
	const getDefaultTitle = () => {
		if (title) return title;
		if (severity === "urgent") {
			return t("billing.upgrade.limitReached");
		}
		if (severity === "warning") {
			return t("billing.upgrade.limitApproaching");
		}
		return t("billing.upgrade.unlockMore");
	};

	const getDefaultDescription = () => {
		if (description) return description;
		if (currentUsage !== undefined && limit !== undefined) {
			const limitName = t(`billing.upgrade.${limitType}`);
			if (severity === "urgent") {
				return t("billing.upgrade.limitReachedDesc")
					.replace("{current}", currentUsage.toString())
					.replace("{limit}", limit.toString())
					.replace("{type}", limitName);
			}
			return t("billing.upgrade.limitApproachingDesc")
				.replace("{current}", currentUsage.toString())
				.replace("{limit}", limit.toString())
				.replace("{type}", limitName);
		}
		return t("billing.upgrade.generalDesc");
	};

	const defaultButtonText = buttonText || t("billing.upgrade.button");
	const resolvedTitle = getDefaultTitle();
	const resolvedDescription = getDefaultDescription();

	// Severity-based styling
	const getSeverityStyles = () => {
		switch (severity) {
			case "urgent":
				return {
					card: "border-destructive/50 bg-destructive/5",
					alert: "border-destructive text-destructive",
					icon: "text-destructive",
				};
			case "warning":
				return {
					card: "border-amber-500/50 bg-amber-500/5",
					alert: "border-amber-500",
					icon: "text-amber-500",
				};
			default:
				return {
					card: "border-primary/30 bg-primary/5",
					alert: "border-primary/50",
					icon: "text-primary",
				};
		}
	};

	const styles = getSeverityStyles();

	// Icon based on severity
	const Icon =
		severity === "urgent" || severity === "warning" ? AlertTriangle : Zap;

	// Card variant
	if (variant === "card") {
		return (
			<Card className={`${styles.card} ${className || ""}`}>
				<CardHeader className="pb-3">
					<div className="flex items-center gap-2">
						<Icon className={`h-5 w-5 ${styles.icon}`} />
						<CardTitle className="text-lg">{resolvedTitle}</CardTitle>
					</div>
					<CardDescription>{resolvedDescription}</CardDescription>
				</CardHeader>
				{showButton && (
					<CardContent className="pt-0">
						<Button asChild>
							<Link href={billingUrl}>
								{defaultButtonText}
								<ArrowUpRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardContent>
				)}
			</Card>
		);
	}

	// Alert variant
	if (variant === "alert") {
		return (
			<Alert className={`${styles.alert} ${className || ""}`}>
				<Icon className={`h-4 w-4 ${styles.icon}`} />
				<AlertTitle>{resolvedTitle}</AlertTitle>
				<AlertDescription className="flex items-center justify-between">
					<span>{resolvedDescription}</span>
					{showButton && (
						<Button variant="outline" size="sm" asChild className="ml-4">
							<Link href={billingUrl}>
								{defaultButtonText}
								<ArrowUpRight className="ml-1 h-3 w-3" />
							</Link>
						</Button>
					)}
				</AlertDescription>
			</Alert>
		);
	}

	// Banner variant (full-width, more prominent)
	if (variant === "banner") {
		const bannerBg =
			severity === "urgent"
				? "bg-destructive/10 border-destructive/30"
				: severity === "warning"
					? "bg-amber-500/10 border-amber-500/30"
					: "bg-primary/10 border-primary/30";

		return (
			<div
				className={`w-full border-b ${bannerBg} px-4 py-3 ${className || ""}`}
			>
				<div className="flex items-center justify-between max-w-screen-xl mx-auto">
					<div className="flex items-center gap-3">
						<Icon className={`h-5 w-5 ${styles.icon}`} />
						<div>
							<p className="font-medium text-sm">{resolvedTitle}</p>
							<p className="text-sm text-muted-foreground">
								{resolvedDescription}
							</p>
						</div>
					</div>
					{showButton && (
						<Button size="sm" asChild>
							<Link href={billingUrl}>
								{defaultButtonText}
								<ArrowUpRight className="ml-1 h-3 w-3" />
							</Link>
						</Button>
					)}
				</div>
			</div>
		);
	}

	// Inline variant (minimal, for embedding in other components)
	return (
		<div className={`flex items-center gap-2 text-sm ${className || ""}`}>
			<Icon className={`h-4 w-4 ${styles.icon}`} />
			<span className="text-muted-foreground">{resolvedDescription}</span>
			{showButton && (
				<Button variant="link" size="sm" asChild className="p-0 h-auto">
					<Link href={billingUrl}>
						{defaultButtonText}
						<ArrowUpRight className="ml-1 h-3 w-3" />
					</Link>
				</Button>
			)}
		</div>
	);
}
