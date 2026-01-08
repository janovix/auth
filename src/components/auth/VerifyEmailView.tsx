"use client";

import {
	ArrowLeft,
	CheckCircle2,
	LogIn,
	MailCheck,
	XCircle,
} from "lucide-react";
import Link from "next/link";

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

/**
 * VerifyEmailView - Success/error page for email verification.
 *
 * This page is shown after successful OTP verification or if there's an error.
 * Note: Email verification now uses OTP codes entered inline in the signup flow,
 * so this page mainly serves as a success confirmation or error display.
 */
export const VerifyEmailView = ({ success, error }: VerifyEmailViewProps) => {
	// Always use dark theme for logo to show white letters
	const logoTheme = "dark" as const;

	// Determine the current state for card description
	const getDescription = () => {
		if (success) {
			return "Tu correo electrónico ha sido verificado exitosamente";
		}
		if (error) {
			return "Hubo un problema al verificar tu correo electrónico";
		}
		return "Estado de verificación de correo";
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
											No se pudo verificar tu correo electrónico. Por favor,
											inicia sesión o regístrate nuevamente para recibir un
											código de verificación.
										</AlertDescription>
									</Alert>
								</Field>

								<Field>
									<Button asChild className="w-full">
										<Link href="/login">
											<LogIn className="h-4 w-4" aria-hidden="true" />
											Ir a iniciar sesión
										</Link>
									</Button>
								</Field>

								<Field>
									<FieldDescription className="text-center">
										<Link
											href="/signup"
											className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
											aria-label="Crear una cuenta nueva"
										>
											¿No tienes cuenta? Regístrate
										</Link>
									</FieldDescription>
								</Field>
							</>
						) : null}

						{/* Default State - No success or error */}
						{!success && !error ? (
							<>
								<Field>
									<div className="flex items-start gap-3 rounded-lg border border-dashed border-primary/20 bg-muted/40 p-4 text-sm">
										<MailCheck
											className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
											aria-hidden="true"
										/>
										<p className="text-muted-foreground">
											La verificación de correo se realiza mediante un código
											OTP enviado a tu email durante el registro. Inicia sesión
											para continuar.
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
