"use client";

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
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, KeyRound, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient, type AuthClient } from "@/lib/auth/authClient";
import { getAuthErrorMessage } from "@/lib/auth/errorMessages";

const passwordSchema = z
	.string()
	.min(8, "La contraseña debe tener al menos 8 caracteres.")
	.regex(/[A-Z]/, "Incluye al menos una letra mayúscula.")
	.regex(/[0-9]/, "Incluye al menos un número.")
	.regex(
		/[!@#$%^&*(),.?":{}|<>_\-\[\]\\;'/+=]/,
		"Incluye al menos un carácter especial.",
	);

const resetSchema = z
	.object({
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "Confirma tu contraseña."),
	})
	.refine((values) => values.newPassword === values.confirmPassword, {
		path: ["confirmPassword"],
		message: "Las contraseñas no coinciden.",
	});

type ResetPasswordValues = z.infer<typeof resetSchema>;
type ResetPasswordClient = Pick<AuthClient, "resetPassword">;

export const ResetPasswordView = ({
	token,
	client = authClient,
	redirectDelayMs = 1800,
}: {
	token: string | null;
	client?: ResetPasswordClient;
	redirectDelayMs?: number;
}) => {
	const router = useRouter();
	const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const form = useForm<ResetPasswordValues>({
		resolver: zodResolver(resetSchema),
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
		},
	});

	const isSubmitting = form.formState.isSubmitting;
	const isTokenReady = Boolean(token);

	useEffect(() => {
		return () => {
			if (redirectTimeoutRef.current) {
				clearTimeout(redirectTimeoutRef.current);
			}
		};
	}, []);

	async function handleSubmit(values: ResetPasswordValues) {
		if (!token) {
			setServerError(
				"Necesitas abrir el enlace enviado a tu correo corporativo.",
			);
			return;
		}

		setServerError(null);
		setSuccessMessage(null);

		try {
			const response = await client.resetPassword({
				token,
				newPassword: values.newPassword,
			});

			if (response.error) {
				setServerError(getAuthErrorMessage(response.error));
				return;
			}

			setSuccessMessage(
				"Tu contraseña fue actualizada. Te llevaremos al inicio de sesión.",
			);
			form.reset();

			if (redirectTimeoutRef.current) {
				clearTimeout(redirectTimeoutRef.current);
			}

			redirectTimeoutRef.current = setTimeout(
				() => {
					router.push("/login?reset=success");
					router.refresh();
				},
				Math.max(redirectDelayMs, 0),
			);
		} catch (error) {
			setServerError(getAuthErrorMessage(error));
		}
	}

	return (
		<div className="flex flex-col gap-4 sm:gap-6 w-full">
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Restablecer contraseña</CardTitle>
					<CardDescription>
						Define una nueva contraseña segura para tu cuenta
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!token ? (
						<Alert variant="destructive" role="alert" className="mb-6">
							<AlertTitle>Token inválido o expirado</AlertTitle>
							<AlertDescription>
								Necesitas abrir el enlace enviado a tu correo. Si ya expiró,{" "}
								<Link
									href="/recover"
									className="font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
									aria-label="Solicitar un nuevo enlace de recuperación"
								>
									solicita uno nuevo
								</Link>
								.
							</AlertDescription>
						</Alert>
					) : null}

					{successMessage ? (
						<Alert role="status" data-testid="reset-success-alert" className="mb-6">
							<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
							<AlertTitle>Contraseña actualizada</AlertTitle>
							<AlertDescription>{successMessage}</AlertDescription>
						</Alert>
					) : null}

					{serverError && !successMessage ? (
						<Alert variant="destructive" role="alert" className="mb-6">
							<AlertTitle>Error al actualizar la contraseña</AlertTitle>
							<AlertDescription>{serverError}</AlertDescription>
						</Alert>
					) : null}

					<Form {...form}>
						<form
							data-testid="reset-password-form"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							<FieldGroup>
								<Field>
									<FormField
										control={form.control}
										name="newPassword"
										render={({ field }) => (
											<FormItem>
												<FieldLabel htmlFor="newPassword" className="flex items-center gap-2">
													<Lock className="h-4 w-4" aria-hidden="true" />
													Nueva contraseña
												</FieldLabel>
												<FormControl>
													<Input
														id="newPassword"
														type="password"
														placeholder="Crea una contraseña segura"
														autoComplete="new-password"
														aria-describedby="newPassword-requirements newPassword-description"
														required
														{...field}
													/>
												</FormControl>
												<FormMessage />
												<FieldDescription id="newPassword-description" className="sr-only">
													La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, números y un símbolo
												</FieldDescription>
												<FieldDescription id="newPassword-requirements" className="text-xs text-muted-foreground mt-1">
													Mínimo 8 caracteres, incluye mayúsculas, números y símbolos
												</FieldDescription>
											</FormItem>
										)}
									/>
								</Field>

								<Field>
									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FieldLabel htmlFor="confirmPassword" className="flex items-center gap-2">
													<Lock className="h-4 w-4" aria-hidden="true" />
													Confirmar contraseña
												</FieldLabel>
												<FormControl>
													<Input
														id="confirmPassword"
														type="password"
														placeholder="Repite tu contraseña"
														autoComplete="new-password"
														aria-describedby="confirmPassword-description"
														required
														{...field}
													/>
												</FormControl>
												<FormMessage />
												<FieldDescription id="confirmPassword-description" className="sr-only">
													Vuelve a ingresar tu contraseña para confirmar
												</FieldDescription>
											</FormItem>
										)}
									/>
								</Field>

								<Field>
									<div className="rounded-lg border border-dashed border-primary/30 bg-muted/50 p-4 text-sm">
										<p className="flex items-center gap-2 font-semibold text-foreground mb-2">
											<KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
											Recomendaciones de seguridad
										</p>
										<ul className="space-y-1.5 text-muted-foreground">
											<li className="flex items-start gap-2">
												<span className="text-primary mt-0.5">•</span>
												<span>Usa al menos 8 caracteres</span>
											</li>
											<li className="flex items-start gap-2">
												<span className="text-primary mt-0.5">•</span>
												<span>Incluye mayúsculas, números y un símbolo</span>
											</li>
											<li className="flex items-start gap-2">
												<span className="text-primary mt-0.5">•</span>
												<span>No reutilices contraseñas de otros sistemas</span>
											</li>
										</ul>
									</div>
								</Field>

								<Field>
									<Button
										type="submit"
										disabled={
											isSubmitting || !isTokenReady || Boolean(successMessage)
										}
										className="w-full"
										aria-busy={isSubmitting}
									>
										{isSubmitting ? (
											<span className="flex items-center justify-center gap-2">
												<Lock className="h-4 w-4 animate-pulse" aria-hidden="true" />
												Guardando contraseña...
											</span>
										) : (
											<>
												<Lock className="h-4 w-4" aria-hidden="true" />
												Actualizar contraseña
											</>
										)}
									</Button>
									<FieldDescription className="text-center">
										<Link
											href="/recover"
											className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
											aria-label="Solicitar un nuevo enlace de recuperación"
										>
											<ArrowLeft className="h-3 w-3" aria-hidden="true" />
											Solicitar un nuevo enlace
										</Link>
									</FieldDescription>
								</Field>
							</FieldGroup>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};
