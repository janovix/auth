"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Copy, Check, Trash2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button, Label } from "@/components/ui";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TimezonePicker } from "@/components/ui/timezone-picker";
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
import {
	SettingsCard,
	SettingsSection,
	SettingsPageHeader,
	OrganizationSettingsViewSkeleton,
} from "@/components/settings";
import { AvatarEditorDialog } from "@/components/ui/avatar-editor-dialog";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";

const DATE_FORMATS: { value: DateFormat; label: string }[] = [
	{ value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
	{ value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
	{ value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
	{ value: "DD.MM.YYYY", label: "DD.MM.YYYY" },
];

const THEMES: { value: Theme; labelKey: string }[] = [
	{ value: "light", labelKey: "settings.appearance.light" },
	{ value: "dark", labelKey: "settings.appearance.dark" },
	{ value: "system", labelKey: "settings.appearance.system" },
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
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
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
	const [orgLogo, setOrgLogo] = useState<string | null>("");
	const [selectedTheme, setSelectedTheme] = useState<Theme>("system");
	const [selectedTimezone, setSelectedTimezone] = useState<string>("UTC");
	const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
	const [selectedDateFormat, setSelectedDateFormat] =
		useState<DateFormat>("MM/DD/YYYY");

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	const isOwner = membership?.role === "owner";

	// Get org initials for avatar placeholder
	const orgInitials = orgData?.name?.substring(0, 2).toUpperCase() || "ORG";

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
				toast.error(
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
		toast.success(message);
	}, []);

	const copyOrgId = () => {
		if (orgData?.id) {
			navigator.clipboard.writeText(orgData.id);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

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

	// Handle logo save via the new AvatarEditorDialog
	const handleLogoSave = useCallback(
		async (dataUrl: string): Promise<boolean> => {
			if (!activeOrgId || !isOwner) return false;

			try {
				setSaving(true);
				const baseUrl = getAuthCoreBaseUrl();
				const blob = dataURLtoBlob(dataUrl);
				const formData = new FormData();
				formData.append("file", blob, "logo.png");

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

				// Update state with the uploaded URL
				setOrgLogo(result.data.url);
				await updateOrganizationSettings(activeOrgId, {
					avatarUrl: result.data.url,
				});
				showSuccess(t("settings.organization.savedSuccess"));
				return true;
			} catch (err) {
				toast.error(
					err instanceof Error
						? err.message
						: t("settings.organization.saveError"),
				);
				return false;
			} finally {
				setSaving(false);
			}
		},
		[activeOrgId, isOwner, dataURLtoBlob, showSuccess, t],
	);

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
			toast.error(
				err instanceof Error
					? err.message
					: t("settings.organization.saveError"),
			);
		} finally {
			setSaving(false);
		}
	}, [activeOrgId, isOwner, orgName, orgSlug, showSuccess, t]);

	const handleThemeChange = useCallback(
		async (newTheme: Theme) => {
			if (!activeOrgId || !isOwner) return;
			setSelectedTheme(newTheme);
			try {
				setSaving(true);
				await updateOrganizationSettings(activeOrgId, { theme: newTheme });
				showSuccess(t("settings.organization.savedSuccess"));
			} catch (err) {
				toast.error(
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
				toast.error(
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
				toast.error(
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
				toast.error(
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

	if (loading) {
		return <OrganizationSettingsViewSkeleton />;
	}

	const createOrgAction = (
		<Button onClick={() => router.push("/settings/organization/new")}>
			<Plus className="h-4 w-4 mr-2" />
			{t("settings.nav.createOrganization")}
		</Button>
	);

	if (!activeOrgId) {
		return (
			<div className="space-y-8">
				<SettingsPageHeader
					icon={Building2}
					title={t("settings.org.title")}
					description={t("settings.organization.noOrg")}
					action={createOrgAction}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<SettingsPageHeader
				icon={Building2}
				title={t("settings.org.title")}
				description={t("settings.org.description")}
				action={createOrgAction}
			/>

			{/* Organization Profile */}
			<SettingsSection
				title={t("settings.org.profile")}
				description={t("settings.org.profileDesc")}
			>
				<SettingsCard>
					<div className="space-y-6">
						{/* Logo with Editor Dialog */}
						<div className="flex flex-col sm:flex-row gap-6">
							<div className="flex flex-col items-center gap-3">
								<AvatarEditorDialog
									value={orgLogo}
									onChange={setOrgLogo}
									onSave={handleLogoSave}
									displaySize={80}
									editorSize={280}
									outputSize={256}
									placeholder={orgInitials}
									editLabel={t("settings.org.changeLogo") || "Change Logo"}
									dialogTitle={
										t("settings.org.logoTitle") || "Edit Organization Logo"
									}
									acceptText={t("common.accept") || "Accept"}
									cancelText={t("common.cancel") || "Cancel"}
									successMessage={
										t("settings.organization.savedSuccess") ||
										"Logo saved successfully!"
									}
									errorMessage={
										t("settings.organization.saveError") ||
										"Failed to save logo. Please try again."
									}
								/>
							</div>

							<div className="flex-1 space-y-4">
								<div className="space-y-2">
									<Label htmlFor="orgName">{t("settings.org.name")}</Label>
									<div className="flex gap-2">
										<Input
											id="orgName"
											value={orgName}
											onChange={(e) => setOrgName(e.target.value)}
											disabled={!isOwner || saving}
											className="flex-1"
										/>
										<Button
											variant="outline"
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

								<div className="space-y-2">
									<Label htmlFor="urlSlug">{t("settings.org.slug")}</Label>
									<div className="flex items-center">
										<span className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-l-md border border-r-0 border-input">
											janovix.com/
										</span>
										<Input
											id="urlSlug"
											value={orgSlug}
											onChange={(e) => setOrgSlug(e.target.value)}
											disabled={!isOwner || saving}
											className="rounded-l-none flex-1"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Organization ID */}
						<div className="space-y-2">
							<Label>{t("settings.org.id")}</Label>
							<div className="flex gap-2">
								<code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono text-muted-foreground truncate">
									{orgData?.id}
								</code>
								<Button variant="outline" size="icon" onClick={copyOrgId}>
									{copied ? (
										<Check className="h-4 w-4" />
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
				</SettingsCard>
			</SettingsSection>

			{/* Default Preferences */}
			<SettingsSection
				title={t("settings.org.defaultPreferences")}
				description={t("settings.org.defaultPreferencesDesc")}
			>
				<SettingsCard>
					<div className="space-y-6">
						<div className="grid sm:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Label>{t("settings.appearance.theme")}</Label>
								<Select
									value={selectedTheme}
									onValueChange={(v: string) => handleThemeChange(v as Theme)}
									disabled={!isOwner || saving}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select theme" />
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

							<div className="space-y-2">
								<Label>{t("settings.org.defaultLanguage")}</Label>
								<Select
									value={selectedLanguage}
									onValueChange={(v: string) =>
										handleLanguageChange(v as LanguageCode)
									}
									disabled={!isOwner || saving}
								>
									<SelectTrigger>
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

							<div className="space-y-2">
								<Label>{t("settings.org.defaultDateFormat")}</Label>
								<Select
									value={selectedDateFormat}
									onValueChange={(v: string) =>
										handleDateFormatChange(v as DateFormat)
									}
									disabled={!isOwner || saving}
								>
									<SelectTrigger>
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

						<div className="space-y-2">
							<Label>{t("settings.org.defaultTimezone")}</Label>
							<TimezonePicker
								value={selectedTimezone}
								onChange={handleTimezoneChange}
								disabled={!isOwner || saving}
							/>
						</div>
					</div>
				</SettingsCard>
			</SettingsSection>

			{/* Danger Zone */}
			<SettingsSection
				title={t("settings.org.dangerZone")}
				description={t("settings.org.dangerZoneDesc")}
				variant="danger"
			>
				<SettingsCard variant="danger">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h4 className="text-sm font-medium text-foreground">
								{t("settings.org.delete")}
							</h4>
							<p className="text-sm text-muted-foreground">
								{t("settings.org.deleteDesc")}
							</p>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="destructive"
									className="shrink-0"
									disabled={!isOwner}
								>
									<Trash2 className="h-4 w-4 mr-2" />
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
				</SettingsCard>
			</SettingsSection>
		</div>
	);
}
