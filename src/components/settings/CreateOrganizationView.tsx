"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, AlertCircle, Link2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button, Label } from "@/components/ui";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { AvatarEditorDialog } from "@algenium/blocks";
import { useLanguage } from "@/contexts/language-context";
import { authClient } from "@/lib/auth/authClient";
import {
	getAuthCoreBaseUrl,
	getProductOrgSlugUrlPrefix,
	withAppPathPrefixCopy,
} from "@/lib/auth/authCoreConfig";
import {
	getSubscriptionStatus,
	shouldUseWatchlistOrgPathPrefix,
} from "@/lib/billing";
import { cn } from "@/lib/utils";
import {
	generateSlug,
	sanitizeSlugInput,
	useSlugAvailability,
	validateSlug,
} from "@/lib/organization";
import {
	SettingsCard,
	SettingsSection,
	SettingsPageHeader,
} from "@/components/settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Convert a data URL to a Blob for uploading.
 */
function dataURLtoBlob(dataUrl: string): Blob {
	const arr = dataUrl.split(",");
	const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}

export function CreateOrganizationView() {
	const { t } = useLanguage();
	const router = useRouter();

	const [orgName, setOrgName] = useState("");
	const [slug, setSlug] = useState("");
	const [slugTouched, setSlugTouched] = useState(false);
	const [orgLogo, setOrgLogo] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [apiSlugError, setApiSlugError] = useState<string | null>(null);
	const [slugPathPrefix, setSlugPathPrefix] = useState(() =>
		getProductOrgSlugUrlPrefix(false),
	);

	useEffect(() => {
		let cancelled = false;
		getSubscriptionStatus()
			.then((status) => {
				if (!cancelled) {
					setSlugPathPrefix(
						getProductOrgSlugUrlPrefix(shouldUseWatchlistOrgPathPrefix(status)),
					);
				}
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);

	const { slugError, slugAvailable, isCheckingSlug } = useSlugAvailability({
		slug,
		slugTakenMessage:
			t("settings.createOrg.slugTaken") ||
			"This slug is already taken. Please choose another.",
	});

	// Auto-generate slug from name (only if user hasn't manually edited)
	useEffect(() => {
		if (!slugTouched && orgName) {
			setSlug(generateSlug(orgName));
		}
	}, [orgName, slugTouched]);

	const handleSlugChange = useCallback((value: string) => {
		setSlug(sanitizeSlugInput(value));
		setSlugTouched(true);
		setApiSlugError(null);
	}, []);

	const displaySlugError = slugError || apiSlugError;

	// Handle logo save via the AvatarEditorDialog
	const handleLogoSave = useCallback(
		async (dataUrl: string): Promise<boolean> => {
			try {
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
				return true;
			} catch {
				return false;
			}
		},
		[],
	);

	const orgInitials = orgName.trim()
		? orgName
				.trim()
				.split(/\s+/)
				.map((word) => word[0])
				.filter(Boolean)
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "";

	const handleCreateOrg = async () => {
		if (!orgName.trim() || !slug.trim()) return;

		// Validate slug before submitting
		const validation = validateSlug(slug);
		if (!validation.valid) {
			setApiSlugError(validation.error || "Invalid slug");
			return;
		}

		setIsCreating(true);
		setError(null);
		setApiSlugError(null);

		try {
			const result = await authClient.organization.create({
				name: orgName.trim(),
				slug: slug.trim(),
				...(orgLogo && { logo: orgLogo }),
			});

			if (result.error) {
				// Check if it's a slug uniqueness error
				const errorMsg =
					result.error.message || result.error.code || "Unknown error";
				if (
					errorMsg.toLowerCase().includes("slug") ||
					errorMsg.toLowerCase().includes("unique")
				) {
					setApiSlugError(
						t("settings.createOrg.slugTaken") ||
							"This slug is already taken. Please choose another.",
					);
				} else {
					setError(
						errorMsg ||
							t("settings.createOrg.error") ||
							"Failed to create organization",
					);
				}
				setIsCreating(false);
				return;
			}

			// Success! Set the new org as active and redirect
			if (result.data?.id) {
				await authClient.organization.setActive({
					organizationId: result.data.id,
				});
			}

			toast.success(
				t("settings.createOrg.success") || "Organization created successfully!",
			);

			// Full navigation to ensure session cookie (with new activeOrganizationId) is re-read
			window.location.href = "/settings/organization";
		} catch (err) {
			setError(
				t("settings.createOrg.error") || "Failed to create organization",
			);
			setIsCreating(false);
		}
	};

	const isFormValid =
		orgName.trim() &&
		slug.trim() &&
		!displaySlugError &&
		(slugAvailable === true || !validateSlug(slug.trim()).valid);

	const backAction = (
		<Button
			variant="outline"
			onClick={() => router.push("/settings/organization")}
		>
			<ArrowLeft className="h-4 w-4 mr-2" />
			{t("common.back") || "Back"}
		</Button>
	);

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<SettingsPageHeader
				icon={Building2}
				title={t("settings.createOrg.title") || "Create Organization"}
				description={
					t("settings.createOrg.description") ||
					"Set up a new organization to manage your team and resources"
				}
				action={backAction}
			/>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>{t("common.error") || "Error"}</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Organization Details */}
			<SettingsSection
				title={t("settings.createOrg.details") || "Organization Details"}
				description={
					t("settings.createOrg.detailsDesc") ||
					"Enter the basic information for your new organization"
				}
			>
				<SettingsCard>
					<div className="space-y-6">
						{/* Organization Logo */}
						<div className="flex flex-col items-center gap-3">
							<AvatarEditorDialog
								value={orgLogo}
								onChange={setOrgLogo}
								onSave={handleLogoSave}
								displaySize={96}
								editorSize={280}
								outputSize={256}
								placeholder={orgInitials}
								editLabel={t("settings.createOrg.addLogo") || "Add Logo"}
								dialogTitle={
									t("settings.createOrg.logoTitle") || "Organization Logo"
								}
								acceptText={t("common.accept") || "Accept"}
								cancelText={t("common.cancel") || "Cancel"}
								successMessage={
									t("settings.createOrg.logoSuccess") || "Logo saved!"
								}
								errorMessage={
									t("settings.createOrg.logoError") || "Failed to save logo."
								}
							/>
							<p className="text-xs text-muted-foreground">
								{t("settings.createOrg.logoHelp") ||
									"Optional: Add a logo for your organization"}
							</p>
						</div>

						{/* Organization Name */}
						<div className="space-y-2">
							<Label htmlFor="orgName">
								{t("settings.createOrg.name") || "Organization name"}
							</Label>
							<Input
								id="orgName"
								placeholder={
									t("settings.createOrg.namePlaceholder") || "Acme Corporation"
								}
								value={orgName}
								onChange={(e) => setOrgName(e.target.value)}
								disabled={isCreating}
							/>
							<p className="text-xs text-muted-foreground">
								{t("settings.createOrg.nameHelp") ||
									"This is how your organization will appear across Janovix"}
							</p>
						</div>

						{/* Organization Slug */}
						<div className="space-y-2">
							<Label htmlFor="orgSlug" className="flex items-center gap-1.5">
								<Link2 className="h-3.5 w-3.5" />
								{t("settings.createOrg.subdomain") || "Organization path"}
							</Label>
							<div className="flex items-center">
								<span className="h-9 shrink-0 px-3 flex items-center bg-muted border border-input border-r-0 rounded-l-md text-sm text-muted-foreground whitespace-nowrap font-mono">
									{slugPathPrefix}
								</span>
								<Input
									id="orgSlug"
									placeholder="acme-corp"
									value={slug}
									onChange={(e) => handleSlugChange(e.target.value)}
									className={cn(
										"h-9 rounded-l-none rounded-r-md font-mono text-sm min-w-0 flex-1",
										displaySlugError &&
											"border-destructive focus-visible:ring-destructive",
									)}
									disabled={isCreating}
								/>
							</div>
							{displaySlugError ? (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="h-3 w-3" />
									{displaySlugError}
								</p>
							) : isCheckingSlug ? (
								<p className="text-xs text-muted-foreground flex items-center gap-1">
									<Spinner className="h-3 w-3" />
									{t("settings.createOrg.checkingSlug") ||
										"Checking availability..."}
								</p>
							) : slugAvailable === true ? (
								<p className="text-xs text-success flex items-center gap-1">
									<Check className="h-3 w-3" />
									{slugPathPrefix}
									{slug}{" "}
									{t("settings.createOrg.slugAvailable") || "is available!"}
								</p>
							) : slug ? (
								<p className="text-xs text-muted-foreground font-mono">
									{slugPathPrefix}
									{slug}
								</p>
							) : (
								<p className="text-xs text-muted-foreground">
									{withAppPathPrefixCopy(
										t("settings.createOrg.subdomainHelp") ||
											"Your organization will live at {appPathPrefix}your-path — choose the segment after {appPathPrefix}",
										slugPathPrefix,
									)}
								</p>
							)}
						</div>

						{/* Submit Button */}
						<div className="flex justify-end pt-4">
							<Button
								onClick={handleCreateOrg}
								loading={isCreating}
								disabled={!isFormValid}
							>
								{isCreating
									? t("settings.createOrg.creating") || "Creating..."
									: t("settings.nav.createOrganization") ||
										"Create Organization"}
							</Button>
						</div>
					</div>
				</SettingsCard>
			</SettingsSection>

			{/* Info */}
			<p className="text-sm text-muted-foreground text-center">
				{t("settings.createOrg.info") ||
					"You can invite team members and configure settings after creating your organization."}
			</p>
		</div>
	);
}
