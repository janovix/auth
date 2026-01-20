"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
	Check,
	ArrowRight,
	Loader2,
	LogOut,
	AlertCircle,
	Link2,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarEditorDialog } from "@/components/ui/avatar-editor-dialog";
import { useLanguage } from "@/contexts/language-context";
import { useOnboarding } from "@/contexts/onboarding-context";
import { authClient } from "@/lib/auth/authClient";
import { getAuthRedirectUrl } from "@/lib/auth/redirectConfig";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";
import { cn } from "@/lib/utils";

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

interface CreateOrganizationStepProps {
	redirectTo?: string;
}

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[áàäâã]/g, "a")
		.replace(/[éèëê]/g, "e")
		.replace(/[íìïî]/g, "i")
		.replace(/[óòöôõ]/g, "o")
		.replace(/[úùüû]/g, "u")
		.replace(/[ñ]/g, "n")
		.replace(/[ç]/g, "c")
		.replace(/[^a-z0-9\s-]/g, "") // Remove special chars
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with single
		.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Validate slug format
 */
function validateSlug(
	slug: string,
	t: (key: string) => string,
): { valid: boolean; error?: string } {
	if (!slug) {
		return { valid: false, error: t("onboarding.org.slug.error.required") };
	}
	if (slug.length < 3) {
		return { valid: false, error: t("onboarding.org.slug.error.min") };
	}
	if (slug.length > 50) {
		return { valid: false, error: t("onboarding.org.slug.error.max") };
	}
	if (!/^[a-z0-9]/.test(slug)) {
		return { valid: false, error: t("onboarding.org.slug.error.start") };
	}
	if (!/[a-z0-9]$/.test(slug)) {
		return { valid: false, error: t("onboarding.org.slug.error.end") };
	}
	if (!/^[a-z0-9-]+$/.test(slug)) {
		return { valid: false, error: t("onboarding.org.slug.error.chars") };
	}
	if (/--/.test(slug)) {
		return { valid: false, error: t("onboarding.org.slug.error.consecutive") };
	}
	return { valid: true };
}

export function CreateOrganizationStep({
	redirectTo,
}: CreateOrganizationStepProps) {
	const { t } = useLanguage();
	const router = useRouter();
	const { state, createOrganization } = useOnboarding();

	const [orgName, setOrgName] = useState("");
	const [slug, setSlug] = useState("");
	const [slugTouched, setSlugTouched] = useState(false);
	const [slugError, setSlugError] = useState<string | null>(null);
	const [orgLogo, setOrgLogo] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Auto-generate slug from name (only if user hasn't manually edited)
	useEffect(() => {
		if (!slugTouched && orgName) {
			setSlug(generateSlug(orgName));
		}
	}, [orgName, slugTouched]);

	// Validate slug on change
	useEffect(() => {
		if (slug) {
			const validation = validateSlug(slug, t);
			setSlugError(validation.valid ? null : validation.error || null);
		} else {
			setSlugError(null);
		}
	}, [slug]);

	const handleSlugChange = useCallback((value: string) => {
		// Only allow valid slug characters as user types
		const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
		setSlug(sanitized);
		setSlugTouched(true);
	}, []);

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

	// Get org initials for placeholder
	const orgInitials = orgName
		? orgName
				.split(" ")
				.map((word) => word[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "?";

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await authClient.signOut();
		window.location.href = "/login";
	};

	const handleCreateOrg = async () => {
		if (!orgName.trim() || !slug.trim()) return;

		// Validate slug before submitting
		const validation = validateSlug(slug, t);
		if (!validation.valid) {
			setSlugError(validation.error || t("onboarding.org.slug.error.invalid"));
			return;
		}

		setIsCreating(true);
		setError(null);

		const result = await createOrganization(orgName.trim(), slug.trim());

		if (!result.success) {
			// Check if it's a slug uniqueness error
			if (
				result.error?.toLowerCase().includes("slug") ||
				result.error?.toLowerCase().includes("unique")
			) {
				setSlugError(t("onboarding.org.slug.error.taken"));
			} else {
				setError(result.error || t("onboarding.org.error.createFailed"));
			}
			setIsCreating(false);
			return;
		}

		// If there's a logo, update the organization with it
		// The organization is already created and set as active by createOrganization
		if (orgLogo) {
			try {
				await authClient.organization.update({
					data: { logo: orgLogo },
				});
			} catch {
				// Don't fail if logo update fails, org is already created
				console.warn("Failed to set organization logo");
			}
		}

		// Success! Redirect to the target URL
		const targetUrl = getAuthRedirectUrl(redirectTo);
		window.location.href = targetUrl;
	};

	const isFormValid = orgName.trim() && slug.trim() && !slugError;

	// Get the plan name for display
	const planName = state.currentPlan?.name || t("onboarding.org.plan.active");

	return (
		<div className="w-full flex justify-center my-auto">
			<div className="w-full max-w-lg px-3 py-6">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<Logo variant="logo" />
					</div>
					<div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
						<Check className="h-8 w-8 text-success" />
					</div>
					<Badge className="mb-4 bg-success/10 text-success border-success/20">
						{t("onboarding.org.badge").replace("{plan}", planName)}
					</Badge>
					<h1 className="text-2xl font-bold text-foreground mb-2">
						{t("onboarding.org.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("onboarding.org.description")}
					</p>
				</div>

				{/* Form Card */}
				<div className="bg-card rounded-xl border border-border p-6 shadow-sm">
					{error && (
						<div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
							<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					<div className="space-y-5">
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
								editLabel={t("onboarding.org.logo.edit") || "Add Logo"}
								dialogTitle={
									t("onboarding.org.logo.title") || "Organization Logo"
								}
								acceptText={t("common.accept") || "Accept"}
								cancelText={t("common.cancel") || "Cancel"}
								successMessage={
									t("onboarding.org.logo.success") || "Logo saved!"
								}
								errorMessage={
									t("onboarding.org.logo.error") || "Failed to save logo."
								}
							/>
							<p className="text-xs text-muted-foreground">
								{t("onboarding.org.logo.help") ||
									"Optional: Add a logo for your organization"}
							</p>
						</div>

						{/* Organization Name */}
						<div className="space-y-2">
							<Label htmlFor="orgName">{t("onboarding.org.name.label")}</Label>
							<Input
								id="orgName"
								placeholder={t("onboarding.org.name.placeholder")}
								value={orgName}
								onChange={(e) => setOrgName(e.target.value)}
								className="h-12"
								disabled={isCreating}
							/>
							<p className="text-xs text-muted-foreground">
								{t("onboarding.org.name.help")}
							</p>
						</div>

						{/* Organization Slug */}
						<div className="space-y-2">
							<Label htmlFor="orgSlug" className="flex items-center gap-1.5">
								<Link2 className="h-3.5 w-3.5" />
								{t("onboarding.org.slug.label")}
							</Label>
							<div className="flex items-center">
								<Input
									id="orgSlug"
									placeholder={t("onboarding.org.slug.placeholder")}
									value={slug}
									onChange={(e) => handleSlugChange(e.target.value)}
									className={cn(
										"h-12 rounded-r-none font-mono text-sm",
										slugError &&
											"border-destructive focus-visible:ring-destructive",
									)}
									disabled={isCreating}
								/>
								<span className="h-12 px-3 flex items-center bg-muted border border-l-0 border-input rounded-r-md text-sm text-muted-foreground whitespace-nowrap">
									.janovix.com
								</span>
							</div>
							{slugError ? (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="h-3 w-3" />
									{slugError}
								</p>
							) : slug ? (
								<p className="text-xs text-success flex items-center gap-1">
									<Check className="h-3 w-3" />
									{t("onboarding.org.slug.available").replace("{slug}", slug)}
								</p>
							) : (
								<p className="text-xs text-muted-foreground">
									{t("onboarding.org.slug.help")}
								</p>
							)}
						</div>

						<Button
							className="w-full h-12"
							size="lg"
							onClick={handleCreateOrg}
							disabled={!isFormValid || isCreating}
						>
							{isCreating ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{t("onboarding.org.creating")}
								</>
							) : (
								<>
									{t("onboarding.org.submit")}
									<ArrowRight className="h-4 w-4 ml-2" />
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Footer Info */}
				<div className="mt-6 text-center space-y-3">
					<p className="text-xs text-muted-foreground">
						{t("onboarding.org.footer")}
					</p>
				</div>

				<div className="flex justify-end mb-4 pt-6">
					<Button
						variant="outline"
						size="sm"
						onClick={handleLogout}
						disabled={isLoggingOut || isCreating}
						className="gap-2"
					>
						{isLoggingOut ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<LogOut className="h-3.5 w-3.5" />
						)}
						{t("settings.nav.signOut")}
					</Button>
				</div>
			</div>
		</div>
	);
}
