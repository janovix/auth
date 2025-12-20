"use client";

import { CheckCircle2, XCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
import { sendVerificationEmail } from "@/lib/auth/authActions";

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

	return (
		<div className="flex flex-col gap-4 sm:gap-6 w-full">
			<div className="flex justify-center mb-2">
				<Logo variant="logo" forceTheme={logoTheme} />
			</div>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Verificación de correo</CardTitle>
					<CardDescription>
						{success
							? "Tu correo electrónico ha sido verificado exitosamente"
							: error
								? "Hubo un problema al verificar tu correo"
								: "Verificando tu correo electrónico..."}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{success ? (
						<>
							<Alert role="status" className="mb-4">
								<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
								<AlertTitle>Verificación exitosa</AlertTitle>
								<AlertDescription>
									Tu correo electrónico ha sido verificado correctamente. Ya
									puedes iniciar sesión.
								</AlertDescription>
							</Alert>
							<Button asChild className="w-full">
								<Link href="/login">Ir a iniciar sesión</Link>
							</Button>
						</>
					) : error ? (
						<>
							<Alert variant="destructive" role="alert" className="mb-4">
								<XCircle className="h-4 w-4" aria-hidden="true" />
								<AlertTitle>Error de verificación</AlertTitle>
								<AlertDescription>
									{error === "invalid_token"
										? "El enlace de verificación no es válido o ha expirado. Por favor, solicita un nuevo enlace."
										: "No se pudo verificar tu correo electrónico. Por favor, intenta nuevamente."}
								</AlertDescription>
							</Alert>
							{email && (
								<div className="space-y-2">
									<Button
										onClick={handleResend}
										disabled={isResending}
										className="w-full"
										variant="outline"
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
							)}
							<Button asChild variant="outline" className="w-full">
								<Link href="/login">Volver a iniciar sesión</Link>
							</Button>
						</>
					) : (
						<>
							<Alert role="status" className="mb-4">
								<Mail className="h-4 w-4" aria-hidden="true" />
								<AlertTitle>Verificando...</AlertTitle>
								<AlertDescription>
									Por favor espera mientras verificamos tu correo electrónico.
								</AlertDescription>
							</Alert>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
