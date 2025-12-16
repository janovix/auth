"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Spinner,
} from "@/components/ui";
import { CheckCircle2, LogOut, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { authClient } from "@/lib/auth/authClient";
import {
	getAuthCoreBaseUrl,
	getAuthEnvironment,
} from "@/lib/auth/authCoreConfig";
import { getAuthErrorMessage } from "@/lib/auth/errorMessages";

export const LogoutView = () => {
	const environment = useMemo(() => getAuthEnvironment(), []);
	const baseUrl = useMemo(() => getAuthCoreBaseUrl(), []);

	const [status, setStatus] = useState<
		"idle" | "running" | "success" | "error"
	>("idle");
	const [feedback, setFeedback] = useState<string | null>(null);

	const signOut = async () => {
		setStatus("running");
		setFeedback(null);

		try {
			const response = await authClient.signOut();
			if (response.error) {
				setStatus("error");
				setFeedback(getAuthErrorMessage(response.error));
				return;
			}

			setStatus("success");
			setFeedback(
				"Sesión cerrada. Puedes volver a iniciar sesión cuando lo necesites.",
			);
		} catch (error) {
			setStatus("error");
			setFeedback(getAuthErrorMessage(error));
		}
	};

	useEffect(() => {
		void signOut();
	}, []);

	return (
		<section className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
			<div className="mx-auto w-full max-w-3xl">
				<Card>
					<CardHeader className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<CardTitle>Cerrar sesión</CardTitle>
							<CardDescription>
								Se revocará tu sesión activa y se eliminará la cookie de
								autenticación
							</CardDescription>
						</div>
						<Badge variant="secondary">
							Entorno · {environment.toUpperCase()}
						</Badge>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						<div className="flex items-center gap-3 text-muted-foreground">
							<LogOut className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
							<div>
								<p className="text-xs text-muted-foreground/70 mb-0.5">
									Endpoint
								</p>
								<p className="font-mono text-xs">{baseUrl}/api/auth/sign-out</p>
							</div>
						</div>
						<div className="rounded-lg border border-dashed border-primary/20 bg-muted/40 p-4 text-muted-foreground">
							<p className="text-xs">
								Nota: Los entornos de desarrollo y producción tienen dominios
								diferentes, por lo que deberás cerrar sesión manualmente en cada
								uno si es necesario.
							</p>
						</div>
						{status === "running" && (
							<div className="flex items-center gap-2 text-foreground">
								<Spinner className="h-4 w-4" aria-hidden="true" />
								<span aria-busy="true">Cerrando sesión...</span>
							</div>
						)}
						{feedback && (
							<Alert variant={status === "error" ? "destructive" : "default"}>
								{status === "success" && (
									<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
								)}
								<AlertTitle>
									{status === "error"
										? "Error al cerrar sesión"
										: "Sesión cerrada"}
								</AlertTitle>
								<AlertDescription>{feedback}</AlertDescription>
							</Alert>
						)}
					</CardContent>
					<CardFooter className="flex flex-wrap gap-3">
						{status === "error" && (
							<Button
								onClick={signOut}
								type="button"
								variant="outline"
								disabled={false}
							>
								<RefreshCw className="h-4 w-4" aria-hidden="true" />
								Reintentar
							</Button>
						)}
						<Button asChild>
							<Link href="/login">Iniciar sesión nuevamente</Link>
						</Button>
						<Button variant="ghost" asChild>
							<Link href="/">Volver al inicio</Link>
						</Button>
					</CardFooter>
				</Card>
			</div>
		</section>
	);
};
