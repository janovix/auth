"use client";

import { useCallback, useEffect, useState } from "react";
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
} from "@/lib/settings";
import { useAuthSession } from "@/lib/auth/useAuthSession";
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

// RFC validation regexes (Mexican format)
// Persona Física: 4 letters + 6-digit date (YYMMDD) + 3 alphanumeric (homoclave)
const RFC_PERSONA_FISICA = /^[A-ZÑ&]{4}(\d{2})(\d{2})(\d{2})[A-Z0-9]{3}$/;
// Persona Moral: 3 letters + 6-digit date (YYMMDD) + 3 alphanumeric (homoclave)
const RFC_PERSONA_MORAL = /^[A-ZÑ&]{3}(\d{2})(\d{2})(\d{2})[A-Z0-9]{3}$/;

/**
 * Validates the YYMMDD date portion of an RFC
 * Returns true if the date is valid
 */
function isValidRfcDate(yy: string, mm: string, dd: string): boolean {
	const year = parseInt(yy, 10);
	const month = parseInt(mm, 10);
	const day = parseInt(dd, 10);

	// Month must be 1-12
	if (month < 1 || month > 12) return false;

	// Day must be at least 1
	if (day < 1) return false;

	// Days in each month (ignoring leap years for simplicity since we only have YY)
	const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (day > daysInMonth[month - 1]) return false;

	// Year reasonableness check (00-99 maps to 1900-2099)
	// Any 2-digit year is technically valid for RFC purposes
	return year >= 0 && year <= 99;
}

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

export function ComplianceSettingsView() {
	const { t } = useLanguage();
	const { data: session } = useAuthSession();

	const [loading, setLoading] = useState(true);
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

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	const canEdit = membership?.role === "owner" || membership?.role === "admin";

	useEffect(() => {
		async function loadData() {
			if (!activeOrgId) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);

				const [complianceSettings, membershipData] = await Promise.all([
					getAmlComplianceSettings(activeOrgId),
					getOrganizationMembership(activeOrgId),
				]);

				setSettings(complianceSettings);
				setMembership(membershipData);

				if (complianceSettings) {
					setRfc(complianceSettings.obligatedSubjectKey);
					setActivityKey(complianceSettings.activityKey);
				}
			} catch (err) {
				toast.error(
					err instanceof Error
						? err.message
						: "Failed to load compliance settings",
				);
			} finally {
				setLoading(false);
			}
		}

		loadData();
	}, [activeOrgId]);

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

			// Validate based on RFC type (persona física = 13 chars, persona moral = 12 chars)
			let match: RegExpMatchArray | null;
			if (value.length === 13) {
				match = value.match(RFC_PERSONA_FISICA);
			} else {
				match = value.match(RFC_PERSONA_MORAL);
			}

			if (!match) {
				setRfcError(t("settings.compliance.rfcFormat"));
				return false;
			}

			// Extract and validate the date portion (groups 1, 2, 3 are YY, MM, DD)
			const [, yy, mm, dd] = match;
			if (!isValidRfcDate(yy, mm, dd)) {
				setRfcError(t("settings.compliance.rfcInvalidDate"));
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

	const selectedActivity = VULNERABLE_ACTIVITIES.find(
		(a) => a.value === activityKey,
	);

	if (loading) {
		return <ComplianceSettingsViewSkeleton />;
	}

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
			</div>
		</TooltipProvider>
	);
}
