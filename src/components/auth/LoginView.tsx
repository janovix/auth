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

const loginSchema = z.object({
	email: z
		.string()
		.min(1, "El correo es obligatorio.")
		.email("Ingresa un correo válido."),
	password: z.string().min(1, "La contraseña es obligatoria."),
	rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;
type LoginClient = {
	signIn: {
		email: AuthClient["signIn"]["email"];
	};
};

const getRuntimeHost = () =>
	typeof window === "undefined" ? undefined : window.location.host;

export const LoginView = ({
	redirectTo,
	client = authClient,
	defaultSuccessMessage,
}: {
	redirectTo?: string;
	client?: LoginClient;
	defaultSuccessMessage?: string;
}) => {
	const router = useRouter();
	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(
		defaultSuccessMessage ?? null,
	);

	const host = getRuntimeHost();
	const environment = useMemo(() => resolveAuthEnvironment(host), [host]);
	const baseUrl = useMemo(() => getAuthCoreBaseUrl(host), [host]);

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

		try {
			const response = await client.signIn.email({
				email: values.email.trim(),
				password: values.password,
				rememberMe: values.rememberMe,
				...(redirectTo ? { callbackURL: redirectTo } : {}),
			});

			if (response.error) {
				setServerError(getAuthErrorMessage(response.error));
				return;
			}

			setSuccessMessage("Acceso validado. Redirigiendo…");
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
							<CardTitle className="text-2xl">Inicia sesión</CardTitle>
							<CardDescription>
								Ingresa tus credenciales para continuar. Entorno:{" "}
								<span className="font-mono text-xs">
									{environment.toUpperCase()}
								</span>
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{successMessage ? (
							<Alert role="status">
								<AlertTitle>Autenticación exitosa</AlertTitle>
								<AlertDescription>{successMessage}</AlertDescription>
							</Alert>
						) : null}

						{serverError && !successMessage ? (
							<Alert variant="destructive" role="alert">
								<AlertTitle>No pudimos validar tus datos</AlertTitle>
								<AlertDescription>{serverError}</AlertDescription>
							</Alert>
						) : null}

						<Form {...form}>
							<form
								data-testid="login-form"
								onSubmit={form.handleSubmit(handleSubmit)}
								className="space-y-5"
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Correo corporativo</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="usuario@empresa.mx"
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
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Contraseña</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="••••••••"
													autoComplete="current-password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="rememberMe"
									render={({ field }) => (
										<FormItem className="flex items-start gap-3 rounded-lg border px-4 py-3">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={(checked) =>
														field.onChange(checked === true)
													}
													aria-label="Mantener sesión en este entorno"
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel className="text-sm font-medium">
													Mantener sesión en este entorno
												</FormLabel>
												<p className="text-xs text-muted-foreground">
													Better Auth compartirá la cookie segura con los PR
													previews del mismo entorno.
												</p>
											</div>
										</FormItem>
									)}
								/>

								<CardFooter className="flex flex-col gap-4 px-0 pb-0">
									<Button
										type="submit"
										className="w-full"
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<span className="flex items-center justify-center gap-2">
												Validando credenciales...
											</span>
										) : (
											"Ingresar"
										)}
									</Button>

									<p className="text-center text-sm text-muted-foreground">
										¿Aún no tienes cuenta?{" "}
										<Link
											href="/signup"
											className="font-medium text-primary underline-offset-2 hover:underline"
										>
											Crea una desde aquí
										</Link>
									</p>

									<p className="text-center text-sm text-muted-foreground">
										¿Olvidaste tu contraseña?{" "}
										<Link
											href={
												redirectTo
													? `/recover?redirectTo=${encodeURIComponent(redirectTo)}`
													: "/recover"
											}
											className="font-medium text-primary underline-offset-2 hover:underline"
										>
											Recupera el acceso
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
