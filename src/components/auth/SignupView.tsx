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
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Building2,
	CheckCircle2,
	Circle,
	Lock,
	Mail,
	ShieldCheck,
	User,
	UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Logo } from "@/components/Logo";
import { authClient, type AuthClient } from "@/lib/auth/authClient";
import {
	getAuthCoreBaseUrl,
	getAuthEnvironment,
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

	const environment = useMemo(() => getAuthEnvironment(), []);
	const baseUrl = useMemo(() => getAuthCoreBaseUrl(), []);
	// Always use dark theme for logo to show white letters (matching previous behavior)
	const logoTheme = "dark" as const;

	const form = useForm<SignupValues>({
		resolver: zodResolver(signupSchema),
		mode: "onChange",
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

	// Watch password field to show real-time validation
	const password = useWatch({
		control: form.control,
		name: "password",
	});

	// Password validation rules checker
	const passwordChecks = useMemo(() => {
		const pwd = password || "";
		return {
			minLength: pwd.length >= 8,
			hasUppercase: /[A-Z]/.test(pwd),
			hasNumber: /[0-9]/.test(pwd),
			hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-\[\]\\;'/+=]/.test(pwd),
		};
	}, [password]);

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
						<Alert role="status" className="mb-6">
							<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
							<AlertTitle>Cuenta creada exitosamente</AlertTitle>
							<AlertDescription>{successMessage}</AlertDescription>
						</Alert>
					) : null}

					{serverError && !successMessage ? (
						<Alert variant="destructive" role="alert" className="mb-6">
							<AlertTitle>Error al crear la cuenta</AlertTitle>
							<AlertDescription>{serverError}</AlertDescription>
						</Alert>
					) : null}

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
										name="organization"
										render={({ field }) => (
											<FormItem>
												<FieldLabel
													htmlFor="organization"
													className="flex items-center gap-2"
												>
													<Building2 className="h-4 w-4" aria-hidden="true" />
													Organización
													<span className="text-xs text-muted-foreground font-normal">
														(opcional)
													</span>
												</FieldLabel>
												<FormControl>
													<Input
														id="organization"
														placeholder="Nombre de tu empresa"
														autoComplete="organization"
														aria-describedby="organization-description"
														{...field}
													/>
												</FormControl>
												<FormMessage />
												<FieldDescription
													id="organization-description"
													className="sr-only"
												>
													Nombre de tu organización o empresa
												</FieldDescription>
											</FormItem>
										)}
									/>
								</Field>

								<Field>
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FieldLabel
													htmlFor="password"
													className="flex items-center gap-2"
												>
													<Lock className="h-4 w-4" aria-hidden="true" />
													Contraseña
												</FieldLabel>
												<FormControl>
													<Input
														id="password"
														type="password"
														placeholder="Crea una contraseña segura"
														autoComplete="new-password"
														aria-describedby={
															password ? "password-requirements" : undefined
														}
														required
														{...field}
													/>
												</FormControl>
												{/* FormMessage hidden - validation labels provide feedback */}
												{password && (
													<div
														id="password-requirements"
														className="mt-2 space-y-1.5"
													>
														<div className="flex items-center gap-2 text-xs">
															{passwordChecks.minLength ? (
																<CheckCircle2 className="h-3.5 w-3.5 text-primary" />
															) : (
																<Circle className="h-3.5 w-3.5 text-muted-foreground" />
															)}
															<span
																className={
																	passwordChecks.minLength
																		? "text-primary"
																		: "text-muted-foreground"
																}
															>
																Al menos 8 caracteres
															</span>
														</div>
														<div className="flex items-center gap-2 text-xs">
															{passwordChecks.hasUppercase ? (
																<CheckCircle2 className="h-3.5 w-3.5 text-primary" />
															) : (
																<Circle className="h-3.5 w-3.5 text-muted-foreground" />
															)}
															<span
																className={
																	passwordChecks.hasUppercase
																		? "text-primary"
																		: "text-muted-foreground"
																}
															>
																Incluye al menos una letra mayúscula
															</span>
														</div>
														<div className="flex items-center gap-2 text-xs">
															{passwordChecks.hasNumber ? (
																<CheckCircle2 className="h-3.5 w-3.5 text-primary" />
															) : (
																<Circle className="h-3.5 w-3.5 text-muted-foreground" />
															)}
															<span
																className={
																	passwordChecks.hasNumber
																		? "text-primary"
																		: "text-muted-foreground"
																}
															>
																Incluye al menos un número
															</span>
														</div>
														<div className="flex items-center gap-2 text-xs">
															{passwordChecks.hasSpecial ? (
																<CheckCircle2 className="h-3.5 w-3.5 text-primary" />
															) : (
																<Circle className="h-3.5 w-3.5 text-muted-foreground" />
															)}
															<span
																className={
																	passwordChecks.hasSpecial
																		? "text-primary"
																		: "text-muted-foreground"
																}
															>
																Incluye al menos un carácter especial
															</span>
														</div>
													</div>
												)}
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
												<FieldLabel
													htmlFor="confirmPassword"
													className="flex items-center gap-2"
												>
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
												<FieldDescription
													id="confirmPassword-description"
													className="sr-only"
												>
													Vuelve a ingresar tu contraseña para confirmar
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
				</CardContent>
			</Card>
		</div>
	);
};
