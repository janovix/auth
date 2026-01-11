"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
	Moon,
	Sun,
	Monitor,
	Clock,
	Calendar,
	Info,
	Loader2,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
				setError(
					err instanceof Error ? err.message : "Failed to load settings",
				);
			} finally {
				setLoading(false);
			}
		}
		loadSettings();
	}, [activeOrgId]);

	const showSuccess = useCallback((message: string) => {
		setSuccessMessage(message);
		setTimeout(() => setSuccessMessage(null), 3000);
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
				setError(err instanceof Error ? err.message : "Failed to save theme");
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
					setError(err instanceof Error ? err.message : "Failed to save theme");
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
				setError(
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
					setError(
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
				setError(
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
					setError(
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
				setError(
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
					setError(
						err instanceof Error ? err.message : "Failed to save date format",
					);
				} finally {
					setSaving(false);
				}
			}
		},
		[orgDefaults.dateFormat, showSuccess, t],
	);

	const handleAvatarSave = useCallback(async () => {
		try {
			setSaving(true);
			await updateUserSettings({ avatarUrl: avatarUrl || null });
			showSuccess(t("settings.saved"));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save avatar");
		} finally {
			setSaving(false);
		}
	}, [avatarUrl, showSuccess, t]);

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
		<div className="space-y-6 sm:space-y-8">
			{/* Header */}
			<div>
				<h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
					{t("settings.personal.title")}
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					{t("settings.personal.description")}
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

			{/* Profile Section */}
			<section className="space-y-4 sm:space-y-6">
				<div>
					<h3 className="text-base sm:text-lg font-medium">
						{t("settings.personal.profile")}
					</h3>
					<p className="text-sm text-muted-foreground">
						{t("settings.personal.profileDesc")}
					</p>
				</div>

				<div className="grid gap-4 sm:gap-6">
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
						<Avatar className="h-16 w-16 sm:h-20 sm:w-20">
							<AvatarImage src={avatarUrl || undefined} />
							<AvatarFallback className="text-lg sm:text-xl bg-primary text-primary-foreground">
								{user?.name
									?.split(" ")
									.map((n: string) => n[0])
									.join("")
									.toUpperCase() || "U"}
							</AvatarFallback>
						</Avatar>
						<div className="space-y-2">
							<div className="flex gap-2 items-center">
								<Input
									type="url"
									placeholder="https://example.com/avatar.jpg"
									value={avatarUrl}
									onChange={(e) => setAvatarUrl(e.target.value)}
									disabled={saving}
									className="w-full max-w-xs"
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={handleAvatarSave}
									disabled={saving}
								>
									{saving ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										t("settings.save")
									)}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								{t("settings.personal.avatarHelp")}
							</p>
						</div>
					</div>

					{/* Name */}
					<div className="grid gap-2">
						<Label htmlFor="name">{t("settings.personal.fullName")}</Label>
						<Input
							id="name"
							value={user?.name || ""}
							disabled
							className="w-full sm:max-w-md bg-muted"
						/>
						<p className="text-xs text-muted-foreground">
							{t("settings.personal.nameHelp")}
						</p>
					</div>

					{/* Email */}
					<div className="grid gap-2">
						<Label htmlFor="email">{t("settings.personal.email")}</Label>
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
							<Input
								id="email"
								value={user?.email || ""}
								disabled
								className="w-full sm:max-w-md bg-muted"
							/>
							{user?.emailVerified && (
								<Badge variant="secondary" className="shrink-0">
									{t("settings.personal.verified")}
								</Badge>
							)}
						</div>
					</div>
				</div>
			</section>

			<Separator />

			{/* Preferences Section */}
			<section className="space-y-4 sm:space-y-6">
				<div>
					<h3 className="text-base sm:text-lg font-medium">
						{t("settings.personal.preferences")}
					</h3>
					<p className="text-sm text-muted-foreground">
						{t("settings.personal.preferencesDesc")}
					</p>
				</div>

				<div className="grid gap-3 sm:gap-4">
					{/* Theme */}
					<Card>
						<CardContent className="p-4">
							<div className="flex flex-col gap-4">
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-center gap-2 min-w-0">
										<Label htmlFor="theme" className="font-medium">
											{t("settings.appearance.theme")}
										</Label>
										{useOrgDefaults.theme && (
											<Badge variant="outline" className="text-xs shrink-0">
												{t("settings.personal.useOrgDefault")}
											</Badge>
										)}
									</div>
									{activeOrgId && (
										<div className="flex items-center gap-2 shrink-0">
											<Label
												htmlFor="theme-default"
												className="text-xs text-muted-foreground hidden sm:inline"
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
								<div className="flex gap-2">
									{THEMES.map(({ value, labelKey, icon: Icon }) => (
										<Button
											key={value}
											variant={
												getEffectiveValue(
													"theme",
													selectedTheme,
													orgDefaults.theme as Theme,
												) === value
													? "default"
													: "outline"
											}
											size="sm"
											onClick={() => handleThemeChange(value)}
											disabled={useOrgDefaults.theme || saving}
											className="flex items-center gap-2"
										>
											<Icon className="h-4 w-4" />
											{t(labelKey)}
										</Button>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Timezone */}
					<Card>
						<CardContent className="p-4">
							<div className="flex flex-col gap-4">
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-center gap-2 min-w-0">
										<Clock className="h-4 w-4" />
										<Label htmlFor="timezone" className="font-medium">
											{t("settings.localization.timezone")}
										</Label>
										{useOrgDefaults.timezone && (
											<Badge variant="outline" className="text-xs shrink-0">
												{t("settings.personal.useOrgDefault")}
											</Badge>
										)}
									</div>
									{activeOrgId && (
										<div className="flex items-center gap-2 shrink-0">
											<Label
												htmlFor="tz-default"
												className="text-xs text-muted-foreground hidden sm:inline"
											>
												{t("settings.personal.useOrgDefault")}
											</Label>
											<Switch
												id="tz-default"
												checked={useOrgDefaults.timezone}
												onCheckedChange={handleTimezoneDefaultToggle}
											/>
										</div>
									)}
								</div>
								<Select
									value={getEffectiveValue(
										"timezone",
										selectedTimezone,
										orgDefaults.timezone,
									)}
									onValueChange={handleTimezoneChange}
									disabled={useOrgDefaults.timezone || saving}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
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
						</CardContent>
					</Card>

					{/* Language */}
					<Card>
						<CardContent className="p-4">
							<div className="flex flex-col gap-4">
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-center gap-2 min-w-0">
										<Label htmlFor="language" className="font-medium">
											{t("settings.localization.language")}
										</Label>
										{useOrgDefaults.language && (
											<Badge variant="outline" className="text-xs shrink-0">
												{t("settings.personal.useOrgDefault")}
											</Badge>
										)}
									</div>
									{activeOrgId && (
										<div className="flex items-center gap-2 shrink-0">
											<Label
												htmlFor="lang-default"
												className="text-xs text-muted-foreground hidden sm:inline"
											>
												{t("settings.personal.useOrgDefault")}
											</Label>
											<Switch
												id="lang-default"
												checked={useOrgDefaults.language}
												onCheckedChange={handleLanguageDefaultToggle}
											/>
										</div>
									)}
								</div>
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
									<SelectTrigger className="w-full">
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
						</CardContent>
					</Card>

					{/* Date Format */}
					<Card>
						<CardContent className="p-4">
							<div className="flex flex-col gap-4">
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-center gap-2 min-w-0">
										<Calendar className="h-4 w-4" />
										<Label htmlFor="dateFormat" className="font-medium">
											{t("settings.localization.dateFormat")}
										</Label>
										{useOrgDefaults.dateFormat && (
											<Badge variant="outline" className="text-xs shrink-0">
												{t("settings.personal.useOrgDefault")}
											</Badge>
										)}
									</div>
									{activeOrgId && (
										<div className="flex items-center gap-2 shrink-0">
											<Label
												htmlFor="date-default"
												className="text-xs text-muted-foreground hidden sm:inline"
											>
												{t("settings.personal.useOrgDefault")}
											</Label>
											<Switch
												id="date-default"
												checked={useOrgDefaults.dateFormat}
												onCheckedChange={handleDateFormatDefaultToggle}
											/>
										</div>
									)}
								</div>
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
									<SelectTrigger className="w-full">
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
								<p className="text-xs text-muted-foreground flex items-center gap-1">
									<Info className="h-3 w-3" />
									{t("settings.personal.dateExample")}:{" "}
									{new Date().toLocaleDateString(
										language === "es" ? "es-MX" : "en-US",
									)}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
