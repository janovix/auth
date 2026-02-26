"use client";

import * as Sentry from "@sentry/nextjs";
import type React from "react";
import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { getCookie, setCookie, COOKIE_NAMES } from "@/lib/cookies";
import {
	getResolvedSettings,
	updateUserSettings,
	type LanguageCode,
} from "@/lib/settings";
import {
	LanguageContext as BlocksLanguageContext,
	type LanguageContextValue as BlocksLanguageContextValue,
	type BlocksLanguage,
} from "@algenium/blocks";

type Language = "en" | "es";

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: string) => string;
}

const translations = {
	en: {
		// Common
		"common.accept": "Accept",
		"common.cancel": "Cancel",
		"common.back": "Back",

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
		"login.button.loading": "Signing in...",
		"login.button.google": "Connect with Google",
		"login.or": "Or continue with",
		"login.error.google": "Failed to sign in with Google",
		"login.captcha.required": "Please complete the captcha verification",
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
		"login.otp.rateLimited":
			"Too many requests. Please wait a moment before requesting another code.",
		"login.otp.resendSuccess":
			"New code sent. Check your email (valid for 5 minutes).",
		"login.otp.resendWait": "Wait {seconds}s to resend",
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
		"login.success.rateLimited":
			"A code was already sent recently. Check your email and spam.",
		"login.error": "Error",
		"login.banned.title": "Account Suspended",
		"login.banned.message":
			"Your account has been suspended. Please contact support if you believe this is an error.",
		"login.banned.tryDifferentEmail": "Try a different email",
		"login.captcha.error": "Please complete the security verification",

		// Passkey sign-in
		"login.passkey.button": "Passkey",
		"login.passkey.error":
			"Passkey sign-in failed. Please try again or use another method.",
		"login.passkey.notSupported": "Your browser does not support passkeys.",

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
		"settings.cancel": "Cancel",
		"settings.appearance.title": "Appearance",
		"settings.appearance.description": "Customize how the app looks",
		"settings.appearance.theme": "Theme",
		"settings.appearance.light": "Light",
		"settings.appearance.dark": "Dark",
		"settings.appearance.system": "System",
		// Theme switcher (short labels)
		"theme.label": "Theme",
		"theme.system": "System",
		"theme.light": "Light",
		"theme.dark": "Dark",
		// Language switcher
		"language.label": "Language",
		"settings.localization.title": "Localization",
		"settings.localization.description":
			"Configure language, timezone, and date format",
		"settings.localization.language": "Language",
		"settings.localization.timezone": "Timezone",
		"settings.localization.dateFormat": "Date Format",
		"settings.profile.title": "Profile",
		"settings.profile.description": "Manage your profile information",
		"settings.profile.avatar": "Profile Picture",
		"settings.profile.avatarUrl": "Avatar URL",
		"settings.profile.changeAvatar": "Change Avatar",
		"settings.profile.editAvatar": "Edit Avatar",
		"settings.profile.editAvatarDescription":
			"Upload and crop your profile picture",
		"settings.profile.uploading": "Uploading...",
		"settings.profile.uploadFailed": "Failed to upload avatar",
		"settings.profile.avatarSet": "Avatar uploaded",
		"settings.profile.readyToSave": "Avatar ready to save",
		"settings.profile.saveAvatar": "Save Avatar",
		"settings.profile.advancedOptions": "Advanced options (manual URL)",
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
		"settings.nav.products": "Products",
		"settings.nav.aml": "AML",
		"settings.nav.watchlist": "Watchlist",
		"settings.nav.active": "Active",
		"settings.nav.apiKeys": "API Keys",
		"settings.sidebar.pendingInvitations": "Pending Invitations",
		"settings.sidebar.invitation": "invitation",
		"settings.sidebar.invitations": "invitations",
		// App Switcher
		"appSwitcher.title": "Janovix Apps",
		"appSwitcher.homepage": "Homepage",
		"appSwitcher.homepageDescription": "Main website",
		"appSwitcher.aml": "AML Platform",
		"appSwitcher.amlDescription": "Anti-money laundering",
		"appSwitcher.watchlist": "Watchlist",
		"appSwitcher.watchlistDescription": "Screening service",
		"appSwitcher.settings": "Settings",
		"appSwitcher.settingsDescription": "Account & organization",
		"appSwitcher.currentApp": "Current",
		// Mobile sidebar
		"mobileSidebar.close": "Close menu",
		"mobileSidebar.navigation": "Navigation",
		"settings.nav.userSettings": "User Settings",
		"settings.nav.orgSettings": "Organization Settings",
		"settings.nav.orgSettingsLink": "Settings",
		"settings.nav.createOrganization": "Create organization",
		"settings.nav.myOrganizations": "My organizations",
		"settings.nav.memberOf": "Member of",
		"settings.nav.orgLimitReached":
			"You've reached your organization limit. Upgrade your plan to create more.",
		"settings.userProgress": "User Progress",
		"settings.orgProgress": "Org Progress",
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
		"settings.personal.emailHelp":
			"Email changes are not currently supported. Please contact support if you need to update your email.",
		"settings.personal.verified": "Verified",
		"settings.personal.preferences": "Preferences",
		"settings.personal.preferencesDesc": "Customize your experience",
		"settings.personal.themeDesc": "Select your preferred color scheme",
		"settings.personal.timezoneDesc": "Used for displaying dates and times",
		"settings.personal.languageDesc": "Interface display language",
		"settings.personal.dateFormatDesc": "How dates are displayed",
		"settings.personal.useOrgDefault": "Use organization default",
		"settings.personal.avatarHelp": "Enter a URL for your avatar image",
		"settings.personal.dateExample": "Example",
		"settings.personal.clockFormat": "Clock Format",
		"settings.personal.clockFormatDesc":
			"How time is displayed (12-hour or 24-hour)",
		"settings.personal.spanish": "Spanish",
		"settings.personal.english": "English",
		"settings.personal.interface": "Interface",
		"settings.personal.interfaceDesc":
			"Customize the appearance and behavior of the application",
		"settings.personal.sidebarCollapsed": "Collapse sidebar by default",
		"settings.personal.sidebarCollapsedDesc":
			"Start with the sidebar collapsed on all applications",
		"settings.personal.changeAvatar": "Change avatar",

		// Notifications section
		"settings.notifications.title": "Notifications",
		"settings.notifications.description":
			"Configure how you receive notification alerts",
		"settings.notifications.sound": "Notification sounds",
		"settings.notifications.soundDesc":
			"Play a sound when new notifications arrive",
		"settings.notifications.soundType": "Sound",
		"settings.notifications.soundTypeDesc":
			"Choose which sound plays for new notifications",
		"settings.notifications.preview": "Preview sound",
		"settings.notifications.sound.chime": "Chime",
		"settings.notifications.sound.bell": "Bell",
		"settings.notifications.sound.pop": "Pop",
		"settings.notifications.sound.ding": "Ding",
		"settings.notifications.sound.none": "None",

		// Passkeys section
		"settings.personal.passkeys.title": "Passkeys",
		"settings.personal.passkeys.description":
			"Use biometrics or security keys to sign in without a password",
		"settings.personal.passkeys.add": "Add passkey",
		"settings.personal.passkeys.addDesc":
			"Register a new passkey on this device",
		"settings.personal.passkeys.name": "Passkey name",
		"settings.personal.passkeys.namePlaceholder":
			"e.g. MacBook Touch ID, iPhone Face ID",
		"settings.personal.passkeys.authenticatorType": "Authenticator type",
		"settings.personal.passkeys.platform": "Platform (biometrics)",
		"settings.personal.passkeys.crossPlatform": "Cross-platform (security key)",
		"settings.personal.passkeys.any": "Any (recommended)",
		"settings.personal.passkeys.delete": "Delete passkey",
		"settings.personal.passkeys.deleteConfirm": "Delete passkey?",
		"settings.personal.passkeys.deleteConfirmDesc":
			"This passkey will be permanently removed. You won't be able to use it to sign in anymore.",
		"settings.personal.passkeys.rename": "Rename",
		"settings.personal.passkeys.renameTitle": "Rename passkey",
		"settings.personal.passkeys.newName": "New name",
		"settings.personal.passkeys.deviceType": "Device type",
		"settings.personal.passkeys.backedUp": "Backed up",
		"settings.personal.passkeys.notBackedUp": "Not backed up",
		"settings.personal.passkeys.createdAt": "Registered",
		"settings.personal.passkeys.noPasskeys": "No passkeys registered",
		"settings.personal.passkeys.noPasskeysDesc":
			"Add a passkey to sign in faster using biometrics or a security key",
		"settings.personal.passkeys.maxReached": "Maximum passkeys reached",
		"settings.personal.passkeys.maxReachedDesc":
			"You can have at most 5 passkeys. Delete one to add another.",
		"settings.personal.passkeys.addSuccess": "Passkey added successfully",
		"settings.personal.passkeys.deleteSuccess": "Passkey deleted",
		"settings.personal.passkeys.renameSuccess": "Passkey renamed",
		"settings.personal.passkeys.addError":
			"Failed to add passkey. Please try again.",
		"settings.personal.passkeys.deleteError":
			"Failed to delete passkey. Please try again.",
		"settings.personal.passkeys.renameError":
			"Failed to rename passkey. Please try again.",

		// Avatar editor
		"settings.avatar.title": "Edit Avatar",
		"settings.avatar.success": "Avatar saved successfully!",
		"settings.avatar.error": "Failed to save avatar. Please try again.",

		// Organization settings
		"settings.org.title": "Organization Settings",
		"settings.org.description":
			"Manage your organization's profile and default settings",

		// Create Organization
		"settings.createOrg.title": "Create Organization",
		"settings.createOrg.description":
			"Set up a new organization to manage your team and resources",
		"settings.createOrg.details": "Organization Details",
		"settings.createOrg.detailsDesc":
			"Enter the basic information for your new organization",
		"settings.createOrg.logoHelp": "Optional: Add a logo for your organization",
		"settings.createOrg.name": "Organization name",
		"settings.createOrg.namePlaceholder": "Acme Corporation",
		"settings.createOrg.nameHelp":
			"This is how your organization will appear across Janovix",
		"settings.createOrg.subdomain": "Organization subdomain",
		"settings.createOrg.subdomainHelp":
			"This will be your organization's unique subdomain",
		"settings.createOrg.checkingSlug": "Checking availability...",
		"settings.createOrg.slugAvailable": "is available!",
		"settings.createOrg.slugTaken":
			"This slug is already taken. Please choose another.",
		"settings.createOrg.creating": "Creating...",
		"settings.createOrg.success": "Organization created successfully!",
		"settings.createOrg.error": "Failed to create organization",
		"settings.createOrg.info":
			"You can invite team members and configure settings after creating your organization.",
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
			"This action cannot be undone. This will permanently delete {name} and all associated data including members, operations, and alerts.",
		"settings.org.deleteWarning":
			"This is a destructive action. All organization data, members, and settings will be permanently removed.",
		"settings.org.deleteSlugPrompt":
			"To confirm, type the organization slug: {slug}",
		"settings.org.deleting": "Deleting...",
		"settings.org.deleteButtonConfirm":
			"I understand, delete this organization",
		"settings.org.deleteSuccess": "Organization deleted successfully",
		"settings.org.deleteError": "Failed to delete organization",
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
		"settings.compliance.kycSelfService": "KYC Self-Service",
		"settings.compliance.kycSelfServiceDesc":
			"Configure self-service KYC verification settings for your clients",
		"settings.compliance.selfServiceMode": "Self-Service Mode",
		"settings.compliance.selfServiceModeHelp":
			"Choose how self-service KYC verification operates for your organization",
		"settings.compliance.selfServiceDisabled": "Disabled",
		"settings.compliance.selfServiceManual": "Manual Review",
		"settings.compliance.selfServiceAutomatic": "Automatic",
		"settings.compliance.selfServiceExpiryHours": "Expiry Hours",
		"settings.compliance.selfServiceExpiryHoursHelp":
			"Number of hours before a self-service KYC verification link expires",
		"settings.compliance.kycComplianceNotice":
			"Self-service KYC verification links allow clients to submit their own identity documents. Ensure your compliance policies permit this before enabling.",
		"settings.compliance.selfServiceSavedSuccess":
			"Self-service settings saved successfully",

		// Team settings
		"settings.team.title": "Team Settings",
		"settings.team.description":
			"Manage your organization's team members and access",
		"settings.team.members": "Team Members",
		"settings.team.membersDesc": "People with access to this organization",
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
		"settings.team.transferOwnership": "Transfer ownership",
		"settings.team.transferConfirmTitle": "Transfer ownership?",
		"settings.team.transferConfirmDesc":
			"Are you sure you want to transfer ownership of this organization to {name}? You will become an admin and lose owner privileges.",
		"settings.team.transferSuccess": "Ownership transferred successfully",
		"settings.team.transferError": "Failed to transfer ownership",
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

		// API Keys settings
		"settings.apiKeys.title": "API Keys",
		"settings.apiKeys.description":
			"Manage API keys for programmatic access to the Janovix API",
		"settings.apiKeys.created": "API key created successfully",
		"settings.apiKeys.revoked": "API key revoked",
		"settings.apiKeys.rotated": "API key rotated successfully",
		"settings.apiKeys.never": "Never",
		"settings.apiKeys.justNow": "Just now",
		"settings.apiKeys.create": "Create API Key",
		"settings.apiKeys.createTitle": "Create API Key",
		"settings.apiKeys.createDesc":
			"Give your API key a descriptive name to identify its usage.",
		"settings.apiKeys.keyName": "Key Name",
		"settings.apiKeys.cancel": "Cancel",
		"settings.apiKeys.creating": "Creating...",
		"settings.apiKeys.createBtn": "Create Key",
		"settings.apiKeys.keyCreated": "Your API Key",
		"settings.apiKeys.keyWarning":
			"This key will only be shown once. Copy it now and store it securely. You will not be able to see it again.",
		"settings.apiKeys.done": "Done",
		"settings.apiKeys.activeKeys": "Active Keys",
		"settings.apiKeys.activeKeysDesc":
			"Keys currently authorized for API access",
		"settings.apiKeys.noKeys": "No API keys yet. Create one to get started.",
		"settings.apiKeys.createdOn": "Created",
		"settings.apiKeys.lastUsed": "Last used",
		"settings.apiKeys.rotate": "Rotate",
		"settings.apiKeys.rotateTitle": "Rotate API Key?",
		"settings.apiKeys.rotateDesc":
			"This will revoke the current key and generate a new one. Any systems using the old key will immediately stop working.",
		"settings.apiKeys.rotateBtn": "Rotate Key",
		"settings.apiKeys.revoke": "Revoke",
		"settings.apiKeys.revokeTitle": "Revoke API Key?",
		"settings.apiKeys.revokeDesc":
			"This action cannot be undone. The key will immediately stop working for any system using it.",
		"settings.apiKeys.revokeBtn": "Revoke Key",
		"settings.apiKeys.revokedKeys": "Revoked Keys",
		"settings.apiKeys.revokedBadge": "Revoked",
		"settings.apiKeys.revokedOn": "Revoked",

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
		"settings.billing.operations": "Operations",
		"settings.billing.included": "included",
		"settings.billing.unlimited": "Unlimited",
		"settings.billing.overage": "overage",
		"settings.billing.resetDate": "Resets on {date}",
		"settings.billing.periodEnd": "Period ends {date}",
		"settings.billing.paymentMethods": "Payment Methods",
		"settings.billing.invoices": "Invoice History",
		"settings.billing.managePortal": "Manage subscription",
		"settings.billing.upgrade": "Upgrade Plan",
		"settings.billing.downgrade": "Downgrade Plan",
		"settings.billing.cancel": "Cancel Subscription",
		"settings.billing.cancelConfirm":
			"Are you sure you want to cancel? Your subscription will remain active until {date}.",
		"settings.billing.reactivate": "Reactivate",
		"settings.billing.enterprise": "Enterprise License",
		"settings.billing.activateLicense": "Activate License",
		"settings.billing.licenseActive": "License Active",
		"settings.billing.licenseExpires": "Expires",
		"settings.billing.licenseNoExpiry": "Perpetual license - no expiry",
		"settings.billing.licenseManagedExternally":
			"This enterprise license is managed outside Stripe. Contact your administrator for changes.",
		"settings.billing.licensePlaceholder": "Enter your license key",
		"settings.billing.selectPlan": "Select a Plan",
		"settings.billing.selectPlanDesc":
			"Choose the plan that best fits your needs",
		"settings.billing.watchlist": "Watchlist",
		"settings.billing.business": "Business",
		"settings.billing.pro": "Pro",
		"settings.billing.ultra": "Ultra",
		"settings.billing.enterprisePlan": "Enterprise",
		"settings.billing.watchlistQueriesPerDay": "Watchlist queries/day/user",
		"settings.billing.noAmlAccess": "No AML Access",
		"settings.billing.watchlistOnly": "Watchlist Only",
		"settings.billing.watchlistOnlyDesc":
			"Need just watchlist screening? Perfect for teams that don't require full AML compliance tools.",
		"settings.billing.watchlistDesc":
			"PEP, sanctions, and adverse media screening",
		"settings.billing.bestFor": "Best for",
		"settings.billing.watchlistBestFor":
			"Companies that need basic due diligence screening without full AML compliance requirements. Ideal for one-time client verification or low-volume screening needs.",
		"settings.billing.amlPlans": "AML Compliance Plans",
		"settings.billing.amlPlansDesc":
			"Full AML compliance suite with watchlist screening, risk monitoring, SAT notice generation, and more.",
		"settings.billing.plans.watchlist.description": "Watchlist screening only",
		"settings.billing.plans.business.description":
			"Ideal plan for small and medium businesses",
		"settings.billing.plans.pro.description":
			"Advanced plan for companies with high volume of operations",
		"settings.billing.plans.ultra.description":
			"Enterprise plan for large corporations with high volume operations",
		"settings.billing.month": "month",
		"settings.billing.year": "year",
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
		"settings.billing.noSubscription": "No Active Subscription",
		"settings.billing.trial": "Trial",
		"settings.billing.daysRemaining": "days remaining",
		"settings.billing.activeSince": "Active since",
		"settings.billing.subscribePrompt":
			"Subscribe to create organizations and access features",
		"settings.billing.organizations": "Organizations",
		"settings.billing.ends": "Ends",
		"settings.billing.renews": "Renews",
		"settings.billing.orgUsage": "Organization Usage",
		"settings.billing.watchlistOnlyNoAml":
			"Watchlist screening only - no AML tools",
		"settings.billing.select": "Select",
		"settings.billing.orgs": "Org(s)",
		"settings.billing.usersPerOrg": "users/org",
		"settings.billing.seeMore": "See more details",
		"settings.billing.enterpriseDesc":
			"Have an enterprise license key? Redeem it here.",
		"settings.billing.licenseKey": "License Key",
		"settings.billing.licenseKeyPlaceholder": "XXXX-XXXX-XXXX-XXXX",
		"settings.billing.redeem": "Redeem",
		"settings.billing.redeemLicense": "Redeem License",
		"settings.billing.licenseRedeemed": "License Redeemed",
		"settings.billing.licenseRedeemedDesc":
			"Your enterprise license has been activated successfully.",
		"settings.billing.redeemConfirmTitle": "Cancel current subscription?",
		"settings.billing.redeemConfirmDesc":
			"Activating this license will cancel your current subscription immediately. Your license will take effect right away.",
		"settings.billing.redeemConfirmAction":
			"Cancel Subscription & Activate License",
		"settings.billing.redeemKeepSubscription": "Keep Subscription",
		"settings.billing.previousPlanCancelled":
			"Your previous subscription has been cancelled.",
		"settings.billing.customDeals":
			"Need a custom plan or volume pricing? Contact our sales team for tailored solutions.",
		"settings.billing.detailedPricing": "Detailed Pricing",
		// Pricing table translations
		"settings.billing.pricing.loadError": "Failed to load pricing information",
		"settings.billing.pricing.planLimitsTitle": "Plan Limits",
		"settings.billing.pricing.planLimitsDesc":
			"Monthly included limits for each subscription plan",
		"settings.billing.pricing.limitHeader": "Limit",
		"settings.billing.pricing.pricingTitle": "Pricing & Extra Fees",
		"settings.billing.pricing.pricingDesc":
			"Monthly subscription prices and overage fees (prices in MXN)",
		"settings.billing.pricing.priceTypeHeader": "Price Type",
		"settings.billing.pricing.pricePerUnit": "Price per unit",
		"settings.billing.pricing.howBillingWorks": "How billing works",
		"settings.billing.pricing.howBillingWorksDesc":
			"You pay the monthly subscription fee upfront, then any overages (extra users, reports, notices, etc.) are calculated at the end of each billing cycle and charged automatically.",
		"settings.billing.pricing.trialPeriod": "Trial period",
		"settings.billing.pricing.trialPeriodDesc":
			"All plans include a 14-day free trial. You won't be charged until the trial ends.",
		// Price type labels
		"settings.billing.pricing.subscription.label": "Monthly Subscription",
		"settings.billing.pricing.subscription.description": "Base monthly fee",
		"settings.billing.pricing.seat.label": "Extra Seat",
		"settings.billing.pricing.seat.description":
			"Per additional user beyond plan limit",
		"settings.billing.pricing.extraOrg.label": "Extra Organization",
		"settings.billing.pricing.extraOrg.description":
			"Per additional organization beyond plan limit",
		"settings.billing.pricing.overageReport.label": "Extra Report",
		"settings.billing.pricing.overageReport.description":
			"Per report beyond monthly limit",
		"settings.billing.pricing.overageNotice.label": "Extra Notice",
		"settings.billing.pricing.overageNotice.description":
			"Per notice beyond monthly limit",
		"settings.billing.pricing.overageAlert.label": "Extra Alert",
		"settings.billing.pricing.overageAlert.description":
			"Per alert beyond monthly limit",
		"settings.billing.pricing.overageOperation.label": "Extra Operation",
		"settings.billing.pricing.overageOperation.description":
			"Per operation beyond monthly limit",
		"settings.billing.pricing.overageClient.label": "Extra Client",
		"settings.billing.pricing.overageClient.description":
			"Per client beyond monthly limit",
		// Limit labels
		"settings.billing.limits.organizations": "Organizations",
		"settings.billing.limits.usersPerOrg": "Users per org",
		"settings.billing.limits.reportsPerMonth": "Reports/month",
		"settings.billing.limits.noticesPerMonth": "Notices/month",
		"settings.billing.limits.alertsPerMonth": "Alerts/month",
		"settings.billing.limits.operationsPerMonth": "Operations/month",
		"settings.billing.limits.clientsPerMonth": "Clients/month",
		"settings.billing.limits.watchlistQueries": "Watchlist queries/day/user",
		// Interval translations
		"settings.billing.interval.month": "month",
		"settings.billing.interval.year": "year",
		"settings.billing.cancelTitle": "Cancel Subscription?",
		"settings.billing.cancelDesc": "Your subscription will remain active until",
		"settings.billing.endOfPeriod": "the end of your billing period",
		"settings.billing.reactivateAnytime":
			"You can reactivate anytime before then",
		"settings.billing.keepSubscription": "Keep Subscription",
		"settings.billing.cancelSubscription": "Cancel Subscription",
		"settings.billing.licenseSuccess": "License activated successfully",
		"settings.billing.error": "An error occurred. Please try again.",
		"settings.billing.freeTier": "Free",
		"settings.billing.freeTierDesc":
			"You're on the free plan with limited features",
		"settings.billing.freeTierUpgradePrompt":
			"Upgrade to unlock more features and higher limits",
		"settings.billing.comingSoon": "Coming Soon",

		// Upgrade prompts
		"billing.upgrade.limitReached": "Limit Reached",
		"billing.upgrade.limitApproaching": "Approaching Limit",
		"billing.upgrade.unlockMore": "Unlock More",
		"billing.upgrade.limitReachedDesc":
			"You've used {current} of {limit} {type}. Upgrade to continue.",
		"billing.upgrade.limitApproachingDesc":
			"You've used {current} of {limit} {type}. Consider upgrading.",
		"billing.upgrade.generalDesc":
			"Upgrade your plan for more features and higher limits.",
		"billing.upgrade.button": "Upgrade Plan",
		"billing.upgrade.notices": "notices",
		"billing.upgrade.users": "users",
		"billing.upgrade.alerts": "alerts",
		"billing.upgrade.operations": "operations",
		"billing.upgrade.general": "resources",

		// Onboarding page
		"onboarding.title": "Complete your profile",
		"onboarding.description": "Tell us a bit about yourself to get started",
		"onboarding.firstName.label": "First name",
		"onboarding.firstName.placeholder": "John",
		"onboarding.firstName.required": "First name is required.",
		"onboarding.firstName.description": "Your first name",
		"onboarding.lastName.label": "Last name",
		"onboarding.lastName.placeholder": "Doe",
		"onboarding.lastName.required": "Last name is required.",
		"onboarding.lastName.description": "Your last name",
		"onboarding.avatar.label": "Profile picture",
		"onboarding.avatar.title": "Edit Avatar",
		"onboarding.avatar.edit": "Edit avatar",
		"onboarding.avatar.optional": "Optional - you can add a photo later",
		"onboarding.avatar.dropzone": "Click or drag an image here",
		"onboarding.avatar.formats": "JPG, PNG, GIF or WebP (max 5MB)",
		"onboarding.avatar.select": "Add photo",
		"onboarding.avatar.remove": "Remove photo",
		"onboarding.avatar.invalidType":
			"Invalid file type. Please use JPG, PNG, GIF or WebP.",
		"onboarding.avatar.tooLarge": "File is too large. Maximum size is 5MB.",
		"onboarding.avatar.uploadFailed":
			"Failed to upload image. Please try again.",
		"onboarding.avatar.uploadSuccess": "Avatar saved successfully!",
		"onboarding.avatar.saved": "Avatar ready to upload",
		"onboarding.button.continue": "Continue",
		"onboarding.button.saving": "Saving...",
		"onboarding.button.uploading": "Uploading photo...",
		"onboarding.success.title": "Profile complete!",
		"onboarding.success.message": "Your profile has been saved. Redirecting...",
		"onboarding.error.title": "Error",
		"onboarding.error.updateFailed":
			"Failed to update profile. Please try again.",
		"onboarding.exit.button": "Exit and sign out",
		"onboarding.exit.loggingOut": "Signing out...",
		"onboarding.exit.description": "Not ready to complete your profile yet?",
		"onboarding.loading": "Loading...",
		"onboarding.redirecting": "Redirecting...",
		"onboarding.profile.footerNote":
			"You can update your profile anytime from settings",

		// Onboarding passkey step
		"onboarding.passkey.title": "Secure your account",
		"onboarding.passkey.description":
			"Add a passkey to sign in instantly with your fingerprint, face, or security key — no password needed.",
		"onboarding.passkey.skip": "Skip for now",
		"onboarding.passkey.continue": "Continue",
		"onboarding.passkey.added": "Passkey added — you're all set!",
		"onboarding.passkey.footerNote":
			"You can manage your passkeys anytime from settings",

		"onboarding.plans.title": "Choose how to get started",
		"onboarding.plans.description":
			"Subscribe monthly for flexible pay-as-you-go billing, or activate an annual license for fixed capacity.",
		"onboarding.plans.note":
			"Subscription or license required to create an organization.",
		"onboarding.plans.welcome": "Welcome, {name}!",
		"onboarding.plans.welcomeFallback": "there",
		"onboarding.plans.before.title": "Before you continue",
		"onboarding.plans.before.description":
			"You need an active subscription or license to create an organization.",
		"onboarding.plans.invite.title": "You have an invitation",
		"onboarding.plans.invite.description":
			"{inviter} invited you to join {organization}.",
		"onboarding.plans.invite.cta": "View Invitation",
		"onboarding.plans.invite.empty.title": "Have an invitation?",
		"onboarding.plans.invite.empty.description":
			"If someone invited you to their organization, check your email for the invitation link.",
		"onboarding.plans.select.title": "Select a plan",
		"onboarding.plans.select.description":
			"Pick a monthly plan to start billing. You can change later.",
		"onboarding.plans.watchlist.title": "Watchlist Only",
		"onboarding.plans.watchlist.description":
			"Screen watchlists without AML access.",
		"onboarding.plans.watchlist.cta": "Subscribe to Watchlist",
		"onboarding.plans.watchlist.contact": "Contact Sales",
		"onboarding.plans.recommended": "Recommended",
		"onboarding.plans.subscribe": "Subscribe to {plan}",
		"onboarding.plans.meteredNote": "+ metered usage at cycle end",
		"onboarding.plans.enterprise.title": "Enterprise",
		"onboarding.plans.enterprise.description":
			"Custom pricing for large organizations with dedicated support",
		"onboarding.plans.enterprise.contact": "Contact Sales",
		"onboarding.plans.enterprise.license": "Enter License Key",
		"onboarding.plans.detailed.title": "Detailed pricing",
		"onboarding.plans.detailed.description":
			"Compare included limits and usage-based pricing. No plan selected yet.",
		"onboarding.plans.detailed.trigger": "View detailed pricing tables",
		"onboarding.plans.editProfile": "Edit profile",
		"onboarding.plans.features.watchlist.1": "1 organization",
		"onboarding.plans.features.watchlist.2": "3 users per org",
		"onboarding.plans.features.watchlist.3": "Watchlist queries only",
		"onboarding.plans.features.watchlist.4": "50 queries/day/user",
		"onboarding.plans.features.watchlist.5": "No AML access",
		"onboarding.plans.features.business.1": "1 organization",
		"onboarding.plans.features.business.2": "2 users per org",
		"onboarding.plans.features.business.3": "1 report/month",
		"onboarding.plans.features.business.4": "2 notices/month",
		"onboarding.plans.features.business.5": "50 queries/day/user",
		"onboarding.plans.features.business.6": "AML + Watchlist access",
		"onboarding.plans.features.pro.1": "3 organizations",
		"onboarding.plans.features.pro.2": "10 users per org",
		"onboarding.plans.features.pro.3": "15 reports/month",
		"onboarding.plans.features.pro.4": "20 notices/month",
		"onboarding.plans.features.pro.5": "200 queries/day/user",
		"onboarding.plans.features.pro.6": "Priority support",
		"onboarding.plans.features.ultra.1": "10 organizations",
		"onboarding.plans.features.ultra.2": "20 users per org",
		"onboarding.plans.features.ultra.3": "100 reports/month",
		"onboarding.plans.features.ultra.4": "100 notices/month",
		"onboarding.plans.features.ultra.5": "500 queries/day/user",
		"onboarding.plans.features.ultra.6": "Dedicated support",
		"onboarding.org.title": "Create your organization",
		"onboarding.org.description":
			"Set up your organization to start using Janovix",
		"onboarding.org.badge": "{plan} Subscription Active",
		"onboarding.org.plan.active": "Active",
		"onboarding.org.name.label": "Organization name",
		"onboarding.org.name.placeholder": "Acme Corporation",
		"onboarding.org.name.help":
			"This is how your organization will appear across Janovix",
		"onboarding.org.slug.label": "Organization subdomain",
		"onboarding.org.slug.placeholder": "acme-corp",
		"onboarding.org.slug.help":
			"This will be your organization's unique subdomain",
		"onboarding.org.slug.available": "{slug}.janovix.com is available!",
		"onboarding.org.slug.error.required": "Slug is required",
		"onboarding.org.slug.error.min": "Slug must be at least 3 characters",
		"onboarding.org.slug.error.max": "Slug must be 50 characters or less",
		"onboarding.org.slug.error.start":
			"Slug must start with a letter or number",
		"onboarding.org.slug.error.end": "Slug must end with a letter or number",
		"onboarding.org.slug.error.chars":
			"Slug can only contain lowercase letters, numbers, and hyphens",
		"onboarding.org.slug.error.consecutive":
			"Slug cannot contain consecutive hyphens",
		"onboarding.org.slug.error.invalid": "Invalid slug",
		"onboarding.org.slug.error.taken":
			"This slug is already taken. Please choose another.",
		"onboarding.org.submit": "Create Organization",
		"onboarding.org.creating": "Creating...",
		"onboarding.org.error.createFailed": "Failed to create organization",
		"onboarding.org.footer":
			"You can invite team members and configure settings after creating your organization.",
		"onboarding.invite.loading": "Loading invitation...",
		"onboarding.invite.none.title": "No pending invitation",
		"onboarding.invite.none.description":
			"You don't have any pending organization invitations. If someone sent you an invitation, please check your email or ask them to resend it.",
		"onboarding.invite.none.back": "Back to onboarding",
		"onboarding.invite.success.title": "Welcome to {organization}!",
		"onboarding.invite.success.description":
			"You've successfully joined the organization. Redirecting...",
		"onboarding.invite.title": "You've been invited!",
		"onboarding.invite.titleMultiple": "You have {count} invitations",
		"onboarding.invite.description":
			"{inviter} invited you to join their organization.",
		"onboarding.invite.descriptionMultiple":
			"Choose which organization you'd like to join.",
		"onboarding.invite.from": "from {name}",
		"onboarding.invite.refresh": "Refresh",
		"onboarding.invite.someone": "Someone",
		"onboarding.invite.decline": "Decline",
		"onboarding.invite.accept": "Accept",
		"onboarding.invite.joining": "Joining...",
		"onboarding.invite.back": "Back to onboarding",
		"onboarding.invite.note":
			"By accepting, you'll join as {role} and can start collaborating immediately.",
		"onboarding.invite.expires": "Expires {date}",
		"onboarding.invite.role.member": "Member",
		"onboarding.invite.role.admin": "Admin",
		"onboarding.invite.role.owner": "Owner",
		"onboarding.invite.error.notFound":
			"This invitation was not found or has expired.",
		"onboarding.invite.error.load": "Failed to load invitation details.",
		"onboarding.invite.error.accept": "Failed to accept invitation",
		"onboarding.invite.error.decline": "Failed to decline invitation",
		"onboarding.license.title": "Activate License Key",
		"onboarding.license.description":
			"Enter your enterprise license key to activate your subscription.",
		"onboarding.license.invalid": "Invalid license key",
		"onboarding.license.activateFailed": "Failed to activate license",
		"onboarding.license.label": "License Key",
		"onboarding.license.validate": "Validate",
		"onboarding.license.contactAdmin":
			"Contact your administrator if you need a license key.",
		"onboarding.license.valid": "License Valid",
		"onboarding.license.organization": "Organization",
		"onboarding.license.plan": "Plan",
		"onboarding.license.validUntil": "Valid until",
		"onboarding.license.users": "Users",
		"onboarding.license.notices": "Notices included",
		"onboarding.license.useDifferent": "Use different key",
		"onboarding.license.cancel": "Cancel",
		"onboarding.license.activating": "Activating...",
		"onboarding.license.activate": "Activate License",
		"onboarding.license.noExpiration": "No expiration",
		"onboarding.license.unlimited": "Unlimited",
		// Breadcrumb error labels
		"breadcrumb.notFound": "Not Found",
		"breadcrumb.error": "Error",
		"breadcrumb.forbidden": "Forbidden",
		"breadcrumb.unauthorized": "Unauthorized",
		// Error pages
		errorNotFoundTitle: "Page not found",
		errorNotFoundDescription:
			"The page you're looking for doesn't exist or has been moved. Check the URL or navigate back to safety.",
		errorServerTitle: "Something went wrong",
		errorServerDescription:
			"We hit an unexpected error while loading this page.",
		errorServerHelp: "Try again, or return home if the problem persists.",
		errorUnauthorizedTitle: "Sign in required",
		errorUnauthorizedDescription: "You need to sign in to access this page.",
		errorUnauthorizedReason:
			"If you arrived here from a bookmark or shared link, sign in and try again.",
		errorForbiddenTitle: "Access denied",
		errorForbiddenDescription: "You don't have access to this page.",
		errorForbiddenReason:
			"This can happen if your role doesn't include this permission or your access was revoked.",
		errorGoBack: "Go back",
		errorHome: "Home",
		errorTryAgain: "Try again",
		errorSignIn: "Sign in",
		errorSigninTitle: "Error",
		errorSigninDescription:
			"We encountered an error during the signin process.",
		// Navbar clock
		"clock.clickForInfo": "Click for timezone info",
		"clock.timezoneInfo": "Timezone Information",
		"clock.switchTo": "Switch to",
		"clock.appTimezone": "App timezone",
		"clock.yourTimezone": "Your timezone",
		"clock.local": "Local",
		"clock.detecting": "Detecting...",
		"clock.timezoneMismatch": "Timezone mismatch",
		"clock.difference": "Difference",
		"clock.timezonesMatch": "Timezones match",
		// Timezone picker
		"timezone.selectTimezone": "Select timezone",
		"timezone.searchTimezones": "Search timezones...",
		"timezone.noTimezonesFound": "No timezones found",
		"timezone.trySearchingAnotherCity": "Try searching for another city",
		"timezone.clearSearch": "Clear search",
		"timezone.timezoneOptions": "Timezone options",

		// Beta access page
		"beta.title": "Beta Access",
		"beta.greeting": "Hello, {name}",
		"beta.message":
			"We've received your registration. We are currently in a beta phase. Thank you for your interest — you will receive an email when public access is released or when access is granted to you.",
		"beta.checkEmail": "Keep an eye on your inbox for updates.",
		"beta.backToLogin": "Back to login",
		"beta.footerNote":
			"Thank you for your patience while we prepare everything for you.",
	},
	es: {
		// Common
		"common.accept": "Aceptar",
		"common.cancel": "Cancelar",
		"common.back": "Volver",

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
		"login.button.loading": "Iniciando sesión...",
		"login.button.google": "Conectar con Google",
		"login.or": "O continúa con",
		"login.error.google": "Error al iniciar sesión con Google",
		"login.captcha.required": "Por favor completa la verificación de captcha",
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
		"login.captcha.error": "Por favor completa la verificación de seguridad",

		// Passkey sign-in
		"login.passkey.button": "Passkey",
		"login.passkey.error":
			"Error al iniciar sesión con llave de acceso. Intenta de nuevo o usa otro método.",
		"login.passkey.notSupported":
			"Tu navegador no es compatible con llaves de acceso.",

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
		"settings.cancel": "Cancelar",
		"settings.appearance.title": "Apariencia",
		"settings.appearance.description": "Personaliza cómo se ve la aplicación",
		"settings.appearance.theme": "Tema",
		"settings.appearance.light": "Claro",
		"settings.appearance.dark": "Oscuro",
		"settings.appearance.system": "Sistema",
		// Theme switcher (short labels)
		"theme.label": "Tema",
		"theme.system": "Sistema",
		"theme.light": "Claro",
		"theme.dark": "Oscuro",
		// Language switcher
		"language.label": "Idioma",
		"settings.localization.title": "Localización",
		"settings.localization.description":
			"Configura idioma, zona horaria y formato de fecha",
		"settings.localization.language": "Idioma",
		"settings.localization.timezone": "Zona horaria",
		"settings.localization.dateFormat": "Formato de fecha",
		"settings.profile.title": "Perfil",
		"settings.profile.description": "Administra tu información de perfil",
		"settings.profile.avatar": "Foto de perfil",
		"settings.profile.avatarUrl": "URL del avatar",
		"settings.profile.changeAvatar": "Cambiar avatar",
		"settings.profile.editAvatar": "Editar avatar",
		"settings.profile.editAvatarDescription":
			"Sube y recorta tu foto de perfil",
		"settings.profile.uploading": "Subiendo...",
		"settings.profile.uploadFailed": "Error al subir avatar",
		"settings.profile.avatarSet": "Avatar subido",
		"settings.profile.readyToSave": "Avatar listo para guardar",
		"settings.profile.saveAvatar": "Guardar Avatar",
		"settings.profile.advancedOptions": "Opciones avanzadas (URL manual)",
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
		"settings.nav.products": "Productos",
		"settings.nav.aml": "AML",
		"settings.nav.watchlist": "Watchlist",
		"settings.nav.active": "Activo",
		"settings.nav.apiKeys": "Claves API",
		"settings.sidebar.pendingInvitations": "Invitaciones Pendientes",
		"settings.sidebar.invitation": "invitación",
		"settings.sidebar.invitations": "invitaciones",
		// App Switcher
		"appSwitcher.title": "Apps de Janovix",
		"appSwitcher.homepage": "Página principal",
		"appSwitcher.homepageDescription": "Sitio web principal",
		"appSwitcher.aml": "Plataforma AML",
		"appSwitcher.amlDescription": "Anti-lavado de dinero",
		"appSwitcher.watchlist": "Lista de vigilancia",
		"appSwitcher.watchlistDescription": "Servicio de screening",
		"appSwitcher.settings": "Configuración",
		"appSwitcher.settingsDescription": "Cuenta y organización",
		"appSwitcher.currentApp": "Actual",
		// Mobile sidebar
		"mobileSidebar.close": "Cerrar menú",
		"mobileSidebar.navigation": "Navegación",
		"settings.nav.userSettings": "Configuración de Usuario",
		"settings.nav.orgSettings": "Configuración de Organización",
		"settings.nav.orgSettingsLink": "Configuración",
		"settings.nav.createOrganization": "Crear organización",
		"settings.nav.myOrganizations": "Mis organizaciones",
		"settings.nav.memberOf": "Miembro de",
		"settings.nav.orgLimitReached":
			"Has alcanzado el límite de organizaciones. Actualiza tu plan para crear más.",
		"settings.userProgress": "Progreso Usuario",
		"settings.orgProgress": "Progreso Org",
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
		"settings.personal.emailHelp":
			"Actualmente no es posible cambiar tu correo electrónico. Contacta a soporte si necesitas actualizarlo.",
		"settings.personal.verified": "Verificado",
		"settings.personal.preferences": "Preferencias",
		"settings.personal.preferencesDesc": "Personaliza tu experiencia",
		"settings.personal.themeDesc": "Selecciona tu esquema de color preferido",
		"settings.personal.timezoneDesc": "Se usa para mostrar fechas y horas",
		"settings.personal.languageDesc": "Idioma de la interfaz",
		"settings.personal.dateFormatDesc": "Cómo se muestran las fechas",
		"settings.personal.useOrgDefault": "Usar valor de organización",
		"settings.personal.avatarHelp": "Ingresa una URL para tu imagen de avatar",
		"settings.personal.dateExample": "Ejemplo",
		"settings.personal.clockFormat": "Formato de reloj",
		"settings.personal.clockFormatDesc":
			"Cómo se muestra la hora (12 horas o 24 horas)",
		"settings.personal.spanish": "Español",
		"settings.personal.english": "Inglés",
		"settings.personal.interface": "Interfaz",
		"settings.personal.interfaceDesc":
			"Personaliza la apariencia y comportamiento de la aplicación",
		"settings.personal.sidebarCollapsed": "Colapsar barra lateral por defecto",
		"settings.personal.sidebarCollapsedDesc":
			"Iniciar con la barra lateral colapsada en todas las aplicaciones",
		"settings.personal.changeAvatar": "Cambiar avatar",

		// Notifications section
		"settings.notifications.title": "Notificaciones",
		"settings.notifications.description":
			"Configura cómo recibes alertas de notificaciones",
		"settings.notifications.sound": "Sonidos de notificación",
		"settings.notifications.soundDesc":
			"Reproducir un sonido cuando lleguen nuevas notificaciones",
		"settings.notifications.soundType": "Sonido",
		"settings.notifications.soundTypeDesc":
			"Elige qué sonido suena para las nuevas notificaciones",
		"settings.notifications.preview": "Previsualizar sonido",
		"settings.notifications.sound.chime": "Campana",
		"settings.notifications.sound.bell": "Timbre",
		"settings.notifications.sound.pop": "Pop",
		"settings.notifications.sound.ding": "Ding",
		"settings.notifications.sound.none": "Sin sonido",

		// Passkeys section
		"settings.personal.passkeys.title": "Llaves de acceso",
		"settings.personal.passkeys.description":
			"Usa biometría o llaves de seguridad para iniciar sesión sin contraseña",
		"settings.personal.passkeys.add": "Agregar llave de acceso",
		"settings.personal.passkeys.addDesc":
			"Registra una nueva llave de acceso en este dispositivo",
		"settings.personal.passkeys.name": "Nombre de la llave",
		"settings.personal.passkeys.namePlaceholder":
			"p. ej. Touch ID del Mac, Face ID del iPhone",
		"settings.personal.passkeys.authenticatorType": "Tipo de autenticador",
		"settings.personal.passkeys.platform": "Plataforma (biometría)",
		"settings.personal.passkeys.crossPlatform":
			"Multiplataforma (llave de seguridad)",
		"settings.personal.passkeys.any": "Cualquiera (recomendado)",
		"settings.personal.passkeys.delete": "Eliminar llave de acceso",
		"settings.personal.passkeys.deleteConfirm": "¿Eliminar llave de acceso?",
		"settings.personal.passkeys.deleteConfirmDesc":
			"Esta llave de acceso se eliminará permanentemente. Ya no podrás usarla para iniciar sesión.",
		"settings.personal.passkeys.rename": "Renombrar",
		"settings.personal.passkeys.renameTitle": "Renombrar llave de acceso",
		"settings.personal.passkeys.newName": "Nuevo nombre",
		"settings.personal.passkeys.deviceType": "Tipo de dispositivo",
		"settings.personal.passkeys.backedUp": "Con respaldo",
		"settings.personal.passkeys.notBackedUp": "Sin respaldo",
		"settings.personal.passkeys.createdAt": "Registrada",
		"settings.personal.passkeys.noPasskeys":
			"No tienes llaves de acceso registradas",
		"settings.personal.passkeys.noPasskeysDesc":
			"Agrega una llave de acceso para iniciar sesión más rápido con biometría o una llave de seguridad",
		"settings.personal.passkeys.maxReached":
			"Límite de llaves de acceso alcanzado",
		"settings.personal.passkeys.maxReachedDesc":
			"Puedes tener como máximo 5 llaves de acceso. Elimina una para agregar otra.",
		"settings.personal.passkeys.addSuccess":
			"Llave de acceso agregada exitosamente",
		"settings.personal.passkeys.deleteSuccess": "Llave de acceso eliminada",
		"settings.personal.passkeys.renameSuccess": "Llave de acceso renombrada",
		"settings.personal.passkeys.addError":
			"Error al agregar la llave de acceso. Intenta de nuevo.",
		"settings.personal.passkeys.deleteError":
			"Error al eliminar la llave de acceso. Intenta de nuevo.",
		"settings.personal.passkeys.renameError":
			"Error al renombrar la llave de acceso. Intenta de nuevo.",

		// Avatar editor
		"settings.avatar.title": "Editar Avatar",
		"settings.avatar.success": "¡Avatar guardado exitosamente!",
		"settings.avatar.error":
			"Error al guardar avatar. Por favor intenta de nuevo.",

		// Organization settings
		"settings.org.title": "Configuración de Organización",
		"settings.org.description":
			"Administra el perfil y configuración predeterminada de tu organización",

		// Create Organization
		"settings.createOrg.title": "Crear Organización",
		"settings.createOrg.description":
			"Configura una nueva organización para administrar tu equipo y recursos",
		"settings.createOrg.details": "Detalles de la Organización",
		"settings.createOrg.detailsDesc":
			"Ingresa la información básica para tu nueva organización",
		"settings.createOrg.logoHelp":
			"Opcional: Añade un logo para tu organización",
		"settings.createOrg.name": "Nombre de la organización",
		"settings.createOrg.namePlaceholder": "Corporación Acme",
		"settings.createOrg.nameHelp":
			"Así aparecerá tu organización en toda la plataforma Janovix",
		"settings.createOrg.subdomain": "Subdominio de la organización",
		"settings.createOrg.subdomainHelp":
			"Este será el subdominio único de tu organización",
		"settings.createOrg.checkingSlug": "Comprobando disponibilidad...",
		"settings.createOrg.slugAvailable": "está disponible!",
		"settings.createOrg.slugTaken":
			"Este slug ya está en uso. Por favor elige otro.",
		"settings.createOrg.creating": "Creando...",
		"settings.createOrg.success": "¡Organización creada exitosamente!",
		"settings.createOrg.error": "Error al crear la organización",
		"settings.createOrg.info":
			"Puedes invitar miembros del equipo y configurar ajustes después de crear tu organización.",
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
			"Esta acción no se puede deshacer. Esto eliminará permanentemente {name} y todos los datos asociados incluyendo miembros, operaciones y alertas.",
		"settings.org.deleteWarning":
			"Esta es una acción destructiva. Todos los datos, miembros y configuraciones de la organización serán eliminados permanentemente.",
		"settings.org.deleteSlugPrompt":
			"Para confirmar, escribe el slug de la organización: {slug}",
		"settings.org.deleting": "Eliminando...",
		"settings.org.deleteButtonConfirm": "Entiendo, eliminar esta organización",
		"settings.org.deleteSuccess": "Organización eliminada exitosamente",
		"settings.org.deleteError": "Error al eliminar la organización",
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
		"settings.compliance.kycSelfService": "KYC Autoservicio",
		"settings.compliance.kycSelfServiceDesc":
			"Configura las opciones de verificación KYC de autoservicio para tus clientes",
		"settings.compliance.selfServiceMode": "Modo de Autoservicio",
		"settings.compliance.selfServiceModeHelp":
			"Elige cómo funciona la verificación KYC de autoservicio en tu organización",
		"settings.compliance.selfServiceDisabled": "Deshabilitado",
		"settings.compliance.selfServiceManual": "Revisión Manual",
		"settings.compliance.selfServiceAutomatic": "Automático",
		"settings.compliance.selfServiceExpiryHours": "Horas de Expiración",
		"settings.compliance.selfServiceExpiryHoursHelp":
			"Número de horas antes de que expire el enlace de verificación KYC de autoservicio",
		"settings.compliance.kycComplianceNotice":
			"Los enlaces de verificación KYC de autoservicio permiten a los clientes enviar sus propios documentos de identidad. Asegúrate de que tus políticas de cumplimiento lo permitan antes de habilitarlo.",
		"settings.compliance.selfServiceSavedSuccess":
			"Configuración de autoservicio guardada exitosamente",

		// Team settings
		"settings.team.title": "Configuración de Equipo",
		"settings.team.description":
			"Administra los miembros del equipo y accesos de tu organización",
		"settings.team.members": "Miembros del Equipo",
		"settings.team.membersDesc": "Personas con acceso a esta organización",
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
		"settings.team.transferOwnership": "Transferir propiedad",
		"settings.team.transferConfirmTitle": "¿Transferir propiedad?",
		"settings.team.transferConfirmDesc":
			"¿Estás seguro de que deseas transferir la propiedad de esta organización a {name}? Te convertirás en administrador y perderás los privilegios de propietario.",
		"settings.team.transferSuccess": "Propiedad transferida exitosamente",
		"settings.team.transferError": "Error al transferir propiedad",
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

		// API Keys settings
		"settings.apiKeys.title": "Claves API",
		"settings.apiKeys.description":
			"Administra las claves API para acceso programático a la API de Janovix",
		"settings.apiKeys.created": "Clave API creada exitosamente",
		"settings.apiKeys.revoked": "Clave API revocada",
		"settings.apiKeys.rotated": "Clave API rotada exitosamente",
		"settings.apiKeys.never": "Nunca",
		"settings.apiKeys.justNow": "Justo ahora",
		"settings.apiKeys.create": "Crear Clave API",
		"settings.apiKeys.createTitle": "Crear Clave API",
		"settings.apiKeys.createDesc":
			"Da a tu clave API un nombre descriptivo para identificar su uso.",
		"settings.apiKeys.keyName": "Nombre de la Clave",
		"settings.apiKeys.cancel": "Cancelar",
		"settings.apiKeys.creating": "Creando...",
		"settings.apiKeys.createBtn": "Crear Clave",
		"settings.apiKeys.keyCreated": "Tu Clave API",
		"settings.apiKeys.keyWarning":
			"Esta clave solo se mostrará una vez. Cópiala ahora y guárdala de forma segura. No podrás verla nuevamente.",
		"settings.apiKeys.done": "Listo",
		"settings.apiKeys.activeKeys": "Claves Activas",
		"settings.apiKeys.activeKeysDesc":
			"Claves actualmente autorizadas para acceso API",
		"settings.apiKeys.noKeys": "Aún no hay claves API. Crea una para comenzar.",
		"settings.apiKeys.createdOn": "Creada",
		"settings.apiKeys.lastUsed": "Último uso",
		"settings.apiKeys.rotate": "Rotar",
		"settings.apiKeys.rotateTitle": "¿Rotar Clave API?",
		"settings.apiKeys.rotateDesc":
			"Esto revocará la clave actual y generará una nueva. Cualquier sistema que use la clave antigua dejará de funcionar inmediatamente.",
		"settings.apiKeys.rotateBtn": "Rotar Clave",
		"settings.apiKeys.revoke": "Revocar",
		"settings.apiKeys.revokeTitle": "¿Revocar Clave API?",
		"settings.apiKeys.revokeDesc":
			"Esta acción no se puede deshacer. La clave dejará de funcionar inmediatamente para cualquier sistema que la use.",
		"settings.apiKeys.revokeBtn": "Revocar Clave",
		"settings.apiKeys.revokedKeys": "Claves Revocadas",
		"settings.apiKeys.revokedBadge": "Revocada",
		"settings.apiKeys.revokedOn": "Revocada",

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
		"settings.billing.operations": "Operaciones",
		"settings.billing.included": "incluidos",
		"settings.billing.unlimited": "Ilimitado",
		"settings.billing.overage": "excedente",
		"settings.billing.resetDate": "Se reinicia el {date}",
		"settings.billing.periodEnd": "Período termina el {date}",
		"settings.billing.paymentMethods": "Métodos de Pago",
		"settings.billing.invoices": "Historial de Facturas",
		"settings.billing.managePortal": "Administrar subscripción",
		"settings.billing.upgrade": "Mejorar Plan",
		"settings.billing.downgrade": "Reducir Plan",
		"settings.billing.cancel": "Cancelar Suscripción",
		"settings.billing.cancelConfirm":
			"¿Estás seguro de que deseas cancelar? Tu suscripción permanecerá activa hasta el {date}.",
		"settings.billing.reactivate": "Reactivar",
		"settings.billing.enterprise": "Licencia Empresarial",
		"settings.billing.activateLicense": "Activar Licencia",
		"settings.billing.licenseActive": "Licencia Activa",
		"settings.billing.licenseExpires": "Expira",
		"settings.billing.licenseNoExpiry": "Licencia perpetua - sin vencimiento",
		"settings.billing.licenseManagedExternally":
			"Esta licencia empresarial se administra fuera de Stripe. Contacta a tu administrador para cambios.",
		"settings.billing.licensePlaceholder": "Ingresa tu clave de licencia",
		"settings.billing.selectPlan": "Selecciona un Plan",
		"settings.billing.selectPlanDesc":
			"Elige el plan que mejor se adapte a tus necesidades",
		"settings.billing.watchlist": "Watchlist",
		"settings.billing.business": "Business",
		"settings.billing.pro": "Pro",
		"settings.billing.ultra": "Ultra",
		"settings.billing.enterprisePlan": "Enterprise",
		"settings.billing.watchlistQueriesPerDay":
			"Consultas watchlist/día/usuario",
		"settings.billing.noAmlAccess": "Sin acceso a AML",
		"settings.billing.watchlistOnly": "Solo Watchlist",
		"settings.billing.watchlistOnlyDesc":
			"¿Solo necesitas verificación en listas? Perfecto para equipos que no requieren herramientas completas de cumplimiento AML.",
		"settings.billing.watchlistDesc":
			"Verificación de PEP, sanciones y medios adversos",
		"settings.billing.bestFor": "Ideal para",
		"settings.billing.watchlistBestFor":
			"Empresas que necesitan verificación básica de diligencia debida sin requisitos completos de cumplimiento AML. Ideal para verificación de clientes única o necesidades de verificación de bajo volumen.",
		"settings.billing.amlPlans": "Planes de Cumplimiento AML",
		"settings.billing.amlPlansDesc":
			"Suite completa de cumplimiento AML con verificación en listas, monitoreo de riesgos, generación de avisos SAT y más.",
		"settings.billing.plans.watchlist.description":
			"Solo verificación en listas de riesgo",
		"settings.billing.plans.business.description":
			"Plan ideal para pequeñas y medianas empresas",
		"settings.billing.plans.pro.description":
			"Plan avanzado para empresas con mayor volumen de operaciones",
		"settings.billing.plans.ultra.description":
			"Plan empresarial para grandes corporaciones con operaciones de alto volumen",
		"settings.billing.month": "mes",
		"settings.billing.year": "año",
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
		"settings.billing.noSubscription": "Sin Suscripción Activa",
		"settings.billing.trial": "Prueba",
		"settings.billing.daysRemaining": "días restantes",
		"settings.billing.activeSince": "Activo desde",
		"settings.billing.subscribePrompt":
			"Suscríbete para crear organizaciones y acceder a las funciones",
		"settings.billing.organizations": "Organizaciones",
		"settings.billing.ends": "Termina",
		"settings.billing.renews": "Renueva",
		"settings.billing.orgUsage": "Uso de Organizaciones",
		"settings.billing.watchlistOnlyNoAml":
			"Solo verificación en listas - sin herramientas AML",
		"settings.billing.select": "Seleccionar",
		"settings.billing.orgs": "Org(s)",
		"settings.billing.usersPerOrg": "usuarios/org",
		"settings.billing.seeMore": "Ver más detalles",
		"settings.billing.enterpriseDesc":
			"¿Tienes una clave de licencia empresarial? Canjéala aquí.",
		"settings.billing.licenseKey": "Clave de Licencia",
		"settings.billing.licenseKeyPlaceholder": "XXXX-XXXX-XXXX-XXXX",
		"settings.billing.redeem": "Canjear",
		"settings.billing.redeemLicense": "Canjear Licencia",
		"settings.billing.licenseRedeemed": "Licencia Canjeada",
		"settings.billing.licenseRedeemedDesc":
			"Tu licencia empresarial ha sido activada exitosamente.",
		"settings.billing.redeemConfirmTitle": "¿Cancelar suscripción actual?",
		"settings.billing.redeemConfirmDesc":
			"Activar esta licencia cancelará tu suscripción actual de forma inmediata. Tu licencia entrará en vigor de inmediato.",
		"settings.billing.redeemConfirmAction":
			"Cancelar Suscripción y Activar Licencia",
		"settings.billing.redeemKeepSubscription": "Mantener Suscripción",
		"settings.billing.previousPlanCancelled":
			"Tu suscripción anterior ha sido cancelada.",
		"settings.billing.customDeals":
			"¿Necesitas un plan personalizado o precios por volumen? Contacta a nuestro equipo de ventas para soluciones a medida.",
		"settings.billing.detailedPricing": "Precios Detallados",
		// Pricing table translations
		"settings.billing.pricing.loadError":
			"Error al cargar información de precios",
		"settings.billing.pricing.planLimitsTitle": "Límites del Plan",
		"settings.billing.pricing.planLimitsDesc":
			"Límites mensuales incluidos para cada plan de suscripción",
		"settings.billing.pricing.limitHeader": "Límite",
		"settings.billing.pricing.pricingTitle": "Precios y Cargos Extra",
		"settings.billing.pricing.pricingDesc":
			"Precios de suscripción mensual y cargos por excedentes (precios en MXN)",
		"settings.billing.pricing.priceTypeHeader": "Tipo de Precio",
		"settings.billing.pricing.pricePerUnit": "Precio por unidad",
		"settings.billing.pricing.howBillingWorks": "Cómo funciona la facturación",
		"settings.billing.pricing.howBillingWorksDesc":
			"Pagas la tarifa de suscripción mensual por adelantado, luego cualquier excedente (usuarios extra, reportes, avisos, etc.) se calcula al final de cada ciclo de facturación y se cobra automáticamente.",
		"settings.billing.pricing.trialPeriod": "Período de prueba",
		"settings.billing.pricing.trialPeriodDesc":
			"Todos los planes incluyen una prueba gratuita de 14 días. No se te cobrará hasta que termine la prueba.",
		// Price type labels
		"settings.billing.pricing.subscription.label": "Suscripción Mensual",
		"settings.billing.pricing.subscription.description": "Tarifa mensual base",
		"settings.billing.pricing.seat.label": "Asiento Extra",
		"settings.billing.pricing.seat.description":
			"Por usuario adicional más allá del límite del plan",
		"settings.billing.pricing.extraOrg.label": "Organización Extra",
		"settings.billing.pricing.extraOrg.description":
			"Por organización adicional más allá del límite del plan",
		"settings.billing.pricing.overageReport.label": "Reporte Extra",
		"settings.billing.pricing.overageReport.description":
			"Por reporte más allá del límite mensual",
		"settings.billing.pricing.overageNotice.label": "Aviso Extra",
		"settings.billing.pricing.overageNotice.description":
			"Por aviso más allá del límite mensual",
		"settings.billing.pricing.overageAlert.label": "Alerta Extra",
		"settings.billing.pricing.overageAlert.description":
			"Por alerta más allá del límite mensual",
		"settings.billing.pricing.overageOperation.label": "Operación Extra",
		"settings.billing.pricing.overageOperation.description":
			"Por operación más allá del límite mensual",
		"settings.billing.pricing.overageClient.label": "Cliente Extra",
		"settings.billing.pricing.overageClient.description":
			"Por cliente más allá del límite mensual",
		// Limit labels
		"settings.billing.limits.organizations": "Organizaciones",
		"settings.billing.limits.usersPerOrg": "Usuarios por org",
		"settings.billing.limits.reportsPerMonth": "Reportes/mes",
		"settings.billing.limits.noticesPerMonth": "Avisos/mes",
		"settings.billing.limits.alertsPerMonth": "Alertas/mes",
		"settings.billing.limits.operationsPerMonth": "Operaciones/mes",
		"settings.billing.limits.clientsPerMonth": "Clientes/mes",
		"settings.billing.limits.watchlistQueries":
			"Consultas watchlist/día/usuario",
		// Interval translations
		"settings.billing.interval.month": "mes",
		"settings.billing.interval.year": "año",
		"settings.billing.cancelTitle": "¿Cancelar Suscripción?",
		"settings.billing.cancelDesc": "Tu suscripción permanecerá activa hasta",
		"settings.billing.endOfPeriod": "el final del período de facturación",
		"settings.billing.reactivateAnytime":
			"Puedes reactivarla en cualquier momento antes",
		"settings.billing.keepSubscription": "Mantener Suscripción",
		"settings.billing.cancelSubscription": "Cancelar Suscripción",
		"settings.billing.licenseSuccess": "Licencia activada exitosamente",
		"settings.billing.error": "Ocurrió un error. Por favor intenta de nuevo.",
		"settings.billing.freeTier": "Gratuito",
		"settings.billing.freeTierDesc":
			"Estás en el plan gratuito con funciones limitadas",
		"settings.billing.freeTierUpgradePrompt":
			"Mejora tu plan para desbloquear más funciones y límites más altos",
		"settings.billing.comingSoon": "Próximamente",

		// Upgrade prompts
		"billing.upgrade.limitReached": "Límite Alcanzado",
		"billing.upgrade.limitApproaching": "Cerca del Límite",
		"billing.upgrade.unlockMore": "Desbloquea Más",
		"billing.upgrade.limitReachedDesc":
			"Has usado {current} de {limit} {type}. Mejora tu plan para continuar.",
		"billing.upgrade.limitApproachingDesc":
			"Has usado {current} de {limit} {type}. Considera mejorar tu plan.",
		"billing.upgrade.generalDesc":
			"Mejora tu plan para más funciones y límites más altos.",
		"billing.upgrade.button": "Mejorar Plan",
		"billing.upgrade.notices": "avisos",
		"billing.upgrade.users": "usuarios",
		"billing.upgrade.alerts": "alertas",
		"billing.upgrade.operations": "operaciones",
		"billing.upgrade.general": "recursos",

		// Onboarding page
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
		"onboarding.avatar.select": "Agregar foto",
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
		"onboarding.loading": "Cargando...",
		"onboarding.redirecting": "Redirigiendo...",
		"onboarding.profile.footerNote":
			"Puedes actualizar tu perfil en configuración cuando quieras",

		// Onboarding passkey step
		"onboarding.passkey.title": "Protege tu cuenta",
		"onboarding.passkey.description":
			"Agrega una llave de acceso para iniciar sesión al instante con tu huella, rostro o llave de seguridad — sin contraseña.",
		"onboarding.passkey.skip": "Omitir por ahora",
		"onboarding.passkey.continue": "Continuar",
		"onboarding.passkey.added": "¡Llave de acceso agregada — todo listo!",
		"onboarding.passkey.footerNote":
			"Puedes administrar tus llaves de acceso en configuración cuando quieras",

		"onboarding.plans.title": "Elige cómo empezar",
		"onboarding.plans.description":
			"Suscríbete mensualmente con facturación flexible, o activa una licencia anual con capacidad fija.",
		"onboarding.plans.note":
			"Se requiere una suscripción o licencia para crear una organización.",
		"onboarding.plans.welcome": "¡Bienvenido, {name}!",
		"onboarding.plans.welcomeFallback": "hola",
		"onboarding.plans.before.title": "Antes de continuar",
		"onboarding.plans.before.description":
			"Necesitas una suscripción o licencia activa para crear una organización.",
		"onboarding.plans.invite.title": "Tienes una invitación",
		"onboarding.plans.invite.description":
			"{inviter} te invitó a unirte a {organization}.",
		"onboarding.plans.invite.cta": "Ver invitación",
		"onboarding.plans.invite.empty.title": "¿Tienes una invitación?",
		"onboarding.plans.invite.empty.description":
			"Si alguien te invitó a su organización, revisa tu correo para el enlace de invitación.",
		"onboarding.plans.select.title": "Selecciona un plan",
		"onboarding.plans.select.description":
			"Elige un plan mensual para comenzar la facturación. Puedes cambiarlo después.",
		"onboarding.plans.watchlist.title": "Solo watchlist",
		"onboarding.plans.watchlist.description": "Revisa listas sin acceso AML.",
		"onboarding.plans.watchlist.cta": "Suscribirse a Watchlist",
		"onboarding.plans.watchlist.contact": "Contactar ventas",
		"onboarding.plans.recommended": "Recomendado",
		"onboarding.plans.subscribe": "Suscribirse a {plan}",
		"onboarding.plans.meteredNote": "+ uso medido al cierre del ciclo",
		"onboarding.plans.enterprise.title": "Enterprise",
		"onboarding.plans.enterprise.description":
			"Precios personalizados para grandes organizaciones con soporte dedicado",
		"onboarding.plans.enterprise.contact": "Contactar ventas",
		"onboarding.plans.enterprise.license": "Ingresar clave de licencia",
		"onboarding.plans.detailed.title": "Precios detallados",
		"onboarding.plans.detailed.description":
			"Compara límites incluidos y precios por uso. No hay plan seleccionado.",
		"onboarding.plans.detailed.trigger": "Ver tablas de precios detalladas",
		"onboarding.plans.editProfile": "Editar perfil",
		"onboarding.plans.features.watchlist.1": "1 organización",
		"onboarding.plans.features.watchlist.2": "3 usuarios por organización",
		"onboarding.plans.features.watchlist.3": "Solo consultas de watchlist",
		"onboarding.plans.features.watchlist.4": "50 consultas/día/usuario",
		"onboarding.plans.features.watchlist.5": "Sin acceso AML",
		"onboarding.plans.features.business.1": "1 organización",
		"onboarding.plans.features.business.2": "2 usuarios por organización",
		"onboarding.plans.features.business.3": "1 reporte/mes",
		"onboarding.plans.features.business.4": "2 avisos/mes",
		"onboarding.plans.features.business.5": "50 consultas/día/usuario",
		"onboarding.plans.features.business.6": "Acceso AML + Watchlist",
		"onboarding.plans.features.pro.1": "3 organizaciones",
		"onboarding.plans.features.pro.2": "10 usuarios por organización",
		"onboarding.plans.features.pro.3": "15 reportes/mes",
		"onboarding.plans.features.pro.4": "20 avisos/mes",
		"onboarding.plans.features.pro.5": "200 consultas/día/usuario",
		"onboarding.plans.features.pro.6": "Soporte prioritario",
		"onboarding.plans.features.ultra.1": "10 organizaciones",
		"onboarding.plans.features.ultra.2": "20 usuarios por organización",
		"onboarding.plans.features.ultra.3": "100 reportes/mes",
		"onboarding.plans.features.ultra.4": "100 avisos/mes",
		"onboarding.plans.features.ultra.5": "500 consultas/día/usuario",
		"onboarding.plans.features.ultra.6": "Soporte dedicado",
		"onboarding.org.title": "Crea tu organización",
		"onboarding.org.description":
			"Configura tu organización para comenzar a usar Janovix",
		"onboarding.org.badge": "Suscripción {plan} activa",
		"onboarding.org.plan.active": "Activa",
		"onboarding.org.name.label": "Nombre de la organización",
		"onboarding.org.name.placeholder": "Corporación Acme",
		"onboarding.org.name.help": "Así aparecerá tu organización en Janovix",
		"onboarding.org.slug.label": "Subdominio de la organización",
		"onboarding.org.slug.placeholder": "acme-corp",
		"onboarding.org.slug.help":
			"Este será el subdominio único de tu organización",
		"onboarding.org.slug.available": "{slug}.janovix.com está disponible",
		"onboarding.org.slug.error.required": "El subdominio es obligatorio",
		"onboarding.org.slug.error.min":
			"El subdominio debe tener al menos 3 caracteres",
		"onboarding.org.slug.error.max":
			"El subdominio debe tener 50 caracteres o menos",
		"onboarding.org.slug.error.start":
			"El subdominio debe comenzar con una letra o número",
		"onboarding.org.slug.error.end":
			"El subdominio debe terminar con una letra o número",
		"onboarding.org.slug.error.chars":
			"El subdominio solo puede contener letras minúsculas, números y guiones",
		"onboarding.org.slug.error.consecutive":
			"El subdominio no puede contener guiones consecutivos",
		"onboarding.org.slug.error.invalid": "Subdominio inválido",
		"onboarding.org.slug.error.taken":
			"Este subdominio ya está en uso. Elige otro.",
		"onboarding.org.submit": "Crear organización",
		"onboarding.org.creating": "Creando...",
		"onboarding.org.error.createFailed": "No se pudo crear la organización",
		"onboarding.org.footer":
			"Puedes invitar miembros y configurar ajustes después de crear tu organización.",
		"onboarding.invite.loading": "Cargando invitación...",
		"onboarding.invite.none.title": "No hay invitaciones pendientes",
		"onboarding.invite.none.description":
			"No tienes invitaciones pendientes. Si alguien te envió una invitación, revisa tu correo o pide que la reenvíe.",
		"onboarding.invite.none.back": "Volver al onboarding",
		"onboarding.invite.success.title": "¡Bienvenido a {organization}!",
		"onboarding.invite.success.description":
			"Te has unido correctamente a la organización. Redirigiendo...",
		"onboarding.invite.title": "¡Te invitaron!",
		"onboarding.invite.titleMultiple": "Tienes {count} invitaciones",
		"onboarding.invite.description":
			"{inviter} te invitó a unirte a su organización.",
		"onboarding.invite.descriptionMultiple":
			"Elige a qué organización te gustaría unirte.",
		"onboarding.invite.from": "de {name}",
		"onboarding.invite.refresh": "Actualizar",
		"onboarding.invite.someone": "Alguien",
		"onboarding.invite.decline": "Rechazar",
		"onboarding.invite.accept": "Aceptar",
		"onboarding.invite.joining": "Uniéndote...",
		"onboarding.invite.back": "Volver al onboarding",
		"onboarding.invite.note":
			"Al aceptar, te unirás como {role} y podrás colaborar de inmediato.",
		"onboarding.invite.expires": "Expira {date}",
		"onboarding.invite.role.member": "Miembro",
		"onboarding.invite.role.admin": "Admin",
		"onboarding.invite.role.owner": "Propietario",
		"onboarding.invite.error.notFound":
			"Esta invitación no se encontró o expiró.",
		"onboarding.invite.error.load":
			"No se pudieron cargar los detalles de la invitación.",
		"onboarding.invite.error.accept": "No se pudo aceptar la invitación",
		"onboarding.invite.error.decline": "No se pudo rechazar la invitación",
		"onboarding.license.title": "Activar clave de licencia",
		"onboarding.license.description":
			"Ingresa tu clave de licencia empresarial para activar tu suscripción.",
		"onboarding.license.invalid": "Clave de licencia inválida",
		"onboarding.license.activateFailed": "No se pudo activar la licencia",
		"onboarding.license.label": "Clave de licencia",
		"onboarding.license.validate": "Validar",
		"onboarding.license.contactAdmin":
			"Contacta a tu administrador si necesitas una clave de licencia.",
		"onboarding.license.valid": "Licencia válida",
		"onboarding.license.organization": "Organización",
		"onboarding.license.plan": "Plan",
		"onboarding.license.validUntil": "Válida hasta",
		"onboarding.license.users": "Usuarios",
		"onboarding.license.notices": "Avisos incluidos",
		"onboarding.license.useDifferent": "Usar otra clave",
		"onboarding.license.cancel": "Cancelar",
		"onboarding.license.activating": "Activando...",
		"onboarding.license.activate": "Activar licencia",
		"onboarding.license.noExpiration": "Sin expiración",
		"onboarding.license.unlimited": "Ilimitado",
		// Breadcrumb error labels
		"breadcrumb.notFound": "No encontrado",
		"breadcrumb.error": "Error",
		"breadcrumb.forbidden": "Prohibido",
		"breadcrumb.unauthorized": "No autorizado",
		// Error pages
		errorNotFoundTitle: "Página no encontrada",
		errorNotFoundDescription:
			"La página que buscas no existe o fue movida. Verifica la URL o vuelve a un lugar seguro.",
		errorServerTitle: "Algo salió mal",
		errorServerDescription:
			"Se produjo un error inesperado al cargar esta página.",
		errorServerHelp:
			"Intenta nuevamente o vuelve al inicio si el problema continúa.",
		errorUnauthorizedTitle: "Inicio de sesión requerido",
		errorUnauthorizedDescription:
			"Necesitas iniciar sesión para acceder a esta página.",
		errorUnauthorizedReason:
			"Si llegaste aquí desde un enlace compartido o un marcador, inicia sesión e inténtalo de nuevo.",
		errorForbiddenTitle: "Acceso denegado",
		errorForbiddenDescription: "No tienes acceso a esta página.",
		errorForbiddenReason:
			"Esto puede ocurrir si tu rol no incluye este permiso o si tu acceso fue revocado.",
		errorGoBack: "Volver",
		errorHome: "Inicio",
		errorTryAgain: "Intentar de nuevo",
		errorSignIn: "Iniciar sesión",
		errorSigninTitle: "Error",
		errorSigninDescription:
			"Encontramos un error durante el proceso de inicio de sesión.",
		// Navbar clock
		"clock.clickForInfo": "Clic para ver información de zona horaria",
		"clock.timezoneInfo": "Información de zona horaria",
		"clock.switchTo": "Cambiar a",
		"clock.appTimezone": "Zona horaria de la app",
		"clock.yourTimezone": "Tu zona horaria",
		"clock.local": "Local",
		"clock.detecting": "Detectando...",
		"clock.timezoneMismatch": "Diferencia de zona horaria",
		"clock.difference": "Diferencia",
		"clock.timezonesMatch": "Las zonas horarias coinciden",
		// Timezone picker
		"timezone.selectTimezone": "Seleccionar zona horaria",
		"timezone.searchTimezones": "Buscar zonas horarias...",
		"timezone.noTimezonesFound": "No se encontraron zonas horarias",
		"timezone.trySearchingAnotherCity": "Intenta buscar otra ciudad",
		"timezone.clearSearch": "Limpiar búsqueda",
		"timezone.timezoneOptions": "Opciones de zona horaria",

		// Beta access page
		"beta.title": "Acceso Beta",
		"beta.greeting": "Hola, {name}",
		"beta.message":
			"Hemos recibido tu registro. Actualmente estamos en fase beta. Gracias por tu interés — recibirás un correo electrónico cuando el acceso público sea liberado o cuando se te otorgue acceso.",
		"beta.checkEmail":
			"Mantente atento a tu bandeja de entrada para actualizaciones.",
		"beta.backToLogin": "Volver al inicio de sesión",
		"beta.footerNote":
			"Gracias por tu paciencia mientras preparamos todo para ti.",
	},
};

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
	const [language, setLanguageState] = useState<Language>("es");
	const [mounted, setMounted] = useState(false);
	const [settingsSynced, setSettingsSynced] = useState(false);

	// Initialize from cookies (instant), then sync with API
	useEffect(() => {
		setMounted(true);

		// Step 1: Read from cookie first for instant render (no flash)
		const stored = getCookie(COOKIE_NAMES.LANGUAGE) as Language | undefined;
		if (stored && (stored === "en" || stored === "es")) {
			setLanguageState(stored);
		} else {
			const browserLang = navigator.language.toLowerCase();
			const detected = browserLang.startsWith("es") ? "es" : "en";
			setLanguageState(detected);
			setCookie(COOKIE_NAMES.LANGUAGE, detected);
		}

		// Step 2: Fetch from API to verify/sync
		getResolvedSettings()
			.then((settings) => {
				const apiLanguage = settings.language as Language;
				if (apiLanguage && (apiLanguage === "en" || apiLanguage === "es")) {
					setLanguageState(apiLanguage);
					setCookie(COOKIE_NAMES.LANGUAGE, apiLanguage);
				}
				setSettingsSynced(true);
			})
			.catch(() => {
				// API unavailable, keep using cookie/browser value
				setSettingsSynced(true);
			});
	}, []);

	// Update both cookie and API when language changes
	const handleSetLanguage = useCallback(
		(lang: Language) => {
			setLanguageState(lang);
			// Update cookie immediately for cross-app sync
			setCookie(COOKIE_NAMES.LANGUAGE, lang);

			// Update API in background (only if we've already synced with API)
			if (settingsSynced) {
				updateUserSettings({ language: lang as LanguageCode }).catch(() => {
					// Silently fail - not critical
				});
			}
		},
		[settingsSynced],
	);

	const t = useCallback(
		(key: string): string => {
			const langTranslations = translations[language];
			return langTranslations[key as keyof typeof langTranslations] || key;
		},
		[language],
	);

	// Create blocks context value
	// Note: We wrap handleSetLanguage to accept string and validate it's a valid Language
	const blocksContextValue: BlocksLanguageContextValue = useMemo(
		() => ({
			language,
			setLanguage: (lang: string) => {
				if (lang === "en" || lang === "es") {
					handleSetLanguage(lang);
				}
			},
			languages: [
				{ code: "en", name: "English" },
				{ code: "es", name: "Español" },
			] satisfies BlocksLanguage[],
		}),
		[language, handleSetLanguage],
	);

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted) {
		return null;
	}

	return (
		<LanguageContext.Provider
			value={{ language, setLanguage: handleSetLanguage, t }}
		>
			<BlocksLanguageContext.Provider value={blocksContextValue}>
				{children}
			</BlocksLanguageContext.Provider>
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
