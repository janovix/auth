"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { authClient } from "@/lib/auth/authClient";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NavBreadcrumb } from "@/components/layout/NavBreadcrumb";
import type { Organization } from "@/components/layout/OrganizationSwitcher";
import { Separator } from "@/components/ui/separator";
import { NavbarClock } from "@/components/ui/navbar-clock";
import {
	setSidebarCollapsed as saveSidebarCollapsed,
	getResolvedSettings,
	getAmlComplianceSettings,
	getUIPreferences,
} from "@/lib/settings/settingsClient";
import { BILLING_ENTITLEMENTS_UPDATED_EVENT } from "@/lib/settings/billingEntitlementsEvents";
import type { NotificationSoundType } from "@/lib/settings/types";
import {
	getSubscriptionStatus,
	getFeatures,
	hasAmlProductAccess,
	type Feature,
} from "@/lib/billing";
import { NotificationsProvider } from "@/contexts/notifications-context";
import {
	LanguageSwitcher,
	NotificationsWidget,
	ThemeSwitcher,
} from "@algenium/blocks";
import { useLanguage } from "@/contexts/language-context";
import { SettingsSidebarProductProvider } from "@/contexts/settings-sidebar-product-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/supportedLanguages";

interface SettingsLayoutClientProps {
	children: React.ReactNode;
	initialSidebarCollapsed: boolean;
}

const SIDEBAR_COOKIE_NAME = "sidebar_state";

/**
 * Helper to set cookie value
 */
function setCookieValue(name: string, value: string, maxAge: number): void {
	if (typeof document === "undefined") return;
	document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}

/**
 * Inner layout component that has access to notifications context
 */
function SettingsLayoutInner({
	children,
	initialSidebarCollapsed,
}: SettingsLayoutClientProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: session } = useAuthSession();
	const { language, setLanguage, t } = useLanguage();

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [activeOrganization, setActiveOrganization] =
		useState<Organization | null>(null);
	const [orgsLoading, setOrgsLoading] = useState(false);
	const orgSwitchProcessedRef = useRef(false);

	// Sidebar state - initialized with server-side value
	const [isCollapsed, setIsCollapsed] = useState(initialSidebarCollapsed);
	const pendingSave = useRef<boolean | null>(null);
	const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Completion status for each section
	const [completionStatus, setCompletionStatus] = useState<
		Record<string, boolean>
	>({
		personal: true, // Profile always considered complete if user exists
		organization: true, // Org exists
		billing: false, // Has active subscription
		compliance: false, // Has AML settings
		team: true, // Has at least one member (owner)
	});

	// Organization usage for the org picker
	const [organizationsOwned, setOrganizationsOwned] = useState(0);
	const [organizationsLimit, setOrganizationsLimit] = useState(0);

	// Pending invitations count for sidebar indicator
	const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);

	// AML product (PLD compliance settings) — hide nav when plan is watchlist-only
	const [hasAmlAccess, setHasAmlAccess] = useState(true);

	// Effective timezone for the navbar clock (resolved from user > org > browser)
	const [effectiveTimezone, setEffectiveTimezone] = useState<string | null>(
		null,
	);
	// Effective clock format for the navbar clock
	const [effectiveClockFormat, setEffectiveClockFormat] = useState<
		"12h" | "24h"
	>("12h");

	// Notification sound preferences
	const [notificationSound, setNotificationSound] = useState<boolean>(true);
	const [notificationSoundType, setNotificationSoundType] =
		useState<NotificationSoundType>("chime");

	// Handle org query param to switch organization
	const orgSlugParam = searchParams.get("org");

	// Debounced save to server
	const saveToServer = useCallback(async (collapsed: boolean) => {
		try {
			await saveSidebarCollapsed(collapsed);
		} catch {
			console.debug(
				"[SettingsLayoutClient] Failed to save sidebar state to server",
			);
		}
	}, []);

	const handleSidebarOpenChange = useCallback(
		(open: boolean) => {
			const collapsed = !open;
			setIsCollapsed(collapsed);

			// Update cookie for fast reload
			setCookieValue(
				SIDEBAR_COOKIE_NAME,
				collapsed ? "false" : "true",
				60 * 60 * 24 * 7,
			);

			// Track pending save
			pendingSave.current = collapsed;

			// Clear existing timeout
			if (saveTimeout.current) {
				clearTimeout(saveTimeout.current);
			}

			// Debounce save to server (300ms)
			saveTimeout.current = setTimeout(() => {
				if (pendingSave.current !== null) {
					saveToServer(pendingSave.current);
					pendingSave.current = null;
				}
			}, 300);
		},
		[saveToServer],
	);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (saveTimeout.current) {
				clearTimeout(saveTimeout.current);
				// Save pending state immediately on unmount
				if (pendingSave.current !== null) {
					saveSidebarCollapsed(pendingSave.current).catch(() => {
						// Ignore errors on unmount
					});
				}
			}
		};
	}, []);

	// Listen for sidebar collapsed change events from settings UI
	useEffect(() => {
		const handleSidebarCollapsedChange = (event: Event) => {
			const customEvent = event as CustomEvent<{ collapsed: boolean }>;
			const { collapsed } = customEvent.detail;
			setIsCollapsed(collapsed);
			// Update cookie to match
			setCookieValue(
				SIDEBAR_COOKIE_NAME,
				collapsed ? "false" : "true",
				60 * 60 * 24 * 7,
			);
		};

		window.addEventListener(
			"sidebar-collapsed-change",
			handleSidebarCollapsedChange,
		);
		return () => {
			window.removeEventListener(
				"sidebar-collapsed-change",
				handleSidebarCollapsedChange,
			);
		};
	}, []);

	// Fetch organizations
	useEffect(() => {
		async function loadOrganizations() {
			try {
				setOrgsLoading(true);
				const authServiceUrl = getAuthCoreBaseUrl();

				// Single request returns organizations already enriched with the user's role.
				const listResponse = await fetch(
					`${authServiceUrl}/api/organization/list-with-role`,
					{
						credentials: "include",
						headers: { "Content-Type": "application/json" },
					},
				);

				if (listResponse.ok) {
					const payload = (await listResponse.json()) as {
						success: boolean;
						data: Array<{
							id: string;
							name: string;
							slug: string;
							logo?: string | null;
							role?: string;
						}>;
					} | null;

					const orgs = payload?.data ?? [];

					const formattedOrgs = orgs.map((org) => ({
						id: org.id,
						name: org.name,
						slug: org.slug,
						logo: org.logo ?? null,
						role: (org.role ?? "member") as "owner" | "admin" | "member",
					}));
					setOrganizations(formattedOrgs);

					// Set active org
					if (activeOrgId) {
						const activeOrg = formattedOrgs.find(
							(o: { id: string }) => o.id === activeOrgId,
						);
						if (activeOrg) {
							setActiveOrganization(activeOrg);
						} else {
							// Fallback: fetch full org details
							const fullOrgResult =
								await authClient.organization.getFullOrganization({
									query: { organizationId: activeOrgId },
								});
							if (fullOrgResult.data) {
								setActiveOrganization({
									id: fullOrgResult.data.id,
									name: fullOrgResult.data.name,
									slug: fullOrgResult.data.slug,
									logo: fullOrgResult.data.logo || null,
								});
							}
						}
					}
				}
			} catch {
				// Silent fail
			} finally {
				setOrgsLoading(false);
			}
		}
		loadOrganizations();
	}, [activeOrgId, session?.user?.id]);

	// Switch org based on query param
	useEffect(() => {
		if (
			!orgSlugParam ||
			orgSwitchProcessedRef.current ||
			organizations.length === 0
		) {
			return;
		}

		const targetOrg = organizations.find((o) => o.slug === orgSlugParam);
		if (!targetOrg) {
			// Org not found, clear the param
			const url = new URL(window.location.href);
			url.searchParams.delete("org");
			router.replace(url.pathname + url.search);
			return;
		}

		// If already on this org, just clear the param
		if (targetOrg.id === activeOrgId) {
			const url = new URL(window.location.href);
			url.searchParams.delete("org");
			router.replace(url.pathname + url.search);
			return;
		}

		// Mark as processed to prevent multiple switches
		orgSwitchProcessedRef.current = true;

		// Switch to the target org
		async function switchOrg() {
			try {
				const result = await authClient.organization.setActive({
					organizationId: targetOrg!.id,
				});

				if (!result.error) {
					// Clear the query param and reload to reflect new org
					const url = new URL(window.location.href);
					url.searchParams.delete("org");
					window.location.href = url.pathname + url.search;
				}
			} catch (error) {
				console.error("Failed to switch organization:", error);
				orgSwitchProcessedRef.current = false;
			}
		}
		switchOrg();
	}, [orgSlugParam, organizations, activeOrgId, router]);

	// Load completion status for sections (billing, AML access, invitations, etc.)
	const loadCompletionStatus = useCallback(async () => {
		if (!activeOrgId) return;

		try {
			// Check compliance settings
			const amlSettings = await getAmlComplianceSettings(activeOrgId);
			setCompletionStatus((prev) => ({
				...prev,
				compliance: Boolean(amlSettings?.obligatedSubjectKey),
			}));

			// Check subscription status (billing)
			const [subscriptionStatus, features] = await Promise.all([
				getSubscriptionStatus({ resolveFromOrg: true }),
				getFeatures({ resolveFromOrg: true }).catch(() => [] as Feature[]),
			]);
			if (subscriptionStatus) {
				setCompletionStatus((prev) => ({
					...prev,
					billing: subscriptionStatus.hasSubscription,
				}));
				setOrganizationsOwned(subscriptionStatus.organizationsOwned);
				setOrganizationsLimit(subscriptionStatus.organizationsLimit);
			}
			setHasAmlAccess(hasAmlProductAccess(subscriptionStatus, features));

			// Check for pending invitations — use the lightweight fast path to avoid
			// the expensive subscription/Stripe checks in the full endpoint
			const authServiceUrl = getAuthCoreBaseUrl();
			const onboardingResponse = await fetch(
				`${authServiceUrl}/api/subscription/onboarding-status?pendingInvitationsOnly=true`,
				{
					credentials: "include",
				},
			);

			if (onboardingResponse.ok) {
				const result = (await onboardingResponse.json()) as {
					success: boolean;
					data?: {
						pendingInvitations?: Array<{ id: string }>;
					};
				};
				if (result.success && result.data?.pendingInvitations) {
					setPendingInvitationsCount(result.data.pendingInvitations.length);
				}
			}
		} catch {
			// Silently fail - completion status is optional
		}
	}, [activeOrgId]);

	useEffect(() => {
		void loadCompletionStatus();
	}, [loadCompletionStatus]);

	useEffect(() => {
		const handler = () => {
			void loadCompletionStatus();
		};
		window.addEventListener(BILLING_ENTITLEMENTS_UPDATED_EVENT, handler);
		return () => {
			window.removeEventListener(BILLING_ENTITLEMENTS_UPDATED_EVENT, handler);
		};
	}, [loadCompletionStatus]);

	// Load effective timezone for the navbar clock (resolved from user > org > browser)
	useEffect(() => {
		async function loadEffectiveTimezone() {
			try {
				const resolvedSettings = await getResolvedSettings();
				if (resolvedSettings?.timezone) {
					setEffectiveTimezone(resolvedSettings.timezone);
				}
				if (resolvedSettings?.clockFormat) {
					setEffectiveClockFormat(resolvedSettings.clockFormat);
				}
			} catch {
				// Silently fail - timezone is optional
			}
		}
		loadEffectiveTimezone();
	}, [activeOrgId]);

	// Load notification sound preferences
	useEffect(() => {
		async function loadNotificationPrefs() {
			try {
				const prefs = await getUIPreferences();
				setNotificationSound(prefs.notificationSound ?? true);
				setNotificationSoundType(prefs.notificationSoundType ?? "chime");
			} catch {
				// Silently fail — defaults remain
			}
		}
		loadNotificationPrefs();
	}, []);

	// Listen for organization name/slug/logo updates from settings views
	useEffect(() => {
		const handleOrgUpdated = (event: Event) => {
			const { id, name, slug, logo } = (
				event as CustomEvent<{
					id: string;
					name: string;
					slug: string;
					logo: string | null;
				}>
			).detail;

			setOrganizations((prev) =>
				prev.map((org) => (org.id === id ? { ...org, name, slug, logo } : org)),
			);
			setActiveOrganization((prev) =>
				prev?.id === id ? { ...prev, name, slug, logo } : prev,
			);
		};

		window.addEventListener("organization-updated", handleOrgUpdated);
		return () => {
			window.removeEventListener("organization-updated", handleOrgUpdated);
		};
	}, []);

	// Listen for timezone changes from settings UI
	useEffect(() => {
		const handleTimezoneChange = (event: Event) => {
			const customEvent = event as CustomEvent<{ timezone: string }>;
			setEffectiveTimezone(customEvent.detail.timezone);
		};

		window.addEventListener("timezone-change", handleTimezoneChange);
		return () => {
			window.removeEventListener("timezone-change", handleTimezoneChange);
		};
	}, []);

	// Listen for clock format changes from settings UI
	useEffect(() => {
		const handleClockFormatChange = (event: Event) => {
			const customEvent = event as CustomEvent<{ clockFormat: "12h" | "24h" }>;
			setEffectiveClockFormat(customEvent.detail.clockFormat);
		};

		window.addEventListener("clock-format-change", handleClockFormatChange);
		return () => {
			window.removeEventListener(
				"clock-format-change",
				handleClockFormatChange,
			);
		};
	}, []);

	const handleOrganizationChange = async (org: Organization) => {
		if (org.id === activeOrgId) return;

		try {
			const result = await authClient.organization.setActive({
				organizationId: org.id,
			});

			if (result.error) {
				console.error("Failed to switch organization");
				return;
			}

			// Reload the page to reflect the new active organization
			window.location.reload();
		} catch (error) {
			console.error("Failed to switch organization:", error);
		}
	};

	// Handle notification click - navigate to href (callbackUrl)
	// Note: Marking as read is handled automatically by the NotificationsWidget via context
	const handleNotificationClick = useCallback(
		(notification: { href?: string }) => {
			// Navigate to href if provided
			if (notification.href) {
				router.push(notification.href);
			}
		},
		[router],
	);

	return (
		<SettingsSidebarProductProvider hasAmlAccess={hasAmlAccess}>
			<SidebarProvider
				open={!isCollapsed}
				onOpenChange={handleSidebarOpenChange}
			>
				<AppSidebar
					organizations={organizations}
					activeOrganization={activeOrganization}
					onOrganizationChange={handleOrganizationChange}
					completionStatus={completionStatus}
					isLoading={orgsLoading}
					organizationsOwned={organizationsOwned}
					organizationsLimit={organizationsLimit}
					pendingInvitationsCount={pendingInvitationsCount}
				/>
				<SidebarInset className="flex h-screen flex-col overflow-hidden">
					{/* Header - Fixed navbar */}
					<TooltipProvider delayDuration={0}>
						<header className="z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 shadow-xs">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mx-2 h-6" />
							<div className="flex-1 min-w-0">
								<NavBreadcrumb />
							</div>
							<div className="flex shrink-0 items-center gap-2">
								<LanguageSwitcher
									languages={SUPPORTED_LANGUAGES}
									currentLanguage={language}
									onLanguageChange={(key) => setLanguage(key as "en" | "es")}
									labels={{ language: t("language.label") }}
									variant="mini"
									size="sm"
									shape="rounded"
									side="bottom"
									align="end"
								/>
								<ThemeSwitcher
									variant="mini"
									size="sm"
									shape="rounded"
									side="bottom"
									align="end"
									labels={{
										theme: t("theme.label"),
										system: t("theme.system"),
										light: t("theme.light"),
										dark: t("theme.dark"),
									}}
								/>
								<NavbarClock
									timezone={effectiveTimezone || undefined}
									defaultFormat={effectiveClockFormat}
									size="sm"
									showTimezoneMismatch={Boolean(effectiveTimezone)}
								/>
								{/* NotificationsWidget now consumes data from BlocksNotificationsContext automatically */}
								<NotificationsWidget
									onNotificationClick={handleNotificationClick}
									size="md"
									maxVisible={50}
									playSound={notificationSound}
									showPulse={true}
									soundType={notificationSoundType}
									pulseStyle="ring"
								/>
							</div>
						</header>
					</TooltipProvider>

					{/* Main Content */}
					<main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
						<div className="max-w-4xl mx-auto p-6 lg:p-8 w-full">
							{children}
						</div>
					</main>
				</SidebarInset>
			</SidebarProvider>
		</SettingsSidebarProductProvider>
	);
}

/**
 * Main layout component that wraps everything with NotificationsProvider
 */
export function SettingsLayoutClient({
	children,
	initialSidebarCollapsed,
}: SettingsLayoutClientProps) {
	return (
		<NotificationsProvider>
			<SettingsLayoutInner initialSidebarCollapsed={initialSidebarCollapsed}>
				{children}
			</SettingsLayoutInner>
		</NotificationsProvider>
	);
}
