"use client";

import {
	signIn as localSignIn,
	sendVerificationEmail,
	type SignInCredentials,
	type AuthResult,
} from "@/lib/auth/authActions";
import { getAuthRedirectUrl } from "@/lib/auth/redirectConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Lock, LogIn, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Logo } from "@/components/Logo";
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
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
import { getAuthErrorMessage } from "@/lib/auth/errorMessages";

const loginSchema = z.object({
	email: z
		.string()
		.min(1, "El correo es obligatorio.")
		.email("Ingresa un correo válido."),
	password: z.string().min(1, "La contraseña es obligatoria."),
	rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignInFn = (credentials: SignInCredentials) => Promise<AuthResult>;

/**
 * LoginView component for user authentication.
 *
 * Note: Route protection for authenticated users is handled by the proxy.ts
 * middleware at the edge level. Authenticated users are redirected to /account
 * before this component renders, so we don't need client-side session checks here.
 */
export const LoginView = ({
	redirectTo,
	signIn = localSignIn,
	defaultSuccessMessage,
}: {
	redirectTo?: string;
	signIn?: SignInFn;
	defaultSuccessMessage?: string;
}) => {
	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(
		defaultSuccessMessage ?? null,
	);
	const [needsVerification, setNeedsVerification] = useState(false);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [isResending, setIsResending] = useState(false);
	const [resendMessage, setResendMessage] = useState<string | null>(null);
	const [resendError, setResendError] = useState<string | null>(null);

	// Always use dark theme for logo to show white letters (matching previous behavior)
	const logoTheme = "dark" as const;

	const form = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: true,
		},
	});

	const handleSubmit = async (values: LoginValues) => {
		setServerError(null);
		setSuccessMessage(null);
		setNeedsVerification(false);
		setResendMessage(null);
		setResendError(null);

		const email = values.email.trim();
		const result = await signIn({
			email,
			password: values.password,
			rememberMe: values.rememberMe,
		});

		if (!result.success) {
			// Check if error is due to unverified email (403 status)
			const error = result.error;
			if (
				error &&
				typeof error === "object" &&
				"status" in error &&
				error.status === 403
			) {
				setNeedsVerification(true);
				setUserEmail(email);
				setServerError(
					"Por favor verifica tu correo electrónico antes de iniciar sesión.",
				);
			} else {
				setServerError(getAuthErrorMessage(result.error));
			}
			return;
		}

		setSuccessMessage("Acceso validado. Redirigiendo…");
		// Use window.location for external redirects (cross-origin)
		window.location.href = getAuthRedirectUrl(redirectTo);
	};

	const handleResendVerification = async () => {
		if (!userEmail) {
			return;
		}

		setIsResending(true);
		setResendMessage(null);
		setResendError(null);

		const result = await sendVerificationEmail(
			userEmail,
			`${window.location.origin}/verify?success=true`,
		);

		if (!result.success) {
			setResendError(
				result.error?.message || "Error al reenviar el correo de verificación",
			);
		} else {
			setResendMessage(
				"Correo de verificación reenviado. Revisa tu bandeja de entrada.",
			);
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
					<CardTitle className="text-xl">Bienvenido de nuevo</CardTitle>
					<CardDescription>
						Ingresa tus credenciales para acceder a tu cuenta
					</CardDescription>
				</CardHeader>
				<CardContent>
					{successMessage ? (
						<Alert role="status" className="mb-6">
							<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
							<AlertTitle>Autenticación exitosa</AlertTitle>
							<AlertDescription>{successMessage}</AlertDescription>
						</Alert>
					) : null}

					{serverError && !successMessage ? (
						<div className="mb-6 space-y-4">
							<Alert variant="destructive" role="alert">
								<AlertTitle>Error de autenticación</AlertTitle>
								<AlertDescription>{serverError}</AlertDescription>
							</Alert>
							{needsVerification && userEmail ? (
								<div className="space-y-3">
									<Button
										onClick={handleResendVerification}
										disabled={isResending}
										variant="outline"
										className="w-full"
									>
										<Mail className="mr-2 h-4 w-4" />
										{isResending
											? "Enviando..."
											: "Reenviar correo de verificación"}
									</Button>
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
								</div>
							) : null}
						</div>
					) : null}

					<Form {...form}>
						<form
							data-testid="login-form"
							onSubmit={form.handleSubmit(handleSubmit)}
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
													Ingresa tu dirección de correo corporativo
												</FieldDescription>
											</FormItem>
										)}
									/>
								</Field>
								<Field>
									<div className="flex items-center">
										<FieldLabel
											htmlFor="password"
											className="flex items-center gap-2"
										>
											<Lock className="h-4 w-4" aria-hidden="true" />
											Contraseña
										</FieldLabel>
										<Link
											href={
												redirectTo
													? `/recover?redirect_to=${encodeURIComponent(redirectTo)}`
													: "/recover"
											}
											className="ml-auto text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
											aria-label="Recuperar contraseña olvidada"
										>
											¿Olvidaste tu contraseña?
										</Link>
									</div>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														id="password"
														type="password"
														placeholder="Ingresa tu contraseña"
														autoComplete="current-password"
														aria-describedby="password-description"
														required
														{...field}
													/>
												</FormControl>
												<FormMessage />
												<FieldDescription
													id="password-description"
													className="sr-only"
												>
													Ingresa tu contraseña de acceso
												</FieldDescription>
											</FormItem>
										)}
									/>
								</Field>
								<Field>
									<FormField
										control={form.control}
										name="rememberMe"
										render={({ field }) => (
											<FormItem className="flex items-start gap-3 rounded-lg border px-4 py-3">
												<FormControl>
													<Checkbox
														id="rememberMe"
														checked={field.value}
														onCheckedChange={(checked) =>
															field.onChange(checked === true)
														}
														aria-describedby="rememberMe-description"
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel
														htmlFor="rememberMe"
														className="text-sm font-medium cursor-pointer"
													>
														Recordar sesión
													</FormLabel>
													<FieldDescription
														id="rememberMe-description"
														className="text-xs text-muted-foreground"
													>
														Mantén tu sesión activa en este dispositivo
													</FieldDescription>
												</div>
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
												<LogIn
													className="h-4 w-4 animate-pulse"
													aria-hidden="true"
												/>
												Iniciando sesión...
											</span>
										) : (
											<>
												<LogIn className="h-4 w-4" aria-hidden="true" />
												Iniciar sesión
											</>
										)}
									</Button>
									<FieldDescription className="text-center">
										¿Aún no tienes cuenta?{" "}
										<Link
											href="/signup"
											className="font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
											aria-label="Crear una nueva cuenta"
										>
											Regístrate aquí
										</Link>
									</FieldDescription>
								</Field>
							</FieldGroup>
						</form>
					</Form>
					<hr className="my-6 border-t" />
					<FieldDescription className="px-6 text-center text-xs text-muted-foreground">
						<Shield className="h-3 w-3 inline-block mr-1" aria-hidden="true" />
						Al iniciar sesión, aceptas nuestros{" "}
						<Link
							href="/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
							aria-label="Leer términos de servicio"
						>
							Términos de Servicio
						</Link>{" "}
						y{" "}
						<Link
							href="/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
							aria-label="Leer política de privacidad"
						>
							Política de Privacidad
						</Link>
						.
					</FieldDescription>
				</CardContent>
			</Card>
		</div>
	);
};
