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
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Logo } from "@/components/Logo";
import { authClient, type AuthClient } from "@/lib/auth/authClient";
import {
	getAuthCoreBaseUrl,
	getAuthEnvironment,
} from "@/lib/auth/authCoreConfig";
import { getAuthErrorMessage } from "@/lib/auth/errorMessages";

const recoverSchema = z.object({
	email: z
		.string()
		.min(1, "El correo es obligatorio.")
		.email("Ingresa un correo válido."),
});

type RecoverValues = z.infer<typeof recoverSchema>;
type RecoverClient = Pick<AuthClient, "requestPasswordReset">;

const getRuntimeOrigin = () =>
	typeof window === "undefined" ? undefined : window.location.origin;

export const RecoverView = ({
	redirectTo,
	client = authClient,
}: {
	redirectTo?: string;
	client?: RecoverClient;
}) => {
	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const environment = useMemo(() => getAuthEnvironment(), []);
	const baseUrl = useMemo(() => getAuthCoreBaseUrl(), []);
	const origin = getRuntimeOrigin();

	const form = useForm<RecoverValues>({
		resolver: zodResolver(recoverSchema),
		defaultValues: {
			email: "",
		},
	});

	const handleSubmit = async (values: RecoverValues) => {
		setServerError(null);
		setSuccessMessage(null);

		try {
			const resolvedRedirectTo =
				redirectTo ?? (origin ? `${origin}/recover/reset` : "/recover/reset");

			const response = await client.requestPasswordReset({
				email: values.email.trim(),
				redirectTo: resolvedRedirectTo,
			});

			if (response.error) {
				setServerError(getAuthErrorMessage(response.error));
				return;
			}

			if (
				response.data &&
				typeof response.data === "object" &&
				"status" in response.data
			) {
				const data = response.data as { status: boolean; message: string };
				if (!data.status) {
					setServerError(data.message);
					return;
				}
				setSuccessMessage(data.message);
				return;
			}

			setSuccessMessage(
				"Si la cuenta existe, te enviaremos un correo con instrucciones para recuperar el acceso.",
			);
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
							<CardTitle className="text-2xl">
								Solicita un enlace seguro
							</CardTitle>
							<CardDescription>
								Envía tu correo corporativo para recibir instrucciones. Entorno:{" "}
								<span className="font-mono text-xs">
									{environment.toUpperCase()}
								</span>
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{successMessage ? (
							<Alert role="status" data-testid="recover-success-alert">
								<AlertTitle>Solicitud recibida</AlertTitle>
								<AlertDescription>
									{successMessage}
									<span className="mt-2 block text-xs text-muted-foreground">
										Revisa tu bandeja de entrada y spam. Si no tienes correo,
										pide uno nuevo después de unos minutos.
									</span>
								</AlertDescription>
							</Alert>
						) : null}

						{serverError && !successMessage ? (
							<Alert variant="destructive" role="alert">
								<AlertTitle>No pudimos enviar el enlace</AlertTitle>
								<AlertDescription>{serverError}</AlertDescription>
							</Alert>
						) : null}

						<Form {...form}>
							<form
								data-testid="recover-form"
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
													placeholder="agent@empresa.mx"
													autoComplete="email"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="flex items-center gap-3 rounded-lg border border-dashed border-primary/20 bg-muted/40 p-4 text-sm text-muted-foreground">
									<MailCheck className="h-5 w-5 text-primary" aria-hidden />
									<p>
										Si la cuenta existe, auth-core enviará un enlace temporal
										válido únicamente durante los próximos minutos.
									</p>
								</div>

								<CardFooter className="flex flex-col gap-4 px-0 pb-0">
									<Button
										type="submit"
										className="w-full"
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<span className="flex items-center justify-center gap-2">
												Enviando instrucciones...
											</span>
										) : (
											"Recibir enlace"
										)}
									</Button>
									<p className="text-center text-xs text-muted-foreground">
										La solicitud no revela si la cuenta existe para proteger tu
										información.
									</p>
									<div className="space-y-2 text-center text-sm text-muted-foreground">
										<p>
											¿Ya tienes un token activo?{" "}
											<Link
												href="/recover/reset"
												className="font-medium text-primary underline-offset-2 hover:underline"
											>
												Actualiza tu contraseña
											</Link>
										</p>
										<p>
											¿Recordaste tu contraseña?{" "}
											<Link
												href="/login"
												className="font-medium text-primary underline-offset-2 hover:underline"
											>
												Regresa al inicio de sesión
											</Link>
										</p>
									</div>
								</CardFooter>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
