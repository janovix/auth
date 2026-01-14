"use client";

import { useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Upload, X, ArrowRight, Loader2, LogOut } from "lucide-react";

import { Logo } from "@/components/Logo";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
	Input,
	Label,
} from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/language-context";
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
	const { t } = useLanguage();
	const { state, updateUserProfile, refreshOnboardingStatus } = useOnboarding();

	const [serverError, setServerError] = useState<string | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(
		state.userProfile.avatarUrl,
	);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [avatarError, setAvatarError] = useState<string | null>(null);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	// Handle avatar file selection
	const handleAvatarChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				// Validate file size (5MB max)
				if (file.size > 5 * 1024 * 1024) {
					setAvatarError(t("onboarding.avatar.tooLarge"));
					return;
				}

				// Validate file type
				if (
					!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
						file.type,
					)
				) {
					setAvatarError(t("onboarding.avatar.invalidType"));
					return;
				}

				const reader = new FileReader();
				reader.onload = (event) => {
					setAvatarPreview(event.target?.result as string);
					setAvatarError(null);
				};
				reader.readAsDataURL(file);
			}
		},
		[t],
	);

	// Handle avatar removal
	const handleRemoveAvatar = useCallback(() => {
		setAvatarPreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	// Upload avatar to R2
	const uploadAvatar = async (dataUrl: string): Promise<string | null> => {
		setIsUploadingAvatar(true);
		setAvatarError(null);

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
				const errorData = (await response.json().catch(() => ({}))) as {
					error?: string;
				};
				throw new Error(errorData.error || t("onboarding.avatar.uploadFailed"));
			}

			const result = (await response.json()) as {
				success: boolean;
				data?: { url: string };
				error?: string;
			};

			if (!result.success || !result.data?.url) {
				throw new Error(result.error || t("onboarding.avatar.uploadFailed"));
			}

			return result.data.url;
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: t("onboarding.avatar.uploadFailed");
			setAvatarError(message);
			return null;
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	// Handle form submission
	const handleSubmit = async (values: ProfileFormValues) => {
		setServerError(null);

		const name = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();

		// Upload avatar if selected
		let avatarUrl: string | undefined;
		if (avatarPreview && avatarPreview.startsWith("data:")) {
			const uploadedUrl = await uploadAvatar(avatarPreview);
			if (uploadedUrl) {
				avatarUrl = uploadedUrl;
			}
			// Continue even if avatar upload fails
		}

		// Update profile with Better Auth
		const result = await updateProfile({
			name,
			...(avatarUrl && { image: avatarUrl }),
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
			avatarUrl: avatarUrl || avatarPreview,
			isComplete: true,
		});

		// Refresh onboarding status to get updated state
		await refreshOnboardingStatus();
	};

	const isSubmitting = form.formState.isSubmitting || isUploadingAvatar;

	// Get initials for avatar placeholder
	const firstName = form.watch("firstName");
	const lastName = form.watch("lastName");
	const avatarInitials =
		(firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "?";

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
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
								{/* Avatar Upload */}
								<div className="flex flex-col items-center gap-4">
									<div className="relative">
										<Avatar className="h-24 w-24 border-4 border-background shadow-lg">
											<AvatarImage src={avatarPreview || undefined} />
											<AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
												{avatarInitials}
											</AvatarFallback>
										</Avatar>
										{avatarPreview && (
											<button
												type="button"
												onClick={handleRemoveAvatar}
												className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
											>
												<X className="h-3.5 w-3.5" />
											</button>
										)}
									</div>
									<div className="flex gap-2">
										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											onChange={handleAvatarChange}
											className="hidden"
											id="avatar-upload"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => fileInputRef.current?.click()}
											disabled={isSubmitting}
											className="gap-2"
										>
											<Upload className="h-4 w-4" />
											{t("onboarding.avatar.select")}
										</Button>
									</div>
									{avatarError && (
										<p className="text-sm text-destructive">{avatarError}</p>
									)}
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
										You can update your profile anytime from settings
									</p>
									<button
										type="button"
										onClick={handleLogout}
										disabled={isLoggingOut || isSubmitting}
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
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
