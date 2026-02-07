"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, ArrowRight, Loader2, LogOut } from "lucide-react";

import { Logo } from "@/components/Logo";
import {
	Button,
	Card,
	CardContent,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
	Input,
	Label,
} from "@/components/ui";
import { ThemeSwitcher, LanguageSwitcher } from "@algenium/blocks";
import { AvatarEditorDialog } from "@algenium/blocks";
import { useLanguage } from "@/contexts/language-context";

const languages = [
	{ key: "en", label: "EN", nativeName: "English" },
	{ key: "es", label: "ES", nativeName: "Español" },
];
import { useOnboarding } from "@/contexts/onboarding-context";
import { authClient } from "@/lib/auth/authClient";
import { updateProfile } from "@/lib/auth/authActions";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";

type ProfileFormValues = {
	firstName: string;
	lastName: string;
};

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

export function ProfileCompletionStep() {
	const { language, setLanguage, t } = useLanguage();
	const { state, updateUserProfile, refreshOnboardingStatus } = useOnboarding();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [serverError, setServerError] = useState<string | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(
		state.userProfile.avatarUrl,
	);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await authClient.signOut();
		window.location.href = "/login";
	};

	// Create schema with translations
	const profileSchema = z.object({
		firstName: z.string().min(1, t("onboarding.firstName.required")),
		lastName: z.string().min(1, t("onboarding.lastName.required")),
	});

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		mode: "onChange",
		defaultValues: {
			firstName: state.userProfile.firstName,
			lastName: state.userProfile.lastName,
		},
	});

	// Upload avatar to R2 and return success/failure
	const handleAvatarSave = async (dataUrl: string): Promise<boolean> => {
		setIsUploadingAvatar(true);

		try {
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

			// Update the avatar preview with the uploaded URL
			setAvatarPreview(result.data.url);
			return true;
		} catch {
			return false;
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	// Handle form submission
	const handleSubmit = async (values: ProfileFormValues) => {
		setServerError(null);

		const name = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();

		// Update profile with Better Auth
		// Avatar is already uploaded via the AvatarEditorDialog onSave callback
		const result = await updateProfile({
			name,
			...(avatarPreview &&
				!avatarPreview.startsWith("data:") && { image: avatarPreview }),
		});

		if (!result.success) {
			setServerError(
				result.error?.message || t("onboarding.error.updateFailed"),
			);
			return;
		}

		// Update local state
		updateUserProfile({
			firstName: values.firstName.trim(),
			lastName: values.lastName.trim(),
			avatarUrl: avatarPreview,
			isComplete: true,
		});

		// Refresh onboarding status to get updated state
		await refreshOnboardingStatus();

		// If coming from edit mode, remove the edit_profile flag
		if (searchParams.get("edit_profile") === "true") {
			const url = new URL(window.location.href);
			url.searchParams.delete("edit_profile");
			router.replace(url.toString());
		}
	};

	const isSubmitting = form.formState.isSubmitting || isUploadingAvatar;

	// Get initials for avatar placeholder
	const firstName = form.watch("firstName");
	const lastName = form.watch("lastName");
	const avatarInitials =
		(firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "?";

	return (
		<div className="w-full flex justify-center my-auto pt-6 px-3">
			<div className="w-full max-w-lg">
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<Logo variant="logo" />
					</div>
					<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
						<User className="h-8 w-8 text-primary" />
					</div>
					<h1 className="text-2xl font-bold text-foreground mb-2">
						{t("onboarding.title")}
					</h1>
					<p className="text-muted-foreground">{t("onboarding.description")}</p>
				</div>

				<Card>
					<CardContent className="pt-6">
						{serverError && (
							<div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
								{serverError}
							</div>
						)}

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleSubmit)}
								className="space-y-6"
							>
								{/* Avatar Upload with Editor Dialog */}
								<div className="flex flex-col items-center gap-4">
									<AvatarEditorDialog
										value={avatarPreview}
										onChange={setAvatarPreview}
										onSave={handleAvatarSave}
										displaySize={96}
										editorSize={280}
										outputSize={256}
										placeholder={t("onboarding.avatar.select")}
										editLabel={t("onboarding.avatar.edit") || "Edit avatar"}
										dialogTitle={t("onboarding.avatar.title") || "Edit Avatar"}
										acceptText={t("common.accept") || "Accept"}
										cancelText={t("common.cancel") || "Cancel"}
										successMessage={
											t("onboarding.avatar.uploadSuccess") ||
											"Avatar saved successfully!"
										}
										errorMessage={
											t("onboarding.avatar.uploadFailed") ||
											"Failed to save avatar. Please try again."
										}
									/>
									<p className="text-xs text-muted-foreground">
										{t("onboarding.avatar.optional")}
									</p>
								</div>

								{/* Name Fields */}
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<Label htmlFor="firstName">
													{t("onboarding.firstName.label")}{" "}
													<span className="text-destructive">*</span>
												</Label>
												<FormControl>
													<Input
														id="firstName"
														placeholder={t("onboarding.firstName.placeholder")}
														autoComplete="given-name"
														disabled={isSubmitting}
														className="h-11"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<Label htmlFor="lastName">
													{t("onboarding.lastName.label")}{" "}
													<span className="text-destructive">*</span>
												</Label>
												<FormControl>
													<Input
														id="lastName"
														placeholder={t("onboarding.lastName.placeholder")}
														autoComplete="family-name"
														disabled={isSubmitting}
														className="h-11"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Submit Button */}
								<Button
									type="submit"
									className="w-full h-12"
									size="lg"
									disabled={
										!form.watch("firstName").trim() ||
										!form.watch("lastName").trim() ||
										isSubmitting
									}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											{isUploadingAvatar
												? t("onboarding.button.uploading")
												: t("onboarding.button.saving")}
										</>
									) : (
										<>
											{t("onboarding.button.continue")}
											<ArrowRight className="h-4 w-4 ml-2" />
										</>
									)}
								</Button>

								<div className="text-center space-y-2">
									<p className="text-xs text-muted-foreground">
										{t("onboarding.profile.footerNote")}
									</p>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>

				<div className="border-t border-border pt-6 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<LanguageSwitcher
							languages={languages}
							currentLanguage={language}
							onLanguageChange={(key) => setLanguage(key as "en" | "es")}
							labels={{ language: t("language.label") }}
							showIcon
						/>
						<ThemeSwitcher
							labels={{
								theme: t("theme.label"),
								system: t("theme.system"),
								light: t("theme.light"),
								dark: t("theme.dark"),
							}}
						/>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleLogout}
						disabled={isLoggingOut || isSubmitting}
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
