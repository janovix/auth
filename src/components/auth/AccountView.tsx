"use client";

import { signOut } from "@/lib/auth/authActions";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, Clock4, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import {
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
import {
	getAuthCoreBaseUrl,
	getAuthEnvironment,
} from "@/lib/auth/authCoreConfig";

const cookieDomainByEnv: Record<"dev" | "prod", string> = {
	dev: ".janovix.workers.dev",
	prod: ".janovix.ai",
};

const normalizeDate = (value?: string | Date) => {
	if (!value) {
		return undefined;
	}
	return value instanceof Date ? value : new Date(value);
};

const formatExpiresIn = (value?: string | Date) => {
	const dateValue = normalizeDate(value);
	if (!dateValue) {
		return "—";
	}
	try {
		return formatDistanceToNow(dateValue, { addSuffix: true, locale: es });
	} catch {
		return "—";
	}
};

/**
 * AccountView displays the current user session information.
 *
 * This component expects the session to be hydrated via SessionHydrator
 * in the parent Server Component. The session store is pre-populated
 * before this component renders, preventing any loading "blink".
 */
export const AccountView = () => {
	const session = useAuthSession();
	const data = session.data;
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const environment = useMemo(() => getAuthEnvironment(), []);
	const baseUrl = useMemo(() => getAuthCoreBaseUrl(), []);

	const handleLogout = useCallback(async () => {
		setIsLoggingOut(true);
		try {
			await signOut();
			// Redirect to login page after logout
			window.location.href = "/login";
		} catch {
			setIsLoggingOut(false);
		}
	}, []);

	if (!data) {
		return (
			<section className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
				<div className="mx-auto w-full max-w-3xl">
					<Card>
						<CardHeader>
							<CardTitle>Sesión no encontrada</CardTitle>
							<CardDescription>
								No se encontró una sesión activa en este entorno
							</CardDescription>
						</CardHeader>
						<CardContent className="flex items-start gap-3 text-sm">
							<AlertTriangle
								className="mt-0.5 h-4 w-4 text-amber-500 flex-shrink-0"
								aria-hidden="true"
							/>
							<div className="text-muted-foreground">
								<p>
									Si vienes de un preview, asegúrate de haber iniciado sesión en
									el mismo dominio para compartir la cookie.
								</p>
							</div>
						</CardContent>
						<CardFooter className="flex flex-wrap gap-3">
							<Button asChild>
								<Link href="/login">Iniciar sesión</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/signup">Crear cuenta</Link>
							</Button>
						</CardFooter>
					</Card>
				</div>
			</section>
		);
	}

	const cookieDomain = cookieDomainByEnv[environment];

	return (
		<section className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
				<Card>
					<CardHeader className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<CardTitle>Mi cuenta</CardTitle>
							<CardDescription>Información de tu sesión activa</CardDescription>
						</div>
						<Badge variant="secondary">
							Entorno · {environment.toUpperCase()}
						</Badge>
					</CardHeader>
					<CardContent className="grid gap-6 md:grid-cols-2">
						<div className="space-y-3 text-sm">
							<div className="flex items-center gap-2">
								<User
									className="h-4 w-4 text-muted-foreground"
									aria-hidden="true"
								/>
								<div>
									<p className="font-medium text-foreground">
										{data.user.name}
									</p>
									<p className="font-mono text-xs text-muted-foreground mt-0.5">
										{data.user.email}
									</p>
								</div>
							</div>
							<div className="text-muted-foreground">
								<p className="text-xs">ID de usuario</p>
								<p className="font-mono text-xs">{data.user.id}</p>
							</div>
						</div>
						<div className="space-y-3 text-sm">
							<div className="flex items-center gap-2">
								<Clock4
									className="h-4 w-4 text-muted-foreground"
									aria-hidden="true"
								/>
								<div>
									<p className="font-medium text-foreground">
										Expira {formatExpiresIn(data.session.expiresAt)}
									</p>
									<p className="text-xs text-muted-foreground mt-0.5">
										Última actualización:{" "}
										{normalizeDate(data.session.updatedAt)?.toLocaleString(
											"es-MX",
											{
												dateStyle: "medium",
												timeStyle: "short",
											},
										) ?? "—"}
									</p>
								</div>
							</div>
							<div className="text-muted-foreground">
								<p className="text-xs">ID de sesión</p>
								<p className="font-mono text-xs break-all">{data.session.id}</p>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex flex-wrap gap-3">
						<Button onClick={handleLogout} disabled={isLoggingOut}>
							{isLoggingOut ? (
								<>
									<Spinner className="h-4 w-4" aria-hidden="true" />
									Cerrando sesión...
								</>
							) : (
								<>
									<LogOut className="h-4 w-4" aria-hidden="true" />
									Cerrar sesión
								</>
							)}
						</Button>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Configuración de seguridad</CardTitle>
						<CardDescription>
							Detalles de la cookie de autenticación
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2 text-sm">
						<div>
							<p className="font-medium text-foreground mb-1">Dominio</p>
							<p className="font-mono text-xs text-muted-foreground">
								{cookieDomain}
							</p>
						</div>
						<div>
							<p className="font-medium text-foreground mb-1">Endpoint base</p>
							<p className="font-mono text-xs text-muted-foreground">
								{baseUrl}/api/auth
							</p>
						</div>
						<div>
							<p className="font-medium text-foreground mb-1">
								Alcance de la sesión
							</p>
							<p className="text-muted-foreground">
								{environment === "dev"
									? "Todas las aplicaciones bajo *.janovix.workers.dev"
									: "Solo aplicaciones bajo el dominio actual"}
							</p>
						</div>
						<div>
							<p className="font-medium text-foreground mb-1">
								Nota importante
							</p>
							<p className="text-muted-foreground">
								Los entornos de desarrollo y producción usan dominios distintos,
								por lo que deberás iniciar sesión de forma independiente en cada
								uno.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Información técnica</CardTitle>
						<CardDescription>
							Detalles de depuración para desarrolladores
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground/70 mb-1">
								Token de sesión
							</p>
							<p className="font-mono text-xs break-all text-muted-foreground">
								{data.session.token}
							</p>
						</div>
						{data.session.ipAddress && (
							<div>
								<p className="text-xs uppercase tracking-wide text-muted-foreground/70 mb-1">
									Dirección IP
								</p>
								<p className="font-mono text-xs text-muted-foreground">
									{data.session.ipAddress}
								</p>
							</div>
						)}
						{data.session.userAgent && (
							<div>
								<p className="text-xs uppercase tracking-wide text-muted-foreground/70 mb-1">
									User Agent
								</p>
								<p className="font-mono text-xs break-all text-muted-foreground">
									{data.session.userAgent}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</section>
	);
};
