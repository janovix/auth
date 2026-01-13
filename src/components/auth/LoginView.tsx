"use client";

import {
	sendVerificationOtp as localSendOtp,
	signInWithOtp as localSignInWithOtp,
	isOtpExpiredError,
	isOtpTooManyAttemptsError,
	type AuthResult,
} from "@/lib/auth/authActions";
import { getAuthRedirectUrl } from "@/lib/auth/redirectConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertTriangle,
	CheckCircle2,
	Loader2,
	Mail,
	RefreshCw,
	Shield,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Logo } from "@/components/Logo";
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
	Input,
} from "@/components/ui";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { getAuthErrorMessage } from "@/lib/auth/errorMessages";
import { useAurora } from "@/contexts/aurora-context";
import { useLanguage } from "@/contexts/language-context";
import { LoginSuccessAnimation } from "./LoginSuccessAnimation";

type EmailValues = { email: string };
type SendOtpFn = (
	email: string,
	type: "sign-in",
) => Promise<AuthResult<{ message: string }>>;
type SignInWithOtpFn = (email: string, otp: string) => Promise<AuthResult>;

const OTP_LENGTH = 6;

/**
 * LoginView component for passwordless OTP-based authentication.
 *
 * Flow:
 * 1. User enters email
 * 2. OTP is sent to email
 * 3. User enters 6-digit OTP
 * 4. Session is created (user is auto-created if new)
 *
 * Note: Route protection for authenticated users is handled by the proxy.ts
 * middleware at the edge level. Authenticated users are redirected to /account
 * before this component renders.
 */
export const LoginView = ({
	redirectTo,
	sendOtp = localSendOtp,
	signInWithOtp = localSignInWithOtp,
	defaultSuccessMessage,
}: {
	redirectTo?: string;
	sendOtp?: SendOtpFn;
	signInWithOtp?: SignInWithOtpFn;
	defaultSuccessMessage?: string;
}) => {
	const { t } = useLanguage();
	const { setPageProfile, setStateModifier } = useAurora();
	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(
		defaultSuccessMessage ?? null,
	);

	// Create schema with translations
	const emailSchema = useMemo(
		() =>
			z.object({
				email: z
					.string()
					.min(1, t("login.email.required"))
					.email(t("login.email.invalid")),
			}),
		[t],
	);

	// OTP flow state
	const [otpSent, setOtpSent] = useState(false);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [otpValue, setOtpValue] = useState("");
	const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
	const [otpError, setOtpError] = useState<string | null>(null);
	const [otpNeedsResend, setOtpNeedsResend] = useState(false);
	const [isResending, setIsResending] = useState(false);

	// Success animation state
	const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
	const redirectUrlRef = useRef<string>("");

	// Set aurora page profile to login on mount
	useEffect(() => {
		setPageProfile("login");
	}, [setPageProfile]);

	const form = useForm<EmailValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			email: "",
		},
	});

	// Track email value at time of error to detect actual changes
	const emailAtErrorRef = useRef<string | null>(null);
	const otpAtErrorRef = useRef<string | null>(null);

	// Reset aurora to default when user starts typing (clears error state)
	const emailValue = form.watch("email");
	useEffect(() => {
		// Only clear error if the email has actually changed since the error was set
		if (
			serverError &&
			emailAtErrorRef.current !== null &&
			emailValue !== emailAtErrorRef.current
		) {
			setServerError(null);
			setStateModifier("default"); // Reset to purple when editing form
			emailAtErrorRef.current = null;
		}
	}, [emailValue, serverError, setStateModifier]);

	// Reset aurora to default when OTP value changes (clears error state)
	useEffect(() => {
		// Only clear error if the OTP has actually changed since the error was set
		if (
			otpError &&
			otpAtErrorRef.current !== null &&
			otpValue !== otpAtErrorRef.current
		) {
			setOtpError(null);
			setStateModifier("default"); // Reset to purple when editing OTP
			otpAtErrorRef.current = null;
		}
	}, [otpValue, otpError, setStateModifier]);

	const handleSendOtp = async (values: EmailValues) => {
		setServerError(null);
		setSuccessMessage(null);
		setOtpError(null);
		setOtpNeedsResend(false);
		emailAtErrorRef.current = null;
		setStateModifier("loading"); // Blue aurora while loading

		const email = values.email.trim();
		const result = await sendOtp(email, "sign-in");

		if (!result.success) {
			setServerError(getAuthErrorMessage(result.error));
			emailAtErrorRef.current = email; // Capture email at time of error
			setStateModifier("error"); // Red aurora on error
			return;
		}

		setUserEmail(email);
		setOtpSent(true);
		setSuccessMessage(t("login.success.message"));
		setStateModifier("default"); // Back to purple after OTP sent
	};

	// Handle OTP verification and sign-in
	const handleVerifyOtp = useCallback(async () => {
		if (!userEmail || otpValue.length !== OTP_LENGTH) {
			return;
		}

		setIsVerifyingOtp(true);
		setOtpError(null);
		setOtpNeedsResend(false);
		otpAtErrorRef.current = null;
		setStateModifier("loading"); // Blue aurora while verifying

		const result = await signInWithOtp(userEmail, otpValue);

		if (!result.success) {
			const isExpired = isOtpExpiredError(result.error);
			const isTooManyAttempts = isOtpTooManyAttemptsError(result.error);

			if (isExpired) {
				setOtpError(t("login.otp.expired"));
				setOtpNeedsResend(true);
				setOtpValue("");
				otpAtErrorRef.current = ""; // Capture OTP value at time of error (empty after clear)
			} else if (isTooManyAttempts) {
				setOtpError(t("login.otp.tooManyAttempts"));
				setOtpNeedsResend(true);
				setOtpValue("");
				otpAtErrorRef.current = ""; // Capture OTP value at time of error (empty after clear)
			} else {
				setOtpError(result.error?.message || t("login.otp.invalid"));
				otpAtErrorRef.current = otpValue; // Capture current OTP value at time of error
			}

			setIsVerifyingOtp(false);
			setStateModifier("error"); // Red aurora on error
			return;
		}

		// Success! Show animation then redirect
		setStateModifier("success"); // Green aurora on success

		// Check if user needs onboarding (no name set or empty name)
		const userName = result.data?.user?.name?.trim();
		const needsOnboarding = !userName;

		if (needsOnboarding) {
			// Redirect to onboarding, preserving the original redirect destination
			const onboardingUrl = new URL("/onboarding", window.location.origin);
			const finalRedirect = getAuthRedirectUrl(redirectTo);
			onboardingUrl.searchParams.set("redirect_to", finalRedirect);
			redirectUrlRef.current = onboardingUrl.toString();
		} else {
			redirectUrlRef.current = getAuthRedirectUrl(redirectTo);
		}
		setShowSuccessAnimation(true);
	}, [userEmail, otpValue, signInWithOtp, redirectTo, setStateModifier, t]);

	// Handle redirect after success animation completes
	const handleSuccessComplete = useCallback(() => {
		window.location.href = redirectUrlRef.current;
	}, []);

	// Auto-submit when OTP is complete
	useEffect(() => {
		if (otpValue.length === OTP_LENGTH && userEmail && !isVerifyingOtp) {
			handleVerifyOtp();
		}
	}, [otpValue, userEmail, isVerifyingOtp, handleVerifyOtp]);

	const handleResendOtp = async () => {
		if (!userEmail) {
			return;
		}

		setIsResending(true);
		setOtpError(null);
		setOtpNeedsResend(false);
		setOtpValue("");
		setStateModifier("loading"); // Blue aurora while resending

		const result = await sendOtp(userEmail, "sign-in");

		if (!result.success) {
			setOtpError(result.error?.message || t("login.otp.resendError"));
			setStateModifier("error"); // Red aurora on error
		} else {
			setSuccessMessage(t("login.otp.resendSuccess"));
			setStateModifier("default"); // Back to purple after success
		}

		setIsResending(false);
	};

	const handleBackToEmail = () => {
		setOtpSent(false);
		setUserEmail(null);
		setOtpValue("");
		setOtpError(null);
		setOtpNeedsResend(false);
		setSuccessMessage(null);
		setStateModifier("default"); // Reset to purple when going back
	};

	const isSubmitting = form.formState.isSubmitting;

	// Show success animation when login is successful
	if (showSuccessAnimation) {
		return (
			<div className="flex flex-col items-center justify-center gap-6 w-full min-h-[200px]">
				<Logo variant="logo" />
				<LoginSuccessAnimation
					onComplete={handleSuccessComplete}
					delay={2000}
				/>
			</div>
		);
	}

	return (
		<div
			className={`flex flex-col gap-4 sm:gap-6 w-full transition-opacity duration-300`}
		>
			<div className="flex justify-center mb-2">
				<Logo variant="logo" />
			</div>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">{t("login.title")}</CardTitle>
					<CardDescription>
						{otpSent
							? t("login.description.otp")
							: t("login.description.email")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{successMessage && !otpError ? (
						<Alert role="status" className="mb-6">
							<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
							<AlertTitle>
								{otpSent
									? t("login.success.codeSent")
									: t("login.success.auth")}
							</AlertTitle>
							<AlertDescription>{successMessage}</AlertDescription>
						</Alert>
					) : null}

					{serverError && !otpSent ? (
						<Alert variant="destructive" role="alert" className="mb-6">
							<AlertTitle>{t("login.error")}</AlertTitle>
							<AlertDescription>{serverError}</AlertDescription>
						</Alert>
					) : null}

					{!otpSent ? (
						// Step 1: Email input
						<Form {...form}>
							<form
								data-testid="login-form"
								onSubmit={form.handleSubmit(handleSendOtp)}
							>
								<FieldGroup>
									<Field>
										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FieldLabel
														htmlFor="email"
														className="flex items-center gap-2"
													>
														<Mail className="h-4 w-4" aria-hidden="true" />
														{t("login.email.label")}
													</FieldLabel>
													<FormControl>
														<Input
															id="email"
															type="email"
															placeholder={t("login.email.placeholder")}
															autoComplete="email"
															aria-describedby="email-description"
															required
															{...field}
														/>
													</FormControl>
													<FormMessage />
													<FieldDescription
														id="email-description"
														className="sr-only"
													>
														{t("login.email.description")}
													</FieldDescription>
												</FormItem>
											)}
										/>
									</Field>
									<Field>
										<Button
											type="submit"
											className="w-full"
											disabled={isSubmitting}
											aria-busy={isSubmitting}
										>
											{isSubmitting ? (
												<span className="flex items-center justify-center gap-2">
													<Mail
														className="h-4 w-4 animate-pulse"
														aria-hidden="true"
													/>
													{t("login.button.sending")}
												</span>
											) : (
												<>
													<Mail className="h-4 w-4" aria-hidden="true" />
													{t("login.button.send")}
												</>
											)}
										</Button>
									</Field>
								</FieldGroup>
							</form>
						</Form>
					) : (
						// Step 2: OTP input
						<div className="space-y-4">
							<Alert>
								<Mail className="h-4 w-4" aria-hidden="true" />
								<AlertTitle>{t("login.otp.sent")}</AlertTitle>
								<AlertDescription>
									{t("login.otp.sentDescription").replace(
										"{email}",
										userEmail || "",
									)}
								</AlertDescription>
							</Alert>

							{/* OTP Input */}
							<div className="flex flex-col items-center gap-4">
								<InputOTP
									maxLength={OTP_LENGTH}
									value={otpValue}
									onChange={setOtpValue}
									disabled={isVerifyingOtp}
									aria-label={t("login.otp.label")}
								>
									<InputOTPGroup>
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>

								{isVerifyingOtp && (
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Loader2 className="h-4 w-4 animate-spin" />
										{t("login.otp.verifying")}
									</div>
								)}
							</div>

							{otpError && (
								<Alert variant="destructive" role="alert">
									{otpNeedsResend && (
										<AlertTriangle className="h-4 w-4" aria-hidden="true" />
									)}
									<AlertTitle>
										{otpNeedsResend
											? t("login.otp.expiredTitle")
											: t("login.otp.errorTitle")}
									</AlertTitle>
									<AlertDescription>{otpError}</AlertDescription>
								</Alert>
							)}

							{/* Resend button */}
							{otpNeedsResend ? (
								<Button
									onClick={handleResendOtp}
									disabled={isResending}
									className="w-full"
								>
									{isResending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{t("login.otp.resendNew")}
										</>
									) : (
										<>
											<RefreshCw className="mr-2 h-4 w-4" />
											{t("login.otp.requestNew")}
										</>
									)}
								</Button>
							) : (
								<Button
									onClick={handleResendOtp}
									disabled={isResending || isVerifyingOtp}
									variant="outline"
									className="w-full"
								>
									<Mail className="mr-2 h-4 w-4" />
									{isResending
										? t("login.otp.resending")
										: t("login.otp.resend")}
								</Button>
							)}

							<div className="text-center text-sm text-muted-foreground">
								{t("login.wrongEmail")}{" "}
								<button
									type="button"
									onClick={handleBackToEmail}
									className="font-medium text-primary underline-offset-4 hover:underline"
								>
									{t("login.changeEmail")}
								</button>
							</div>
						</div>
					)}

					<hr className="my-6 border-t" />
					<FieldDescription className="px-6 text-center text-xs text-muted-foreground">
						<Shield className="h-3 w-3 inline-block mr-1" aria-hidden="true" />
						{t("login.terms")}{" "}
						<Link
							href="/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
						>
							{t("login.termsOfService")}
						</Link>{" "}
						{t("login.and")}{" "}
						<Link
							href="/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
						>
							{t("login.privacyPolicy")}
						</Link>
						.
					</FieldDescription>
				</CardContent>
			</Card>
		</div>
	);
};
