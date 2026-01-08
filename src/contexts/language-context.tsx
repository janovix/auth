"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "es";

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: string) => string;
}

const translations = {
	en: {
		// Login page
		"login.title": "Welcome",
		"login.description.email": "Enter your email to receive an access code",
		"login.description.otp": "Enter the code we sent to your email",
		"login.email.label": "Email address",
		"login.email.placeholder": "you@company.com",
		"login.email.required": "Email is required.",
		"login.email.invalid": "Enter a valid email.",
		"login.email.description": "Enter your email address",
		"login.button.send": "Send access code",
		"login.button.sending": "Sending code...",
		"login.noAccount": "Don't have an account?",
		"login.signupLink": "Sign up here",
		"login.otp.sent": "Code sent",
		"login.otp.sentDescription":
			"We sent a 6-digit code to {email}. Check your inbox and spam.",
		"login.otp.label": "Verification code",
		"login.otp.verifying": "Verifying...",
		"login.otp.expired":
			"The code has expired. Codes are valid for 5 minutes. Request a new one.",
		"login.otp.tooManyAttempts":
			"You have exceeded the number of attempts. For security, request a new code.",
		"login.otp.invalid": "Incorrect code. Try again.",
		"login.otp.expiredTitle": "Expired or invalid code",
		"login.otp.errorTitle": "Verification error",
		"login.otp.resendNew": "Sending new code...",
		"login.otp.requestNew": "Request new code",
		"login.otp.resend": "Resend code",
		"login.otp.resending": "Sending...",
		"login.otp.resendError": "Error resending code. Try again.",
		"login.otp.resendSuccess":
			"New code sent. Check your email (valid for 5 minutes).",
		"login.wrongEmail": "Wrong email?",
		"login.changeEmail": "Change email",
		"login.terms": "By signing in, you accept our",
		"login.termsOfService": "Terms of Service",
		"login.and": "and",
		"login.privacyPolicy": "Privacy Policy",
		"login.success.codeSent": "Code sent",
		"login.success.auth": "Authentication successful",
		"login.success.message":
			"We sent you a 6-digit code. Check your email and spam.",
		"login.error": "Error",

		// Signup page
		"signup.title": "Create your account",
		"signup.description": "Complete the form to get started",
		"signup.firstName.label": "First name",
		"signup.firstName.placeholder": "John",
		"signup.firstName.required": "First name is required.",
		"signup.firstName.description": "Your first name",
		"signup.lastName.label": "Last name",
		"signup.lastName.placeholder": "Doe",
		"signup.lastName.required": "Last name is required.",
		"signup.lastName.description": "Your last name",
		"signup.email.label": "Email address",
		"signup.email.placeholder": "you@company.com",
		"signup.email.required": "Email is required.",
		"signup.email.invalid": "Enter a valid email.",
		"signup.email.description": "Your corporate email address",
		"signup.terms.label": "I accept the",
		"signup.terms.termsAndConditions": "terms and conditions",
		"signup.terms.andThe": "and the",
		"signup.terms.privacyNotice": "privacy notice",
		"signup.terms.required": "You must accept the terms and conditions.",
		"signup.terms.description":
			"You must accept the terms and conditions to continue",
		"signup.button.create": "Create account",
		"signup.button.creating": "Creating account...",
		"signup.hasAccount": "Already have an account?",
		"signup.loginLink": "Sign in",
		"signup.success.title": "Account created — Verification pending",
		"signup.success.titleDone": "Account created successfully",
		"signup.success.message":
			"We sent a 6-digit code to your email. Enter it below to verify your account.",
		"signup.success.redirect": "Account created. Redirecting to login…",
		"signup.otp.title": "Enter verification code",
		"signup.otp.description":
			"We sent a 6-digit code to {email}. Check your inbox (and spam folder).",
		"signup.otp.verifying": "Verifying...",
		"signup.otp.expired":
			"The code has expired. Codes are valid for 5 minutes. Request a new one.",
		"signup.otp.tooManyAttempts":
			"You have exceeded the number of attempts. For security, request a new code.",
		"signup.otp.invalid": "Incorrect code. Try again.",
		"signup.otp.expiredTitle": "Expired or invalid code",
		"signup.otp.errorTitle": "Verification error",
		"signup.otp.resendNew": "Sending new code...",
		"signup.otp.requestNew": "Request new code",
		"signup.otp.resend": "Resend code",
		"signup.otp.resending": "Sending...",
		"signup.otp.resendError": "Error resending verification code",
		"signup.otp.resendSuccess":
			"New code sent. Check your email (valid for 5 minutes).",
		"signup.otp.changeEmail": "Need to change your email?",
		"signup.otp.backToForm": "Back to form",
		"signup.otp.verified": "Email verified! Please sign in to continue.",
		"signup.error.title": "Error creating account",

		// Verify email page
		"verify.title": "Email verification",
		"verify.success.description": "Your email has been verified successfully",
		"verify.error.description": "There was a problem verifying your email",
		"verify.default.description": "Email verification status",
		"verify.success.title": "Verification successful",
		"verify.success.message":
			"Your email has been verified correctly. You can now sign in with your account.",
		"verify.success.ready":
			"Your account is ready to use. You can now access all platform features.",
		"verify.success.button": "Go to sign in",
		"verify.error.title": "Verification error",
		"verify.error.message":
			"Could not verify your email. Please sign in or register again to receive a verification code.",
		"verify.error.noAccount": "Don't have an account? Sign up",
		"verify.default.message":
			"Email verification is done via OTP code sent to your email during registration. Sign in to continue.",
		"verify.default.backToLogin": "Back to sign in",

		// Account page
		"account.noSession.title": "Session not found",
		"account.noSession.description":
			"No active session was found in this environment",
		"account.noSession.previewNote":
			"If you come from a preview, make sure you signed in on the same domain to share the cookie.",
		"account.noSession.login": "Sign in",
		"account.noSession.signup": "Create account",
		"account.title": "My account",
		"account.description": "Your active session information",
		"account.environment": "Environment",
		"account.userId": "User ID",
		"account.expires": "Expires {time}",
		"account.lastUpdate": "Last update:",
		"account.sessionId": "Session ID",
		"account.logout": "Sign out",
		"account.loggingOut": "Signing out...",
		"account.security.title": "Security settings",
		"account.security.description": "Authentication cookie details",
		"account.security.domain": "Domain",
		"account.security.endpoint": "Base endpoint",
		"account.security.scope": "Session scope",
		"account.security.scopeDev": "All apps under *.janovix.workers.dev",
		"account.security.scopeProd": "Only apps under the current domain",
		"account.security.note": "Important note",
		"account.security.noteText":
			"Development and production environments use different domains, so you'll need to sign in independently in each one.",
		"account.technical.title": "Technical information",
		"account.technical.description": "Debug details for developers",
		"account.technical.token": "Session token",
		"account.technical.ip": "IP Address",
		"account.technical.userAgent": "User Agent",
	},
	es: {
		// Login page
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
		"login.noAccount": "¿Aún no tienes cuenta?",
		"login.signupLink": "Regístrate aquí",
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
		"login.otp.resendSuccess":
			"Nuevo código enviado. Revisa tu correo (válido por 5 minutos).",
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
		"login.error": "Error",

		// Signup page
		"signup.title": "Crea tu cuenta",
		"signup.description": "Completa el formulario para comenzar",
		"signup.firstName.label": "Nombre",
		"signup.firstName.placeholder": "Mariana",
		"signup.firstName.required": "Tu nombre es obligatorio.",
		"signup.firstName.description": "Tu nombre de pila",
		"signup.lastName.label": "Apellido",
		"signup.lastName.placeholder": "López",
		"signup.lastName.required": "Tu apellido es obligatorio.",
		"signup.lastName.description": "Tu apellido",
		"signup.email.label": "Correo electrónico",
		"signup.email.placeholder": "tu@empresa.com",
		"signup.email.required": "El correo es obligatorio.",
		"signup.email.invalid": "Ingresa un correo válido.",
		"signup.email.description": "Tu dirección de correo corporativo",
		"signup.terms.label": "Acepto los",
		"signup.terms.termsAndConditions": "términos y condiciones",
		"signup.terms.andThe": "y el",
		"signup.terms.privacyNotice": "aviso de privacidad",
		"signup.terms.required": "Debes aceptar los términos y condiciones.",
		"signup.terms.description":
			"Debes aceptar los términos y condiciones para continuar",
		"signup.button.create": "Crear cuenta",
		"signup.button.creating": "Creando cuenta...",
		"signup.hasAccount": "¿Ya tienes cuenta?",
		"signup.loginLink": "Inicia sesión",
		"signup.success.title": "Cuenta creada — Verificación pendiente",
		"signup.success.titleDone": "Cuenta creada exitosamente",
		"signup.success.message":
			"Hemos enviado un código de 6 dígitos a tu correo. Ingrésalo a continuación para verificar tu cuenta.",
		"signup.success.redirect":
			"Cuenta creada. Redirigiendo al inicio de sesión…",
		"signup.otp.title": "Ingresa el código de verificación",
		"signup.otp.description":
			"Enviamos un código de 6 dígitos a {email}. Revisa tu bandeja de entrada (y la carpeta de spam).",
		"signup.otp.verifying": "Verificando...",
		"signup.otp.expired":
			"El código ha expirado. Los códigos son válidos por 5 minutos. Solicita uno nuevo.",
		"signup.otp.tooManyAttempts":
			"Has excedido el número de intentos. Por seguridad, solicita un nuevo código.",
		"signup.otp.invalid": "Código incorrecto. Inténtalo de nuevo.",
		"signup.otp.expiredTitle": "Código expirado o inválido",
		"signup.otp.errorTitle": "Error de verificación",
		"signup.otp.resendNew": "Enviando nuevo código...",
		"signup.otp.requestNew": "Solicitar nuevo código",
		"signup.otp.resend": "Reenviar código",
		"signup.otp.resending": "Enviando...",
		"signup.otp.resendError": "Error al reenviar el código de verificación",
		"signup.otp.resendSuccess":
			"Nuevo código enviado. Revisa tu correo (válido por 5 minutos).",
		"signup.otp.changeEmail": "¿Necesitas cambiar tu correo?",
		"signup.otp.backToForm": "Volver al formulario",
		"signup.otp.verified":
			"¡Correo verificado! Por favor inicia sesión para continuar.",
		"signup.error.title": "Error al crear la cuenta",

		// Verify email page
		"verify.title": "Verificación de correo",
		"verify.success.description":
			"Tu correo electrónico ha sido verificado exitosamente",
		"verify.error.description":
			"Hubo un problema al verificar tu correo electrónico",
		"verify.default.description": "Estado de verificación de correo",
		"verify.success.title": "Verificación exitosa",
		"verify.success.message":
			"Tu correo electrónico ha sido verificado correctamente. Ya puedes iniciar sesión con tu cuenta.",
		"verify.success.ready":
			"Tu cuenta está lista para usar. Ahora puedes acceder a todas las funcionalidades de la plataforma.",
		"verify.success.button": "Ir a iniciar sesión",
		"verify.error.title": "Error de verificación",
		"verify.error.message":
			"No se pudo verificar tu correo electrónico. Por favor, inicia sesión o regístrate nuevamente para recibir un código de verificación.",
		"verify.error.noAccount": "¿No tienes cuenta? Regístrate",
		"verify.default.message":
			"La verificación de correo se realiza mediante un código OTP enviado a tu email durante el registro. Inicia sesión para continuar.",
		"verify.default.backToLogin": "Volver al inicio de sesión",

		// Account page
		"account.noSession.title": "Sesión no encontrada",
		"account.noSession.description":
			"No se encontró una sesión activa en este entorno",
		"account.noSession.previewNote":
			"Si vienes de un preview, asegúrate de haber iniciado sesión en el mismo dominio para compartir la cookie.",
		"account.noSession.login": "Iniciar sesión",
		"account.noSession.signup": "Crear cuenta",
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
	},
};

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
	const [language, setLanguageState] = useState<Language>("es");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const stored = localStorage.getItem("language") as Language;
		if (stored && (stored === "en" || stored === "es")) {
			setLanguageState(stored);
		} else {
			const browserLang = navigator.language.toLowerCase();
			setLanguageState(browserLang.startsWith("es") ? "es" : "en");
		}
	}, []);

	const handleSetLanguage = (lang: Language) => {
		setLanguageState(lang);
		localStorage.setItem("language", lang);
	};

	const t = (key: string): string => {
		const langTranslations = translations[language];
		return langTranslations[key as keyof typeof langTranslations] || key;
	};

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted) {
		return null;
	}

	return (
		<LanguageContext.Provider
			value={{ language, setLanguage: handleSetLanguage, t }}
		>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (context === undefined) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
