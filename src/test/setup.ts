import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Mock sonner toast for tests
export const mockToast = {
	success: vi.fn(),
	error: vi.fn(),
	warning: vi.fn(),
	info: vi.fn(),
	loading: vi.fn(),
	promise: vi.fn(),
	dismiss: vi.fn(),
	custom: vi.fn(),
};

vi.mock("sonner", () => ({
	toast: mockToast,
	Toaster: () => null,
}));

// Mock language context for tests with Spanish translations
const mockTranslations: Record<string, string> = {
	// Common
	"common.accept": "Aceptar",
	"common.cancel": "Cancelar",

	// Login
	"login.title": "Bienvenido",
	"login.description.email":
		"Ingresa tu correo para recibir un código de acceso",
	"login.description.otp": "Ingresa el código que enviamos a tu correo",
	"login.email.label": "Correo electrónico",
	"login.email.placeholder": "tu@empresa.com",
	"login.email.required": "El correo es obligatorio.",
	"login.email.invalid": "Ingresa un correo válido.",
	"login.email.description": "Ingresa tu dirección de correo",
	"login.button.send": "Enviar código de acceso",
	"login.button.sending": "Enviando código...",
	"login.button.loading": "Iniciando sesión...",
	"login.otp.sent": "Código enviado",
	"login.otp.sentDescription":
		"Enviamos un código de 6 dígitos a {email}. Revisa tu bandeja de entrada y spam.",
	"login.otp.label": "Código de verificación",
	"login.otp.verifying": "Verificando...",
	"login.otp.expired":
		"El código ha expirado. Los códigos son válidos por 5 minutos. Solicita uno nuevo.",
	"login.otp.tooManyAttempts":
		"Has excedido el número de intentos. Por seguridad, solicita un nuevo código.",
	"login.otp.invalid": "Código incorrecto. Inténtalo de nuevo.",
	"login.otp.expiredTitle": "Código expirado o inválido",
	"login.otp.errorTitle": "Error de verificación",
	"login.otp.resendNew": "Enviando nuevo código...",
	"login.otp.requestNew": "Solicitar nuevo código",
	"login.otp.resend": "Reenviar código",
	"login.otp.resending": "Enviando...",
	"login.otp.resendError": "Error al reenviar el código. Intenta de nuevo.",
	"login.otp.rateLimited":
		"Demasiadas solicitudes. Espera un momento antes de pedir otro código.",
	"login.otp.resendSuccess":
		"Nuevo código enviado. Revisa tu correo (válido por 5 minutos).",
	"login.otp.resendWait": "Espera {seconds}s para reenviar",
	"login.wrongEmail": "¿Correo incorrecto?",
	"login.changeEmail": "Cambiar correo",
	"login.terms": "Al iniciar sesión, aceptas nuestros",
	"login.termsOfService": "Términos de Servicio",
	"login.and": "y",
	"login.privacyPolicy": "Política de Privacidad",
	"login.success.codeSent": "Código enviado",
	"login.success.auth": "Autenticación exitosa",
	"login.success.message":
		"Te enviamos un código de 6 dígitos. Revisa tu correo y spam.",
	"login.success.rateLimited":
		"Ya te enviamos un código recientemente. Revisa tu correo y spam.",
	"login.error": "Error",
	"login.banned.title": "Cuenta Suspendida",
	"login.banned.message":
		"Tu cuenta ha sido suspendida. Por favor contacta a soporte si crees que esto es un error.",
	"login.banned.tryDifferentEmail": "Probar con otro correo",

	// Account
	"account.noSession.title": "Sesión no encontrada",
	"account.noSession.description":
		"No se encontró una sesión activa en este entorno",
	"account.noSession.previewNote":
		"Si vienes de un preview, asegúrate de haber iniciado sesión en el mismo dominio para compartir la cookie.",
	"account.noSession.login": "Iniciar sesión",
	"account.title": "Mi cuenta",
	"account.description": "Información de tu sesión activa",
	"account.environment": "Entorno",
	"account.userId": "ID de usuario",
	"account.expires": "Expira {time}",
	"account.lastUpdate": "Última actualización:",
	"account.sessionId": "ID de sesión",
	"account.logout": "Cerrar sesión",
	"account.loggingOut": "Cerrando sesión...",
	"account.security.title": "Configuración de seguridad",
	"account.security.description": "Detalles de la cookie de autenticación",
	"account.security.domain": "Dominio",
	"account.security.endpoint": "Endpoint base",
	"account.security.scope": "Alcance de la sesión",
	"account.security.scopeDev":
		"Todas las aplicaciones bajo *.janovix.workers.dev",
	"account.security.scopeProd": "Solo aplicaciones bajo el dominio actual",
	"account.security.note": "Nota importante",
	"account.security.noteText":
		"Los entornos de desarrollo y producción usan dominios distintos, por lo que deberás iniciar sesión de forma independiente en cada uno.",
	"account.technical.title": "Información técnica",
	"account.technical.description":
		"Detalles de depuración para desarrolladores",
	"account.technical.token": "Token de sesión",
	"account.technical.ip": "Dirección IP",
	"account.technical.userAgent": "User Agent",

	// Settings
	"settings.title": "Configuración",
	"settings.description": "Administra tus preferencias de cuenta",
	"settings.saved": "Configuración guardada",
	"settings.save": "Guardar",
	"settings.cancel": "Cancelar",
	"settings.appearance.title": "Apariencia",
	"settings.appearance.description":
		"Personaliza la apariencia de la aplicación",
	"settings.appearance.theme": "Tema",
	"settings.appearance.light": "Claro",
	"settings.appearance.dark": "Oscuro",
	"settings.appearance.system": "Sistema",
	"settings.localization.title": "Localización",
	"settings.localization.description": "Configura tu idioma y zona horaria",
	"settings.localization.language": "Idioma",
	"settings.localization.timezone": "Zona horaria",
	"settings.localization.dateFormat": "Formato de fecha",
	"settings.profile.title": "Perfil",
	"settings.profile.description": "Administra tu información de perfil",
	"settings.profile.avatar": "Foto de perfil",
	"settings.profile.avatarUrl": "URL del avatar",
	"settings.profile.changeAvatar": "Cambiar avatar",
	"settings.profile.editAvatar": "Editar avatar",
	"settings.profile.editAvatarDescription": "Sube y recorta tu foto de perfil",
	"settings.profile.uploading": "Subiendo...",
	"settings.profile.uploadFailed": "Error al subir avatar",
	"settings.profile.avatarSet": "Avatar subido",
	"settings.profile.advancedOptions": "Opciones avanzadas (URL manual)",
	"settings.personal.changeAvatar": "Cambiar avatar",
	"settings.avatar.title": "Editar Avatar",
	"settings.avatar.success": "¡Avatar guardado exitosamente!",
	"settings.avatar.error":
		"Error al guardar avatar. Por favor intenta de nuevo.",
	"settings.payments.title": "Métodos de pago",
	"settings.payments.description": "Administra tus métodos de pago",
	"settings.payments.comingSoon": "Próximamente",
	// Organization settings
	"settings.organization.title": "Configuración de Organización",
	"settings.organization.description":
		"Configuración predeterminada para tu organización (solo propietarios pueden editar)",
	"settings.organization.noOrg": "Sin organización activa",
	"settings.organization.noOrgDescription":
		"Selecciona una organización para administrar su configuración",
	"settings.organization.viewOnly":
		"Puedes ver la configuración de la organización, pero solo los propietarios pueden editarla.",
	"settings.organization.ownerNote":
		"Como propietario, puedes editar esta configuración. Los cambios se aplicarán como valores predeterminados para todos los miembros de la organización.",
	"settings.organization.theme": "Tema predeterminado",
	"settings.organization.language": "Idioma predeterminado",
	"settings.organization.timezone": "Zona horaria predeterminada",
	"settings.organization.dateFormat": "Formato de fecha predeterminado",
	"settings.organization.avatarUrl": "URL del logo de la organización",
	"settings.organization.savedSuccess":
		"Configuración de organización guardada",
	"settings.organization.loadError":
		"Error al cargar la configuración de la organización",
	"settings.organization.saveError":
		"Error al guardar la configuración de la organización",

	// Audit
	"audit.title": "Registro de auditoría",
	"audit.description": "Historial de actividad del sistema",
	"audit.noLogs": "No hay registros de auditoría",
	"audit.accessDenied.title": "Acceso denegado",
	"audit.accessDenied.description": "Se requiere acceso de administrador",
	"audit.table.event": "Evento",
	"audit.table.entity": "Entidad",
	"audit.table.actor": "Actor",
	"audit.table.source": "Fuente",
	"audit.table.time": "Hora",
	"audit.table.actions": "Acciones",
	"audit.pagination.showing": "Mostrando {start} a {end} de {total}",
	"audit.filters.eventType": "Tipo de evento",
	"audit.filters.entityType": "Tipo de entidad",
	"audit.filters.sourceService": "Servicio fuente",
	"audit.filters.search": "Buscar",
	"audit.filters.searchPlaceholder": "Buscar en registros...",
	"audit.filters.advanced": "Filtros avanzados",
	"audit.filters.clear": "Limpiar filtros",
	"audit.filters.startDate": "Fecha inicio",
	"audit.filters.endDate": "Fecha fin",
	"audit.filters.actorUserId": "ID de usuario actor",
	"audit.filters.actorUserIdPlaceholder": "ID del usuario",
	"audit.filters.actorOrgId": "ID de organización",
	"audit.filters.actorOrgIdPlaceholder": "ID de la organización",
	"audit.filters.all": "Todos",
	"audit.filters.entityId": "ID de entidad",
	"audit.filters.entityIdPlaceholder": "ID de la entidad",
	"audit.detail.title": "Detalle del registro",
	"audit.detail.basicInfo": "Información básica",
	"audit.detail.id": "ID",
	"audit.detail.timestamp": "Fecha y hora",
	"audit.detail.entityType": "Tipo de entidad",
	"audit.detail.entityId": "ID de entidad",
	"audit.detail.sourceService": "Servicio fuente",
	"audit.detail.requestId": "ID de solicitud",
	"audit.detail.actorInfo": "Información del actor",
	"audit.detail.actorUserId": "ID de usuario",
	"audit.detail.actorOrgId": "ID de organización",
	"audit.detail.actorIp": "Dirección IP",
	"audit.detail.actorUserAgent": "User Agent",
	"audit.detail.changeSummary": "Resumen de cambios",
	"audit.detail.previousState": "Estado anterior",
	"audit.detail.newState": "Nuevo estado",
	"audit.detail.metadata": "Metadatos",
	"audit.detail.signatureInfo": "Información de firma",
	"audit.detail.signature": "Firma",
	"audit.detail.previousSignature": "Firma anterior",
	"audit.detail.copied": "Copiado",
	"audit.integrity.title": "Verificación de integridad",
	"audit.integrity.description":
		"Verifica la integridad de la cadena de auditoría",
	"audit.integrity.verify": "Verificar",
	"audit.integrity.status": "Estado",
	"audit.integrity.valid": "Válido",
	"audit.integrity.invalid": "Inválido",
	"audit.integrity.verified": "Verificados",
	"audit.integrity.entries": "registros",
	"audit.integrity.brokenAt": "Roto en",
	// Onboarding
	"onboarding.title": "Completa tu perfil",
	"onboarding.description": "Cuéntanos un poco sobre ti para comenzar",
	"onboarding.firstName.label": "Nombre",
	"onboarding.firstName.placeholder": "Mariana",
	"onboarding.firstName.required": "Tu nombre es obligatorio.",
	"onboarding.firstName.description": "Tu nombre de pila",
	"onboarding.lastName.label": "Apellido",
	"onboarding.lastName.placeholder": "López",
	"onboarding.lastName.required": "Tu apellido es obligatorio.",
	"onboarding.lastName.description": "Tu apellido",
	"onboarding.avatar.label": "Foto de perfil",
	"onboarding.avatar.title": "Editar Avatar",
	"onboarding.avatar.edit": "Editar avatar",
	"onboarding.avatar.optional": "Opcional - puedes agregar una foto después",
	"onboarding.avatar.dropzone": "Haz clic o arrastra una imagen aquí",
	"onboarding.avatar.formats": "JPG, PNG, GIF o WebP (máx 5MB)",
	"onboarding.avatar.select": "Seleccionar foto de perfil",
	"onboarding.avatar.remove": "Eliminar foto",
	"onboarding.avatar.invalidType":
		"Tipo de archivo inválido. Usa JPG, PNG, GIF o WebP.",
	"onboarding.avatar.tooLarge":
		"El archivo es muy grande. El tamaño máximo es 5MB.",
	"onboarding.avatar.uploadFailed":
		"Error al subir la imagen. Por favor intenta de nuevo.",
	"onboarding.avatar.uploadSuccess": "¡Avatar guardado exitosamente!",
	"onboarding.avatar.saved": "Avatar listo para subir",
	"onboarding.button.continue": "Continuar",
	"onboarding.button.saving": "Guardando...",
	"onboarding.button.uploading": "Subiendo foto...",
	"onboarding.success.title": "¡Perfil completo!",
	"onboarding.success.message": "Tu perfil ha sido guardado. Redirigiendo...",
	"onboarding.error.title": "Error",
	"onboarding.error.updateFailed":
		"Error al actualizar el perfil. Por favor intenta de nuevo.",
	"onboarding.exit.button": "Salir y cerrar sesión",
	"onboarding.exit.loggingOut": "Cerrando sesión...",
	"onboarding.exit.description": "¿No estás listo para completar tu perfil?",
};

vi.mock("@/contexts/language-context", () => ({
	useLanguage: () => ({
		language: "es" as const,
		setLanguage: vi.fn(),
		t: (key: string) => mockTranslations[key] || key,
	}),
	LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Set default environment variables for tests (must include https://)
if (!process.env.NEXT_PUBLIC_AUTH_SERVICE_URL) {
	process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
		"https://auth-svc.example.workers.dev";
}
if (!process.env.NEXT_PUBLIC_AUTH_APP_URL) {
	process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.workers.dev";
}
if (!process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL) {
	process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL = "https://app.example.workers.dev";
}

// Mock Turnstile component for tests
vi.mock("@marsidev/react-turnstile", () => ({
	Turnstile: vi.fn(({ onSuccess, siteKey }) => {
		// Auto-verify in tests by calling onSuccess immediately.
		// Using setTimeout here can leave pending timers that fire after Vitest
		// tears down JSDOM, causing "window is not defined" unhandled errors.
		React.useEffect(() => {
			if (onSuccess) {
				onSuccess("mock-turnstile-token");
			}
		}, [onSuccess]);

		return React.createElement("div", {
			"data-testid": "turnstile-widget",
			"data-site-key": siteKey,
		});
	}),
}));

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Mock IntersectionObserver for tests (required by motion/react useInView used in animate-ui icons)
global.IntersectionObserver = class IntersectionObserver {
	readonly root: Element | Document | null = null;
	readonly rootMargin: string = "";
	readonly thresholds: ReadonlyArray<number> = [];
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}
};

// Ensure window exists for React DOM scheduler
if (typeof window !== "undefined") {
	// Mock window.matchMedia for next-themes
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(), // deprecated
			removeListener: vi.fn(), // deprecated
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});

	// Mock requestAnimationFrame for React DOM scheduler
	if (typeof window.requestAnimationFrame === "undefined") {
		window.requestAnimationFrame = vi.fn((cb) => {
			return Number(setTimeout(cb, 0));
		}) as typeof window.requestAnimationFrame;
		window.cancelAnimationFrame = vi.fn((id) => {
			clearTimeout(id);
		}) as typeof window.cancelAnimationFrame;
	}
}

// Mock document.elementFromPoint for input-otp library
// The input-otp library uses this method which doesn't exist in jsdom
if (typeof document !== "undefined" && !document.elementFromPoint) {
	document.elementFromPoint = vi.fn(() => null);
}
