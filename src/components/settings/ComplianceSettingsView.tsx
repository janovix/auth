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
	Loader2,
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

// Vulnerable activities catalog (as per Mexican AML regulations)
const VULNERABLE_ACTIVITIES = [
	{
		value: "VEH",
		label: "Vehículos (VEH)",
		description: "Venta de vehículos terrestres, aéreos y marítimos",
	},
	{
		value: "INM",
		label: "Inmuebles (INM)",
		description: "Servicios de mediación inmobiliaria",
	},
	{
		value: "JOY",
		label: "Joyería (JOY)",
		description: "Compraventa de joyas, metales preciosos y relojes",
	},
	{
		value: "OAR",
		label: "Obras de arte (OAR)",
		description: "Compraventa de obras de arte",
	},
	{
		value: "BLI",
		label: "Blindaje (BLI)",
		description: "Blindaje de vehículos o bienes inmuebles",
	},
	{
		value: "TRA",
		label: "Traslado (TRA)",
		description: "Traslado o custodia de dinero o valores",
	},
	{
		value: "JUE",
		label: "Juegos (JUE)",
		description: "Juegos con apuesta, concursos o sorteos",
	},
	{
		value: "TAR",
		label: "Tarjetas (TAR)",
		description: "Emisión de tarjetas de servicios o crédito",
	},
	{
		value: "CHE",
		label: "Cheques (CHE)",
		description: "Emisión y venta de cheques de viajero",
	},
	{
		value: "PRE",
		label: "Préstamos (PRE)",
		description: "Ofrecimiento habitual o profesional de préstamos",
	},
	{
		value: "ARP",
		label: "Arrendamiento (ARP)",
		description: "Arrendamiento de bienes inmuebles",
	},
	{
		value: "FCP",
		label: "Fe pública (FCP)",
		description: "Prestación de servicios de fe pública",
	},
	{
		value: "SAP",
		label: "Servicios profesionales (SAP)",
		description: "Servicios profesionales independientes",
	},
	{
		value: "ACT",
		label: "Actividades comerciales (ACT)",
		description: "Otras actividades comerciales",
	},
];

// RFC validation regex (Mexican format)
const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;

// Reporting thresholds (in UMAs)
const REPORTING_THRESHOLDS = {
	VEH: { threshold: 645, description: "settings.compliance.threshold645" },
	INM: { threshold: 8025, description: "settings.compliance.threshold8025" },
	JOY: { threshold: 805, description: "settings.compliance.threshold805" },
	OAR: { threshold: 4815, description: "settings.compliance.threshold4815" },
	BLI: { threshold: 2410, description: "settings.compliance.threshold2410" },
	TRA: { threshold: 3210, description: "settings.compliance.threshold3210" },
	JUE: { threshold: 325, description: "settings.compliance.threshold325" },
	TAR: { threshold: 805, description: "settings.compliance.threshold805" },
	CHE: { threshold: 645, description: "settings.compliance.threshold645" },
	PRE: { threshold: 1605, description: "settings.compliance.threshold1605" },
	ARP: { threshold: 1605, description: "settings.compliance.threshold1605" },
	FCP: { threshold: 8025, description: "settings.compliance.threshold8025" },
	SAP: { threshold: 8025, description: "settings.compliance.threshold8025" },
	ACT: { threshold: 8025, description: "settings.compliance.threshold8025" },
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

			await updateSelfServiceSettings(activeOrgId, {
				selfServiceMode,
				selfServiceExpiryHours,
			});

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
		showSuccess,
		t,
	]);

	const isDirtySelfService =
		settings &&
		(selfServiceMode !== (settings.selfServiceMode || "disabled") ||
			selfServiceExpiryHours !== (settings.selfServiceExpiryHours || 72));

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
									disabled={!canEdit || saving || !rfc || !activityKey}
								>
									{saving ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{t("settings.saving")}
										</>
									) : (
										<>
											<Check className="mr-2 h-4 w-4" />
											{t("settings.compliance.saveChanges")}
										</>
									)}
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
														<div className="text-right">
															<span className="text-sm font-semibold text-foreground">
																{value.threshold.toLocaleString()} UMAs
															</span>
															<p className="text-xs text-muted-foreground font-mono">
																$
																{(value.threshold * CURRENT_UMA).toLocaleString(
																	"es-MX",
																	{
																		minimumFractionDigits: 2,
																		maximumFractionDigits: 2,
																	},
																)}{" "}
																MXN
															</p>
														</div>
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
										disabled={
											!canEdit || savingSelfService || !isDirtySelfService
										}
									>
										{savingSelfService ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												{t("settings.saving")}
											</>
										) : (
											<>
												<Check className="mr-2 h-4 w-4" />
												{t("settings.compliance.saveChanges")}
											</>
										)}
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
