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
	Checkbox,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Logo } from "@/components/Logo";
import { authClient, type AuthClient } from "@/lib/auth/authClient";
import {
	getAuthCoreBaseUrl,
	resolveAuthEnvironment,
} from "@/lib/auth/authCoreConfig";
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

const signupSchema = z
	.object({
		firstName: z.string().min(1, "Tu nombre es obligatorio."),
		lastName: z.string().min(1, "Tu apellido es obligatorio."),
		email: z
			.string()
			.min(1, "El correo es obligatorio.")
			.email("Ingresa un correo válido."),
		organization: z.string().optional(),
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Confirma tu contraseña."),
		acceptTerms: z.boolean().refine((value) => value, {
			message: "Debes aceptar los términos y condiciones.",
		}),
	})
	.refine((values) => values.password === values.confirmPassword, {
		path: ["confirmPassword"],
		message: "Las contraseñas no coinciden.",
	});

type SignupValues = z.infer<typeof signupSchema>;
type SignupClient = {
	signUp: {
		email: AuthClient["signUp"]["email"];
	};
};

const getRuntimeHost = () =>
	typeof window === "undefined" ? undefined : window.location.host;

export const SignupView = ({
	redirectTo,
	client = authClient,
}: {
	redirectTo?: string;
	client?: SignupClient;
}) => {
	const router = useRouter();
	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const host = getRuntimeHost();
	const environment = useMemo(() => resolveAuthEnvironment(host), [host]);
	const baseUrl = useMemo(() => getAuthCoreBaseUrl(host), [host]);

	const form = useForm<SignupValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			organization: "",
			password: "",
			confirmPassword: "",
			acceptTerms: false,
		},
	});

	const handleSubmit = async (values: SignupValues) => {
		setServerError(null);
		setSuccessMessage(null);

		try {
			const name =
				`${values.firstName.trim()} ${values.lastName.trim()}`.trim();
			const response = await client.signUp.email({
				name,
				email: values.email.trim(),
				password: values.password,
				...(redirectTo ? { callbackURL: redirectTo } : {}),
			});

			if (response.error) {
				setServerError(getAuthErrorMessage(response.error));
				return;
			}

			setSuccessMessage("Cuenta creada. Redirigiendo…");
			router.push(redirectTo || "/account");
		} catch (error) {
			setServerError(getAuthErrorMessage(error));
		}
	};

	const isSubmitting = form.formState.isSubmitting;

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-muted px-4 py-12">
			<div className="w-full max-w-md space-y-8">
				<div className="flex justify-center">
					<Logo variant="logo" />
				</div>

				<Card className="shadow-xl shadow-black/5">
					<CardHeader className="space-y-4">
						<div>
							<CardTitle className="text-2xl">Crea tu cuenta</CardTitle>
							<CardDescription>
								Registro en auth-core. Entorno:{" "}
								<span className="font-mono text-xs">
									{environment.toUpperCase()}
								</span>
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{successMessage ? (
							<Alert role="status">
								<AlertTitle>Registro completado</AlertTitle>
								<AlertDescription>{successMessage}</AlertDescription>
							</Alert>
						) : null}

						{serverError && !successMessage ? (
							<Alert variant="destructive" role="alert">
								<AlertTitle>No pudimos crear tu cuenta</AlertTitle>
								<AlertDescription>{serverError}</AlertDescription>
							</Alert>
						) : null}

						<Form {...form}>
							<form
								data-testid="signup-form"
								onSubmit={form.handleSubmit(handleSubmit)}
								className="space-y-5"
							>
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nombre</FormLabel>
												<FormControl>
													<Input
														placeholder="Mariana"
														autoComplete="given-name"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Apellido</FormLabel>
												<FormControl>
													<Input
														placeholder="López"
														autoComplete="family-name"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Correo corporativo</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="compliance@empresa.mx"
													autoComplete="email"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="organization"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Organización (opcional)</FormLabel>
											<FormControl>
												<Input
													placeholder="Nombre de tu institución"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Contraseña</FormLabel>
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
								</div>

								<FormField
									control={form.control}
									name="acceptTerms"
									render={({ field }) => (
										<FormItem className="flex items-start gap-3 rounded-lg border px-4 py-3">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={(checked) =>
														field.onChange(checked === true)
													}
													aria-label="Aceptar términos y condiciones"
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel className="text-sm font-medium">
													Acepto los términos, condiciones y el aviso de
													privacidad.
												</FormLabel>
												<FormMessage />
											</div>
										</FormItem>
									)}
								/>

								<CardFooter className="flex flex-col gap-4 px-0 pb-0">
									<Button
										type="submit"
										disabled={isSubmitting}
										className="w-full"
									>
										{isSubmitting ? (
											<span className="flex items-center justify-center gap-2">
												Creando cuenta...
											</span>
										) : (
											"Crear cuenta"
										)}
									</Button>

									<p className="text-center text-sm text-muted-foreground">
										¿Ya tienes cuenta?{" "}
										<Link
											href="/login"
											className="font-medium text-primary underline-offset-2 hover:underline"
										>
											Inicia sesión
										</Link>
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
