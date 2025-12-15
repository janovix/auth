"use client";

import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, Clock4, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import {
	getAuthCoreBaseUrl,
	resolveAuthEnvironment,
	type AuthEnvironment,
} from "@/lib/auth/authCoreConfig";
import { useAuthSession } from "@/lib/auth/useAuthSession";

const cookieDomainByEnv: Record<AuthEnvironment, string> = {
	dev: ".janovix.workers.dev",
	prod: ".janovix.ai",
};

const getRuntimeHost = () =>
	typeof window === "undefined" ? undefined : window.location.host;

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

export const AccountView = () => {
	const session = useAuthSession();
	const data = session.data;

	const host = getRuntimeHost();
	const environment = useMemo(() => resolveAuthEnvironment(host), [host]);
	const baseUrl = useMemo(() => getAuthCoreBaseUrl(host), [host]);

	if (!data) {
		return (
			<section className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
				<div className="mx-auto w-full max-w-3xl">
					<Card>
						<CardHeader>
							<CardTitle>No encontramos una sesión activa</CardTitle>
							<CardDescription>
								Inicia sesión nuevamente para que auth-core emita la cookie
								correspondiente a este entorno.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex items-start gap-3 text-sm text-foreground">
							<AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
							<div>
								<p>
									Si vienes de un preview asegúrate de haber iniciado sesión en
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
							<CardTitle>Tu sesión en auth-core</CardTitle>
							<CardDescription>
								Información directa de /api/auth/get-session
							</CardDescription>
						</div>
						<Badge variant="secondary">
							Entorno · {environment.toUpperCase()}
						</Badge>
					</CardHeader>
					<CardContent className="grid gap-6 md:grid-cols-2">
						<div className="space-y-2 text-sm text-muted-foreground">
							<div className="flex items-center gap-2 text-foreground">
								<User className="h-4 w-4" />
								<span className="font-medium">{data.user.name}</span>
							</div>
							<p className="font-mono text-xs text-foreground">
								{data.user.email}
							</p>
							<p>ID de usuario: {data.user.id}</p>
						</div>
						<div className="space-y-2 text-sm text-muted-foreground">
							<div className="flex items-center gap-2 text-foreground">
								<Clock4 className="h-4 w-4" />
								<span className="font-medium">
									Expira {formatExpiresIn(data.session.expiresAt)}
								</span>
							</div>
							<p className="font-mono text-xs text-foreground">
								Session ID: {data.session.id}
							</p>
							<p>
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
					</CardContent>
					<CardFooter className="flex flex-wrap gap-3">
						<Button asChild>
							<Link href="/logout">
								<LogOut className="mr-2 h-4 w-4" />
								Cerrar sesión
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/login">Cambiar de usuario</Link>
						</Button>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Detalles de la cookie emitida</CardTitle>
						<CardDescription>
							Better Auth configura los atributos HttpOnly y Secure para evitar
							fugas en el cliente.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
						<div>
							<p className="font-medium text-foreground">Dominio</p>
							<p className="font-mono text-xs">{cookieDomain}</p>
						</div>
						<div>
							<p className="font-medium text-foreground">Endpoint base</p>
							<p className="font-mono text-xs">{baseUrl}/api/auth</p>
						</div>
						<div>
							<p className="font-medium text-foreground">Comparte sesión con</p>
							<p>
								{environment === "dev"
									? "Todas las aplicaciones bajo *.janovix.workers.dev"
									: "Solo aplicaciones bajo el dominio actual"}
							</p>
						</div>
						<div>
							<p className="font-medium text-foreground">Recordatorio</p>
							<p>
								Dev/preview y producción usan dominios distintos, por lo que
								deberás iniciar sesión de forma independiente.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Sesión técnica</CardTitle>
						<CardDescription>
							Información útil para depurar auth-core
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm font-mono text-muted-foreground">
						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground/70">
								Token
							</p>
							<p className="break-all">{data.session.token}</p>
						</div>
						{data.session.ipAddress && (
							<div>
								<p className="text-xs uppercase tracking-wide text-muted-foreground/70">
									IP registrada
								</p>
								<p>{data.session.ipAddress}</p>
							</div>
						)}
						{data.session.userAgent && (
							<div>
								<p className="text-xs uppercase tracking-wide text-muted-foreground/70">
									User agent
								</p>
								<p>{data.session.userAgent}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</section>
	);
};
