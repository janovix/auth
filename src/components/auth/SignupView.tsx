"use client";

import {
	signUp as localSignUp,
	sendVerificationOtp,
	verifyEmailWithOtp,
	isOtpExpiredError,
	isOtpTooManyAttemptsError,
	type SignUpCredentials,
	type AuthResult,
} from "@/lib/auth/authActions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertTriangle,
	CheckCircle2,
	Loader2,
	Mail,
	RefreshCw,
	ShieldCheck,
	User,
	UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
	Checkbox,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from "@/components/ui";
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

type SignupValues = {
	firstName: string;
	lastName: string;
	email: string;
	acceptTerms: boolean;
};
type SignUpFn = (credentials: SignUpCredentials) => Promise<AuthResult>;

const OTP_LENGTH = 6;

export const SignupView = ({
	redirectTo,
	signUp = localSignUp,
}: {
	redirectTo?: string;
	signUp?: SignUpFn;
}) => {
	const { t } = useLanguage();
	const { setPageProfile, setStateModifier } = useAurora();
	const router = useRouter();
	const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [needsVerification, setNeedsVerification] = useState(false);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [isResending, setIsResending] = useState(false);
	const [resendMessage, setResendMessage] = useState<string | null>(null);
	const [resendError, setResendError] = useState<string | null>(null);

	// OTP verification state
	const [otpValue, setOtpValue] = useState("");
	const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
	const [otpError, setOtpError] = useState<string | null>(null);
	const [otpNeedsResend, setOtpNeedsResend] = useState(false);

	// Create schema with translations
	const signupSchema = useMemo(
		() =>
			z.object({
				firstName: z.string().min(1, t("signup.firstName.required")),
				lastName: z.string().min(1, t("signup.lastName.required")),
				email: z
					.string()
					.min(1, t("signup.email.required"))
					.email(t("signup.email.invalid")),
				acceptTerms: z.boolean().refine((value) => value, {
					message: t("signup.terms.required"),
				}),
			}),
		[t],
	);

	// Set aurora page profile to signup (pink/purple) on mount
	useEffect(() => {
		setPageProfile("signup");
	}, [setPageProfile]);

	// Cleanup redirect timeout on unmount
	useEffect(() => {
		return () => {
			if (redirectTimeoutRef.current) {
				clearTimeout(redirectTimeoutRef.current);
			}
		};
	}, []);

	const form = useForm<SignupValues>({
		resolver: zodResolver(signupSchema),
		mode: "onChange",
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			acceptTerms: false,
		},
	});

	// Track form values at time of error to detect actual changes
	const formValuesAtErrorRef = useRef<string | null>(null);
	const otpAtErrorRef = useRef<string | null>(null);

	// Watch form values to reset aurora mode when user starts typing (clears error state)
	const formValues = form.watch();
	const formValuesString = useMemo(
		() => JSON.stringify(formValues),
		[formValues],
	);

	useEffect(() => {
		// Only clear error if form values have actually changed since the error was set
		if (
			serverError &&
			!needsVerification &&
			formValuesAtErrorRef.current !== null &&
			formValuesString !== formValuesAtErrorRef.current
		) {
			setServerError(null);
			setStateModifier("default"); // Reset to pink/purple when editing form
			formValuesAtErrorRef.current = null;
		}
	}, [formValuesString, serverError, needsVerification, setStateModifier]);

	// Reset aurora to default when OTP value changes (clears error state)
	useEffect(() => {
		// Only clear error if OTP has actually changed since the error was set
		if (
			otpError &&
			otpAtErrorRef.current !== null &&
			otpValue !== otpAtErrorRef.current
		) {
			setOtpError(null);
			setStateModifier("default"); // Reset to pink/purple when editing OTP
			otpAtErrorRef.current = null;
		}
	}, [otpValue, otpError, setStateModifier]);

	const handleSubmit = async (values: SignupValues) => {
		setServerError(null);
		setSuccessMessage(null);
		setNeedsVerification(false);
		setResendMessage(null);
		setResendError(null);
		formValuesAtErrorRef.current = null;
		setStateModifier("loading"); // Blue aurora while loading

		const email = values.email.trim();
		const name = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
		const result = await signUp({
			name,
			email,
		});

		if (!result.success) {
			setServerError(getAuthErrorMessage(result.error));
			formValuesAtErrorRef.current = JSON.stringify(values); // Capture form values at time of error
			setStateModifier("error"); // Red aurora on error
			return;
		}

		// Check if email verification is needed (emailVerified can be false, null, or undefined)
		const isEmailVerified = result.data?.user.emailVerified === true;
		if (!isEmailVerified) {
			// NOTE: Do NOT call sendVerificationOtp here!
			// The emailOTP plugin in auth-svc has `sendVerificationOnSignUp: true`,
			// which automatically sends the OTP when the user signs up.
			setNeedsVerification(true);
			setUserEmail(email);
			setSuccessMessage(t("signup.success.message"));
			setStateModifier("default"); // Back to pink/purple after OTP sent
			return;
		}

		// Email is already verified, redirect to login
		setSuccessMessage(t("signup.success.redirect"));
		setStateModifier("success"); // Green aurora on success
		const loginUrl = redirectTo
			? `/login?redirect_to=${encodeURIComponent(redirectTo)}`
			: "/login";
		redirectTimeoutRef.current = setTimeout(() => {
			router.push(loginUrl);
		}, 1500);
	};

	// Handle OTP verification
	const handleVerifyOtp = useCallback(async () => {
		if (!userEmail || otpValue.length !== OTP_LENGTH) {
			return;
		}

		setIsVerifyingOtp(true);
		setOtpError(null);
		setOtpNeedsResend(false);
		otpAtErrorRef.current = null;
		setStateModifier("loading"); // Blue aurora while verifying

		const result = await verifyEmailWithOtp(userEmail, otpValue);

		if (!result.success) {
			// Detect specific OTP error types for better UX
			const isExpired = isOtpExpiredError(result.error);
			const isTooManyAttempts = isOtpTooManyAttemptsError(result.error);

			if (isExpired) {
				setOtpError(t("signup.otp.expired"));
				setOtpNeedsResend(true);
				setOtpValue(""); // Clear the expired OTP
				otpAtErrorRef.current = ""; // Capture OTP value at time of error (empty after clear)
			} else if (isTooManyAttempts) {
				setOtpError(t("signup.otp.tooManyAttempts"));
				setOtpNeedsResend(true);
				setOtpValue(""); // Clear the OTP
				otpAtErrorRef.current = ""; // Capture OTP value at time of error (empty after clear)
			} else {
				// Invalid OTP or unknown error - show message from server
				setOtpError(result.error?.message || t("signup.otp.invalid"));
				otpAtErrorRef.current = otpValue; // Capture current OTP value at time of error
			}

			setIsVerifyingOtp(false);
			setStateModifier("error"); // Red aurora on error
			return;
		}

		// Verification successful!
		// User needs to sign in via OTP to get a session
		setSuccessMessage(t("signup.otp.verified"));
		setStateModifier("success"); // Green aurora on success

		// Short delay to show the success message before redirecting to login
		setTimeout(() => {
			// Preserve the redirectTo parameter so after login, user goes to the right place
			const loginUrl = redirectTo
				? `/login?redirect_to=${encodeURIComponent(redirectTo)}`
				: "/login";
			router.push(loginUrl);
		}, 1500);
	}, [userEmail, otpValue, redirectTo, router, setStateModifier, t]);

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
		setResendMessage(null);
		setResendError(null);
		setOtpValue(""); // Clear current OTP
		setOtpError(null);
		setOtpNeedsResend(false); // Reset the needs-resend state
		setStateModifier("loading"); // Blue aurora while resending

		const result = await sendVerificationOtp(userEmail, "email-verification");

		if (!result.success) {
			setResendError(result.error?.message || t("signup.otp.resendError"));
			setStateModifier("error"); // Red aurora on error
		} else {
			setResendMessage(t("signup.otp.resendSuccess"));
			setStateModifier("default"); // Back to pink/purple after success
		}

		setIsResending(false);
	};

	const isSubmitting = form.formState.isSubmitting;

	return (
		<div className="flex flex-col gap-4 sm:gap-6 w-full">
			<div className="flex justify-center mb-2">
				<Logo variant="logo" />
			</div>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">{t("signup.title")}</CardTitle>
					<CardDescription>{t("signup.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					{successMessage ? (
						<div className="mb-6 space-y-4">
							<Alert role="status">
								<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
								<AlertTitle>
									{needsVerification
										? t("signup.success.title")
										: t("signup.success.titleDone")}
								</AlertTitle>
								<AlertDescription>{successMessage}</AlertDescription>
							</Alert>
							{needsVerification && userEmail ? (
								<div className="space-y-4">
									<Alert>
										<Mail className="h-4 w-4" aria-hidden="true" />
										<AlertTitle>{t("signup.otp.title")}</AlertTitle>
										<AlertDescription>
											{t("signup.otp.description").replace(
												"{email}",
												userEmail,
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
												{t("signup.otp.verifying")}
											</div>
										)}
									</div>

									{otpError && (
										<Alert
											variant={otpNeedsResend ? "destructive" : "destructive"}
											role="alert"
										>
											{otpNeedsResend && (
												<AlertTriangle className="h-4 w-4" aria-hidden="true" />
											)}
											<AlertTitle>
												{otpNeedsResend
													? t("signup.otp.expiredTitle")
													: t("signup.otp.errorTitle")}
											</AlertTitle>
											<AlertDescription>{otpError}</AlertDescription>
										</Alert>
									)}

									{/* Prominent resend button when OTP needs to be resent */}
									{otpNeedsResend ? (
										<Button
											onClick={handleResendOtp}
											disabled={isResending}
											className="w-full"
										>
											{isResending ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													{t("signup.otp.resendNew")}
												</>
											) : (
												<>
													<RefreshCw className="mr-2 h-4 w-4" />
													{t("signup.otp.requestNew")}
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
												? t("signup.otp.resending")
												: t("signup.otp.resend")}
										</Button>
									)}

									{resendMessage && (
										<Alert role="status">
											<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
											<AlertDescription>{resendMessage}</AlertDescription>
										</Alert>
									)}
									{resendError && (
										<Alert variant="destructive" role="alert">
											<AlertDescription>{resendError}</AlertDescription>
										</Alert>
									)}

									<div className="text-center text-sm text-muted-foreground">
										{t("signup.otp.changeEmail")}{" "}
										<button
											type="button"
											onClick={() => {
												setNeedsVerification(false);
												setUserEmail(null);
												setOtpValue("");
												setOtpError(null);
												setOtpNeedsResend(false);
												setSuccessMessage(null);
												setStateModifier("default"); // Reset to pink/purple when going back
											}}
											className="font-medium text-primary underline-offset-4 hover:underline"
										>
											{t("signup.otp.backToForm")}
										</button>
									</div>
								</div>
							) : null}
						</div>
					) : null}

					{serverError && !successMessage ? (
						<Alert variant="destructive" role="alert" className="mb-6">
							<AlertTitle>{t("signup.error.title")}</AlertTitle>
							<AlertDescription>{serverError}</AlertDescription>
						</Alert>
					) : null}

					{/* Hide form when verification is needed */}
					{!needsVerification ? (
						<Form {...form}>
							<form
								data-testid="signup-form"
								onSubmit={form.handleSubmit(handleSubmit)}
							>
								<FieldGroup>
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
															{t("signup.firstName.label")}
														</FieldLabel>
														<FormControl>
															<Input
																id="firstName"
																placeholder={t("signup.firstName.placeholder")}
																autoComplete="given-name"
																aria-describedby="firstName-description"
																required
																{...field}
															/>
														</FormControl>
														<FormMessage />
														<FieldDescription
															id="firstName-description"
															className="sr-only"
														>
															{t("signup.firstName.description")}
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
															{t("signup.lastName.label")}
														</FieldLabel>
														<FormControl>
															<Input
																id="lastName"
																placeholder={t("signup.lastName.placeholder")}
																autoComplete="family-name"
																aria-describedby="lastName-description"
																required
																{...field}
															/>
														</FormControl>
														<FormMessage />
														<FieldDescription
															id="lastName-description"
															className="sr-only"
														>
															{t("signup.lastName.description")}
														</FieldDescription>
													</FormItem>
												)}
											/>
										</div>
									</Field>

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
														{t("signup.email.label")}
													</FieldLabel>
													<FormControl>
														<Input
															id="email"
															type="email"
															placeholder={t("signup.email.placeholder")}
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
														{t("signup.email.description")}
													</FieldDescription>
												</FormItem>
											)}
										/>
									</Field>

									<Field>
										<FormField
											control={form.control}
											name="acceptTerms"
											render={({ field }) => (
												<FormItem className="flex items-start gap-3 rounded-lg border px-4 py-3">
													<FormControl>
														<Checkbox
															id="acceptTerms"
															checked={field.value}
															onCheckedChange={(checked) =>
																field.onChange(checked === true)
															}
															aria-describedby="acceptTerms-description"
														/>
													</FormControl>
													<div className="space-y-1 leading-none">
														<FormLabel
															htmlFor="acceptTerms"
															className="text-sm font-medium cursor-pointer flex items-start gap-2"
														>
															<ShieldCheck
																className="h-4 w-4 mt-0.5 flex-shrink-0"
																aria-hidden="true"
															/>
															<span>
																{t("signup.terms.label")}{" "}
																<Link
																	href="/privacy"
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
																	onClick={(e) => e.stopPropagation()}
																>
																	{t("signup.terms.termsAndConditions")}
																</Link>{" "}
																{t("signup.terms.andThe")}{" "}
																<Link
																	href="/privacy"
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
																	onClick={(e) => e.stopPropagation()}
																>
																	{t("signup.terms.privacyNotice")}
																</Link>
															</span>
														</FormLabel>
														<FormMessage />
														<FieldDescription
															id="acceptTerms-description"
															className="sr-only"
														>
															{t("signup.terms.description")}
														</FieldDescription>
													</div>
												</FormItem>
											)}
										/>
									</Field>

									<Field>
										<Button
											type="submit"
											disabled={isSubmitting}
											className="w-full"
											aria-busy={isSubmitting}
										>
											{isSubmitting ? (
												<span className="flex items-center justify-center gap-2">
													<UserPlus
														className="h-4 w-4 animate-pulse"
														aria-hidden="true"
													/>
													{t("signup.button.creating")}
												</span>
											) : (
												<>
													<UserPlus className="h-4 w-4" aria-hidden="true" />
													{t("signup.button.create")}
												</>
											)}
										</Button>
										<FieldDescription className="text-center">
											{t("signup.hasAccount")}{" "}
											<Link
												href="/login"
												className="font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
											>
												{t("signup.loginLink")}
											</Link>
										</FieldDescription>
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
