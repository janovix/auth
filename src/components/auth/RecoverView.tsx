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
import { ArrowLeft, CheckCircle2, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
		<div className="flex flex-col gap-4 sm:gap-6 w-full">
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Recuperar contraseña</CardTitle>
					<CardDescription>
						Te enviaremos un enlace seguro para restablecer tu contraseña
					</CardDescription>
				</CardHeader>
				<CardContent>
					{successMessage ? (
						<Alert role="status" data-testid="recover-success-alert" className="mb-6">
							<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
							<AlertTitle>Solicitud enviada</AlertTitle>
							<AlertDescription>
								{successMessage}
								<span className="mt-2 block text-xs text-muted-foreground">
									Revisa tu bandeja de entrada y spam. Si no recibes el correo,
									puedes solicitar uno nuevo después de unos minutos.
								</span>
							</AlertDescription>
						</Alert>
					) : null}

					{serverError && !successMessage ? (
						<Alert variant="destructive" role="alert" className="mb-6">
							<AlertTitle>Error al enviar el enlace</AlertTitle>
							<AlertDescription>{serverError}</AlertDescription>
						</Alert>
					) : null}

					<Form {...form}>
						<form
							data-testid="recover-form"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							<FieldGroup>
								<Field>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FieldLabel htmlFor="email" className="flex items-center gap-2">
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
												<FieldDescription id="email-description" className="sr-only">
													Ingresa el correo asociado a tu cuenta
												</FieldDescription>
											</FormItem>
										)}
									/>
								</Field>

								<Field>
									<div className="flex items-start gap-3 rounded-lg border border-dashed border-primary/20 bg-muted/40 p-4 text-sm">
										<MailCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
										<p className="text-muted-foreground">
											Si la cuenta existe, recibirás un enlace temporal válido
											únicamente durante los próximos minutos.
										</p>
									</div>
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
												<Mail className="h-4 w-4 animate-pulse" aria-hidden="true" />
												Enviando enlace...
											</span>
										) : (
											<>
												<Mail className="h-4 w-4" aria-hidden="true" />
												Enviar enlace de recuperación
											</>
										)}
									</Button>
									<FieldDescription className="text-center text-xs text-muted-foreground">
										Por seguridad, no revelamos si la cuenta existe
									</FieldDescription>
									<div className="space-y-2 text-center text-sm">
										<p className="text-muted-foreground">
											¿Ya tienes un enlace?{" "}
											<Link
												href="/recover/reset"
												className="font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
												aria-label="Restablecer contraseña con token existente"
											>
												Restablecer contraseña
											</Link>
										</p>
										<p className="text-muted-foreground">
											<Link
												href="/login"
												className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
												aria-label="Volver al inicio de sesión"
											>
												<ArrowLeft className="h-3 w-3" aria-hidden="true" />
												Volver al inicio de sesión
											</Link>
										</p>
									</div>
								</Field>
							</FieldGroup>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};
