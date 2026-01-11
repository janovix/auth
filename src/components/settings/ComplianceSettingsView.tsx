"use client";

import { useCallback, useEffect, useState } from "react";
import {
	Shield,
	Building2,
	AlertTriangle,
	CheckCircle,
	Info,
	Loader2,
	HelpCircle,
} from "lucide-react";
import {
	Button,
	Card,
	CardContent,
	Label,
	Input,
	Spinner,
	Badge,
} from "@/components/ui";
import { Separator } from "@/components/ui/separator";
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
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/language-context";
import {
	getAmlComplianceSettings,
	createOrUpdateAmlComplianceSettings,
	getOrganizationMembership,
	type AmlComplianceSettings,
	type OrganizationMembership,
} from "@/lib/settings";
import { useAuthSession } from "@/lib/auth/useAuthSession";

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

export function ComplianceSettingsView() {
	const { t } = useLanguage();
	const { data: session } = useAuthSession();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const [settings, setSettings] = useState<AmlComplianceSettings | null>(null);
	const [membership, setMembership] = useState<OrganizationMembership | null>(
		null,
	);

	// Form state
	const [rfc, setRfc] = useState("");
	const [activityKey, setActivityKey] = useState("");
	const [rfcError, setRfcError] = useState<string | null>(null);

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
				setError(
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
		setSuccessMessage(message);
		setTimeout(() => setSuccessMessage(null), 3000);
	}, []);

	const validateRfc = (value: string): boolean => {
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
	};

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
			setError(t("settings.compliance.activityRequired"));
			return;
		}

		try {
			setSaving(true);
			setError(null);

			const result = await createOrUpdateAmlComplianceSettings(activeOrgId, {
				obligatedSubjectKey: rfc,
				activityKey: activityKey,
			});

			setSettings(result);
			showSuccess(t("settings.compliance.savedSuccess"));
		} catch (err) {
			setError(
				err instanceof Error ? err.message : t("settings.compliance.saveError"),
			);
		} finally {
			setSaving(false);
		}
	}, [activeOrgId, canEdit, rfc, activityKey, showSuccess, t]);

	const selectedActivity = VULNERABLE_ACTIVITIES.find(
		(a) => a.value === activityKey,
	);
	const threshold =
		REPORTING_THRESHOLDS[activityKey as keyof typeof REPORTING_THRESHOLDS];

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Spinner className="h-8 w-8" />
			</div>
		);
	}

	if (!activeOrgId) {
		return (
			<div className="space-y-6">
				<div>
					<h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
						{t("settings.compliance.title")}
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						{t("settings.organization.noOrg")}
					</p>
				</div>
			</div>
		);
	}

	return (
		<TooltipProvider>
			<div className="space-y-6 sm:space-y-8">
				{/* Header */}
				<div>
					<h2 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
						<Shield className="h-6 w-6" />
						{t("settings.compliance.title")}
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						{t("settings.compliance.description")}
					</p>
				</div>

				{/* Success/Error Messages */}
				{successMessage && (
					<div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
						<CheckCircle className="h-4 w-4" />
						{successMessage}
					</div>
				)}
				{error && (
					<div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
						<AlertTriangle className="h-4 w-4" />
						{error}
					</div>
				)}

				{/* Compliance Status */}
				<Card
					className={
						settings
							? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
							: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
					}
				>
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							{settings ? (
								<CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
							) : (
								<AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
							)}
							<div>
								<h3 className="font-medium">
									{settings
										? t("settings.compliance.statusConfigured")
										: t("settings.compliance.statusNotConfigured")}
								</h3>
								<p className="text-sm text-muted-foreground">
									{settings
										? t("settings.compliance.statusConfiguredDesc")
										: t("settings.compliance.statusNotConfiguredDesc")}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Separator />

				{/* Obligated Subject Information */}
				<section className="space-y-4 sm:space-y-6">
					<div>
						<h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							{t("settings.compliance.obligatedSubject")}
						</h3>
						<p className="text-sm text-muted-foreground">
							{t("settings.compliance.obligatedSubjectDesc")}
						</p>
					</div>

					<div className="grid gap-4 sm:gap-6">
						{/* RFC */}
						<div className="grid gap-2">
							<div className="flex items-center gap-2">
								<Label htmlFor="rfc" className="font-medium">
									{t("settings.compliance.rfc")}
								</Label>
								<Tooltip>
									<TooltipTrigger>
										<HelpCircle className="h-4 w-4 text-muted-foreground" />
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<p>{t("settings.compliance.rfcHelp")}</p>
									</TooltipContent>
								</Tooltip>
							</div>
							<div className="flex flex-col gap-2">
								<Input
									id="rfc"
									value={rfc}
									onChange={(e) => handleRfcChange(e.target.value)}
									placeholder="XAXX010101000"
									maxLength={13}
									disabled={!canEdit || saving}
									className={`w-full sm:max-w-md font-mono uppercase ${
										rfcError ? "border-red-500" : ""
									}`}
								/>
								{rfcError && <p className="text-sm text-red-500">{rfcError}</p>}
								<p className="text-xs text-muted-foreground">
									{t("settings.compliance.rfcFormat")}: 12-13{" "}
									{t("settings.compliance.characters")}
								</p>
							</div>
						</div>

						{/* Vulnerable Activity */}
						<div className="grid gap-2">
							<div className="flex items-center gap-2">
								<Label htmlFor="activity" className="font-medium">
									{t("settings.compliance.vulnerableActivity")}
								</Label>
								<Tooltip>
									<TooltipTrigger>
										<HelpCircle className="h-4 w-4 text-muted-foreground" />
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
								<SelectTrigger id="activity" className="w-full sm:max-w-md">
									<SelectValue
										placeholder={t("settings.compliance.selectActivity")}
									/>
								</SelectTrigger>
								<SelectContent>
									{VULNERABLE_ACTIVITIES.map((activity) => (
										<SelectItem key={activity.value} value={activity.value}>
											<div className="flex flex-col">
												<span>{activity.label}</span>
												<span className="text-xs text-muted-foreground">
													{activity.description}
												</span>
											</div>
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

						{/* Save Button */}
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
									t("settings.compliance.saveChanges")
								)}
							</Button>
							{!canEdit && (
								<p className="text-sm text-muted-foreground mt-2">
									{t("settings.compliance.ownerOnly")}
								</p>
							)}
						</div>
					</div>
				</section>

				<Separator />

				{/* Reporting Thresholds */}
				<section className="space-y-4 sm:space-y-6">
					<div>
						<h3 className="text-base sm:text-lg font-medium">
							{t("settings.compliance.reportingThresholds")}
						</h3>
						<p className="text-sm text-muted-foreground">
							{t("settings.compliance.reportingThresholdsDesc")}
						</p>
					</div>

					{threshold && activityKey && (
						<Card>
							<CardContent className="p-4">
								<div className="grid gap-4">
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium">
											{t("settings.compliance.thresholdUMA")}
										</span>
										<Badge variant="secondary" className="text-base font-mono">
											{threshold.threshold.toLocaleString()} UMAs
										</Badge>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium">
											{t("settings.compliance.thresholdMXN")}
										</span>
										<Badge variant="outline" className="text-base font-mono">
											$
											{(threshold.threshold * CURRENT_UMA).toLocaleString(
												"es-MX",
												{
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												},
											)}{" "}
											MXN
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground flex items-center gap-1">
										<Info className="h-3 w-3" />
										{t("settings.compliance.umaNote")}: ${CURRENT_UMA} MXN
										(2024)
									</p>
								</div>
							</CardContent>
						</Card>
					)}

					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="all-thresholds">
							<AccordionTrigger>
								{t("settings.compliance.viewAllThresholds")}
							</AccordionTrigger>
							<AccordionContent>
								<div className="grid gap-2 pt-2">
									{Object.entries(REPORTING_THRESHOLDS).map(([key, value]) => {
										const activity = VULNERABLE_ACTIVITIES.find(
											(a) => a.value === key,
										);
										return (
											<div
												key={key}
												className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-muted/50"
											>
												<div>
													<span className="font-medium">
														{activity?.label || key}
													</span>
													<p className="text-xs text-muted-foreground">
														{activity?.description}
													</p>
												</div>
												<div className="text-right">
													<span className="font-mono text-sm">
														{value.threshold.toLocaleString()} UMAs
													</span>
													<p className="text-xs text-muted-foreground font-mono">
														$
														{(value.threshold * CURRENT_UMA).toLocaleString(
															"es-MX",
														)}{" "}
														MXN
													</p>
												</div>
											</div>
										);
									})}
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</section>
			</div>
		</TooltipProvider>
	);
}
