"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import type { Plan } from "@/lib/billing";
import { formatCurrency } from "@/lib/billing";
import { Check, Crown, Building2, Zap } from "lucide-react";

interface PlanComparisonGridProps {
	plans: Plan[];
	currentPlanId?: string | null;
	onSelectPlan: (planId: string) => void;
	loading?: boolean;
}

const FEATURE_LABELS: Record<string, { en: string; es: string }> = {
	data_capture: { en: "Data Capture", es: "Captura de Datos" },
	compliance_validation: {
		en: "Compliance Validation",
		es: "Validación de Cumplimiento",
	},
	report_generation: { en: "Report Generation", es: "Generación de Reportes" },
	acknowledgment_tracking: {
		en: "Acknowledgment Tracking",
		es: "Seguimiento de Acuses",
	},
	advanced_roles: { en: "Advanced Roles", es: "Roles Avanzados" },
	approval_flows: { en: "Approval Workflows", es: "Flujos de Aprobación" },
	report_templates: { en: "Report Templates", es: "Plantillas de Reportes" },
	priority_support: { en: "Priority Support", es: "Soporte Prioritario" },
	sso: { en: "Single Sign-On (SSO)", es: "Inicio de Sesión Único (SSO)" },
	custom_branding: { en: "Custom Branding", es: "Marca Personalizada" },
	audit_export: { en: "Audit Export", es: "Exportación de Auditoría" },
	api_access: { en: "API Access", es: "Acceso a API" },
	dedicated_support: { en: "Dedicated Support", es: "Soporte Dedicado" },
	custom_integrations: {
		en: "Custom Integrations",
		es: "Integraciones Personalizadas",
	},
};

function PlanCard({
	plan,
	isCurrent,
	onSelect,
	loading,
}: {
	plan: Plan;
	isCurrent: boolean;
	onSelect: () => void;
	loading?: boolean;
}) {
	const { t, language } = useLanguage();

	const getIcon = () => {
		switch (plan.tier) {
			case "pro":
				return <Crown className="h-6 w-6 text-purple-500" />;
			case "enterprise":
				return <Building2 className="h-6 w-6 text-amber-500" />;
			default:
				return <Zap className="h-6 w-6 text-blue-500" />;
		}
	};

	return (
		<Card
			className={`relative flex flex-col ${
				plan.recommended
					? "border-primary shadow-lg ring-2 ring-primary/20"
					: ""
			}`}
		>
			{plan.recommended && (
				<Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
					{t("settings.billing.recommended")}
				</Badge>
			)}

			{isCurrent && (
				<Badge
					variant="secondary"
					className="absolute -top-3 right-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
				>
					{t("settings.billing.currentPlanBadge")}
				</Badge>
			)}

			<CardHeader className="text-center pb-2">
				<div className="flex justify-center mb-2">{getIcon()}</div>
				<CardTitle className="text-xl">{plan.name}</CardTitle>
				<CardDescription>
					<span className="text-3xl font-bold text-foreground">
						{formatCurrency(plan.monthlyPrice)}
					</span>
					<span className="text-muted-foreground">
						{t("settings.billing.month")}
					</span>
				</CardDescription>
			</CardHeader>

			<CardContent className="flex-1">
				<div className="space-y-3 mb-4">
					<div className="flex items-center justify-between text-sm">
						<span>{t("settings.billing.notices")}</span>
						<span className="font-medium">
							{plan.noticesIncluded} {t("settings.billing.included")}
						</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span>{t("settings.billing.users")}</span>
						<span className="font-medium">
							{plan.usersIncluded} {t("settings.billing.included")}
						</span>
					</div>
					{plan.overagePrice && (
						<div className="flex items-center justify-between text-sm text-muted-foreground">
							<span>{t("settings.billing.overage")}</span>
							<span>
								{formatCurrency(plan.overagePrice)}{" "}
								{t("settings.billing.perNotice")}
							</span>
						</div>
					)}
				</div>

				<div className="border-t pt-4">
					<p className="text-sm font-medium mb-2">
						{t("settings.billing.features")}:
					</p>
					<ul className="space-y-2">
						{plan.features.slice(0, 5).map((feature) => (
							<li
								key={feature}
								className="flex items-center gap-2 text-sm text-muted-foreground"
							>
								<Check className="h-4 w-4 text-emerald-500 shrink-0" />
								<span>{FEATURE_LABELS[feature]?.[language] || feature}</span>
							</li>
						))}
						{plan.features.length > 5 && (
							<li className="text-sm text-muted-foreground ml-6">
								+{plan.features.length - 5} more...
							</li>
						)}
					</ul>
				</div>
			</CardContent>

			<CardFooter>
				<Button
					className="w-full"
					variant={
						isCurrent ? "outline" : plan.recommended ? "default" : "outline"
					}
					onClick={onSelect}
					disabled={isCurrent || loading}
				>
					{isCurrent
						? t("settings.billing.currentPlanBadge")
						: t("settings.billing.subscribe")}
				</Button>
			</CardFooter>
		</Card>
	);
}

export function PlanComparisonGrid({
	plans,
	currentPlanId,
	onSelectPlan,
	loading,
}: PlanComparisonGridProps) {
	const { t } = useLanguage();

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold">
					{t("settings.billing.selectPlan")}
				</h3>
				<p className="text-sm text-muted-foreground">
					{t("settings.billing.selectPlanDesc")}
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{plans.map((plan) => (
					<PlanCard
						key={plan.id}
						plan={plan}
						isCurrent={plan.id === currentPlanId}
						onSelect={() => onSelectPlan(plan.id)}
						loading={loading}
					/>
				))}
			</div>

			<Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Building2 className="h-5 w-5 text-amber-600" />
						<CardTitle className="text-amber-900 dark:text-amber-100">
							{t("settings.billing.enterprisePlan")}
						</CardTitle>
					</div>
					<CardDescription className="text-amber-700 dark:text-amber-300">
						Custom pricing for large organizations with dedicated support
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="outline"
						className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
						asChild
					>
						<a href="mailto:ventas@janovix.com">
							{t("settings.billing.contactSales")}
						</a>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
