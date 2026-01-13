"use client";

import { updateProfile } from "@/lib/auth/authActions";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";
import { getAuthRedirectUrl } from "@/lib/auth/redirectConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertTriangle,
	Camera,
	CheckCircle2,
	Loader2,
	User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Logo } from "@/components/Logo";
import {
	Alert,
	AlertDescription,
	AlertTitle,
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
} from "@/components/ui";
import { AvatarEditor } from "@/components/ui/avatar-editor";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { useAurora } from "@/contexts/aurora-context";
import { useLanguage } from "@/contexts/language-context";

type OnboardingValues = {
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

export const OnboardingView = ({
	redirectTo,
}: {
	redirectTo?: string;
}) => {
	const { t } = useLanguage();
	const { setPageProfile, setStateModifier } = useAurora();

	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Avatar state
	const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [avatarError, setAvatarError] = useState<string | null>(null);

	// Create schema with translations
	const onboardingSchema = useMemo(
		() =>
			z.object({
				firstName: z.string().min(1, t("onboarding.firstName.required")),
				lastName: z.string().min(1, t("onboarding.lastName.required")),
			}),
		[t],
	);

	// Set aurora page profile on mount
	useEffect(() => {
		setPageProfile("onboarding");
	}, [setPageProfile]);

	const form = useForm<OnboardingValues>({
		resolver: zodResolver(onboardingSchema),
		mode: "onChange",
		defaultValues: {
			firstName: "",
			lastName: "",
		},
	});

	// Handle avatar change from editor (fires on any edit)
	const handleAvatarChange = useCallback((dataUrl: string | null) => {
		setAvatarDataUrl(dataUrl);
		if (dataUrl) {
			setAvatarError(null);
		}
	}, []);

	// Upload avatar to R2 and return the public URL
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
				error instanceof Error ? error.message : t("onboarding.avatar.uploadFailed");
			setAvatarError(message);
			return null;
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const handleSubmit = async (values: OnboardingValues) => {
		setServerError(null);
		setSuccessMessage(null);
		setStateModifier("loading");

		const name = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();

		// Upload avatar if selected
		let avatarUrl: string | undefined;
		if (avatarDataUrl) {
			const uploadedUrl = await uploadAvatar(avatarDataUrl);
			if (uploadedUrl) {
				avatarUrl = uploadedUrl;
			}
			// Avatar upload failed - still continue with name update
			// The error is already shown via avatarError state
		}

		// Update profile with name and optional avatar
		const result = await updateProfile({
			name,
			...(avatarUrl && { image: avatarUrl }),
		});

		if (!result.success) {
			setServerError(result.error?.message || t("onboarding.error.updateFailed"));
			setStateModifier("error");
			return;
		}

		// Success!
		setSuccessMessage(t("onboarding.success.message"));
		setStateModifier("success");

		// Redirect after a short delay
		setTimeout(() => {
			const targetUrl = getAuthRedirectUrl(redirectTo);
			window.location.href = targetUrl;
		}, 1500);
	};

	const isSubmitting = form.formState.isSubmitting || isUploadingAvatar;

	// Get initials for avatar placeholder
	const firstName = form.watch("firstName");
	const lastName = form.watch("lastName");
	const avatarInitials =
		(firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "?";

	return (
		<div className="flex flex-col gap-4 sm:gap-6 w-full">
			<div className="flex justify-center">
				<Logo variant="logo" />
			</div>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">{t("onboarding.title")}</CardTitle>
					<CardDescription>{t("onboarding.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					{successMessage ? (
						<Alert role="status" className="mb-6">
							<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
							<AlertTitle>{t("onboarding.success.title")}</AlertTitle>
							<AlertDescription>{successMessage}</AlertDescription>
						</Alert>
					) : null}

					{serverError && !successMessage ? (
						<Alert variant="destructive" role="alert" className="mb-6">
							<AlertTriangle className="h-4 w-4" aria-hidden="true" />
							<AlertTitle>{t("onboarding.error.title")}</AlertTitle>
							<AlertDescription>{serverError}</AlertDescription>
						</Alert>
					) : null}

					{!successMessage ? (
						<Form {...form}>
							<form
								data-testid="onboarding-form"
								onSubmit={form.handleSubmit(handleSubmit)}
							>
								<FieldGroup>
									{/* Avatar Editor Section */}
									<Field>
										<FieldLabel className="flex items-center gap-2 justify-center">
											<Camera className="h-4 w-4" aria-hidden="true" />
											{t("onboarding.avatar.label")}
										</FieldLabel>
										<div className="flex flex-col items-center gap-2">
											<div className="w-full max-w-[280px]">
												<AvatarEditor
													outputSize={256}
													outputFormat="webp"
													outputQuality={0.9}
													onChange={handleAvatarChange}
													initials={avatarInitials}
												/>
											</div>
											{avatarError && (
												<p className="text-sm text-destructive">{avatarError}</p>
											)}
											<FieldDescription className="text-center">
												{t("onboarding.avatar.optional")}
											</FieldDescription>
										</div>
									</Field>

									{/* Name Fields */}
									<Field>
										<div className="grid gap-4 md:grid-cols-2">
											<FormField
												control={form.control}
												name="firstName"
												render={({ field }) => (
													<FormItem>
														<FieldLabel
															htmlFor="firstName"
															className="flex items-center gap-2"
														>
															<User className="h-4 w-4" aria-hidden="true" />
															{t("onboarding.firstName.label")}
														</FieldLabel>
														<FormControl>
															<Input
																id="firstName"
																placeholder={t("onboarding.firstName.placeholder")}
																autoComplete="given-name"
																aria-describedby="firstName-description"
																required
																disabled={isSubmitting}
																{...field}
															/>
														</FormControl>
														<FormMessage />
														<FieldDescription
															id="firstName-description"
															className="sr-only"
														>
															{t("onboarding.firstName.description")}
														</FieldDescription>
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="lastName"
												render={({ field }) => (
													<FormItem>
														<FieldLabel
															htmlFor="lastName"
															className="flex items-center gap-2"
														>
															<User className="h-4 w-4" aria-hidden="true" />
															{t("onboarding.lastName.label")}
														</FieldLabel>
														<FormControl>
															<Input
																id="lastName"
																placeholder={t("onboarding.lastName.placeholder")}
																autoComplete="family-name"
																aria-describedby="lastName-description"
																required
																disabled={isSubmitting}
																{...field}
															/>
														</FormControl>
														<FormMessage />
														<FieldDescription
															id="lastName-description"
															className="sr-only"
														>
															{t("onboarding.lastName.description")}
														</FieldDescription>
													</FormItem>
												)}
											/>
										</div>
									</Field>

									{/* Submit Button */}
									<Field>
										<Button
											type="submit"
											disabled={isSubmitting}
											className="w-full"
											aria-busy={isSubmitting}
										>
											{isSubmitting ? (
												<span className="flex items-center justify-center gap-2">
													<Loader2
														className="h-4 w-4 animate-spin"
														aria-hidden="true"
													/>
													{isUploadingAvatar
														? t("onboarding.button.uploading")
														: t("onboarding.button.saving")}
												</span>
											) : (
												<>
													<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
													{t("onboarding.button.continue")}
												</>
											)}
										</Button>
									</Field>
								</FieldGroup>
							</form>
						</Form>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
};
