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

		// Settings page
		"settings.title": "Settings",
		"settings.description": "Manage your account preferences",
		"settings.saved": "Settings saved successfully",
		"settings.save": "Save",
		"settings.appearance.title": "Appearance",
		"settings.appearance.description": "Customize how the app looks",
		"settings.appearance.theme": "Theme",
		"settings.appearance.light": "Light",
		"settings.appearance.dark": "Dark",
		"settings.appearance.system": "System",
		"settings.localization.title": "Localization",
		"settings.localization.description":
			"Configure language, timezone, and date format",
		"settings.localization.language": "Language",
		"settings.localization.timezone": "Timezone",
		"settings.localization.dateFormat": "Date Format",
		"settings.profile.title": "Profile",
		"settings.profile.description": "Manage your profile information",
		"settings.profile.avatarUrl": "Avatar URL",
		"settings.payments.title": "Payment Methods",
		"settings.payments.description": "Manage your payment methods",
		"settings.payments.comingSoon": "Payment methods management coming soon.",
		// Organization settings
		"settings.organization.title": "Organization Settings",
		"settings.organization.description":
			"Default settings for your organization (only owners can edit)",
		"settings.organization.noOrg": "No active organization",
		"settings.organization.noOrgDescription":
			"Select an organization to manage its settings",
		"settings.organization.viewOnly":
			"You can view organization settings, but only owners can edit them.",
		"settings.organization.ownerNote":
			"As the owner, you can edit these settings. Changes will apply as defaults for all organization members.",
		"settings.organization.theme": "Default Theme",
		"settings.organization.language": "Default Language",
		"settings.organization.timezone": "Default Timezone",
		"settings.organization.dateFormat": "Default Date Format",
		"settings.organization.avatarUrl": "Organization Logo URL",
		"settings.organization.savedSuccess": "Organization settings saved",
		"settings.organization.loadError": "Failed to load organization settings",
		"settings.organization.saveError": "Failed to save organization settings",

		// Audit page
		"audit.title": "Audit Logs",
		"audit.description":
			"View and manage audit logs for compliance and security",
		"audit.noLogs": "No audit logs found",
		"audit.accessDenied.title": "Access Denied",
		"audit.accessDenied.description":
			"You need admin privileges to view audit logs.",
		"audit.table.event": "Event",
		"audit.table.entity": "Entity",
		"audit.table.actor": "Actor",
		"audit.table.source": "Source",
		"audit.table.time": "Time",
		"audit.table.actions": "Actions",
		"audit.pagination.showing": "Showing {start} to {end} of {total} entries",
		"audit.filters.searchPlaceholder": "Search by entity ID, request ID...",
		"audit.filters.advanced": "Filters",
		"audit.filters.clear": "Clear",
		"audit.filters.all": "All",
		"audit.filters.eventType": "Event Type",
		"audit.filters.entityType": "Entity Type",
		"audit.filters.sourceService": "Source Service",
		"audit.filters.entityId": "Entity ID",
		"audit.filters.entityIdPlaceholder": "Enter entity ID",
		"audit.filters.startDate": "Start Date",
		"audit.filters.endDate": "End Date",
		"audit.filters.actorUserId": "Actor User ID",
		"audit.filters.actorUserIdPlaceholder": "Enter user ID",
		"audit.filters.actorOrgId": "Actor Org ID",
		"audit.filters.actorOrgIdPlaceholder": "Enter organization ID",
		"audit.detail.title": "Audit Log Details",
		"audit.detail.basicInfo": "Basic Information",
		"audit.detail.id": "Log ID",
		"audit.detail.timestamp": "Timestamp",
		"audit.detail.entityType": "Entity Type",
		"audit.detail.entityId": "Entity ID",
		"audit.detail.sourceService": "Source Service",
		"audit.detail.requestId": "Request ID",
		"audit.detail.actorInfo": "Actor Information",
		"audit.detail.actorUserId": "User ID",
		"audit.detail.actorOrgId": "Organization ID",
		"audit.detail.actorIp": "IP Address",
		"audit.detail.actorUserAgent": "User Agent",
		"audit.detail.changeSummary": "Change Summary",
		"audit.detail.previousState": "Previous State",
		"audit.detail.newState": "New State",
		"audit.detail.metadata": "Metadata",
		"audit.detail.signatureInfo": "Signature Information",
		"audit.detail.signature": "Signature",
		"audit.detail.previousSignature": "Previous Signature",
		"audit.integrity.title": "Chain Integrity",
		"audit.integrity.verify": "Verify",
		"audit.integrity.status": "Status",
		"audit.integrity.valid": "Valid",
		"audit.integrity.invalid": "Invalid",
		"audit.integrity.verified": "Verified",
		"audit.integrity.entries": "entries",
		"audit.integrity.brokenAt": "Chain broken at",
		"audit.integrity.description":
			"Click verify to check the integrity of the audit log chain.",

		// Settings navigation
		"settings.nav.personal": "Personal",
		"settings.nav.organization": "Organization",
		"settings.nav.compliance": "AML Compliance",
		"settings.nav.team": "Team",
		"settings.nav.organizations": "Organizations",
		"settings.nav.signOut": "Sign out",
		"settings.saving": "Saving...",

		// Personal settings
		"settings.personal.title": "Personal Settings",
		"settings.personal.description":
			"Manage your personal preferences and profile",
		"settings.personal.profile": "Profile",
		"settings.personal.profileDesc": "Your personal information",
		"settings.personal.fullName": "Full name",
		"settings.personal.nameHelp": "Your name is managed through your account",
		"settings.personal.email": "Email address",
		"settings.personal.verified": "Verified",
		"settings.personal.preferences": "Preferences",
		"settings.personal.preferencesDesc": "Customize your experience",
		"settings.personal.useOrgDefault": "Use organization default",
		"settings.personal.avatarHelp": "Enter a URL for your avatar image",
		"settings.personal.dateExample": "Example",
		"settings.personal.spanish": "Spanish",
		"settings.personal.english": "English",

		// Organization settings
		"settings.org.title": "Organization Settings",
		"settings.org.description":
			"Manage your organization's profile and default settings",
		"settings.org.profile": "Organization Profile",
		"settings.org.profileDesc": "Basic organization information",
		"settings.org.name": "Organization name",
		"settings.org.slug": "URL slug",
		"settings.org.id": "Organization ID",
		"settings.org.idHelp": "Use this ID for API integrations",
		"settings.org.logoHelp": "Enter a URL for your organization logo",
		"settings.org.defaultPreferences": "Default Preferences",
		"settings.org.defaultPreferencesDesc":
			"These settings will be used as defaults for new members",
		"settings.org.defaultTimezone": "Default timezone",
		"settings.org.defaultLanguage": "Default language",
		"settings.org.defaultDateFormat": "Default date format",
		"settings.org.dangerZone": "Danger Zone",
		"settings.org.dangerZoneDesc": "Irreversible and destructive actions",
		"settings.org.delete": "Delete organization",
		"settings.org.deleteDesc":
			"Permanently delete this organization and all its data",
		"settings.org.deleteButton": "Delete organization",
		"settings.org.deleteConfirmTitle": "Delete organization?",
		"settings.org.deleteConfirmDesc":
			"This action cannot be undone. This will permanently delete {name} and all associated data including members, transactions, and alerts.",
		"settings.org.cancel": "Cancel",

		// AML Compliance settings
		"settings.compliance.title": "AML Compliance Settings",
		"settings.compliance.description":
			"Configure your obligated subject information for anti-money laundering compliance",
		"settings.compliance.statusConfigured": "Compliance configured",
		"settings.compliance.statusConfiguredDesc":
			"Your AML compliance information has been configured",
		"settings.compliance.statusNotConfigured": "Compliance not configured",
		"settings.compliance.statusNotConfiguredDesc":
			"Please configure your obligated subject information to comply with AML regulations",
		"settings.compliance.obligatedSubject": "Obligated Subject Information",
		"settings.compliance.obligatedSubjectDesc":
			"Information required for LFPIORPI compliance",
		"settings.compliance.rfc": "RFC (Tax ID)",
		"settings.compliance.rfcRequired": "RFC is required",
		"settings.compliance.rfcLength": "RFC must be 12 or 13 characters",
		"settings.compliance.rfcFormat": "Invalid RFC format",
		"settings.compliance.rfcHelp":
			"The RFC (Registro Federal de Contribuyentes) is your Mexican tax identification number. It must be 12 characters for legal entities or 13 for individuals.",
		"settings.compliance.characters": "characters",
		"settings.compliance.vulnerableActivity": "Vulnerable Activity",
		"settings.compliance.activityRequired": "Vulnerable activity is required",
		"settings.compliance.activityHelp":
			"Select the vulnerable activity that best describes your business operations according to LFPIORPI Article 17",
		"settings.compliance.selectActivity": "Select a vulnerable activity",
		"settings.compliance.saveChanges": "Save changes",
		"settings.compliance.savedSuccess":
			"Compliance settings saved successfully",
		"settings.compliance.saveError": "Failed to save compliance settings",
		"settings.compliance.ownerOnly":
			"Only organization owners and admins can edit compliance settings",
		"settings.compliance.reportingThresholds": "Reporting Thresholds",
		"settings.compliance.reportingThresholdsDesc":
			"Operations above these thresholds must be reported to the FIU",
		"settings.compliance.thresholdUMA": "Threshold (UMAs)",
		"settings.compliance.thresholdMXN": "Threshold (MXN)",
		"settings.compliance.umaNote": "UMA value",
		"settings.compliance.viewAllThresholds": "View all thresholds by activity",

		// Team settings
		"settings.team.title": "Team Settings",
		"settings.team.description":
			"Manage your organization's team members and access",
		"settings.team.members": "Team Members",
		"settings.team.pendingInvitations": "Pending Invitations",
		"settings.team.inviteMember": "Invite member",
		"settings.team.inviteDesc": "Send an invitation to join your organization",
		"settings.team.email": "Email address",
		"settings.team.role": "Role",
		"settings.team.roleOwner": "Owner",
		"settings.team.roleAdmin": "Admin",
		"settings.team.roleMember": "Member",
		"settings.team.sendInvite": "Send invitation",
		"settings.team.sending": "Sending...",
		"settings.team.cancel": "Cancel",
		"settings.team.inviteSent": "Invitation sent successfully",
		"settings.team.inviteError": "Failed to send invitation",
		"settings.team.you": "You",
		"settings.team.invitedBy": "Invited by",
		"settings.team.makeAdmin": "Make admin",
		"settings.team.makeMember": "Make member",
		"settings.team.remove": "Remove",
		"settings.team.roleUpdated": "Role updated successfully",
		"settings.team.roleUpdateError": "Failed to update role",
		"settings.team.memberRemoved": "Member removed successfully",
		"settings.team.removeError": "Failed to remove member",
		"settings.team.invitationCanceled": "Invitation canceled",
		"settings.team.cancelError": "Failed to cancel invitation",
		"settings.team.removeConfirmTitle": "Remove member?",
		"settings.team.removeConfirmDesc":
			"Are you sure you want to remove {name} from the organization? They will lose access immediately.",
		"settings.team.rolePermissions": "Role Permissions",
		"settings.team.rolePermissionsDesc":
			"What each role can do in your organization",
		"settings.team.perm.all": "Full access to all settings",
		"settings.team.perm.delete": "Delete organization",
		"settings.team.perm.transfer": "Transfer ownership",
		"settings.team.perm.manage": "Manage team members",
		"settings.team.perm.invite": "Invite new members",
		"settings.team.perm.settings": "Edit organization settings",
		"settings.team.perm.view": "View organization data",
		"settings.team.perm.use": "Use organization features",

		// Billing settings
		"settings.nav.billing": "Billing",
		"settings.billing.title": "Billing & Subscription",
		"settings.billing.description":
			"Manage your subscription, usage, and payment methods",
		"settings.billing.currentPlan": "Current Plan",
		"settings.billing.noPlan": "No active subscription",
		"settings.billing.noPlanDesc": "Subscribe to a plan to unlock all features",
		"settings.billing.usage": "Usage This Period",
		"settings.billing.notices": "Notices",
		"settings.billing.users": "Users",
		"settings.billing.alerts": "Alerts",
		"settings.billing.transactions": "Transactions",
		"settings.billing.included": "included",
		"settings.billing.unlimited": "Unlimited",
		"settings.billing.overage": "overage",
		"settings.billing.resetDate": "Resets on {date}",
		"settings.billing.periodEnd": "Period ends {date}",
		"settings.billing.paymentMethods": "Payment Methods",
		"settings.billing.invoices": "Invoice History",
		"settings.billing.managePortal": "Manage in Stripe Portal",
		"settings.billing.upgrade": "Upgrade Plan",
		"settings.billing.downgrade": "Downgrade Plan",
		"settings.billing.cancel": "Cancel Subscription",
		"settings.billing.cancelConfirm":
			"Are you sure you want to cancel? Your subscription will remain active until {date}.",
		"settings.billing.reactivate": "Reactivate",
		"settings.billing.enterprise": "Enterprise License",
		"settings.billing.activateLicense": "Activate License",
		"settings.billing.licenseActive": "License Active",
		"settings.billing.licenseExpires": "Expires {date}",
		"settings.billing.licensePlaceholder": "Enter your license key",
		"settings.billing.selectPlan": "Select a Plan",
		"settings.billing.selectPlanDesc":
			"Choose the plan that best fits your needs",
		"settings.billing.business": "Business",
		"settings.billing.pro": "Pro",
		"settings.billing.enterprisePlan": "Enterprise",
		"settings.billing.month": "/month",
		"settings.billing.year": "/year",
		"settings.billing.perNotice": "per extra notice",
		"settings.billing.contactSales": "Contact Sales",
		"settings.billing.subscribe": "Subscribe",
		"settings.billing.currentPlanBadge": "Current",
		"settings.billing.recommended": "Recommended",
		"settings.billing.canceledBadge": "Cancels {date}",
		"settings.billing.pastDue": "Past Due",
		"settings.billing.active": "Active",
		"settings.billing.trialing": "Trial",
		"settings.billing.features": "Features",
		"settings.billing.invoiceDate": "Date",
		"settings.billing.invoiceAmount": "Amount",
		"settings.billing.invoiceStatus": "Status",
		"settings.billing.invoicePaid": "Paid",
		"settings.billing.invoicePending": "Pending",
		"settings.billing.invoiceFailed": "Failed",
		"settings.billing.downloadPdf": "Download PDF",
		"settings.billing.noInvoices": "No invoices yet",
		"settings.billing.ownerOnly": "Only organization owners can manage billing",
		"settings.billing.subscribeSuccess": "Subscription activated successfully",
		"settings.billing.cancelSuccess":
			"Subscription will be canceled at the end of the billing period",
		"settings.billing.reactivateSuccess": "Subscription reactivated",
		"settings.billing.licenseSuccess": "License activated successfully",
		"settings.billing.error": "An error occurred. Please try again.",
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

		// Settings page
		"settings.title": "Configuración",
		"settings.description": "Administra las preferencias de tu cuenta",
		"settings.saved": "Configuración guardada exitosamente",
		"settings.save": "Guardar",
		"settings.appearance.title": "Apariencia",
		"settings.appearance.description": "Personaliza cómo se ve la aplicación",
		"settings.appearance.theme": "Tema",
		"settings.appearance.light": "Claro",
		"settings.appearance.dark": "Oscuro",
		"settings.appearance.system": "Sistema",
		"settings.localization.title": "Localización",
		"settings.localization.description":
			"Configura idioma, zona horaria y formato de fecha",
		"settings.localization.language": "Idioma",
		"settings.localization.timezone": "Zona horaria",
		"settings.localization.dateFormat": "Formato de fecha",
		"settings.profile.title": "Perfil",
		"settings.profile.description": "Administra tu información de perfil",
		"settings.profile.avatarUrl": "URL del avatar",
		"settings.payments.title": "Métodos de pago",
		"settings.payments.description": "Administra tus métodos de pago",
		"settings.payments.comingSoon":
			"Administración de métodos de pago próximamente.",
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

		// Audit page
		"audit.title": "Registros de Auditoría",
		"audit.description":
			"Ver y administrar registros de auditoría para cumplimiento y seguridad",
		"audit.noLogs": "No se encontraron registros de auditoría",
		"audit.accessDenied.title": "Acceso Denegado",
		"audit.accessDenied.description":
			"Necesitas privilegios de administrador para ver los registros de auditoría.",
		"audit.table.event": "Evento",
		"audit.table.entity": "Entidad",
		"audit.table.actor": "Actor",
		"audit.table.source": "Origen",
		"audit.table.time": "Tiempo",
		"audit.table.actions": "Acciones",
		"audit.pagination.showing": "Mostrando {start} a {end} de {total} entradas",
		"audit.filters.searchPlaceholder":
			"Buscar por ID de entidad, ID de solicitud...",
		"audit.filters.advanced": "Filtros",
		"audit.filters.clear": "Limpiar",
		"audit.filters.all": "Todos",
		"audit.filters.eventType": "Tipo de Evento",
		"audit.filters.entityType": "Tipo de Entidad",
		"audit.filters.sourceService": "Servicio de Origen",
		"audit.filters.entityId": "ID de Entidad",
		"audit.filters.entityIdPlaceholder": "Ingresa ID de entidad",
		"audit.filters.startDate": "Fecha de Inicio",
		"audit.filters.endDate": "Fecha de Fin",
		"audit.filters.actorUserId": "ID de Usuario Actor",
		"audit.filters.actorUserIdPlaceholder": "Ingresa ID de usuario",
		"audit.filters.actorOrgId": "ID de Org Actor",
		"audit.filters.actorOrgIdPlaceholder": "Ingresa ID de organización",
		"audit.detail.title": "Detalles del Registro de Auditoría",
		"audit.detail.basicInfo": "Información Básica",
		"audit.detail.id": "ID del Registro",
		"audit.detail.timestamp": "Marca de Tiempo",
		"audit.detail.entityType": "Tipo de Entidad",
		"audit.detail.entityId": "ID de Entidad",
		"audit.detail.sourceService": "Servicio de Origen",
		"audit.detail.requestId": "ID de Solicitud",
		"audit.detail.actorInfo": "Información del Actor",
		"audit.detail.actorUserId": "ID de Usuario",
		"audit.detail.actorOrgId": "ID de Organización",
		"audit.detail.actorIp": "Dirección IP",
		"audit.detail.actorUserAgent": "User Agent",
		"audit.detail.changeSummary": "Resumen de Cambios",
		"audit.detail.previousState": "Estado Anterior",
		"audit.detail.newState": "Estado Nuevo",
		"audit.detail.metadata": "Metadatos",
		"audit.detail.signatureInfo": "Información de Firma",
		"audit.detail.signature": "Firma",
		"audit.detail.previousSignature": "Firma Anterior",
		"audit.integrity.title": "Integridad de la Cadena",
		"audit.integrity.verify": "Verificar",
		"audit.integrity.status": "Estado",
		"audit.integrity.valid": "Válida",
		"audit.integrity.invalid": "Inválida",
		"audit.integrity.verified": "Verificados",
		"audit.integrity.entries": "registros",
		"audit.integrity.brokenAt": "Cadena rota en",
		"audit.integrity.description":
			"Haz clic en verificar para comprobar la integridad de la cadena de auditoría.",

		// Settings navigation
		"settings.nav.personal": "Personal",
		"settings.nav.organization": "Organización",
		"settings.nav.compliance": "Cumplimiento PLD",
		"settings.nav.team": "Equipo",
		"settings.nav.organizations": "Organizaciones",
		"settings.nav.signOut": "Cerrar sesión",
		"settings.saving": "Guardando...",

		// Personal settings
		"settings.personal.title": "Configuración Personal",
		"settings.personal.description":
			"Administra tus preferencias personales y perfil",
		"settings.personal.profile": "Perfil",
		"settings.personal.profileDesc": "Tu información personal",
		"settings.personal.fullName": "Nombre completo",
		"settings.personal.nameHelp": "Tu nombre se administra desde tu cuenta",
		"settings.personal.email": "Correo electrónico",
		"settings.personal.verified": "Verificado",
		"settings.personal.preferences": "Preferencias",
		"settings.personal.preferencesDesc": "Personaliza tu experiencia",
		"settings.personal.useOrgDefault": "Usar valor de organización",
		"settings.personal.avatarHelp": "Ingresa una URL para tu imagen de avatar",
		"settings.personal.dateExample": "Ejemplo",
		"settings.personal.spanish": "Español",
		"settings.personal.english": "Inglés",

		// Organization settings
		"settings.org.title": "Configuración de Organización",
		"settings.org.description":
			"Administra el perfil y configuración predeterminada de tu organización",
		"settings.org.profile": "Perfil de la Organización",
		"settings.org.profileDesc": "Información básica de la organización",
		"settings.org.name": "Nombre de la organización",
		"settings.org.slug": "URL slug",
		"settings.org.id": "ID de Organización",
		"settings.org.idHelp": "Usa este ID para integraciones API",
		"settings.org.logoHelp": "Ingresa una URL para el logo de tu organización",
		"settings.org.defaultPreferences": "Preferencias Predeterminadas",
		"settings.org.defaultPreferencesDesc":
			"Esta configuración se usará como predeterminada para nuevos miembros",
		"settings.org.defaultTimezone": "Zona horaria predeterminada",
		"settings.org.defaultLanguage": "Idioma predeterminado",
		"settings.org.defaultDateFormat": "Formato de fecha predeterminado",
		"settings.org.dangerZone": "Zona de Peligro",
		"settings.org.dangerZoneDesc": "Acciones irreversibles y destructivas",
		"settings.org.delete": "Eliminar organización",
		"settings.org.deleteDesc":
			"Eliminar permanentemente esta organización y todos sus datos",
		"settings.org.deleteButton": "Eliminar organización",
		"settings.org.deleteConfirmTitle": "¿Eliminar organización?",
		"settings.org.deleteConfirmDesc":
			"Esta acción no se puede deshacer. Esto eliminará permanentemente {name} y todos los datos asociados incluyendo miembros, transacciones y alertas.",
		"settings.org.cancel": "Cancelar",

		// AML Compliance settings
		"settings.compliance.title": "Configuración de Cumplimiento PLD",
		"settings.compliance.description":
			"Configura la información de sujeto obligado para el cumplimiento de prevención de lavado de dinero",
		"settings.compliance.statusConfigured": "Cumplimiento configurado",
		"settings.compliance.statusConfiguredDesc":
			"Tu información de cumplimiento PLD ha sido configurada",
		"settings.compliance.statusNotConfigured": "Cumplimiento no configurado",
		"settings.compliance.statusNotConfiguredDesc":
			"Por favor configura tu información de sujeto obligado para cumplir con la regulación PLD",
		"settings.compliance.obligatedSubject": "Información del Sujeto Obligado",
		"settings.compliance.obligatedSubjectDesc":
			"Información requerida para cumplimiento LFPIORPI",
		"settings.compliance.rfc": "RFC",
		"settings.compliance.rfcRequired": "El RFC es requerido",
		"settings.compliance.rfcLength": "El RFC debe tener 12 o 13 caracteres",
		"settings.compliance.rfcFormat": "Formato de RFC inválido",
		"settings.compliance.rfcHelp":
			"El RFC (Registro Federal de Contribuyentes) es tu número de identificación fiscal mexicano. Debe tener 12 caracteres para personas morales o 13 para personas físicas.",
		"settings.compliance.characters": "caracteres",
		"settings.compliance.vulnerableActivity": "Actividad Vulnerable",
		"settings.compliance.activityRequired":
			"La actividad vulnerable es requerida",
		"settings.compliance.activityHelp":
			"Selecciona la actividad vulnerable que mejor describe tus operaciones según el Artículo 17 de la LFPIORPI",
		"settings.compliance.selectActivity": "Selecciona una actividad vulnerable",
		"settings.compliance.saveChanges": "Guardar cambios",
		"settings.compliance.savedSuccess":
			"Configuración de cumplimiento guardada exitosamente",
		"settings.compliance.saveError":
			"Error al guardar configuración de cumplimiento",
		"settings.compliance.ownerOnly":
			"Solo propietarios y administradores pueden editar la configuración de cumplimiento",
		"settings.compliance.reportingThresholds": "Umbrales de Reporte",
		"settings.compliance.reportingThresholdsDesc":
			"Las operaciones superiores a estos umbrales deben reportarse a la UIF",
		"settings.compliance.thresholdUMA": "Umbral (UMAs)",
		"settings.compliance.thresholdMXN": "Umbral (MXN)",
		"settings.compliance.umaNote": "Valor UMA",
		"settings.compliance.viewAllThresholds":
			"Ver todos los umbrales por actividad",

		// Team settings
		"settings.team.title": "Configuración de Equipo",
		"settings.team.description":
			"Administra los miembros del equipo y accesos de tu organización",
		"settings.team.members": "Miembros del Equipo",
		"settings.team.pendingInvitations": "Invitaciones Pendientes",
		"settings.team.inviteMember": "Invitar miembro",
		"settings.team.inviteDesc":
			"Envía una invitación para unirse a tu organización",
		"settings.team.email": "Correo electrónico",
		"settings.team.role": "Rol",
		"settings.team.roleOwner": "Propietario",
		"settings.team.roleAdmin": "Administrador",
		"settings.team.roleMember": "Miembro",
		"settings.team.sendInvite": "Enviar invitación",
		"settings.team.sending": "Enviando...",
		"settings.team.cancel": "Cancelar",
		"settings.team.inviteSent": "Invitación enviada exitosamente",
		"settings.team.inviteError": "Error al enviar la invitación",
		"settings.team.you": "Tú",
		"settings.team.invitedBy": "Invitado por",
		"settings.team.makeAdmin": "Hacer administrador",
		"settings.team.makeMember": "Hacer miembro",
		"settings.team.remove": "Remover",
		"settings.team.roleUpdated": "Rol actualizado exitosamente",
		"settings.team.roleUpdateError": "Error al actualizar rol",
		"settings.team.memberRemoved": "Miembro removido exitosamente",
		"settings.team.removeError": "Error al remover miembro",
		"settings.team.invitationCanceled": "Invitación cancelada",
		"settings.team.cancelError": "Error al cancelar invitación",
		"settings.team.removeConfirmTitle": "¿Remover miembro?",
		"settings.team.removeConfirmDesc":
			"¿Estás seguro de que deseas remover a {name} de la organización? Perderá acceso inmediatamente.",
		"settings.team.rolePermissions": "Permisos por Rol",
		"settings.team.rolePermissionsDesc":
			"Lo que cada rol puede hacer en tu organización",
		"settings.team.perm.all": "Acceso completo a toda la configuración",
		"settings.team.perm.delete": "Eliminar organización",
		"settings.team.perm.transfer": "Transferir propiedad",
		"settings.team.perm.manage": "Administrar miembros del equipo",
		"settings.team.perm.invite": "Invitar nuevos miembros",
		"settings.team.perm.settings": "Editar configuración de organización",
		"settings.team.perm.view": "Ver datos de la organización",
		"settings.team.perm.use": "Usar funciones de la organización",

		// Billing settings
		"settings.nav.billing": "Facturación",
		"settings.billing.title": "Facturación y Suscripción",
		"settings.billing.description":
			"Administra tu suscripción, uso y métodos de pago",
		"settings.billing.currentPlan": "Plan Actual",
		"settings.billing.noPlan": "Sin suscripción activa",
		"settings.billing.noPlanDesc":
			"Suscríbete a un plan para desbloquear todas las funciones",
		"settings.billing.usage": "Uso Este Período",
		"settings.billing.notices": "Avisos",
		"settings.billing.users": "Usuarios",
		"settings.billing.alerts": "Alertas",
		"settings.billing.transactions": "Transacciones",
		"settings.billing.included": "incluidos",
		"settings.billing.unlimited": "Ilimitado",
		"settings.billing.overage": "excedente",
		"settings.billing.resetDate": "Se reinicia el {date}",
		"settings.billing.periodEnd": "Período termina el {date}",
		"settings.billing.paymentMethods": "Métodos de Pago",
		"settings.billing.invoices": "Historial de Facturas",
		"settings.billing.managePortal": "Administrar en Portal de Stripe",
		"settings.billing.upgrade": "Mejorar Plan",
		"settings.billing.downgrade": "Reducir Plan",
		"settings.billing.cancel": "Cancelar Suscripción",
		"settings.billing.cancelConfirm":
			"¿Estás seguro de que deseas cancelar? Tu suscripción permanecerá activa hasta el {date}.",
		"settings.billing.reactivate": "Reactivar",
		"settings.billing.enterprise": "Licencia Empresarial",
		"settings.billing.activateLicense": "Activar Licencia",
		"settings.billing.licenseActive": "Licencia Activa",
		"settings.billing.licenseExpires": "Expira el {date}",
		"settings.billing.licensePlaceholder": "Ingresa tu clave de licencia",
		"settings.billing.selectPlan": "Selecciona un Plan",
		"settings.billing.selectPlanDesc":
			"Elige el plan que mejor se adapte a tus necesidades",
		"settings.billing.business": "Business",
		"settings.billing.pro": "Pro",
		"settings.billing.enterprisePlan": "Enterprise",
		"settings.billing.month": "/mes",
		"settings.billing.year": "/año",
		"settings.billing.perNotice": "por aviso extra",
		"settings.billing.contactSales": "Contactar Ventas",
		"settings.billing.subscribe": "Suscribirse",
		"settings.billing.currentPlanBadge": "Actual",
		"settings.billing.recommended": "Recomendado",
		"settings.billing.canceledBadge": "Cancela el {date}",
		"settings.billing.pastDue": "Vencido",
		"settings.billing.active": "Activo",
		"settings.billing.trialing": "Prueba",
		"settings.billing.features": "Características",
		"settings.billing.invoiceDate": "Fecha",
		"settings.billing.invoiceAmount": "Monto",
		"settings.billing.invoiceStatus": "Estado",
		"settings.billing.invoicePaid": "Pagada",
		"settings.billing.invoicePending": "Pendiente",
		"settings.billing.invoiceFailed": "Fallida",
		"settings.billing.downloadPdf": "Descargar PDF",
		"settings.billing.noInvoices": "Sin facturas aún",
		"settings.billing.ownerOnly":
			"Solo los propietarios de la organización pueden administrar la facturación",
		"settings.billing.subscribeSuccess": "Suscripción activada exitosamente",
		"settings.billing.cancelSuccess":
			"La suscripción se cancelará al final del período de facturación",
		"settings.billing.reactivateSuccess": "Suscripción reactivada",
		"settings.billing.licenseSuccess": "Licencia activada exitosamente",
		"settings.billing.error": "Ocurrió un error. Por favor intenta de nuevo.",
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
