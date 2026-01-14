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
import { useLanguage } from "@/contexts/language-context";
import { useOnboarding } from "@/contexts/onboarding-context";
import { authClient } from "@/lib/auth/authClient";
import { getAuthRedirectUrl } from "@/lib/auth/redirectConfig";
import { cn } from "@/lib/utils";

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
function validateSlug(slug: string): { valid: boolean; error?: string } {
	if (!slug) {
		return { valid: false, error: "Slug is required" };
	}
	if (slug.length < 3) {
		return { valid: false, error: "Slug must be at least 3 characters" };
	}
	if (slug.length > 50) {
		return { valid: false, error: "Slug must be 50 characters or less" };
	}
	if (!/^[a-z0-9]/.test(slug)) {
		return { valid: false, error: "Slug must start with a letter or number" };
	}
	if (!/[a-z0-9]$/.test(slug)) {
		return { valid: false, error: "Slug must end with a letter or number" };
	}
	if (!/^[a-z0-9-]+$/.test(slug)) {
		return {
			valid: false,
			error: "Slug can only contain lowercase letters, numbers, and hyphens",
		};
	}
	if (/--/.test(slug)) {
		return { valid: false, error: "Slug cannot contain consecutive hyphens" };
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
			const validation = validateSlug(slug);
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

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await authClient.signOut();
		window.location.href = "/login";
	};

	const handleCreateOrg = async () => {
		if (!orgName.trim() || !slug.trim()) return;

		// Validate slug before submitting
		const validation = validateSlug(slug);
		if (!validation.valid) {
			setSlugError(validation.error || "Invalid slug");
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
				setSlugError("This slug is already taken. Please choose another.");
			} else {
				setError(result.error || "Failed to create organization");
			}
			setIsCreating(false);
			return;
		}

		// Success! Redirect to the target URL
		const targetUrl = getAuthRedirectUrl(redirectTo);
		window.location.href = targetUrl;
	};

	const isFormValid = orgName.trim() && slug.trim() && !slugError;

	// Get the plan name for display
	const planName = state.currentPlan?.name || "Active";

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-lg">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<Logo variant="logo" />
					</div>
					<div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
						<Check className="h-8 w-8 text-success" />
					</div>
					<Badge className="mb-4 bg-success/10 text-success border-success/20">
						{planName} Subscription Active
					</Badge>
					<h1 className="text-2xl font-bold text-foreground mb-2">
						Create Your Organization
					</h1>
					<p className="text-muted-foreground">
						Set up your organization to start using Janovix
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
						{/* Organization Name */}
						<div className="space-y-2">
							<Label htmlFor="orgName">Organization name</Label>
							<Input
								id="orgName"
								placeholder="Acme Corporation"
								value={orgName}
								onChange={(e) => setOrgName(e.target.value)}
								className="h-12"
								disabled={isCreating}
							/>
							<p className="text-xs text-muted-foreground">
								This is how your organization will appear across Janovix
							</p>
						</div>

						{/* Organization Slug */}
						<div className="space-y-2">
							<Label htmlFor="orgSlug" className="flex items-center gap-1.5">
								<Link2 className="h-3.5 w-3.5" />
								Organization subdomain
							</Label>
							<div className="flex items-center">
								<Input
									id="orgSlug"
									placeholder="acme-corp"
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
									{slug}.janovix.com is available!
								</p>
							) : (
								<p className="text-xs text-muted-foreground">
									This will be your organization&apos;s unique subdomain
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
									Creating...
								</>
							) : (
								<>
									Create Organization
									<ArrowRight className="h-4 w-4 ml-2" />
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Footer Info */}
				<div className="mt-6 text-center space-y-3">
					<p className="text-xs text-muted-foreground">
						You can invite team members and configure settings after creating
						your organization.
					</p>
					<button
						type="button"
						onClick={handleLogout}
						disabled={isLoggingOut || isCreating}
						className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
					>
						{isLoggingOut ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<LogOut className="h-3.5 w-3.5" />
						)}
						Sign out
					</button>
				</div>
			</div>
		</div>
	);
}
