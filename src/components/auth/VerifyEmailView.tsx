"use client";

import { sendVerificationEmail } from "@/lib/auth/authActions";
import {
	ArrowLeft,
	CheckCircle2,
	LogIn,
	Mail,
	MailCheck,
	RefreshCw,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
} from "@/components/ui";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";

type VerifyEmailViewProps = {
	success?: boolean;
	error?: string;
	email?: string;
};

export const VerifyEmailView = ({
	success,
	error,
	email,
}: VerifyEmailViewProps) => {
	const [isResending, setIsResending] = useState(false);
	const [resendMessage, setResendMessage] = useState<string | null>(null);
	const [resendError, setResendError] = useState<string | null>(null);

	// Always use dark theme for logo to show white letters
	const logoTheme = "dark" as const;

	const handleResend = async () => {
		if (!email) {
			setResendError("No se proporcionó un correo electrónico");
			return;
		}

		setIsResending(true);
		setResendMessage(null);
		setResendError(null);

		const result = await sendVerificationEmail(email);

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

	// Determine the current state for card description
	const getDescription = () => {
		if (success) {
			return "Tu correo electrónico ha sido verificado exitosamente";
		}
		if (error) {
			return "Hubo un problema al verificar tu correo electrónico";
		}
		return "Verificando tu correo electrónico...";
	};

	return (
		<div className="flex flex-col gap-4 sm:gap-6 w-full">
			<div className="flex justify-center mb-2">
				<Logo variant="logo" forceTheme={logoTheme} />
			</div>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Verificación de correo</CardTitle>
					<CardDescription>{getDescription()}</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						{/* Success State */}
						{success ? (
							<>
								<Field>
									<Alert role="status" data-testid="verify-success-alert">
										<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
										<AlertTitle>Verificación exitosa</AlertTitle>
										<AlertDescription>
											Tu correo electrónico ha sido verificado correctamente. Ya
											puedes iniciar sesión con tu cuenta.
										</AlertDescription>
									</Alert>
								</Field>

								<Field>
									<div className="flex items-start gap-3 rounded-lg border border-dashed border-primary/20 bg-muted/40 p-4 text-sm">
										<MailCheck
											className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
											aria-hidden="true"
										/>
										<p className="text-muted-foreground">
											Tu cuenta está lista para usar. Ahora puedes acceder a
											todas las funcionalidades de la plataforma.
										</p>
									</div>
								</Field>

								<Field>
									<Button asChild className="w-full">
										<Link href="/login">
											<LogIn className="h-4 w-4" aria-hidden="true" />
											Ir a iniciar sesión
										</Link>
									</Button>
								</Field>
							</>
						) : null}

						{/* Error State */}
						{error && !success ? (
							<>
								<Field>
									<Alert
										variant="destructive"
										role="alert"
										data-testid="verify-error-alert"
									>
										<XCircle className="h-4 w-4" aria-hidden="true" />
										<AlertTitle>Error de verificación</AlertTitle>
										<AlertDescription>
											{error === "invalid_token"
												? "El enlace de verificación no es válido o ha expirado. Por favor, solicita un nuevo enlace de verificación."
												: "No se pudo verificar tu correo electrónico. Por favor, intenta nuevamente o solicita un nuevo enlace."}
										</AlertDescription>
									</Alert>
								</Field>

								{email ? (
									<>
										<Field>
											<div className="flex items-start gap-3 rounded-lg border border-dashed border-primary/20 bg-muted/40 p-4 text-sm">
												<Mail
													className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
													aria-hidden="true"
												/>
												<p className="text-muted-foreground">
													Si necesitas un nuevo enlace de verificación, puedes
													solicitarlo a continuación. El enlace se enviará a{" "}
													<strong className="text-foreground">{email}</strong>.
												</p>
											</div>
										</Field>

										<Field>
											<Button
												onClick={handleResend}
												disabled={isResending}
												className="w-full"
												variant="outline"
												aria-busy={isResending}
											>
												{isResending ? (
													<span className="flex items-center justify-center gap-2">
														<RefreshCw
															className="h-4 w-4 animate-spin"
															aria-hidden="true"
														/>
														Enviando...
													</span>
												) : (
													<>
														<Mail className="h-4 w-4" aria-hidden="true" />
														Reenviar correo de verificación
													</>
												)}
											</Button>
										</Field>

										{resendMessage ? (
											<Field>
												<Alert role="status">
													<CheckCircle2
														className="h-4 w-4"
														aria-hidden="true"
													/>
													<AlertTitle>Correo enviado</AlertTitle>
													<AlertDescription>{resendMessage}</AlertDescription>
												</Alert>
											</Field>
										) : null}

										{resendError ? (
											<Field>
												<Alert variant="destructive" role="alert">
													<XCircle className="h-4 w-4" aria-hidden="true" />
													<AlertDescription>{resendError}</AlertDescription>
												</Alert>
											</Field>
										) : null}
									</>
								) : null}

								<Field>
									<FieldDescription className="text-center">
										<Link
											href="/login"
											className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
											aria-label="Volver al inicio de sesión"
										>
											<ArrowLeft className="h-3 w-3" aria-hidden="true" />
											Volver al inicio de sesión
										</Link>
									</FieldDescription>
								</Field>
							</>
						) : null}

						{/* Loading/Pending State */}
						{!success && !error ? (
							<>
								<Field>
									<Alert role="status">
										<Mail
											className="h-4 w-4 animate-pulse"
											aria-hidden="true"
										/>
										<AlertTitle>Verificando...</AlertTitle>
										<AlertDescription>
											Por favor espera mientras verificamos tu correo
											electrónico. Esto puede tomar unos segundos.
										</AlertDescription>
									</Alert>
								</Field>

								<Field>
									<div className="flex items-start gap-3 rounded-lg border border-dashed border-primary/20 bg-muted/40 p-4 text-sm">
										<MailCheck
											className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
											aria-hidden="true"
										/>
										<p className="text-muted-foreground">
											Si fuiste redirigido aquí desde tu correo electrónico, la
											verificación se completará automáticamente.
										</p>
									</div>
								</Field>

								<Field>
									<FieldDescription className="text-center">
										<Link
											href="/login"
											className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
											aria-label="Volver al inicio de sesión"
										>
											<ArrowLeft className="h-3 w-3" aria-hidden="true" />
											Volver al inicio de sesión
										</Link>
									</FieldDescription>
								</Field>
							</>
						) : null}
					</FieldGroup>
				</CardContent>
			</Card>
		</div>
	);
};
