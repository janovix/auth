"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
	Shield,
	AlertTriangle,
	HelpCircle,
	ChevronDown,
	ChevronRight,
	Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Label } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/language-context";
import {
	getAmlComplianceSettings,
	createOrUpdateAmlComplianceSettings,
	getOrganizationMembership,
	type AmlComplianceSettings,
	type OrganizationMembership,
	updateSelfServiceSettings,
} from "@/lib/settings";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import {
	getSubscriptionStatus,
	getFeatures,
	hasAmlProductAccess,
	type Feature,
} from "@/lib/billing";
import {
	SettingsCard,
	SettingsSection,
	SettingsPageHeader,
	ComplianceSettingsViewSkeleton,
} from "@/components/settings";

// Vulnerable activities catalog — codes aligned with aml-svc ActivityCode / SAT catalog
const VULNERABLE_ACTIVITIES = [
	{
		value: "JYS",
		label: "Juego y sorteos (JYS)",
		description: "Juegos con apuesta, concursos y sorteos",
	},
	{
		value: "TSC",
		label: "Tarjetas de servicio/crédito (TSC)",
		description: "Tarjetas de servicio o crédito",
	},
	{
		value: "TPP",
		label: "Tarjetas prepagadas (TPP)",
		description: "Tarjetas prepagadas, vales o cupones",
	},
	{
		value: "TDR",
		label: "Monederos y certificados (TDR)",
		description: "Monederos y certificados de devoluciones o recompensas",
	},
	{
		value: "CHV",
		label: "Cheques de viajero (CHV)",
		description: "Cheques de viajero",
	},
	{
		value: "MPC",
		label: "Mutuo, préstamos y créditos (MPC)",
		description: "Servicios de mutuo, préstamos o créditos",
	},
	{
		value: "INM",
		label: "Inmuebles (INM)",
		description: "Servicios relacionados con inmuebles",
	},
	{
		value: "DIN",
		label: "Desarrollo inmobiliario (DIN)",
		description: "Desarrollo inmobiliario",
	},
	{
		value: "MJR",
		label: "Joyería (MJR)",
		description: "Metales y piedras preciosas, joyas y relojes",
	},
	{
		value: "OBA",
		label: "Arte (OBA)",
		description: "Obras de arte",
	},
	{
		value: "VEH",
		label: "Vehículos (VEH)",
		description: "Vehículos aéreos, marítimos o terrestres",
	},
	{
		value: "BLI",
		label: "Blindaje (BLI)",
		description: "Servicios de blindaje",
	},
	{
		value: "TCV",
		label: "Custodia de valores (TCV)",
		description: "Traslado o custodia de dinero o valores",
	},
	{
		value: "SPR",
		label: "Servicios profesionales (SPR)",
		description: "Prestación de servicios profesionales",
	},
	{
		value: "FEP",
		label: "Fe pública — notarios (FEP)",
		description: "Fé Pública: Notarios y Corredores Públicos",
	},
	{
		value: "FES",
		label: "Fe pública — servidores públicos (FES)",
		description: "Fé Pública: Servidores Públicos",
	},
	{
		value: "DON",
		label: "Donativos (DON)",
		description: "Donativos",
	},
	{
		value: "ARI",
		label: "Arrendamiento de inmuebles (ARI)",
		description: "Derechos personales de uso y goce de inmuebles",
	},
	{
		value: "AVI",
		label: "Activos virtuales (AVI)",
		description: "Operaciones con Activos Virtuales",
	},
];

// RFC validation regex (Mexican format)
const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;

/** Notice filing thresholds (UMA) — aligned with aml-svc activity handlers */
const REPORTING_THRESHOLDS: Record<
	string,
	{ thresholdUma: number | "ALWAYS" }
> = {
	JYS: { thresholdUma: 645 },
	TSC: { thresholdUma: 1285 },
	TPP: { thresholdUma: 645 },
	TDR: { thresholdUma: 645 },
	CHV: { thresholdUma: 645 },
	MPC: { thresholdUma: 1605 },
	INM: { thresholdUma: 8025 },
	DIN: { thresholdUma: 8025 },
	MJR: { thresholdUma: 1605 },
	OBA: { thresholdUma: 4815 },
	VEH: { thresholdUma: 6420 },
	BLI: { thresholdUma: 4815 },
	TCV: { thresholdUma: 3210 },
	SPR: { thresholdUma: "ALWAYS" },
	FEP: { thresholdUma: 8000 },
	FES: { thresholdUma: "ALWAYS" },
	DON: { thresholdUma: 3210 },
	ARI: { thresholdUma: 3210 },
	AVI: { thresholdUma: 210 },
};

// Current UMA value (this should be fetched from the API in a real implementation)
const CURRENT_UMA = 108.57; // Value for 2024

type AmlAccessState = "unknown" | "granted" | "denied";

export function ComplianceSettingsView() {
	const { t } = useLanguage();
	const { data: session } = useAuthSession();

	const [loading, setLoading] = useState(true);
	const [amlAccess, setAmlAccess] = useState<AmlAccessState>("unknown");
	const [saving, setSaving] = useState(false);

	const [settings, setSettings] = useState<AmlComplianceSettings | null>(null);
	const [membership, setMembership] = useState<OrganizationMembership | null>(
		null,
	);

	// Form state
	const [rfc, setRfc] = useState("");
	const [activityKey, setActivityKey] = useState("");
	const [rfcError, setRfcError] = useState<string | null>(null);
	const [thresholdsOpen, setThresholdsOpen] = useState(false);

	// Self-Service state
	const [selfServiceMode, setSelfServiceMode] = useState<
		"disabled" | "manual" | "automatic"
	>("disabled");
	const [selfServiceExpiryHours, setSelfServiceExpiryHours] = useState(72);
	const [selfServiceSendEmail, setSelfServiceSendEmail] = useState(true);
	const [savingSelfService, setSavingSelfService] = useState(false);

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	const canEdit = membership?.role === "owner" || membership?.role === "admin";

	// Gate: AML / PLD compliance settings require AML product on the subscription
	useEffect(() => {
		if (!activeOrgId) {
			setAmlAccess("unknown");
			return;
		}

		let cancelled = false;
		setAmlAccess("unknown");

		void (async () => {
			try {
				const [sub, feats] = await Promise.all([
					getSubscriptionStatus({ resolveFromOrg: true }),
					getFeatures({ resolveFromOrg: true }).catch(() => [] as Feature[]),
				]);
				if (cancelled) return;
				if (!hasAmlProductAccess(sub, feats)) {
					setAmlAccess("denied");
					return;
				}
				setAmlAccess("granted");
			} catch {
				if (!cancelled) {
					// Fail open: allow settings if billing cannot be loaded
					setAmlAccess("granted");
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [activeOrgId]);

	useEffect(() => {
		if (!activeOrgId || amlAccess !== "granted") {
			if (!activeOrgId) {
				setLoading(false);
			}
			return;
		}

		const orgId = activeOrgId;
		let cancelled = false;

		async function loadData() {
			try {
				setLoading(true);

				const [complianceSettings, membershipData] = await Promise.all([
					getAmlComplianceSettings(orgId),
					getOrganizationMembership(orgId),
				]);

				if (cancelled) return;

				setSettings(complianceSettings);
				setMembership(membershipData);

				if (complianceSettings) {
					setRfc(complianceSettings.obligatedSubjectKey);
					setActivityKey(complianceSettings.activityKey);
					// Load self-service settings
					setSelfServiceMode(complianceSettings.selfServiceMode || "disabled");
					setSelfServiceExpiryHours(
						complianceSettings.selfServiceExpiryHours || 72,
					);
					setSelfServiceSendEmail(
						complianceSettings.selfServiceSendEmail !== false,
					);
				}
			} catch (err) {
				if (!cancelled) {
					toast.error(
						err instanceof Error
							? err.message
							: "Failed to load compliance settings",
					);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void loadData();

		return () => {
			cancelled = true;
		};
	}, [activeOrgId, amlAccess]);

	const showSuccess = useCallback((message: string) => {
		toast.success(message);
	}, []);

	const validateRfc = useCallback(
		(value: string): boolean => {
			if (!value) {
				setRfcError(t("settings.compliance.rfcRequired"));
				return false;
			}
			if (value.length !== 12 && value.length !== 13) {
				setRfcError(t("settings.compliance.rfcLength"));
				return false;
			}
			if (!RFC_REGEX.test(value)) {
				setRfcError(t("settings.compliance.rfcFormat"));
				return false;
			}
			setRfcError(null);
			return true;
		},
		[t],
	);

	const handleRfcChange = (value: string) => {
		const upperValue = value.toUpperCase();
		setRfc(upperValue);
		if (upperValue) {
			validateRfc(upperValue);
		} else {
			setRfcError(null);
		}
	};

	const handleSave = useCallback(async () => {
		if (!activeOrgId || !canEdit) return;

		// Validate RFC
		if (!validateRfc(rfc)) return;

		// Validate activity
		if (!activityKey) {
			toast.error(t("settings.compliance.activityRequired"));
			return;
		}

		try {
			setSaving(true);

			const result = await createOrUpdateAmlComplianceSettings(activeOrgId, {
				obligatedSubjectKey: rfc,
				activityKey: activityKey,
			});

			setSettings(result);
			showSuccess(t("settings.compliance.savedSuccess"));
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : t("settings.compliance.saveError"),
			);
		} finally {
			setSaving(false);
		}
	}, [activeOrgId, canEdit, rfc, activityKey, validateRfc, showSuccess, t]);

	const handleSaveSelfService = useCallback(async () => {
		if (!activeOrgId || !canEdit) return;

		try {
			setSavingSelfService(true);

			const updated = await updateSelfServiceSettings(activeOrgId, {
				selfServiceMode,
				selfServiceExpiryHours,
				selfServiceSendEmail,
			});

			setSettings((prev) => (prev ? { ...prev, ...updated } : prev));
			showSuccess(t("settings.compliance.selfServiceSavedSuccess"));
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : t("settings.compliance.saveError"),
			);
		} finally {
			setSavingSelfService(false);
		}
	}, [
		activeOrgId,
		canEdit,
		selfServiceMode,
		selfServiceExpiryHours,
		selfServiceSendEmail,
		showSuccess,
		t,
	]);

	const isDirtySelfService =
		settings &&
		(selfServiceMode !== (settings.selfServiceMode || "disabled") ||
			selfServiceExpiryHours !== (settings.selfServiceExpiryHours || 72) ||
			selfServiceSendEmail !== (settings.selfServiceSendEmail !== false));

	const selectedActivity = VULNERABLE_ACTIVITIES.find(
		(a) => a.value === activityKey,
	);

	if (!activeOrgId) {
		return (
			<div className="space-y-8">
				<SettingsPageHeader
					icon={Shield}
					title={t("settings.compliance.title")}
					description={t("settings.organization.noOrg")}
				/>
			</div>
		);
	}

	if (amlAccess === "unknown") {
		return <ComplianceSettingsViewSkeleton />;
	}

	if (amlAccess === "denied") {
		return (
			<div className="space-y-8">
				<SettingsPageHeader
					icon={Shield}
					title={t("settings.compliance.notAvailableTitle")}
					description={t("settings.compliance.notAvailableDescription")}
				/>
				<Alert>
					<AlertDescription className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<span>{t("settings.compliance.notAvailableDescription")}</span>
						<Button asChild className="shrink-0 sm:w-auto w-full">
							<Link href="/settings/billing">
								{t("settings.compliance.viewBilling")}
							</Link>
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (loading) {
		return <ComplianceSettingsViewSkeleton />;
	}

	return (
		<TooltipProvider>
			<div className="space-y-8">
				{/* Page Header */}
				<SettingsPageHeader
					icon={Shield}
					title={t("settings.compliance.title")}
					description={t("settings.compliance.description")}
				/>

				{/* Warning Alert - show when not configured */}
				{!settings && (
					<Alert
						variant="destructive"
						className="bg-warning/10 border-warning/30 text-warning-foreground"
					>
						<AlertTriangle className="h-5 w-5" />
						<AlertTitle className="font-semibold">
							{t("settings.compliance.statusNotConfigured")}
						</AlertTitle>
						<AlertDescription>
							{t("settings.compliance.statusNotConfiguredDesc")}
						</AlertDescription>
					</Alert>
				)}

				{/* Obligated Subject Information */}
				<SettingsSection
					title={t("settings.compliance.obligatedSubject")}
					description={t("settings.compliance.obligatedSubjectDesc")}
				>
					<SettingsCard>
						<div className="space-y-6">
							{/* RFC */}
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="rfc">{t("settings.compliance.rfc")}</Label>
									<Tooltip>
										<TooltipTrigger asChild>
											<HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
										</TooltipTrigger>
										<TooltipContent className="max-w-xs">
											<p>{t("settings.compliance.rfcHelp")}</p>
										</TooltipContent>
									</Tooltip>
								</div>
								<Input
									id="rfc"
									placeholder="XAXX010101000"
									value={rfc}
									onChange={(e) => handleRfcChange(e.target.value)}
									maxLength={13}
									disabled={!canEdit || saving}
									className={`font-mono uppercase ${rfcError ? "border-destructive" : ""}`}
								/>
								{rfcError && (
									<p className="text-xs text-destructive">{rfcError}</p>
								)}
							</div>

							{/* Vulnerable Activity */}
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="activity">
										{t("settings.compliance.vulnerableActivity")}
									</Label>
									<Tooltip>
										<TooltipTrigger asChild>
											<HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
										</TooltipTrigger>
										<TooltipContent className="max-w-xs">
											<p>{t("settings.compliance.activityHelp")}</p>
										</TooltipContent>
									</Tooltip>
								</div>
								<Select
									value={activityKey}
									onValueChange={setActivityKey}
									disabled={!canEdit || saving}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={t("settings.compliance.selectActivity")}
										/>
									</SelectTrigger>
									<SelectContent>
										{VULNERABLE_ACTIVITIES.map((activity) => (
											<SelectItem key={activity.value} value={activity.value}>
												{activity.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{selectedActivity && (
									<p className="text-sm text-muted-foreground">
										{selectedActivity.description}
									</p>
								)}
							</div>

							<div className="pt-2">
								<Button
									onClick={handleSave}
									loading={saving}
									disabled={!canEdit || !rfc || !activityKey}
								>
									{!saving && <Check className="mr-2 h-4 w-4" />}
									{saving
										? t("settings.saving")
										: t("settings.compliance.saveChanges")}
								</Button>
								{!canEdit && (
									<p className="text-sm text-muted-foreground mt-2">
										{t("settings.compliance.ownerOnly")}
									</p>
								)}
							</div>
						</div>
					</SettingsCard>
				</SettingsSection>

				{/* Reporting Thresholds */}
				<SettingsSection
					title={t("settings.compliance.reportingThresholds")}
					description={t("settings.compliance.reportingThresholdsDesc")}
				>
					<Collapsible open={thresholdsOpen} onOpenChange={setThresholdsOpen}>
						<SettingsCard>
							<CollapsibleTrigger asChild>
								<button
									type="button"
									className="w-full flex items-center justify-between text-left"
								>
									<span className="text-sm font-medium text-foreground">
										{t("settings.compliance.viewAllThresholds")}
									</span>
									{thresholdsOpen ? (
										<ChevronDown className="h-4 w-4 text-muted-foreground" />
									) : (
										<ChevronRight className="h-4 w-4 text-muted-foreground" />
									)}
								</button>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<div className="mt-4 pt-4 border-t border-border">
									<div className="space-y-3">
										{Object.entries(REPORTING_THRESHOLDS).map(
											([key, value]) => {
												const activity = VULNERABLE_ACTIVITIES.find(
													(a) => a.value === key,
												);
												const thresholdUma = value.thresholdUma;
												const rightColumn =
													thresholdUma === "ALWAYS" ? (
														<span className="text-sm font-semibold text-foreground">
															{t("settings.compliance.noticeThresholdAlways")}
														</span>
													) : (
														<>
															<span className="text-sm font-semibold text-foreground">
																{thresholdUma.toLocaleString()} UMAs
															</span>
															<p className="text-xs text-muted-foreground font-mono">
																$
																{(thresholdUma * CURRENT_UMA).toLocaleString(
																	"es-MX",
																	{
																		minimumFractionDigits: 2,
																		maximumFractionDigits: 2,
																	},
																)}{" "}
																MXN
															</p>
														</>
													);
												return (
													<div
														key={key}
														className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
													>
														<div>
															<p className="text-sm font-medium text-foreground">
																{activity?.label || key}
															</p>
															<p className="text-xs text-muted-foreground">
																{activity?.description}
															</p>
														</div>
														<div className="text-right">{rightColumn}</div>
													</div>
												);
											},
										)}
									</div>
								</div>
							</CollapsibleContent>
						</SettingsCard>
					</Collapsible>
				</SettingsSection>

				{/* KYC Self-Service Settings */}
				{settings && (
					<SettingsSection
						title={t("settings.compliance.kycSelfService")}
						description={t("settings.compliance.kycSelfServiceDesc")}
					>
						<SettingsCard>
							<div className="space-y-6">
								{/* Mode selector */}
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Label htmlFor="self-service-mode">
											{t("settings.compliance.selfServiceMode")}
										</Label>
										<Tooltip>
											<TooltipTrigger asChild>
												<HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
											</TooltipTrigger>
											<TooltipContent className="max-w-xs">
												<p>{t("settings.compliance.selfServiceModeHelp")}</p>
											</TooltipContent>
										</Tooltip>
									</div>
									<Select
										value={selfServiceMode}
										onValueChange={(v) =>
											setSelfServiceMode(
												v as "disabled" | "manual" | "automatic",
											)
										}
										disabled={!canEdit || savingSelfService}
									>
										<SelectTrigger id="self-service-mode">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="disabled">
												{t("settings.compliance.selfServiceDisabled")}
											</SelectItem>
											<SelectItem value="manual">
												{t("settings.compliance.selfServiceManual")}
											</SelectItem>
											<SelectItem value="automatic">
												{t("settings.compliance.selfServiceAutomatic")}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Expiry hours */}
								{selfServiceMode !== "disabled" && (
									<div className="space-y-2">
										<Label htmlFor="expiry-hours">
											{t("settings.compliance.selfServiceExpiryHours")}
										</Label>
										<div className="flex items-center gap-3">
											<Input
												id="expiry-hours"
												type="number"
												min={1}
												max={720}
												value={selfServiceExpiryHours}
												onChange={(e) =>
													setSelfServiceExpiryHours(Number(e.target.value))
												}
												disabled={!canEdit || savingSelfService}
												className="w-28"
											/>
											<span className="text-sm text-muted-foreground">
												≈{" "}
												{selfServiceExpiryHours >= 24
													? `${Math.round(selfServiceExpiryHours / 24)} día${Math.round(selfServiceExpiryHours / 24) !== 1 ? "s" : ""}`
													: `${selfServiceExpiryHours} hora${selfServiceExpiryHours !== 1 ? "s" : ""}`}
											</span>
										</div>
										<p className="text-xs text-muted-foreground">
											{t("settings.compliance.selfServiceExpiryHoursHelp")}
										</p>
									</div>
								)}

								{/* Send invite email when creating a KYC session */}
								{selfServiceMode !== "disabled" && (
									<div className="flex items-start gap-3 rounded-md border p-3">
										<Switch
											id="self-service-send-email"
											checked={selfServiceSendEmail}
											onCheckedChange={setSelfServiceSendEmail}
											disabled={!canEdit || savingSelfService}
										/>
										<div className="space-y-1">
											<Label
												htmlFor="self-service-send-email"
												className="cursor-pointer"
											>
												{t("settings.compliance.selfServiceSendEmail")}
											</Label>
											<p className="text-xs text-muted-foreground">
												{t("settings.compliance.selfServiceSendEmailHelp")}
											</p>
										</div>
									</div>
								)}

								{/* Compliance notice */}
								<div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
									<AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
									<p className="text-xs text-amber-700 dark:text-amber-300">
										{t("settings.compliance.kycComplianceNotice")}
									</p>
								</div>

								{/* Save button */}
								<div className="flex justify-end">
									<Button
										onClick={handleSaveSelfService}
										loading={savingSelfService}
										disabled={!canEdit || !isDirtySelfService}
									>
										{!savingSelfService && <Check className="mr-2 h-4 w-4" />}
										{savingSelfService
											? t("settings.saving")
											: t("settings.compliance.saveChanges")}
									</Button>
								</div>
							</div>
						</SettingsCard>
					</SettingsSection>
				)}
			</div>
		</TooltipProvider>
	);
}
