"use client";

import * as Sentry from "@sentry/nextjs";
import {
	sendVerificationOtp as localSendOtp,
	signInWithOtp as localSignInWithOtp,
	isOtpExpiredError,
	isOtpTooManyAttemptsError,
	isBannedUserError,
	isRateLimitError,
	type AuthResult,
	type SendOtpOptions,
} from "@/lib/auth/authActions";
import { useResendCooldown } from "@/hooks/useResendCooldown";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertTriangle,
	CheckCircle2,
	Mail,
	RefreshCw,
	Shield,
} from "lucide-react";
import { SendHorizontal } from "@/components/animate-ui/icons/send-horizontal";
import {
	authClient,
	AUTH_RATE_LIMIT_EVENT,
	type RateLimitEventDetail,
} from "@/lib/auth/authClient";
import Link from "next/link";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import { Logo } from "@/components/Logo";
import { useTurnstile } from "@/contexts/turnstile-context";
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
import { Spinner } from "@/components/ui/spinner";
import { getAuthErrorMessage } from "@/lib/auth/errorMessages";
import {
	DEFAULT_POST_AUTH_ROUTE,
	isSafeRedirectToQueryValue,
	resolveSafeRedirectUrl,
} from "@/lib/auth/safeRedirect";
import { useAurora } from "@/contexts/aurora-context";
import { useLanguage } from "@/contexts/language-context";
import { LoginSuccessAnimation } from "./LoginSuccessAnimation";

type EmailValues = { email: string };
type SendOtpFn = (
	email: string,
	type: "sign-in",
	options?: SendOtpOptions,
) => Promise<AuthResult<{ message: string; rateLimited?: boolean }>>;
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
	const { siteKey: TURNSTILE_SITE_KEY } = useTurnstile();
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
	const [isBanned, setIsBanned] = useState(false);

	// Resend cooldown - duration is dynamically set from X-Retry-After header
	const { secondsRemaining, isOnCooldown, startCooldown, resetCooldown } =
		useResendCooldown();

	// Success animation state
	const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
	const redirectUrlRef = useRef<string>("");

	// Turnstile captcha state
	const [captchaToken, setCaptchaToken] = useState<string | null>(null);
	const [captchaError, setCaptchaError] = useState(false);
	const turnstileRef = useRef<TurnstileInstance>(null);
	// Track if we're waiting for captcha to complete before sending/resending OTP
	const [pendingSend, setPendingSend] = useState(false);
	const [pendingResend, setPendingResend] = useState(false);

	// Loading states for social/passkey sign-in methods
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

	// Set aurora page profile to login on mount
	useEffect(() => {
		setPageProfile("login");
	}, [setPageProfile]);

	// Conditional UI (passkey autofill) — silently activates if browser has matching credentials
	useEffect(() => {
		if (
			typeof PublicKeyCredential === "undefined" ||
			!PublicKeyCredential.isConditionalMediationAvailable
		) {
			return;
		}

		void PublicKeyCredential.isConditionalMediationAvailable().then(
			(available) => {
				if (!available) return;
				void authClient.signIn.passkey({ autoFill: true });
			},
		);
	}, []);

	// Listen for rate limit events from authClient to set cooldown dynamically
	// The cooldown duration comes from the server's X-Retry-After header
	useEffect(() => {
		const handleRateLimit = (event: Event) => {
			const customEvent = event as CustomEvent<RateLimitEventDetail>;
			const retryAfter = customEvent.detail?.retryAfter;

			console.log("[LoginView] Rate limit event received:", {
				retryAfter,
				isOnCooldown,
				secondsRemaining,
			});

			if (!retryAfter || retryAfter <= 0) {
				console.warn("[LoginView] Invalid retryAfter value");
				return;
			}

			startCooldown(retryAfter);
		};

		window.addEventListener(AUTH_RATE_LIMIT_EVENT, handleRateLimit);

		return () => {
			window.removeEventListener(AUTH_RATE_LIMIT_EVENT, handleRateLimit);
		};
	}, [startCooldown, isOnCooldown, secondsRemaining]);

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

	// Internal function to send OTP with token
	const sendOtpWithToken = async (email: string, token: string | null) => {
		setServerError(null);
		setSuccessMessage(null);
		setOtpError(null);
		setOtpNeedsResend(false);
		emailAtErrorRef.current = null;
		setStateModifier("loading"); // Blue aurora while loading

		// IMPORTANT: Wait for the server response before transitioning to OTP input
		// Previously this was optimistic, but caused users to see the input page
		// even when the OTP send failed or timed out on the backend
		const result = await sendOtp(email, "sign-in", {
			captchaToken: token || undefined,
		});

		// Reset captcha after use (token is single-use)
		setCaptchaToken(null);
		turnstileRef.current?.reset();

		// Now safe to clear pendingSend since request completed
		setPendingSend(false);

		if (!result.success) {
			// Show error on email input screen
			const errorMessage =
				result.error && isRateLimitError(result.error)
					? t("login.otp.rateLimited")
					: getAuthErrorMessage(result.error);
			setServerError(errorMessage);
			emailAtErrorRef.current = email;
			setStateModifier("error");
			return;
		}

		// Success! Now transition to OTP input screen
		setUserEmail(email);
		setOtpSent(true);
		setSuccessMessage(t("login.success.message"));

		// Show different message if rate-limited (OTP already sent)
		if (result.data?.rateLimited) {
			setSuccessMessage(
				t("login.success.rateLimited") ||
					"A code was already sent. Check your email.",
			);
		}

		setStateModifier("default");
		// Note: Cooldown is now started automatically by the AUTH_RATE_LIMIT_EVENT listener
		// when the server returns a 429 response with X-Retry-After header
	};

	const handleSendOtp = async (values: EmailValues) => {
		const email = values.email.trim();

		// If captcha is required but no token, show captcha and wait for resolution
		if (TURNSTILE_SITE_KEY && !captchaToken) {
			setPendingSend(true);
			setCaptchaError(false);
			return;
		}

		setPendingSend(true);
		await sendOtpWithToken(email, captchaToken);
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
			const isBannedUser = isBannedUserError(result.error);

			// IMPORTANT: Always clear OTP value on ANY error to prevent auto-submit loop.
			// The auto-submit effect triggers when otpValue.length === 6 && !isVerifyingOtp,
			// so keeping the OTP value would cause an infinite verification loop.
			setOtpValue("");
			otpAtErrorRef.current = "";

			if (isBannedUser) {
				setOtpError(t("login.banned.message"));
				setIsBanned(true);
			} else if (isExpired) {
				setOtpError(t("login.otp.expired"));
				setOtpNeedsResend(true);
			} else if (isTooManyAttempts) {
				// Server returned TOO_MANY_ATTEMPTS - OTP is now invalid
				// User must request a new code (Better Auth default: 3 attempts)
				setOtpError(t("login.otp.tooManyAttempts"));
				setOtpNeedsResend(true);
			} else {
				// Invalid OTP - user can try again until server returns TOO_MANY_ATTEMPTS
				// Always use translated message for better UX (server returns "Invalid OTP")
				setOtpError(t("login.otp.invalid"));
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
			const onboardingUrl = new URL("/onboarding", window.location.origin);
			const safeRedirectParam =
				redirectTo &&
				isSafeRedirectToQueryValue(
					redirectTo,
					window.location.origin,
					process.env,
				)
					? redirectTo
					: DEFAULT_POST_AUTH_ROUTE;
			onboardingUrl.searchParams.set("redirect_to", safeRedirectParam);
			redirectUrlRef.current = onboardingUrl.toString();
		} else {
			redirectUrlRef.current = resolveSafeRedirectUrl(
				redirectTo ?? null,
				window.location.origin,
			);
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

	const handleResendOtp = async (tokenOverride?: string) => {
		if (!userEmail) {
			return;
		}

		const token = tokenOverride || captchaToken;

		// If captcha is required but no token, show captcha and wait for resolution
		if (TURNSTILE_SITE_KEY && !token) {
			setPendingResend(true);
			setCaptchaError(false);
			// Captcha widget will be shown, and when resolved, will auto-trigger resend
			return;
		}

		setIsResending(true);
		setPendingResend(false);
		setOtpError(null);
		setOtpNeedsResend(false);
		setOtpValue("");
		setStateModifier("loading"); // Blue aurora while resending

		const result = await sendOtp(userEmail, "sign-in", {
			captchaToken: token || undefined,
		});

		// Reset captcha after use (token is single-use)
		setCaptchaToken(null);
		turnstileRef.current?.reset();

		if (!result.success) {
			const errorMessage =
				result.error && isRateLimitError(result.error)
					? t("login.otp.rateLimited")
					: result.error?.message || t("login.otp.resendError");
			setOtpError(errorMessage);
			setStateModifier("error");
		} else {
			setSuccessMessage(t("login.otp.resendSuccess"));
			setStateModifier("default"); // Back to purple after success
			// Note: Cooldown is now started automatically by the AUTH_RATE_LIMIT_EVENT listener
			// when the server returns a 429 response with X-Retry-After header
		}

		setIsResending(false);
	};

	const handleBackToEmail = () => {
		setOtpSent(false);
		setUserEmail(null);
		setOtpValue("");
		setOtpError(null);
		setOtpNeedsResend(false);
		setIsBanned(false);
		setSuccessMessage(null);
		setPendingSend(false);
		setPendingResend(false);
		setStateModifier("default");
		resetCooldown();
	};

	const handleGoogleSignIn = async () => {
		if (anyAuthLoading) return;
		try {
			setServerError(null);
			setIsGoogleLoading(true);
			setStateModifier("loading"); // Blue aurora while loading

			// Sign in with Google - this will redirect to Google OAuth flow
			// callbackURL is where the user should be sent AFTER successful OAuth
			// (not the OAuth callback endpoint - that's automatic at /api/auth/callback/google)
			const finalRedirectUrl = resolveSafeRedirectUrl(
				redirectTo ?? null,
				window.location.origin,
			);

			await authClient.signIn.social({
				provider: "google",
				callbackURL: finalRedirectUrl,
			});
			// Page redirects on success — no cleanup needed
		} catch (error) {
			Sentry.captureException(error, {
				tags: { context: "google-signin-error" },
			});
			setServerError(
				error instanceof Error
					? error.message
					: t("login.error.google") || "Failed to sign in with Google",
			);
			setStateModifier("error");
			setIsGoogleLoading(false);
		}
	};

	const handlePasskeySignIn = async () => {
		if (anyAuthLoading) return;
		try {
			setServerError(null);
			setIsPasskeyLoading(true);
			setStateModifier("loading");

			const finalRedirectUrl = resolveSafeRedirectUrl(
				redirectTo ?? null,
				window.location.origin,
			);

			const { data, error } = await authClient.signIn.passkey();
			if (error) {
				Sentry.captureException(new Error(error.message), {
					tags: { context: "passkey-signin-error" },
				});
				setServerError(
					t("login.passkey.error") ||
						"Passkey sign-in failed. Please try again.",
				);
				setStateModifier("error");
				return;
			}
			if (data) {
				setStateModifier("success");
				setShowSuccessAnimation(true);
				setTimeout(() => {
					window.location.href = finalRedirectUrl;
				}, 2000);
			}
		} catch (error) {
			Sentry.captureException(error, {
				tags: { context: "passkey-signin-error" },
			});
			setServerError(
				t("login.passkey.error") || "Passkey sign-in failed. Please try again.",
			);
			setStateModifier("error");
		} finally {
			setIsPasskeyLoading(false);
		}
	};

	const isSubmitting = form.formState.isSubmitting;

	// True whenever any auth method is in progress — disables all buttons to
	// prevent rage-clicks and accidental multi-method submissions.
	const anyAuthLoading =
		isSubmitting || pendingSend || isGoogleLoading || isPasskeyLoading;

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
					{successMessage && !otpError && !otpSent ? (
						<Alert role="status" className="mb-6">
							<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
							<AlertTitle>{t("login.success.auth")}</AlertTitle>
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
															className="h-11 px-4"
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

									{/* Turnstile Captcha Widget for Initial Send - hidden when invisible */}
									{TURNSTILE_SITE_KEY && pendingSend && (
										<div className="sr-only">
											<Turnstile
												ref={turnstileRef}
												siteKey={TURNSTILE_SITE_KEY}
												onSuccess={(token) => {
													setCaptchaToken(token);
													setCaptchaError(false);
													const currentEmail = form.getValues("email");
													sendOtpWithToken(currentEmail, token);
												}}
												onError={() => {
													setCaptchaToken(null);
													setCaptchaError(true);
													setPendingSend(false);
												}}
												onExpire={() => {
													setCaptchaToken(null);
													setPendingSend(false);
												}}
												options={{
													theme: "auto",
													size: "invisible",
													appearance: "interaction-only",
												}}
											/>
										</div>
									)}

									<Field>
										<Button
											type="submit"
											className="w-full h-11 gap-3 px-6"
											loading={isSubmitting || pendingSend}
											disabled={anyAuthLoading || isOnCooldown}
										>
											{isOnCooldown ? (
												<>
													<RefreshCw className="h-5 w-5" aria-hidden="true" />
													{t("login.otp.resendWait").replace(
														"{seconds}",
														String(secondsRemaining),
													)}
												</>
											) : isSubmitting || pendingSend ? (
												t("login.button.sending")
											) : (
												<>
													<SendHorizontal
														animateOnHover
														size={20}
														aria-hidden="true"
													/>
													{t("login.button.send")}
												</>
											)}
										</Button>
									</Field>

									{/* Divider */}
									<div className="relative py-2">
										<div className="absolute inset-0 flex items-center">
											<span className="w-full border-t" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-background px-2 text-muted-foreground">
												{t("login.or") || "Or continue with"}
											</span>
										</div>
									</div>

									{/* Google Sign In Button */}
									<Field>
										<Button
											type="button"
											variant="outline"
											className="w-full h-11 gap-3 px-6"
											onClick={handleGoogleSignIn}
											loading={isGoogleLoading}
											disabled={anyAuthLoading}
										>
											{!isGoogleLoading && (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src="/google.svg"
													alt=""
													className="h-5 w-5"
													aria-hidden="true"
												/>
											)}
											{isGoogleLoading
												? t("login.button.loading")
												: t("login.button.google")}
										</Button>
									</Field>

									{/* Passkey Sign In Button */}
									<Field>
										<Button
											type="button"
											variant="outline"
											className="w-full h-11 gap-3 px-6"
											onClick={handlePasskeySignIn}
											loading={isPasskeyLoading}
											disabled={anyAuthLoading}
										>
											{!isPasskeyLoading && (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src="/passkey.svg"
													alt=""
													className="h-5 w-5"
													aria-hidden="true"
												/>
											)}
											{isPasskeyLoading
												? t("login.button.loading")
												: t("login.passkey.button")}
										</Button>
									</Field>
								</FieldGroup>
							</form>
						</Form>
					) : (
						// Step 2: OTP input (or banned state)
						<div className="space-y-4">
							{/* Show banned error alert when user is banned */}
							{isBanned ? (
								<>
									<Alert variant="destructive" role="alert">
										<AlertTriangle className="h-4 w-4" aria-hidden="true" />
										<AlertTitle>{t("login.banned.title")}</AlertTitle>
										<AlertDescription>{otpError}</AlertDescription>
									</Alert>

									<Button
										onClick={handleBackToEmail}
										variant="outline"
										className="w-full"
									>
										<Mail className="mr-2 h-4 w-4" />
										{t("login.banned.tryDifferentEmail")}
									</Button>
								</>
							) : (
								<>
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
											autoFocus
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
												<Spinner className="h-4 w-4" />
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

									{/* Turnstile Captcha Widget for Resend - hidden when invisible */}
									{TURNSTILE_SITE_KEY && pendingResend && (
										<div className="sr-only">
											<Turnstile
												ref={turnstileRef}
												siteKey={TURNSTILE_SITE_KEY}
												onSuccess={(token) => {
													setCaptchaToken(token);
													setCaptchaError(false);
													// Auto-trigger resend after captcha success
													handleResendOtp(token);
												}}
												onError={() => {
													setCaptchaToken(null);
													setCaptchaError(true);
													setPendingResend(false);
												}}
												onExpire={() => {
													setCaptchaToken(null);
													setPendingResend(false);
												}}
												options={{
													theme: "auto",
													size: "invisible",
													appearance: "interaction-only",
												}}
											/>
										</div>
									)}

									{/* Resend button */}
									{otpNeedsResend ? (
										<Button
											onClick={() => handleResendOtp()}
											loading={isResending || pendingResend}
											disabled={isOnCooldown}
											className="w-full"
										>
											{isOnCooldown ? (
												<>
													<RefreshCw className="mr-2 h-4 w-4" />
													{t("login.otp.resendWait").replace(
														"{seconds}",
														String(secondsRemaining),
													)}
												</>
											) : isResending || pendingResend ? (
												t("login.otp.resendNew")
											) : (
												<>
													<RefreshCw className="mr-2 h-4 w-4" />
													{t("login.otp.requestNew")}
												</>
											)}
										</Button>
									) : (
										<Button
											onClick={() => handleResendOtp()}
											loading={isResending || pendingResend}
											disabled={isVerifyingOtp || isOnCooldown}
											variant="outline"
											className="w-full"
										>
											{!(isResending || pendingResend) && (
												<Mail className="mr-2 h-4 w-4" />
											)}
											{isResending || pendingResend
												? t("login.otp.resending")
												: isOnCooldown
													? t("login.otp.resendWait").replace(
															"{seconds}",
															String(secondsRemaining),
														)
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
								</>
							)}
						</div>
					)}

					<hr className="my-6 border-t" />
					<FieldDescription className="px-6 text-center text-xs text-muted-foreground">
						<Shield className="h-3 w-3 inline-block mr-1" aria-hidden="true" />
						{t("login.terms")}{" "}
						<Link
							href="https://www.janovix.com/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
						>
							{t("login.termsOfService")}
						</Link>{" "}
						{t("login.and")}{" "}
						<Link
							href="https://www.janovix.com/terms"
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
