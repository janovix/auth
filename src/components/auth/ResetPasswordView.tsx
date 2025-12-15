"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Logo } from "@/components/Logo";
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
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-muted px-4 py-12">
			<div className="w-full max-w-md space-y-8">
				<div className="flex justify-center">
					<Logo variant="logo" />
				</div>

				<Card className="shadow-xl shadow-black/5">
					<CardHeader className="space-y-4">
						<div>
							<CardTitle className="text-2xl">
								Define tu nueva contraseña
							</CardTitle>
							<CardDescription>
								Usa una contraseña fuerte y única. Necesitas un token válido del
								enlace recibido.
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{!token ? (
							<Alert variant="destructive" role="alert">
								<AlertTitle>No encontramos un token válido</AlertTitle>
								<AlertDescription>
									Necesitas abrir el enlace enviado a tu correo. Si ya expiró,{" "}
									<Link
										href="/recover"
										className="font-medium underline-offset-2 hover:underline"
									>
										solicita uno nuevo
									</Link>
									.
								</AlertDescription>
							</Alert>
						) : null}

						{successMessage ? (
							<Alert role="status" data-testid="reset-success-alert">
								<AlertTitle>Contraseña actualizada</AlertTitle>
								<AlertDescription>{successMessage}</AlertDescription>
							</Alert>
						) : null}

						{serverError && !successMessage ? (
							<Alert variant="destructive" role="alert">
								<AlertTitle>No pudimos actualizar tu contraseña</AlertTitle>
								<AlertDescription>{serverError}</AlertDescription>
							</Alert>
						) : null}

						<Form {...form}>
							<form
								data-testid="reset-password-form"
								onSubmit={form.handleSubmit(handleSubmit)}
								className="space-y-5"
							>
								<FormField
									control={form.control}
									name="newPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nueva contraseña</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="••••••••"
													autoComplete="new-password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirma tu contraseña</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="••••••••"
													autoComplete="new-password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="rounded-lg border border-dashed border-primary/30 bg-muted/50 p-4 text-sm text-muted-foreground">
									<p className="flex items-center gap-2 font-semibold text-foreground">
										<KeyRound className="h-4 w-4 text-primary" aria-hidden />
										Recomendaciones
									</p>
									<ul className="mt-2 list-disc space-y-1 pl-6">
										<li>Usa al menos 8 caracteres.</li>
										<li>Incluye mayúsculas, números y un símbolo.</li>
										<li>No reutilices contraseñas de otros sistemas.</li>
									</ul>
								</div>

								<CardFooter className="flex flex-col gap-4 px-0 pb-0">
									<Button
										type="submit"
										disabled={
											isSubmitting || !isTokenReady || Boolean(successMessage)
										}
										className="w-full"
									>
										{isSubmitting ? (
											<span className="flex items-center justify-center gap-2">
												Guardando contraseña...
											</span>
										) : (
											"Cambiar contraseña"
										)}
									</Button>
									<p className="text-center text-sm text-muted-foreground">
										¿Te equivocaste de cuenta?{" "}
										<Link
											href="/recover"
											className="font-medium text-primary underline-offset-2 hover:underline"
										>
											Solicita un nuevo enlace
										</Link>
										.
									</p>
								</CardFooter>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
