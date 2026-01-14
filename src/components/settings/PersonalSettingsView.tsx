"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
	Moon,
	Sun,
	Monitor,
	Clock,
	Calendar,
	Globe,
	User,
	Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Label, Spinner, Badge } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import {
	getUserSettings,
	updateUserSettings,
	getOrganizationSettings,
	type UserSettings,
	type OrganizationSettings,
	type Theme,
	type LanguageCode,
	type DateFormat,
} from "@/lib/settings";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { getAllTimezoneOptions } from "@/lib/timezones";
import { cn } from "@/lib/utils";
import {
	SettingsCard,
	SettingsSection,
	SettingsPageHeader,
	AvatarUploadDialog,
} from "@/components/settings";

// Get all timezones
const TIMEZONES = getAllTimezoneOptions();

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

export function PersonalSettingsView() {
	const { t, language, setLanguage } = useLanguage();
	const { theme, setTheme } = useTheme();
	const { data: session } = useAuthSession();
	const user = session?.user;

	const [settings, setSettings] = useState<UserSettings | null>(null);
	const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Track which settings use org defaults
	const [useOrgDefaults, setUseOrgDefaults] = useState({
		theme: true,
		timezone: true,
		language: true,
		dateFormat: true,
	});

	// Form state
	const [selectedTheme, setSelectedTheme] = useState<Theme>("system");
	const [selectedTimezone, setSelectedTimezone] = useState<string>("UTC");
	const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
	const [selectedDateFormat, setSelectedDateFormat] =
		useState<DateFormat>("MM/DD/YYYY");
	const [avatarUrl, setAvatarUrl] = useState<string>("");

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	// Org defaults (fallback values when user uses org defaults)
	const orgDefaults = {
		theme: orgSettings?.theme || "system",
		timezone: orgSettings?.timezone || "UTC",
		language: orgSettings?.language || "en",
		dateFormat: orgSettings?.dateFormat || "MM/DD/YYYY",
	};

	// Get user initials for avatar placeholder
	const userInitials =
		user?.name
			?.split(" ")
			.map((n: string) => n[0])
			.join("")
			.toUpperCase() || "U";

	useEffect(() => {
		async function loadSettings() {
			try {
				setLoading(true);
				const data = await getUserSettings();
				setSettings(data);

				// Initialize form with user settings or defaults
				if (data) {
					setUseOrgDefaults({
						theme: data.theme === null,
						timezone: data.timezone === null,
						language: data.language === null,
						dateFormat: data.dateFormat === null,
					});

					setSelectedTheme(data.theme || "system");
					setSelectedTimezone(
						data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
					);
					setSelectedLanguage(data.language || "en");
					setSelectedDateFormat(data.dateFormat || "MM/DD/YYYY");
					setAvatarUrl(data.avatarUrl || "");
				}

				// Load org settings if we have an active org
				if (activeOrgId) {
					const orgData = await getOrganizationSettings(activeOrgId);
					setOrgSettings(orgData);
				}
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to load settings",
				);
			} finally {
				setLoading(false);
			}
		}
		loadSettings();
	}, [activeOrgId]);

	const showSuccess = useCallback((message: string) => {
		toast.success(message);
	}, []);

	const handleThemeChange = useCallback(
		async (newTheme: Theme) => {
			setSelectedTheme(newTheme);
			setTheme(newTheme);
			try {
				setSaving(true);
				await updateUserSettings({ theme: newTheme });
				showSuccess(t("settings.saved"));
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to save theme",
				);
			} finally {
				setSaving(false);
			}
		},
		[setTheme, showSuccess, t],
	);

	const handleThemeDefaultToggle = useCallback(
		async (useDefault: boolean) => {
			setUseOrgDefaults((prev) => ({ ...prev, theme: useDefault }));
			if (useDefault) {
				const defaultTheme = orgDefaults.theme as Theme;
				setSelectedTheme(defaultTheme);
				setTheme(defaultTheme);
				try {
					setSaving(true);
					await updateUserSettings({ theme: null });
					showSuccess(t("settings.saved"));
				} catch (err) {
					toast.error(
						err instanceof Error ? err.message : "Failed to save theme",
					);
				} finally {
					setSaving(false);
				}
			}
		},
		[orgDefaults.theme, setTheme, showSuccess, t],
	);

	const handleTimezoneChange = useCallback(
		async (newTimezone: string) => {
			setSelectedTimezone(newTimezone);
			try {
				setSaving(true);
				await updateUserSettings({ timezone: newTimezone });
				showSuccess(t("settings.saved"));
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to save timezone",
				);
			} finally {
				setSaving(false);
			}
		},
		[showSuccess, t],
	);

	const handleTimezoneDefaultToggle = useCallback(
		async (useDefault: boolean) => {
			setUseOrgDefaults((prev) => ({ ...prev, timezone: useDefault }));
			if (useDefault) {
				setSelectedTimezone(orgDefaults.timezone);
				try {
					setSaving(true);
					await updateUserSettings({ timezone: null });
					showSuccess(t("settings.saved"));
				} catch (err) {
					toast.error(
						err instanceof Error ? err.message : "Failed to save timezone",
					);
				} finally {
					setSaving(false);
				}
			}
		},
		[orgDefaults.timezone, showSuccess, t],
	);

	const handleLanguageChange = useCallback(
		async (newLanguage: LanguageCode) => {
			setSelectedLanguage(newLanguage);
			setLanguage(newLanguage);
			try {
				setSaving(true);
				await updateUserSettings({ language: newLanguage });
				showSuccess(t("settings.saved"));
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to save language",
				);
			} finally {
				setSaving(false);
			}
		},
		[setLanguage, showSuccess, t],
	);

	const handleLanguageDefaultToggle = useCallback(
		async (useDefault: boolean) => {
			setUseOrgDefaults((prev) => ({ ...prev, language: useDefault }));
			if (useDefault) {
				const defaultLang = orgDefaults.language as LanguageCode;
				setSelectedLanguage(defaultLang);
				setLanguage(defaultLang);
				try {
					setSaving(true);
					await updateUserSettings({ language: null });
					showSuccess(t("settings.saved"));
				} catch (err) {
					toast.error(
						err instanceof Error ? err.message : "Failed to save language",
					);
				} finally {
					setSaving(false);
				}
			}
		},
		[orgDefaults.language, setLanguage, showSuccess, t],
	);

	const handleDateFormatChange = useCallback(
		async (newFormat: DateFormat) => {
			setSelectedDateFormat(newFormat);
			try {
				setSaving(true);
				await updateUserSettings({ dateFormat: newFormat });
				showSuccess(t("settings.saved"));
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to save date format",
				);
			} finally {
				setSaving(false);
			}
		},
		[showSuccess, t],
	);

	const handleDateFormatDefaultToggle = useCallback(
		async (useDefault: boolean) => {
			setUseOrgDefaults((prev) => ({ ...prev, dateFormat: useDefault }));
			if (useDefault) {
				setSelectedDateFormat(orgDefaults.dateFormat as DateFormat);
				try {
					setSaving(true);
					await updateUserSettings({ dateFormat: null });
					showSuccess(t("settings.saved"));
				} catch (err) {
					toast.error(
						err instanceof Error ? err.message : "Failed to save date format",
					);
				} finally {
					setSaving(false);
				}
			}
		},
		[orgDefaults.dateFormat, showSuccess, t],
	);

	const handleAvatarUploadSuccess = useCallback(
		async (url: string) => {
			setAvatarUrl(url);
			try {
				setSaving(true);
				await updateUserSettings({ avatarUrl: url });
				showSuccess(t("settings.saved"));
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to save avatar",
				);
			} finally {
				setSaving(false);
			}
		},
		[showSuccess, t],
	);

	const getEffectiveValue = <T,>(
		key: keyof typeof useOrgDefaults,
		userValue: T | null,
		orgDefault: T,
	): T => {
		return useOrgDefaults[key] ? orgDefault : (userValue ?? orgDefault);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Spinner className="h-8 w-8" />
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<SettingsPageHeader
				icon={User}
				title={t("settings.personal.title")}
				description={t("settings.personal.description")}
			/>

			{/* Profile Section */}
			<SettingsSection
				title={t("settings.personal.profile")}
				description={t("settings.personal.profileDesc")}
			>
				<SettingsCard>
					<div className="flex flex-col sm:flex-row gap-6">
						{/* Avatar */}
						<div className="flex flex-col items-center gap-3">
							<Avatar className="h-20 w-20">
								<AvatarImage src={avatarUrl || undefined} />
								<AvatarFallback className="bg-primary text-primary-foreground text-xl">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							<AvatarUploadDialog
								trigger={
									<Button variant="outline" size="sm">
										{t("settings.personal.changeAvatar") || "Change Avatar"}
									</Button>
								}
								initials={userInitials}
								currentAvatarUrl={avatarUrl}
								onUploadSuccess={handleAvatarUploadSuccess}
								title={t("settings.avatar.title")}
								description={t("settings.avatar.description")}
							/>
						</div>

						{/* Form Fields */}
						<div className="flex-1 space-y-4">
							<div className="space-y-2">
								<Label htmlFor="fullName">
									{t("settings.personal.fullName")}
								</Label>
								<Input
									id="fullName"
									defaultValue={user?.name || ""}
									disabled
									className="bg-muted"
								/>
								<p className="text-xs text-muted-foreground">
									{t("settings.personal.nameHelp")}
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">{t("settings.personal.email")}</Label>
								<div className="flex gap-2">
									<Input
										id="email"
										defaultValue={user?.email || ""}
										disabled
										className="bg-muted flex-1"
									/>
									{user?.emailVerified && (
										<Badge
											variant="secondary"
											className="shrink-0 bg-success/10 text-success border-success/20"
										>
											<Check className="h-3 w-3 mr-1" />
											{t("settings.personal.verified")}
										</Badge>
									)}
								</div>
							</div>
						</div>
					</div>
				</SettingsCard>
			</SettingsSection>

			{/* Preferences Section */}
			<SettingsSection
				title={t("settings.personal.preferences")}
				description={t("settings.personal.preferencesDesc")}
			>
				{/* Theme */}
				<SettingsCard className="mb-4">
					<div className="space-y-3">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h4 className="text-sm font-medium text-foreground">
									{t("settings.appearance.theme")}
								</h4>
								<p className="text-sm text-muted-foreground">
									{t("settings.personal.themeDesc") ||
										"Select your preferred color scheme"}
								</p>
							</div>
							{activeOrgId && (
								<div className="flex items-center gap-2 shrink-0">
									<Label
										htmlFor="theme-default"
										className="text-xs text-muted-foreground"
									>
										{t("settings.personal.useOrgDefault")}
									</Label>
									<Switch
										id="theme-default"
										checked={useOrgDefaults.theme}
										onCheckedChange={handleThemeDefaultToggle}
									/>
								</div>
							)}
						</div>
						<div className="grid grid-cols-3 gap-2 p-1 bg-secondary rounded-lg border border-border">
							{THEMES.map(({ value, labelKey, icon: Icon }) => (
								<button
									key={value}
									type="button"
									onClick={() => handleThemeChange(value)}
									disabled={useOrgDefaults.theme || saving}
									className={cn(
										"flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-md text-sm font-medium transition-all",
										"disabled:opacity-50 disabled:cursor-not-allowed",
										getEffectiveValue(
											"theme",
											selectedTheme,
											orgDefaults.theme as Theme,
										) === value
											? "bg-card text-foreground shadow-sm"
											: "text-muted-foreground hover:text-foreground hover:bg-card/50",
									)}
								>
									<Icon className="h-5 w-5" />
									<span>{t(labelKey)}</span>
								</button>
							))}
						</div>
					</div>
				</SettingsCard>

				{/* Timezone */}
				<SettingsCard className="mb-4">
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div>
								<h4 className="text-sm font-medium text-foreground">
									{t("settings.localization.timezone")}
								</h4>
								<p className="text-sm text-muted-foreground">
									{t("settings.personal.timezoneDesc") ||
										"Used for displaying dates and times"}
								</p>
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							{activeOrgId && (
								<div className="flex items-center gap-2">
									<Label
										htmlFor="orgTimezone"
										className="text-xs text-muted-foreground"
									>
										{t("settings.personal.useOrgDefault")}
									</Label>
									<Switch
										id="orgTimezone"
										checked={useOrgDefaults.timezone}
										onCheckedChange={handleTimezoneDefaultToggle}
									/>
								</div>
							)}
							<Select
								value={getEffectiveValue(
									"timezone",
									selectedTimezone,
									orgDefaults.timezone,
								)}
								onValueChange={handleTimezoneChange}
								disabled={useOrgDefaults.timezone || saving}
							>
								<SelectTrigger className="w-[220px]">
									<SelectValue placeholder="Select timezone" />
								</SelectTrigger>
								<SelectContent className="max-h-[300px]">
									{TIMEZONES.map((tz) => (
										<SelectItem key={tz.value} value={tz.value}>
											{tz.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</SettingsCard>

				{/* Language */}
				<SettingsCard className="mb-4">
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div>
								<h4 className="text-sm font-medium text-foreground">
									{t("settings.localization.language")}
								</h4>
								<p className="text-sm text-muted-foreground">
									{t("settings.personal.languageDesc") ||
										"Interface display language"}
								</p>
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							{activeOrgId && (
								<div className="flex items-center gap-2">
									<Label
										htmlFor="orgLanguage"
										className="text-xs text-muted-foreground"
									>
										{t("settings.personal.useOrgDefault")}
									</Label>
									<Switch
										id="orgLanguage"
										checked={useOrgDefaults.language}
										onCheckedChange={handleLanguageDefaultToggle}
									/>
								</div>
							)}
							<Select
								value={getEffectiveValue(
									"language",
									selectedLanguage,
									orgDefaults.language as LanguageCode,
								)}
								onValueChange={(v: string) =>
									handleLanguageChange(v as LanguageCode)
								}
								disabled={useOrgDefaults.language || saving}
							>
								<SelectTrigger className="w-[220px]">
									<SelectValue placeholder="Select language" />
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
					</div>
				</SettingsCard>

				{/* Date Format */}
				<SettingsCard>
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div>
								<h4 className="text-sm font-medium text-foreground">
									{t("settings.localization.dateFormat")}
								</h4>
								<p className="text-sm text-muted-foreground">
									{t("settings.personal.dateFormatDesc") ||
										"How dates are displayed"}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{t("settings.personal.dateExample")}:{" "}
									{new Date().toLocaleDateString(
										language === "es" ? "es-MX" : "en-US",
									)}
								</p>
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							{activeOrgId && (
								<div className="flex items-center gap-2">
									<Label
										htmlFor="orgDateFormat"
										className="text-xs text-muted-foreground"
									>
										{t("settings.personal.useOrgDefault")}
									</Label>
									<Switch
										id="orgDateFormat"
										checked={useOrgDefaults.dateFormat}
										onCheckedChange={handleDateFormatDefaultToggle}
									/>
								</div>
							)}
							<Select
								value={getEffectiveValue(
									"dateFormat",
									selectedDateFormat,
									orgDefaults.dateFormat as DateFormat,
								)}
								onValueChange={(v: string) =>
									handleDateFormatChange(v as DateFormat)
								}
								disabled={useOrgDefaults.dateFormat || saving}
							>
								<SelectTrigger className="w-[220px]">
									<SelectValue placeholder="Select format" />
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
				</SettingsCard>
			</SettingsSection>
		</div>
	);
}
