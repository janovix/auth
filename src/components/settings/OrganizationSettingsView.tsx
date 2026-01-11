"use client";

import { useCallback, useEffect, useState } from "react";
import {
	Moon,
	Sun,
	Monitor,
	Copy,
	AlertTriangle,
	Check,
	Loader2,
} from "lucide-react";
import {
	Button,
	Card,
	CardContent,
	Label,
	Input,
	Spinner,
} from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/language-context";
import {
	getOrganizationSettings,
	updateOrganizationSettings,
	getOrganizationMembership,
	type OrganizationSettings,
	type OrganizationMembership,
	type Theme,
	type LanguageCode,
	type DateFormat,
} from "@/lib/settings";
import { authClient } from "@/lib/auth/authClient";
import { useAuthSession } from "@/lib/auth/useAuthSession";

// Common timezones
const TIMEZONES = [
	{ value: "America/Mexico_City", label: "Mexico City (GMT-6)" },
	{ value: "America/Cancun", label: "Cancún (GMT-5)" },
	{ value: "America/Tijuana", label: "Tijuana (GMT-8)" },
	{ value: "America/New_York", label: "New York (GMT-5)" },
	{ value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
	{ value: "America/Chicago", label: "Chicago (GMT-6)" },
	{ value: "Europe/London", label: "London (GMT)" },
	{ value: "Europe/Paris", label: "Paris (GMT+1)" },
	{ value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
	{ value: "UTC", label: "UTC" },
];

const DATE_FORMATS: { value: DateFormat; label: string }[] = [
	{ value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
	{ value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
	{ value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
	{ value: "DD.MM.YYYY", label: "DD.MM.YYYY" },
];

const THEMES: { value: Theme; labelKey: string; icon: typeof Sun }[] = [
	{ value: "light", labelKey: "settings.appearance.light", icon: Sun },
	{ value: "dark", labelKey: "settings.appearance.dark", icon: Moon },
	{ value: "system", labelKey: "settings.appearance.system", icon: Monitor },
];

const LANGUAGES: { value: LanguageCode; labelKey: string }[] = [
	{ value: "es", labelKey: "settings.personal.spanish" },
	{ value: "en", labelKey: "settings.personal.english" },
];

interface OrgData {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
}

export function OrganizationSettingsView() {
	const { t } = useLanguage();
	const { data: session } = useAuthSession();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	// Organization data
	const [orgData, setOrgData] = useState<OrgData | null>(null);
	const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(
		null,
	);
	const [membership, setMembership] = useState<OrganizationMembership | null>(
		null,
	);

	// Form state
	const [orgName, setOrgName] = useState("");
	const [orgSlug, setOrgSlug] = useState("");
	const [orgLogo, setOrgLogo] = useState("");
	const [selectedTheme, setSelectedTheme] = useState<Theme>("system");
	const [selectedTimezone, setSelectedTimezone] = useState<string>("UTC");
	const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
	const [selectedDateFormat, setSelectedDateFormat] =
		useState<DateFormat>("MM/DD/YYYY");

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	const isOwner = membership?.role === "owner";

	useEffect(() => {
		async function loadOrgData() {
			if (!activeOrgId) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);

				// Load organization data, settings, and membership in parallel
				const [orgResult, settings, membershipData] = await Promise.all([
					authClient.organization.getFullOrganization({
						query: { organizationId: activeOrgId },
					}),
					getOrganizationSettings(activeOrgId),
					getOrganizationMembership(activeOrgId),
				]);

				if (orgResult.data) {
					const org = orgResult.data;
					setOrgData({
						id: org.id,
						name: org.name,
						slug: org.slug,
						logo: org.logo || null,
					});
					setOrgName(org.name);
					setOrgSlug(org.slug);
					setOrgLogo(org.logo || "");
				}

				setOrgSettings(settings);
				setMembership(membershipData);

				// Initialize form with settings
				if (settings) {
					setSelectedTheme((settings.theme as Theme) || "system");
					setSelectedTimezone(settings.timezone || "UTC");
					setSelectedLanguage((settings.language as LanguageCode) || "en");
					setSelectedDateFormat(
						(settings.dateFormat as DateFormat) || "MM/DD/YYYY",
					);
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to load organization data",
				);
			} finally {
				setLoading(false);
			}
		}

		loadOrgData();
	}, [activeOrgId]);

	const showSuccess = useCallback((message: string) => {
		setSuccessMessage(message);
		setTimeout(() => setSuccessMessage(null), 3000);
	}, []);

	const copyOrgId = () => {
		if (orgData?.id) {
			navigator.clipboard.writeText(orgData.id);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleThemeChange = useCallback(
		async (newTheme: Theme) => {
			if (!activeOrgId || !isOwner) return;
			setSelectedTheme(newTheme);
			try {
				setSaving(true);
				await updateOrganizationSettings(activeOrgId, { theme: newTheme });
				showSuccess(t("settings.organization.savedSuccess"));
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: t("settings.organization.saveError"),
				);
			} finally {
				setSaving(false);
			}
		},
		[activeOrgId, isOwner, showSuccess, t],
	);

	const handleTimezoneChange = useCallback(
		async (newTimezone: string) => {
			if (!activeOrgId || !isOwner) return;
			setSelectedTimezone(newTimezone);
			try {
				setSaving(true);
				await updateOrganizationSettings(activeOrgId, {
					timezone: newTimezone,
				});
				showSuccess(t("settings.organization.savedSuccess"));
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: t("settings.organization.saveError"),
				);
			} finally {
				setSaving(false);
			}
		},
		[activeOrgId, isOwner, showSuccess, t],
	);

	const handleLanguageChange = useCallback(
		async (newLanguage: LanguageCode) => {
			if (!activeOrgId || !isOwner) return;
			setSelectedLanguage(newLanguage);
			try {
				setSaving(true);
				await updateOrganizationSettings(activeOrgId, {
					language: newLanguage,
				});
				showSuccess(t("settings.organization.savedSuccess"));
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: t("settings.organization.saveError"),
				);
			} finally {
				setSaving(false);
			}
		},
		[activeOrgId, isOwner, showSuccess, t],
	);

	const handleDateFormatChange = useCallback(
		async (newFormat: DateFormat) => {
			if (!activeOrgId || !isOwner) return;
			setSelectedDateFormat(newFormat);
			try {
				setSaving(true);
				await updateOrganizationSettings(activeOrgId, {
					dateFormat: newFormat,
				});
				showSuccess(t("settings.organization.savedSuccess"));
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: t("settings.organization.saveError"),
				);
			} finally {
				setSaving(false);
			}
		},
		[activeOrgId, isOwner, showSuccess, t],
	);

	const handleLogoSave = useCallback(async () => {
		if (!activeOrgId || !isOwner) return;
		try {
			setSaving(true);
			await updateOrganizationSettings(activeOrgId, {
				avatarUrl: orgLogo || null,
			});
			showSuccess(t("settings.organization.savedSuccess"));
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: t("settings.organization.saveError"),
			);
		} finally {
			setSaving(false);
		}
	}, [activeOrgId, isOwner, orgLogo, showSuccess, t]);

	const handleOrgUpdate = useCallback(async () => {
		if (!activeOrgId || !isOwner) return;
		try {
			setSaving(true);
			await authClient.organization.update({
				organizationId: activeOrgId,
				data: {
					name: orgName,
					slug: orgSlug,
				},
			});
			showSuccess(t("settings.organization.savedSuccess"));
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: t("settings.organization.saveError"),
			);
		} finally {
			setSaving(false);
		}
	}, [activeOrgId, isOwner, orgName, orgSlug, showSuccess, t]);

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
						{t("settings.org.title")}
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						{t("settings.organization.noOrg")}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Header */}
			<div>
				<h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
					{t("settings.org.title")}
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					{t("settings.org.description")}
				</p>
			</div>

			{/* Success/Error Messages */}
			{successMessage && (
				<div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
					{successMessage}
				</div>
			)}
			{error && (
				<div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
					{error}
				</div>
			)}

			<Separator />

			{/* Organization Info */}
			<section className="space-y-4 sm:space-y-6">
				<div>
					<h3 className="text-base sm:text-lg font-medium">
						{t("settings.org.profile")}
					</h3>
					<p className="text-sm text-muted-foreground">
						{t("settings.org.profileDesc")}
					</p>
				</div>

				<div className="grid gap-4 sm:gap-6">
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
						<Avatar className="h-16 w-16 sm:h-20 sm:w-20">
							<AvatarImage src={orgLogo || undefined} />
							<AvatarFallback className="text-lg sm:text-xl bg-primary text-primary-foreground">
								{orgData?.name?.substring(0, 2).toUpperCase() || "ORG"}
							</AvatarFallback>
						</Avatar>
						<div className="space-y-2">
							<div className="flex gap-2 items-center">
								<Input
									type="url"
									placeholder="https://example.com/logo.png"
									value={orgLogo}
									onChange={(e) => setOrgLogo(e.target.value)}
									disabled={!isOwner || saving}
									className="w-full max-w-xs"
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={handleLogoSave}
									disabled={!isOwner || saving}
								>
									{saving ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										t("settings.save")
									)}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								{t("settings.org.logoHelp")}
							</p>
						</div>
					</div>

					{/* Name */}
					<div className="grid gap-2">
						<Label htmlFor="orgName">{t("settings.org.name")}</Label>
						<div className="flex gap-2 items-center">
							<Input
								id="orgName"
								value={orgName}
								onChange={(e) => setOrgName(e.target.value)}
								disabled={!isOwner || saving}
								className="w-full sm:max-w-md"
							/>
							<Button
								variant="outline"
								size="sm"
								onClick={handleOrgUpdate}
								disabled={!isOwner || saving}
							>
								{saving ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									t("settings.save")
								)}
							</Button>
						</div>
					</div>

					{/* Slug */}
					<div className="grid gap-2">
						<Label htmlFor="slug">{t("settings.org.slug")}</Label>
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:max-w-md">
							<span className="text-sm text-muted-foreground shrink-0">
								janovix.com/
							</span>
							<Input
								id="slug"
								value={orgSlug}
								onChange={(e) => setOrgSlug(e.target.value)}
								disabled={!isOwner || saving}
								className="w-full"
							/>
						</div>
					</div>

					{/* Organization ID */}
					<div className="grid gap-2">
						<Label>{t("settings.org.id")}</Label>
						<div className="flex items-center gap-2">
							<code className="rounded bg-muted px-3 py-2 font-mono text-sm truncate max-w-[200px] sm:max-w-none">
								{orgData?.id}
							</code>
							<Button
								variant="ghost"
								size="icon"
								onClick={copyOrgId}
								className="shrink-0"
							>
								{copied ? (
									<Check className="h-4 w-4 text-green-500" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							{t("settings.org.idHelp")}
						</p>
					</div>
				</div>
			</section>

			<Separator />

			{/* Default Preferences */}
			<section className="space-y-4 sm:space-y-6">
				<div>
					<h3 className="text-base sm:text-lg font-medium">
						{t("settings.org.defaultPreferences")}
					</h3>
					<p className="text-sm text-muted-foreground">
						{t("settings.org.defaultPreferencesDesc")}
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					{/* Theme */}
					<div className="grid gap-2">
						<Label htmlFor="orgTheme">{t("settings.appearance.theme")}</Label>
						<Select
							value={selectedTheme}
							onValueChange={(v: string) => handleThemeChange(v as Theme)}
							disabled={!isOwner || saving}
						>
							<SelectTrigger id="orgTheme">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{THEMES.map(({ value, labelKey }) => (
									<SelectItem key={value} value={value}>
										{t(labelKey)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Timezone */}
					<div className="grid gap-2">
						<Label htmlFor="orgTimezone">
							{t("settings.org.defaultTimezone")}
						</Label>
						<Select
							value={selectedTimezone}
							onValueChange={handleTimezoneChange}
							disabled={!isOwner || saving}
						>
							<SelectTrigger id="orgTimezone">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{TIMEZONES.map((tz) => (
									<SelectItem key={tz.value} value={tz.value}>
										{tz.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Language */}
					<div className="grid gap-2">
						<Label htmlFor="orgLanguage">
							{t("settings.org.defaultLanguage")}
						</Label>
						<Select
							value={selectedLanguage}
							onValueChange={(v: string) =>
								handleLanguageChange(v as LanguageCode)
							}
							disabled={!isOwner || saving}
						>
							<SelectTrigger id="orgLanguage">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{LANGUAGES.map((lang) => (
									<SelectItem key={lang.value} value={lang.value}>
										{t(lang.labelKey)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Date Format */}
					<div className="grid gap-2">
						<Label htmlFor="orgDateFormat">
							{t("settings.org.defaultDateFormat")}
						</Label>
						<Select
							value={selectedDateFormat}
							onValueChange={(v: string) =>
								handleDateFormatChange(v as DateFormat)
							}
							disabled={!isOwner || saving}
						>
							<SelectTrigger id="orgDateFormat">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{DATE_FORMATS.map((fmt) => (
									<SelectItem key={fmt.value} value={fmt.value}>
										{fmt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</section>

			<Separator />

			{/* Danger Zone */}
			<section className="space-y-4 sm:space-y-6">
				<div>
					<h3 className="text-base sm:text-lg font-medium text-destructive">
						{t("settings.org.dangerZone")}
					</h3>
					<p className="text-sm text-muted-foreground">
						{t("settings.org.dangerZoneDesc")}
					</p>
				</div>

				<Card className="border-destructive/50">
					<CardContent className="p-4">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
							<div>
								<h4 className="font-medium">{t("settings.org.delete")}</h4>
								<p className="text-sm text-muted-foreground">
									{t("settings.org.deleteDesc")}
								</p>
							</div>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="destructive"
										size="sm"
										className="shrink-0"
										disabled={!isOwner}
									>
										<AlertTriangle className="mr-2 h-4 w-4" />
										{t("settings.org.deleteButton")}
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
									<AlertDialogHeader>
										<AlertDialogTitle>
											{t("settings.org.deleteConfirmTitle")}
										</AlertDialogTitle>
										<AlertDialogDescription>
											{t("settings.org.deleteConfirmDesc").replace(
												"{name}",
												orgData?.name || "",
											)}
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter className="flex-col sm:flex-row gap-2">
										<AlertDialogCancel className="w-full sm:w-auto">
											{t("settings.org.cancel")}
										</AlertDialogCancel>
										<AlertDialogAction className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">
											{t("settings.org.deleteButton")}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
