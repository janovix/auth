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

const signupSchema = z.object({
	firstName: z.string().min(1, "Tu nombre es obligatorio."),
	lastName: z.string().min(1, "Tu apellido es obligatorio."),
	email: z
		.string()
		.min(1, "El correo es obligatorio.")
		.email("Ingresa un correo válido."),
	acceptTerms: z.boolean().refine((value) => value, {
		message: "Debes aceptar los términos y condiciones.",
	}),
});

type SignupValues = z.infer<typeof signupSchema>;
type SignUpFn = (credentials: SignUpCredentials) => Promise<AuthResult>;

const OTP_LENGTH = 6;

export const SignupView = ({
	redirectTo,
	signUp = localSignUp,
}: {
	redirectTo?: string;
	signUp?: SignUpFn;
}) => {
	const { setMode } = useAurora();
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

	// Always use dark theme for logo to show white letters
	const logoTheme = "dark" as const;

	// Set aurora mode to signup (pink/purple) on mount and cleanup on unmount
	useEffect(() => {
		setMode("signup");
		return () => {
			setMode("login");
		};
	}, [setMode]);

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
			setMode("signup"); // Reset to pink/purple when editing form
			formValuesAtErrorRef.current = null;
		}
	}, [formValuesString, serverError, needsVerification, setMode]);

	// Reset aurora to signup mode when OTP value changes (clears error state)
	useEffect(() => {
		// Only clear error if OTP has actually changed since the error was set
		if (
			otpError &&
			otpAtErrorRef.current !== null &&
			otpValue !== otpAtErrorRef.current
		) {
			setOtpError(null);
			setMode("signup"); // Reset to pink/purple when editing OTP
			otpAtErrorRef.current = null;
		}
	}, [otpValue, otpError, setMode]);

	const handleSubmit = async (values: SignupValues) => {
		setServerError(null);
		setSuccessMessage(null);
		setNeedsVerification(false);
		setResendMessage(null);
		setResendError(null);
		formValuesAtErrorRef.current = null;
		setMode("loading"); // Blue aurora while loading

		const email = values.email.trim();
		const name = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
		const result = await signUp({
			name,
			email,
		});

		if (!result.success) {
			setServerError(getAuthErrorMessage(result.error));
			formValuesAtErrorRef.current = JSON.stringify(values); // Capture form values at time of error
			setMode("error"); // Red aurora on error
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
			setSuccessMessage(
				"Hemos enviado un código de 6 dígitos a tu correo. Ingrésalo a continuación para verificar tu cuenta.",
			);
			setMode("signup"); // Back to pink/purple after OTP sent
			return;
		}

		// Email is already verified, redirect to login
		setSuccessMessage("Cuenta creada. Redirigiendo al inicio de sesión…");
		setMode("success"); // Green aurora on success
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
		setMode("loading"); // Blue aurora while verifying

		const result = await verifyEmailWithOtp(userEmail, otpValue);

		if (!result.success) {
			// Detect specific OTP error types for better UX
			const isExpired = isOtpExpiredError(result.error);
			const isTooManyAttempts = isOtpTooManyAttemptsError(result.error);

			if (isExpired) {
				setOtpError(
					"El código ha expirado. Los códigos son válidos por 5 minutos. Solicita uno nuevo.",
				);
				setOtpNeedsResend(true);
				setOtpValue(""); // Clear the expired OTP
				otpAtErrorRef.current = ""; // Capture OTP value at time of error (empty after clear)
			} else if (isTooManyAttempts) {
				setOtpError(
					"Has excedido el número de intentos. Por seguridad, solicita un nuevo código.",
				);
				setOtpNeedsResend(true);
				setOtpValue(""); // Clear the OTP
				otpAtErrorRef.current = ""; // Capture OTP value at time of error (empty after clear)
			} else {
				// Invalid OTP or unknown error - show message from server
				setOtpError(
					result.error?.message || "Código incorrecto. Inténtalo de nuevo.",
				);
				otpAtErrorRef.current = otpValue; // Capture current OTP value at time of error
			}

			setIsVerifyingOtp(false);
			setMode("error"); // Red aurora on error
			return;
		}

		// Verification successful!
		// User needs to sign in via OTP to get a session
		setSuccessMessage(
			"¡Correo verificado! Por favor inicia sesión para continuar.",
		);
		setMode("success"); // Green aurora on success

		// Short delay to show the success message before redirecting to login
		setTimeout(() => {
			// Preserve the redirectTo parameter so after login, user goes to the right place
			const loginUrl = redirectTo
				? `/login?redirect_to=${encodeURIComponent(redirectTo)}`
				: "/login";
			router.push(loginUrl);
		}, 1500);
	}, [userEmail, otpValue, redirectTo, router, setMode]);

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
		setMode("loading"); // Blue aurora while resending

		const result = await sendVerificationOtp(userEmail, "email-verification");

		if (!result.success) {
			setResendError(
				result.error?.message || "Error al reenviar el código de verificación",
			);
			setMode("error"); // Red aurora on error
		} else {
			setResendMessage(
				"Nuevo código enviado. Revisa tu correo (válido por 5 minutos).",
			);
			setMode("signup"); // Back to pink/purple after success
		}

		setIsResending(false);
	};

	const isSubmitting = form.formState.isSubmitting;

	return (
		<div className="flex flex-col gap-4 sm:gap-6 w-full">
			<div className="flex justify-center mb-2">
				<Logo variant="logo" forceTheme={logoTheme} />
			</div>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Crea tu cuenta</CardTitle>
					<CardDescription>
						Completa el formulario para comenzar
					</CardDescription>
				</CardHeader>
				<CardContent>
					{successMessage ? (
						<div className="mb-6 space-y-4">
							<Alert role="status">
								<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
								<AlertTitle>
									{needsVerification
										? "Cuenta creada — Verificación pendiente"
										: "Cuenta creada exitosamente"}
								</AlertTitle>
								<AlertDescription>{successMessage}</AlertDescription>
							</Alert>
							{needsVerification && userEmail ? (
								<div className="space-y-4">
									<Alert>
										<Mail className="h-4 w-4" aria-hidden="true" />
										<AlertTitle>Ingresa el código de verificación</AlertTitle>
										<AlertDescription>
											Enviamos un código de 6 dígitos a{" "}
											<strong>{userEmail}</strong>. Revisa tu bandeja de entrada
											(y la carpeta de spam).
										</AlertDescription>
									</Alert>

									{/* OTP Input */}
									<div className="flex flex-col items-center gap-4">
										<InputOTP
											maxLength={OTP_LENGTH}
											value={otpValue}
											onChange={setOtpValue}
											disabled={isVerifyingOtp}
											aria-label="Código de verificación"
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
												Verificando...
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
													? "Código expirado o inválido"
													: "Error de verificación"}
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
													Enviando nuevo código...
												</>
											) : (
												<>
													<RefreshCw className="mr-2 h-4 w-4" />
													Solicitar nuevo código
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
											{isResending ? "Enviando..." : "Reenviar código"}
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
										¿Necesitas cambiar tu correo?{" "}
										<button
											type="button"
											onClick={() => {
												setNeedsVerification(false);
												setUserEmail(null);
												setOtpValue("");
												setOtpError(null);
												setOtpNeedsResend(false);
												setSuccessMessage(null);
												setMode("signup"); // Reset to pink/purple when going back
											}}
											className="font-medium text-primary underline-offset-4 hover:underline"
										>
											Volver al formulario
										</button>
									</div>
								</div>
							) : null}
						</div>
					) : null}

					{serverError && !successMessage ? (
						<Alert variant="destructive" role="alert" className="mb-6">
							<AlertTitle>Error al crear la cuenta</AlertTitle>
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
															Nombre
														</FieldLabel>
														<FormControl>
															<Input
																id="firstName"
																placeholder="Mariana"
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
															Tu nombre de pila
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
															Apellido
														</FieldLabel>
														<FormControl>
															<Input
																id="lastName"
																placeholder="López"
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
															Tu apellido
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
														Correo electrónico
													</FieldLabel>
													<FormControl>
														<Input
															id="email"
															type="email"
															placeholder="tu@empresa.com"
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
														Tu dirección de correo corporativo
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
																Acepto los{" "}
																<Link
																	href="/privacy"
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
																	onClick={(e) => e.stopPropagation()}
																>
																	términos y condiciones
																</Link>{" "}
																y el{" "}
																<Link
																	href="/privacy"
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
																	onClick={(e) => e.stopPropagation()}
																>
																	aviso de privacidad
																</Link>
															</span>
														</FormLabel>
														<FormMessage />
														<FieldDescription
															id="acceptTerms-description"
															className="sr-only"
														>
															Debes aceptar los términos y condiciones para
															continuar
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
													Creando cuenta...
												</span>
											) : (
												<>
													<UserPlus className="h-4 w-4" aria-hidden="true" />
													Crear cuenta
												</>
											)}
										</Button>
										<FieldDescription className="text-center">
											¿Ya tienes cuenta?{" "}
											<Link
												href="/login"
												className="font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
												aria-label="Iniciar sesión con una cuenta existente"
											>
												Inicia sesión
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
