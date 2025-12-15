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
import { LogOut, RefreshCw } from "lucide-react";
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
								Better Auth revocará tu sesión activa en auth-core y eliminará
								la cookie HttpOnly del entorno actual.
							</CardDescription>
						</div>
						<Badge variant="secondary">
							Entorno · {environment.toUpperCase()}
						</Badge>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-3 text-foreground">
							<LogOut className="h-4 w-4" />
							<span>
								Endpoint:{" "}
								<span className="font-mono text-xs">
									{baseUrl}/api/auth/sign-out
								</span>
							</span>
						</div>
						<p>
							Recuerda que dev/preview y producción tienen dominios diferentes,
							por lo que deberás cerrar sesión manualmente en cada entorno.
						</p>
						{status === "running" && (
							<div className="flex items-center gap-2 text-foreground">
								<Spinner className="h-4 w-4" />
								<span>Solicitando a auth-core que elimine la cookie…</span>
							</div>
						)}
						{feedback && (
							<Alert variant={status === "error" ? "destructive" : "default"}>
								<AlertTitle>
									{status === "error"
										? "No se pudo cerrar la sesión"
										: "Sesión finalizada"}
								</AlertTitle>
								<AlertDescription>{feedback}</AlertDescription>
							</Alert>
						)}
					</CardContent>
					<CardFooter className="flex flex-wrap gap-3">
						<Button
							onClick={signOut}
							type="button"
							variant="outline"
							disabled={status === "running"}
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							Reintentar
						</Button>
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
