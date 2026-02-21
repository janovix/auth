"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
	Moon,
	Sun,
	Monitor,
	Calendar,
	Languages,
	User,
	Check,
	PanelLeftClose,
	Globe,
	Clock,
	Fingerprint,
	Trash2,
	Pencil,
	Plus,
	ShieldCheck,
	ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Label, Badge } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
	getUserSettings,
	updateUserSettings,
	getOrganizationSettings,
	updateUIPreferences,
	type UserSettings,
	type OrganizationSettings,
	type Theme,
	type LanguageCode,
	type DateFormat,
	type ClockFormat,
} from "@/lib/settings";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { authClient } from "@/lib/auth/authClient";
import type { Passkey } from "@better-auth/passkey/client";
import { cn } from "@/lib/utils";
import {
	SettingsCard,
	SettingsSection,
	SettingsPageHeader,
	PersonalSettingsViewSkeleton,
} from "@/components/settings";
import { AvatarEditorDialog } from "@algenium/blocks";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";
import { updateProfile } from "@/lib/auth/authActions";

const DATE_FORMATS: { value: DateFormat; label: string }[] = [
	{ value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
	{ value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
	{ value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
	{ value: "DD.MM.YYYY", label: "DD.MM.YYYY" },
];

const THEMES: { value: Theme; labelKey: string; icon: typeof Sun }[] = [
	{ value: "system", labelKey: "settings.appearance.system", icon: Monitor },
	{ value: "light", labelKey: "settings.appearance.light", icon: Sun },
	{ value: "dark", labelKey: "settings.appearance.dark", icon: Moon },
];

const LANGUAGES: { value: LanguageCode; labelKey: string }[] = [
	{ value: "es", labelKey: "settings.personal.spanish" },
	{ value: "en", labelKey: "settings.personal.english" },
];

const CLOCK_FORMATS: { value: ClockFormat; label: string }[] = [
	{ value: "12h", label: "12-hour (AM/PM)" },
	{ value: "24h", label: "24-hour" },
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
		clockFormat: true,
	});

	// Form state
	const [selectedTheme, setSelectedTheme] = useState<Theme>("system");
	const [selectedTimezone, setSelectedTimezone] = useState<string>("UTC");
	const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
	const [selectedDateFormat, setSelectedDateFormat] =
		useState<DateFormat>("MM/DD/YYYY");
	const [selectedClockFormat, setSelectedClockFormat] =
		useState<ClockFormat>("12h");
	// Avatar URL: prefer user.image (Better Auth), fallback to settings.avatarUrl
	const [avatarUrl, setAvatarUrl] = useState<string | null>(
		user?.image || null,
	);
	const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

	// Passkey state
	const MAX_PASSKEYS = 5;
	const [passkeys, setPasskeys] = useState<Passkey[]>([]);
	const [passkeysLoading, setPasskeysLoading] = useState(false);
	const [addPasskeyOpen, setAddPasskeyOpen] = useState(false);
	const [newPasskeyName, setNewPasskeyName] = useState("");
	const [newPasskeyAttachment, setNewPasskeyAttachment] = useState<
		"platform" | "cross-platform" | undefined
	>(undefined);
	const [addingPasskey, setAddingPasskey] = useState(false);
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [renameOpen, setRenameOpen] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	// Org defaults (fallback values when user uses org defaults)
	const orgDefaults = {
		theme: orgSettings?.theme || "system",
		timezone: orgSettings?.timezone || "UTC",
		language: orgSettings?.language || "en",
		dateFormat: orgSettings?.dateFormat || "MM/DD/YYYY",
		clockFormat: orgSettings?.clockFormat || "12h",
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
						clockFormat: data.clockFormat === null,
					});

					setSelectedTheme(data.theme || "system");
					setSelectedTimezone(
						data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
					);
					setSelectedLanguage(data.language || "en");
					setSelectedDateFormat(data.dateFormat || "MM/DD/YYYY");
					setSelectedClockFormat(data.clockFormat || "12h");
					// Prefer user.image (Better Auth) over settings.avatarUrl
					setAvatarUrl(user?.image || data.avatarUrl || null);
					setSidebarCollapsed(data.metadata?.sidebarCollapsed ?? false);
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
	}, [activeOrgId, user?.image]);

	// Load passkeys
	useEffect(() => {
		async function loadPasskeys() {
			setPasskeysLoading(true);
			try {
				const { data } = await authClient.passkey.listUserPasskeys();
				setPasskeys(data ?? []);
			} catch {
				// Non-critical: passkeys may not be supported in some environments
			} finally {
				setPasskeysLoading(false);
			}
		}
		loadPasskeys();
	}, []);

	const handleAddPasskey = useCallback(async () => {
		setAddingPasskey(true);
		try {
			const { data, error } = await authClient.passkey.addPasskey({
				name: newPasskeyName.trim() || undefined,
				authenticatorAttachment: newPasskeyAttachment,
			});
			if (error) {
				toast.error(t("settings.personal.passkeys.addError"));
				return;
			}
			if (data) {
				setPasskeys((prev) => [...prev, data]);
			}
			toast.success(t("settings.personal.passkeys.addSuccess"));
			setAddPasskeyOpen(false);
			setNewPasskeyName("");
			setNewPasskeyAttachment(undefined);
		} catch {
			toast.error(t("settings.personal.passkeys.addError"));
		} finally {
			setAddingPasskey(false);
		}
	}, [newPasskeyName, newPasskeyAttachment, t]);

	const handleDeletePasskey = useCallback(
		async (id: string) => {
			setDeletingId(id);
			try {
				const { error } = await authClient.passkey.deletePasskey({ id });
				if (error) {
					toast.error(t("settings.personal.passkeys.deleteError"));
					return;
				}
				setPasskeys((prev) => prev.filter((p) => p.id !== id));
				toast.success(t("settings.personal.passkeys.deleteSuccess"));
			} catch {
				toast.error(t("settings.personal.passkeys.deleteError"));
			} finally {
				setDeletingId(null);
			}
		},
		[t],
	);

	const handleOpenRename = useCallback((pk: Passkey) => {
		setRenamingId(pk.id);
		setRenameValue(pk.name ?? "");
		setRenameOpen(true);
	}, []);

	const handleRenamePasskey = useCallback(async () => {
		if (!renamingId) return;
		try {
			const { error } = await authClient.passkey.updatePasskey({
				id: renamingId,
				name: renameValue.trim(),
			});
			if (error) {
				toast.error(t("settings.personal.passkeys.renameError"));
				return;
			}
			setPasskeys((prev) =>
				prev.map((p) =>
					p.id === renamingId ? { ...p, name: renameValue.trim() } : p,
				),
			);
			toast.success(t("settings.personal.passkeys.renameSuccess"));
			setRenameOpen(false);
			setRenamingId(null);
		} catch {
			toast.error(t("settings.personal.passkeys.renameError"));
		}
	}, [renamingId, renameValue, t]);

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
				// Dispatch event to update navbar clock immediately
				window.dispatchEvent(
					new CustomEvent("timezone-change", {
						detail: { timezone: newTimezone },
					}),
				);
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
					// Dispatch event to update navbar clock to org timezone
					window.dispatchEvent(
						new CustomEvent("timezone-change", {
							detail: { timezone: orgDefaults.timezone },
						}),
					);
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

	const handleClockFormatChange = useCallback(
		async (newFormat: ClockFormat) => {
			setSelectedClockFormat(newFormat);
			try {
				setSaving(true);
				await updateUserSettings({ clockFormat: newFormat });
				// Dispatch event to update navbar clock immediately
				window.dispatchEvent(
					new CustomEvent("clock-format-change", {
						detail: { clockFormat: newFormat },
					}),
				);
				showSuccess(t("settings.saved"));
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to save clock format",
				);
			} finally {
				setSaving(false);
			}
		},
		[showSuccess, t],
	);

	const handleClockFormatDefaultToggle = useCallback(
		async (useDefault: boolean) => {
			setUseOrgDefaults((prev) => ({ ...prev, clockFormat: useDefault }));
			if (useDefault) {
				const defaultFormat = orgDefaults.clockFormat as ClockFormat;
				setSelectedClockFormat(defaultFormat);
				try {
					setSaving(true);
					await updateUserSettings({ clockFormat: null });
					// Dispatch event to update navbar clock to org clock format
					window.dispatchEvent(
						new CustomEvent("clock-format-change", {
							detail: { clockFormat: defaultFormat },
						}),
					);
					showSuccess(t("settings.saved"));
				} catch (err) {
					toast.error(
						err instanceof Error ? err.message : "Failed to save clock format",
					);
				} finally {
					setSaving(false);
				}
			}
		},
		[orgDefaults.clockFormat, showSuccess, t],
	);

	/**
	 * Convert a data URL to a Blob for uploading.
	 */
	const dataURLtoBlob = useCallback((dataUrl: string): Blob => {
		const arr = dataUrl.split(",");
		const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], { type: mime });
	}, []);

	// Handle avatar save via the new AvatarEditorDialog
	const handleAvatarSave = useCallback(
		async (dataUrl: string): Promise<boolean> => {
			try {
				setSaving(true);
				const baseUrl = getAuthCoreBaseUrl();
				const blob = dataURLtoBlob(dataUrl);
				const formData = new FormData();
				formData.append("file", blob, "avatar.png");

				const response = await fetch(`${baseUrl}/api/upload/avatar`, {
					method: "POST",
					credentials: "include",
					body: formData,
				});

				if (!response.ok) {
					return false;
				}

				const result = (await response.json()) as {
					success: boolean;
					data?: { url: string };
					error?: string;
				};

				if (!result.success || !result.data?.url) {
					return false;
				}

				const uploadedUrl = result.data.url;

				// Update Better Auth user's image
				await updateProfile({ image: uploadedUrl });

				// Update user settings with the avatar URL
				setAvatarUrl(uploadedUrl);
				await updateUserSettings({ avatarUrl: uploadedUrl });

				showSuccess(t("settings.saved"));
				return true;
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to save avatar",
				);
				return false;
			} finally {
				setSaving(false);
			}
		},
		[dataURLtoBlob, showSuccess, t],
	);

	const handleSidebarCollapsedChange = useCallback(
		async (collapsed: boolean) => {
			setSidebarCollapsed(collapsed);
			try {
				setSaving(true);
				await updateUIPreferences({ sidebarCollapsed: collapsed });
				// Dispatch event to update the current sidebar state immediately
				window.dispatchEvent(
					new CustomEvent("sidebar-collapsed-change", {
						detail: { collapsed },
					}),
				);
				showSuccess(t("settings.saved"));
			} catch (err) {
				toast.error(
					err instanceof Error
						? err.message
						: "Failed to save sidebar preference",
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
		return <PersonalSettingsViewSkeleton />;
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
						{/* Avatar with Editor Dialog */}
						<div className="flex flex-col items-center gap-3">
							<AvatarEditorDialog
								value={avatarUrl}
								onChange={setAvatarUrl}
								onSave={handleAvatarSave}
								displaySize={80}
								editorSize={280}
								outputSize={256}
								placeholder={userInitials}
								editLabel={
									t("settings.personal.changeAvatar") || "Change Avatar"
								}
								dialogTitle={t("settings.avatar.title") || "Edit Avatar"}
								acceptText={t("common.accept") || "Accept"}
								cancelText={t("common.cancel") || "Cancel"}
								successMessage={
									t("settings.avatar.success") || "Avatar saved successfully!"
								}
								errorMessage={
									t("settings.avatar.error") ||
									"Failed to save avatar. Please try again."
								}
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
								<p className="text-xs text-muted-foreground">
									{t("settings.personal.emailHelp")}
								</p>
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
							<Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div className="space-y-3 flex-1">
								<div>
									<h4 className="text-sm font-medium text-foreground">
										{t("settings.localization.timezone")}
									</h4>
									<p className="text-sm text-muted-foreground">
										{t("settings.personal.timezoneDesc") ||
											"Used for displaying dates and times"}
									</p>
								</div>
								<TimezonePicker
									value={getEffectiveValue(
										"timezone",
										selectedTimezone,
										orgDefaults.timezone,
									)}
									onChange={handleTimezoneChange}
									disabled={useOrgDefaults.timezone || saving}
								/>
							</div>
						</div>
						{activeOrgId && (
							<div className="flex items-center gap-2 shrink-0">
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
					</div>
				</SettingsCard>

				{/* Language */}
				<SettingsCard className="mb-4">
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<Languages className="h-5 w-5 text-muted-foreground mt-0.5" />
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
				<SettingsCard className="mb-4">
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

				{/* Clock Format */}
				<SettingsCard>
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div>
								<h4 className="text-sm font-medium text-foreground">
									{t("settings.personal.clockFormat")}
								</h4>
								<p className="text-sm text-muted-foreground">
									{t("settings.personal.clockFormatDesc") ||
										"How time is displayed"}
								</p>
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							{activeOrgId && (
								<div className="flex items-center gap-2">
									<Label
										htmlFor="orgClockFormat"
										className="text-xs text-muted-foreground"
									>
										{t("settings.personal.useOrgDefault")}
									</Label>
									<Switch
										id="orgClockFormat"
										checked={useOrgDefaults.clockFormat}
										onCheckedChange={handleClockFormatDefaultToggle}
									/>
								</div>
							)}
							<Select
								value={getEffectiveValue(
									"clockFormat",
									selectedClockFormat,
									orgDefaults.clockFormat as ClockFormat,
								)}
								onValueChange={(v: string) =>
									handleClockFormatChange(v as ClockFormat)
								}
								disabled={useOrgDefaults.clockFormat || saving}
							>
								<SelectTrigger className="w-[220px]">
									<SelectValue placeholder="Select format" />
								</SelectTrigger>
								<SelectContent>
									{CLOCK_FORMATS.map((fmt) => (
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

			{/* Interface Section */}
			<SettingsSection
				title={t("settings.personal.interface")}
				description={t("settings.personal.interfaceDesc")}
			>
				{/* Sidebar Collapsed */}
				<SettingsCard>
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							<PanelLeftClose className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div>
								<h4 className="text-sm font-medium text-foreground">
									{t("settings.personal.sidebarCollapsed")}
								</h4>
								<p className="text-sm text-muted-foreground">
									{t("settings.personal.sidebarCollapsedDesc")}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								id="sidebarCollapsed"
								checked={sidebarCollapsed}
								onCheckedChange={handleSidebarCollapsedChange}
								disabled={saving}
							/>
						</div>
					</div>
				</SettingsCard>
			</SettingsSection>

			{/* Passkeys Section */}
			<SettingsSection
				title={t("settings.personal.passkeys.title")}
				description={t("settings.personal.passkeys.description")}
			>
				{/* Add passkey button */}
				<div className="flex justify-end mb-2">
					<Dialog open={addPasskeyOpen} onOpenChange={setAddPasskeyOpen}>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								disabled={passkeys.length >= MAX_PASSKEYS || passkeysLoading}
								className="gap-2"
							>
								<Plus className="h-4 w-4" />
								{t("settings.personal.passkeys.add")}
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>{t("settings.personal.passkeys.add")}</DialogTitle>
								<DialogDescription>
									{t("settings.personal.passkeys.addDesc")}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-2">
								<div className="space-y-2">
									<Label htmlFor="passkey-name">
										{t("settings.personal.passkeys.name")}
									</Label>
									<Input
										id="passkey-name"
										placeholder={t(
											"settings.personal.passkeys.namePlaceholder",
										)}
										value={newPasskeyName}
										onChange={(e) => setNewPasskeyName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !addingPasskey) {
												handleAddPasskey();
											}
										}}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="passkey-type">
										{t("settings.personal.passkeys.authenticatorType")}
									</Label>
									<Select
										value={newPasskeyAttachment ?? "any"}
										onValueChange={(v) => {
											setNewPasskeyAttachment(
												v === "any"
													? undefined
													: (v as "platform" | "cross-platform"),
											);
										}}
									>
										<SelectTrigger id="passkey-type">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="any">
												{t("settings.personal.passkeys.any")}
											</SelectItem>
											<SelectItem value="platform">
												{t("settings.personal.passkeys.platform")}
											</SelectItem>
											<SelectItem value="cross-platform">
												{t("settings.personal.passkeys.crossPlatform")}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setAddPasskeyOpen(false)}
									disabled={addingPasskey}
								>
									{t("common.cancel")}
								</Button>
								<Button onClick={handleAddPasskey} disabled={addingPasskey}>
									<Fingerprint className="mr-2 h-4 w-4" />
									{addingPasskey
										? `${t("settings.personal.passkeys.add")}...`
										: t("settings.personal.passkeys.add")}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{/* Max reached notice */}
				{passkeys.length >= MAX_PASSKEYS && (
					<div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground mb-2">
						{t("settings.personal.passkeys.maxReachedDesc")}
					</div>
				)}

				{/* Passkeys list */}
				{passkeysLoading ? (
					<SettingsCard>
						<div className="flex items-center gap-3 py-2">
							<Fingerprint className="h-5 w-5 text-muted-foreground animate-pulse" />
							<div className="h-4 w-48 bg-muted rounded animate-pulse" />
						</div>
					</SettingsCard>
				) : passkeys.length === 0 ? (
					<SettingsCard>
						<div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
							<Fingerprint className="h-8 w-8 text-muted-foreground/50" />
							<p className="text-sm font-medium text-foreground">
								{t("settings.personal.passkeys.noPasskeys")}
							</p>
							<p className="text-xs text-muted-foreground">
								{t("settings.personal.passkeys.noPasskeysDesc")}
							</p>
						</div>
					</SettingsCard>
				) : (
					<div className="space-y-2">
						{passkeys.map((pk) => (
							<SettingsCard key={pk.id}>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									<div className="flex items-start gap-3">
										<Fingerprint className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
										<div className="min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<h4 className="text-sm font-medium text-foreground truncate">
													{pk.name ||
														`${t("settings.personal.passkeys.deviceType")}: ${pk.deviceType}`}
												</h4>
												{pk.backedUp ? (
													<Badge variant="secondary" className="gap-1 text-xs">
														<ShieldCheck className="h-3 w-3" />
														{t("settings.personal.passkeys.backedUp")}
													</Badge>
												) : (
													<Badge
														variant="outline"
														className="gap-1 text-xs text-muted-foreground"
													>
														<ShieldOff className="h-3 w-3" />
														{t("settings.personal.passkeys.notBackedUp")}
													</Badge>
												)}
											</div>
											<p className="text-xs text-muted-foreground mt-0.5">
												{t("settings.personal.passkeys.deviceType")}:{" "}
												{pk.deviceType}
												{pk.createdAt && (
													<>
														{" · "}
														{t("settings.personal.passkeys.createdAt")}:{" "}
														{new Date(pk.createdAt).toLocaleDateString()}
													</>
												)}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-1 shrink-0">
										{/* Rename button */}
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => handleOpenRename(pk)}
											title={t("settings.personal.passkeys.rename")}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										{/* Delete button */}
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-destructive hover:text-destructive"
													disabled={deletingId === pk.id}
													title={t("settings.personal.passkeys.delete")}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														{t("settings.personal.passkeys.deleteConfirm")}
													</AlertDialogTitle>
													<AlertDialogDescription>
														{t("settings.personal.passkeys.deleteConfirmDesc")}
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>
														{t("common.cancel")}
													</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleDeletePasskey(pk.id)}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														{t("settings.personal.passkeys.delete")}
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							</SettingsCard>
						))}
					</div>
				)}
			</SettingsSection>

			{/* Rename passkey dialog */}
			<Dialog open={renameOpen} onOpenChange={setRenameOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{t("settings.personal.passkeys.renameTitle")}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-2 py-2">
						<Label htmlFor="rename-passkey">
							{t("settings.personal.passkeys.newName")}
						</Label>
						<Input
							id="rename-passkey"
							value={renameValue}
							onChange={(e) => setRenameValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleRenamePasskey();
							}}
							autoFocus
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRenameOpen(false)}>
							{t("common.cancel")}
						</Button>
						<Button
							onClick={handleRenamePasskey}
							disabled={!renameValue.trim()}
						>
							{t("settings.personal.passkeys.rename")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
