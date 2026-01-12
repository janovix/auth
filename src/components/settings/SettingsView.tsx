"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
	Moon,
	Sun,
	Monitor,
	Globe,
	Clock,
	Calendar,
	User,
	CreditCard,
	Loader2,
	Building2,
	Lock,
	AlertCircle,
} from "lucide-react";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Label,
	Input,
	Spinner,
} from "@/components/ui";
import { useLanguage } from "@/contexts/language-context";
import {
	getUserSettings,
	updateUserSettings,
	getOrganizationSettings,
	updateOrganizationSettings,
	getOrganizationMembership,
	type UserSettings,
	type OrganizationSettings,
	type OrganizationMembership,
	type Theme,
	type LanguageCode,
	type DateFormat,
} from "@/lib/settings";
import { authClient } from "@/lib/auth/authClient";
import { getAllTimezoneOptions } from "@/lib/timezones";

// Get all timezones
const TIMEZONES = getAllTimezoneOptions();

const DATE_FORMATS: { value: DateFormat; label: string; example: string }[] = [
	{ value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "01/15/2026" },
	{ value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "15/01/2026" },
	{ value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2026-01-15" },
	{ value: "DD.MM.YYYY", label: "DD.MM.YYYY", example: "15.01.2026" },
];

const LANGUAGES: { value: LanguageCode; label: string; flag: string }[] = [
	{ value: "en", label: "English", flag: "🇺🇸" },
	{ value: "es", label: "Español", flag: "🇲🇽" },
];

export function SettingsView() {
	const { t, language, setLanguage } = useLanguage();
	const { theme, setTheme } = useTheme();
	const [settings, setSettings] = useState<UserSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Organization state
	const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
	const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(
		null,
	);
	const [orgMembership, setOrgMembership] =
		useState<OrganizationMembership | null>(null);
	const [orgLoading, setOrgLoading] = useState(false);
	const [orgSaving, setOrgSaving] = useState(false);

	// Organization form state
	const [orgTheme, setOrgTheme] = useState<Theme | null>(null);
	const [orgLanguage, setOrgLanguage] = useState<LanguageCode | null>(null);
	const [orgTimezone, setOrgTimezone] = useState<string | null>(null);
	const [orgDateFormat, setOrgDateFormat] = useState<DateFormat | null>(null);
	const [orgAvatarUrl, setOrgAvatarUrl] = useState<string>("");

	// Form state
	const [selectedTimezone, setSelectedTimezone] = useState<string>("UTC");
	const [selectedDateFormat, setSelectedDateFormat] =
		useState<DateFormat>("MM/DD/YYYY");
	const [avatarUrl, setAvatarUrl] = useState<string>("");

	const isOrgOwner = orgMembership?.role === "owner";

	useEffect(() => {
		async function loadSettings() {
			try {
				setLoading(true);
				const data = await getUserSettings();
				setSettings(data);

				// Initialize form with user settings or defaults
				if (data) {
					setSelectedTimezone(
						data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
					);
					setSelectedDateFormat(data.dateFormat || "MM/DD/YYYY");
					setAvatarUrl(data.avatarUrl || "");
				} else {
					setSelectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
				}

				// Get active organization from session
				const sessionResult = await authClient.getSession();
				const orgId = (
					sessionResult.data?.session as { activeOrganizationId?: string }
				)?.activeOrganizationId;
				if (orgId) {
					setActiveOrgId(orgId);
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load settings",
				);
			} finally {
				setLoading(false);
			}
		}
		loadSettings();
	}, []);

	// Load organization settings when activeOrgId changes
	useEffect(() => {
		async function loadOrgSettings() {
			if (!activeOrgId) {
				setOrgSettings(null);
				setOrgMembership(null);
				return;
			}

			try {
				setOrgLoading(true);
				const [settings, membership] = await Promise.all([
					getOrganizationSettings(activeOrgId),
					getOrganizationMembership(activeOrgId),
				]);
				setOrgSettings(settings);
				setOrgMembership(membership);

				// Initialize org form state
				if (settings) {
					setOrgTheme((settings.theme as Theme) || null);
					setOrgLanguage((settings.language as LanguageCode) || null);
					setOrgTimezone(settings.timezone || null);
					setOrgDateFormat((settings.dateFormat as DateFormat) || null);
					setOrgAvatarUrl(settings.avatarUrl || "");
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: t("settings.organization.loadError"),
				);
			} finally {
				setOrgLoading(false);
			}
		}
		loadOrgSettings();
	}, [activeOrgId, t]);

	const handleThemeChange = useCallback(
		async (newTheme: Theme) => {
			setTheme(newTheme);
			try {
				setSaving(true);
				await updateUserSettings({ theme: newTheme });
				setSuccessMessage(t("settings.saved"));
				setTimeout(() => setSuccessMessage(null), 3000);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to save theme");
			} finally {
				setSaving(false);
			}
		},
		[setTheme, t],
	);

	const handleLanguageChange = useCallback(
		async (newLanguage: LanguageCode) => {
			setLanguage(newLanguage);
			try {
				setSaving(true);
				await updateUserSettings({ language: newLanguage });
				setSuccessMessage(t("settings.saved"));
				setTimeout(() => setSuccessMessage(null), 3000);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to save language",
				);
			} finally {
				setSaving(false);
			}
		},
		[setLanguage, t],
	);

	const handleTimezoneChange = useCallback(
		async (newTimezone: string) => {
			setSelectedTimezone(newTimezone);
			try {
				setSaving(true);
				await updateUserSettings({ timezone: newTimezone });
				setSuccessMessage(t("settings.saved"));
				setTimeout(() => setSuccessMessage(null), 3000);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to save timezone",
				);
			} finally {
				setSaving(false);
			}
		},
		[t],
	);

	const handleDateFormatChange = useCallback(
		async (newFormat: DateFormat) => {
			setSelectedDateFormat(newFormat);
			try {
				setSaving(true);
				await updateUserSettings({ dateFormat: newFormat });
				setSuccessMessage(t("settings.saved"));
				setTimeout(() => setSuccessMessage(null), 3000);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to save date format",
				);
			} finally {
				setSaving(false);
			}
		},
		[t],
	);

	const handleAvatarSave = useCallback(async () => {
		try {
			setSaving(true);
			await updateUserSettings({ avatarUrl: avatarUrl || null });
			setSuccessMessage(t("settings.saved"));
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save avatar");
		} finally {
			setSaving(false);
		}
	}, [avatarUrl, t]);

	// Organization settings handlers
	const handleOrgThemeChange = useCallback(
		async (newTheme: Theme | null) => {
			if (!activeOrgId || !isOrgOwner) return;
			setOrgTheme(newTheme);
			try {
				setOrgSaving(true);
				await updateOrganizationSettings(activeOrgId, { theme: newTheme });
				setSuccessMessage(t("settings.organization.savedSuccess"));
				setTimeout(() => setSuccessMessage(null), 3000);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: t("settings.organization.saveError"),
				);
			} finally {
				setOrgSaving(false);
			}
		},
		[activeOrgId, isOrgOwner, t],
	);

	const handleOrgLanguageChange = useCallback(
		async (newLanguage: LanguageCode | null) => {
			if (!activeOrgId || !isOrgOwner) return;
			setOrgLanguage(newLanguage);
			try {
				setOrgSaving(true);
				await updateOrganizationSettings(activeOrgId, {
					language: newLanguage,
				});
				setSuccessMessage(t("settings.organization.savedSuccess"));
				setTimeout(() => setSuccessMessage(null), 3000);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: t("settings.organization.saveError"),
				);
			} finally {
				setOrgSaving(false);
			}
		},
		[activeOrgId, isOrgOwner, t],
	);

	const handleOrgTimezoneChange = useCallback(
		async (newTimezone: string | null) => {
			if (!activeOrgId || !isOrgOwner) return;
			setOrgTimezone(newTimezone);
			try {
				setOrgSaving(true);
				await updateOrganizationSettings(activeOrgId, {
					timezone: newTimezone,
				});
				setSuccessMessage(t("settings.organization.savedSuccess"));
				setTimeout(() => setSuccessMessage(null), 3000);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: t("settings.organization.saveError"),
				);
			} finally {
				setOrgSaving(false);
			}
		},
		[activeOrgId, isOrgOwner, t],
	);

	const handleOrgDateFormatChange = useCallback(
		async (newFormat: DateFormat | null) => {
			if (!activeOrgId || !isOrgOwner) return;
			setOrgDateFormat(newFormat);
			try {
				setOrgSaving(true);
				await updateOrganizationSettings(activeOrgId, {
					dateFormat: newFormat,
				});
				setSuccessMessage(t("settings.organization.savedSuccess"));
				setTimeout(() => setSuccessMessage(null), 3000);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: t("settings.organization.saveError"),
				);
			} finally {
				setOrgSaving(false);
			}
		},
		[activeOrgId, isOrgOwner, t],
	);

	const handleOrgAvatarSave = useCallback(async () => {
		if (!activeOrgId || !isOrgOwner) return;
		try {
			setOrgSaving(true);
			await updateOrganizationSettings(activeOrgId, {
				avatarUrl: orgAvatarUrl || null,
			});
			setSuccessMessage(t("settings.organization.savedSuccess"));
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: t("settings.organization.saveError"),
			);
		} finally {
			setOrgSaving(false);
		}
	}, [activeOrgId, isOrgOwner, orgAvatarUrl, t]);

	if (loading) {
		return (
			<section className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
				<div className="mx-auto flex w-full max-w-4xl items-center justify-center py-20">
					<Spinner className="h-8 w-8" />
				</div>
			</section>
		);
	}

	return (
		<section className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
				{/* Header */}
				<div className="mb-2">
					<h1 className="text-2xl font-bold tracking-tight">
						{t("settings.title")}
					</h1>
					<p className="text-muted-foreground">{t("settings.description")}</p>
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

				{/* Appearance Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Sun className="h-5 w-5" />
							{t("settings.appearance.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.appearance.description")}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label className="text-sm font-medium mb-3 block">
								{t("settings.appearance.theme")}
							</Label>
							<div className="flex gap-2">
								{[
									{
										value: "light",
										icon: Sun,
										label: t("settings.appearance.light"),
									},
									{
										value: "dark",
										icon: Moon,
										label: t("settings.appearance.dark"),
									},
									{
										value: "system",
										icon: Monitor,
										label: t("settings.appearance.system"),
									},
								].map(({ value, icon: Icon, label }) => (
									<Button
										key={value}
										variant={theme === value ? "default" : "outline"}
										size="sm"
										onClick={() => handleThemeChange(value as Theme)}
										disabled={saving}
										className="flex items-center gap-2"
									>
										<Icon className="h-4 w-4" />
										{label}
									</Button>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Localization Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="h-5 w-5" />
							{t("settings.localization.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.localization.description")}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Language */}
						<div>
							<Label className="text-sm font-medium mb-3 block">
								{t("settings.localization.language")}
							</Label>
							<div className="flex gap-2">
								{LANGUAGES.map(({ value, label, flag }) => (
									<Button
										key={value}
										variant={language === value ? "default" : "outline"}
										size="sm"
										onClick={() => handleLanguageChange(value)}
										disabled={saving}
										className="flex items-center gap-2"
									>
										<span>{flag}</span>
										{label}
									</Button>
								))}
							</div>
						</div>

						{/* Timezone */}
						<div>
							<Label className="text-sm font-medium mb-3 block flex items-center gap-2">
								<Clock className="h-4 w-4" />
								{t("settings.localization.timezone")}
							</Label>
							<select
								value={selectedTimezone}
								onChange={(e) => handleTimezoneChange(e.target.value)}
								disabled={saving}
								className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							>
								{TIMEZONES.map((tz) => (
									<option key={tz.value} value={tz.value}>
										{tz.label}
									</option>
								))}
							</select>
						</div>

						{/* Date Format */}
						<div>
							<Label className="text-sm font-medium mb-3 block flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								{t("settings.localization.dateFormat")}
							</Label>
							<div className="flex flex-wrap gap-2">
								{DATE_FORMATS.map(({ value, label, example }) => (
									<Button
										key={value}
										variant={
											selectedDateFormat === value ? "default" : "outline"
										}
										size="sm"
										onClick={() => handleDateFormatChange(value)}
										disabled={saving}
										className="flex flex-col items-center py-3 px-4 h-auto"
									>
										<span className="font-mono text-xs">{label}</span>
										<span className="text-xs text-muted-foreground mt-1">
											{example}
										</span>
									</Button>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Profile Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							{t("settings.profile.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.profile.description")}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label
								htmlFor="avatar-url"
								className="text-sm font-medium mb-2 block"
							>
								{t("settings.profile.avatarUrl")}
							</Label>
							<div className="flex gap-2 max-w-md">
								<Input
									id="avatar-url"
									type="url"
									placeholder="https://example.com/avatar.jpg"
									value={avatarUrl}
									onChange={(e) => setAvatarUrl(e.target.value)}
									disabled={saving}
								/>
								<Button onClick={handleAvatarSave} disabled={saving} size="sm">
									{saving ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										t("settings.save")
									)}
								</Button>
							</div>
							{avatarUrl && (
								<div className="mt-3">
									<img
										src={avatarUrl}
										alt="Avatar preview"
										className="h-16 w-16 rounded-full object-cover border"
										onError={(e) => {
											(e.target as HTMLImageElement).style.display = "none";
										}}
									/>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Payment Methods Section (Placeholder) */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5" />
							{t("settings.payments.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.payments.description")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							{t("settings.payments.comingSoon")}
						</p>
					</CardContent>
				</Card>

				{/* Organization Settings Section */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							{t("settings.organization.title")}
						</CardTitle>
						<CardDescription>
							{t("settings.organization.description")}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{!activeOrgId ? (
							<div className="flex items-center gap-3 text-muted-foreground">
								<AlertCircle className="h-5 w-5" />
								<div>
									<p className="font-medium">
										{t("settings.organization.noOrg")}
									</p>
									<p className="text-sm">
										{t("settings.organization.noOrgDescription")}
									</p>
								</div>
							</div>
						) : orgLoading ? (
							<div className="flex items-center justify-center py-8">
								<Spinner className="h-6 w-6" />
							</div>
						) : (
							<>
								{/* Permission notice */}
								<div
									className={`flex items-start gap-3 p-3 rounded-md ${
										isOrgOwner
											? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
											: "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200"
									}`}
								>
									{isOrgOwner ? (
										<Building2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
									) : (
										<Lock className="h-5 w-5 mt-0.5 flex-shrink-0" />
									)}
									<p className="text-sm">
										{isOrgOwner
											? t("settings.organization.ownerNote")
											: t("settings.organization.viewOnly")}
									</p>
								</div>

								{/* Organization Theme */}
								<div>
									<Label className="text-sm font-medium mb-3 block">
										{t("settings.organization.theme")}
									</Label>
									<div className="flex gap-2">
										{[
											{
												value: "light" as Theme,
												icon: Sun,
												label: t("settings.appearance.light"),
											},
											{
												value: "dark" as Theme,
												icon: Moon,
												label: t("settings.appearance.dark"),
											},
											{
												value: "system" as Theme,
												icon: Monitor,
												label: t("settings.appearance.system"),
											},
										].map(({ value, icon: Icon, label }) => (
											<Button
												key={value}
												variant={orgTheme === value ? "default" : "outline"}
												size="sm"
												onClick={() => handleOrgThemeChange(value)}
												disabled={!isOrgOwner || orgSaving}
												className="flex items-center gap-2"
											>
												<Icon className="h-4 w-4" />
												{label}
											</Button>
										))}
										{orgTheme && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleOrgThemeChange(null)}
												disabled={!isOrgOwner || orgSaving}
												className="text-muted-foreground"
											>
												Clear
											</Button>
										)}
									</div>
								</div>

								{/* Organization Language */}
								<div>
									<Label className="text-sm font-medium mb-3 block">
										{t("settings.organization.language")}
									</Label>
									<div className="flex gap-2">
										{LANGUAGES.map(({ value, label, flag }) => (
											<Button
												key={value}
												variant={orgLanguage === value ? "default" : "outline"}
												size="sm"
												onClick={() => handleOrgLanguageChange(value)}
												disabled={!isOrgOwner || orgSaving}
												className="flex items-center gap-2"
											>
												<span>{flag}</span>
												{label}
											</Button>
										))}
										{orgLanguage && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleOrgLanguageChange(null)}
												disabled={!isOrgOwner || orgSaving}
												className="text-muted-foreground"
											>
												Clear
											</Button>
										)}
									</div>
								</div>

								{/* Organization Timezone */}
								<div>
									<Label className="text-sm font-medium mb-3 block flex items-center gap-2">
										<Clock className="h-4 w-4" />
										{t("settings.organization.timezone")}
									</Label>
									<div className="flex gap-2 items-center">
										<select
											value={orgTimezone || ""}
											onChange={(e) =>
												handleOrgTimezoneChange(e.target.value || null)
											}
											disabled={!isOrgOwner || orgSaving}
											className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
										>
											<option value="">— No default —</option>
											{TIMEZONES.map((tz) => (
												<option key={tz.value} value={tz.value}>
													{tz.label}
												</option>
											))}
										</select>
									</div>
								</div>

								{/* Organization Date Format */}
								<div>
									<Label className="text-sm font-medium mb-3 block flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										{t("settings.organization.dateFormat")}
									</Label>
									<div className="flex flex-wrap gap-2">
										{DATE_FORMATS.map(({ value, label, example }) => (
											<Button
												key={value}
												variant={
													orgDateFormat === value ? "default" : "outline"
												}
												size="sm"
												onClick={() => handleOrgDateFormatChange(value)}
												disabled={!isOrgOwner || orgSaving}
												className="flex flex-col items-center py-3 px-4 h-auto"
											>
												<span className="font-mono text-xs">{label}</span>
												<span className="text-xs text-muted-foreground mt-1">
													{example}
												</span>
											</Button>
										))}
										{orgDateFormat && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleOrgDateFormatChange(null)}
												disabled={!isOrgOwner || orgSaving}
												className="text-muted-foreground self-center"
											>
												Clear
											</Button>
										)}
									</div>
								</div>

								{/* Organization Logo */}
								<div>
									<Label
										htmlFor="org-avatar-url"
										className="text-sm font-medium mb-2 block"
									>
										{t("settings.organization.avatarUrl")}
									</Label>
									<div className="flex gap-2 max-w-md">
										<Input
											id="org-avatar-url"
											type="url"
											placeholder="https://example.com/logo.png"
											value={orgAvatarUrl}
											onChange={(e) => setOrgAvatarUrl(e.target.value)}
											disabled={!isOrgOwner || orgSaving}
										/>
										<Button
											onClick={handleOrgAvatarSave}
											disabled={!isOrgOwner || orgSaving}
											size="sm"
										>
											{orgSaving ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												t("settings.save")
											)}
										</Button>
									</div>
									{orgAvatarUrl && (
										<div className="mt-3">
											<img
												src={orgAvatarUrl}
												alt="Organization logo preview"
												className="h-16 w-16 rounded object-cover border"
												onError={(e) => {
													(e.target as HTMLImageElement).style.display = "none";
												}}
											/>
										</div>
									)}
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
