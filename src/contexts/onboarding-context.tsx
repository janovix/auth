"use client";

import * as Sentry from "@sentry/nextjs";
import type React from "react";
import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	type ReactNode,
} from "react";
import { authClient } from "@/lib/auth/authClient";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";
import { startSubscription, getSubscriptionStatus } from "@/lib/billing";

// ============================================================================
// Types
// ============================================================================

export type Plan = {
	id: string;
	name: string;
	price: number;
};

export type PendingInvitation = {
	id: string;
	organizationId: string;
	organizationName: string;
	organizationLogo: string | null;
	role: "member" | "admin" | "owner";
	inviterName: string | null;
	inviterEmail: string | null;
	expiresAt: Date | null;
};

export type LicenseLimits = {
	maxOrganizations: number;
	maxUsers: number;
	reportsPerMonth: number;
	noticesPerMonth: number;
	alertsPerMonth: number;
	operationsPerMonth: number;
	clientsPerMonth: number;
	watchlistQueriesPerMonth: number;
};

export type License = {
	key: string;
	organizationName: string;
	plan: string;
	expiresAt: string | null;
	limits: LicenseLimits | null;
	isActive: boolean;
};

export type UserProfile = {
	firstName: string;
	lastName: string;
	avatarUrl: string | null;
	isComplete: boolean;
};

export type OnboardingState = {
	// Profile state
	userProfile: UserProfile;
	// Subscription state
	hasSubscription: boolean;
	currentPlan: Plan | null;
	subscriptionStatus: string | null;
	// License state
	license: License | null;
	// Organization state
	hasOrganization: boolean;
	organizationName: string | null;
	// Invitation state - support multiple invitations
	pendingInvitation: PendingInvitation | null; // Kept for backward compatibility
	pendingInvitations: PendingInvitation[]; // All pending invitations
	// Derived state
	canCreateOrganization: boolean;
	isLoading: boolean;
};

export type OnboardingContextType = {
	state: OnboardingState;
	// Profile actions
	updateUserProfile: (profile: Partial<UserProfile>) => void;
	// Subscription actions
	startSubscriptionFlow: (
		plan: Plan,
		successUrl: string,
		cancelUrl: string,
	) => Promise<{ url: string }>;
	// Organization actions
	createOrganization: (
		name: string,
		slug?: string,
	) => Promise<{ success: boolean; error?: string }>;
	// Invitation actions (using Better Auth organization plugin)
	acceptInvitation: (
		invitationId: string,
		organizationId?: string,
	) => Promise<{ success: boolean; error?: string }>;
	declineInvitation: (
		invitationId: string,
	) => Promise<{ success: boolean; error?: string }>;
	// License actions
	validateLicense: (
		key: string,
	) => Promise<{ valid: boolean; license?: License; error?: string }>;
	activateLicense: (
		license: License,
	) => Promise<{ success: boolean; error?: string }>;
	// Checkout modal state
	isCheckoutOpen: boolean;
	setCheckoutOpen: (open: boolean) => void;
	selectedPlan: Plan | null;
	setSelectedPlan: (plan: Plan | null) => void;
	// Refresh state
	refreshOnboardingStatus: () => Promise<void>;
	// Reset state (for testing/demo)
	reset: () => void;
};

// ============================================================================
// Initial State
// ============================================================================

const initialState: OnboardingState = {
	userProfile: {
		firstName: "",
		lastName: "",
		avatarUrl: null,
		isComplete: false,
	},
	hasSubscription: false,
	currentPlan: null,
	subscriptionStatus: null,
	license: null,
	hasOrganization: false,
	organizationName: null,
	pendingInvitation: null,
	pendingInvitations: [],
	canCreateOrganization: false,
	isLoading: true,
};

// ============================================================================
// Context
// ============================================================================

const OnboardingContext = createContext<OnboardingContextType | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function OnboardingProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<OnboardingState>(initialState);
	const [isCheckoutOpen, setCheckoutOpen] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

	// Fetch onboarding status from API
	const refreshOnboardingStatus = useCallback(async () => {
		try {
			setState((prev) => ({ ...prev, isLoading: true }));
			const baseUrl = getAuthCoreBaseUrl();

			// Fetch onboarding status
			const response = await fetch(
				`${baseUrl}/api/subscription/onboarding-status`,
				{
					credentials: "include",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to fetch onboarding status");
			}

			const result = (await response.json()) as {
				success: boolean;
				data?: {
					profileComplete: boolean;
					hasOrganization: boolean;
					hasSubscription: boolean;
					subscriptionStatus: string | null;
					plan: string | null;
					pendingInvitation: {
						id: string;
						organizationId: string;
						organizationName: string;
						organizationLogo: string | null;
						role: string;
						inviterName: string | null;
						inviterEmail: string | null;
						expiresAt: string | null;
					} | null;
					pendingInvitations?: Array<{
						id: string;
						organizationId: string;
						organizationName: string;
						organizationLogo: string | null;
						role: string;
						inviterName: string | null;
						inviterEmail: string | null;
						expiresAt: string | null;
					}>;
					canCreateOrganization: boolean;
				};
			};

			if (!result.success || !result.data) {
				throw new Error("Invalid response from onboarding status");
			}

			const data = result.data;

			// Also fetch current user session for profile info
			const sessionResult = await authClient.getSession();

			let firstName = "";
			let lastName = "";
			let avatarUrl: string | null = null;

			if (sessionResult.data?.user?.name) {
				const nameParts = sessionResult.data.user.name.split(" ");
				firstName = nameParts[0] || "";
				lastName = nameParts.slice(1).join(" ") || "";
			}
			avatarUrl = sessionResult.data?.user?.image ?? null;

			// Map all pending invitations
			const allInvitations: PendingInvitation[] = (
				data.pendingInvitations || []
			).map((inv) => ({
				id: inv.id,
				organizationId: inv.organizationId,
				organizationName: inv.organizationName,
				organizationLogo: inv.organizationLogo,
				role: inv.role as "member" | "admin" | "owner",
				inviterName: inv.inviterName,
				inviterEmail: inv.inviterEmail,
				expiresAt: inv.expiresAt ? new Date(inv.expiresAt) : null,
			}));

			// Fallback to single invitation for backward compatibility
			const firstInvitation = allInvitations[0] || null;

			setState({
				userProfile: {
					firstName,
					lastName,
					avatarUrl,
					isComplete: data.profileComplete,
				},
				hasSubscription: data.hasSubscription,
				currentPlan: data.plan
					? {
							id: data.plan,
							name: data.plan.charAt(0).toUpperCase() + data.plan.slice(1),
							price: 0,
						}
					: null,
				subscriptionStatus: data.subscriptionStatus,
				license: null, // License info would come from subscription status endpoint if needed
				hasOrganization: data.hasOrganization,
				organizationName: null, // Will be set when org is created/joined
				pendingInvitation: firstInvitation,
				pendingInvitations: allInvitations,
				canCreateOrganization: data.canCreateOrganization,
				isLoading: false,
			});
		} catch (error) {
			Sentry.captureException(error, {
				tags: { context: "onboarding-status-fetch-failed" },
			});
			setState((prev) => ({ ...prev, isLoading: false }));
		}
	}, []);

	// Load initial state
	useEffect(() => {
		refreshOnboardingStatus();
	}, [refreshOnboardingStatus]);

	// Update user profile locally
	const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
		setState((prev) => {
			const updatedProfile = { ...prev.userProfile, ...profile };
			const isComplete =
				updatedProfile.firstName.trim() !== "" &&
				updatedProfile.lastName.trim() !== "";
			return {
				...prev,
				userProfile: {
					...updatedProfile,
					isComplete,
				},
			};
		});
	}, []);

	// Start subscription flow using Better Auth Stripe
	const startSubscriptionFlow = useCallback(
		async (
			plan: Plan,
			successUrl: string,
			cancelUrl: string,
		): Promise<{ url: string }> => {
			const planId = plan.id.toLowerCase() as
				| "watchlist"
				| "business"
				| "pro"
				| "ultra";
			return startSubscription(planId, successUrl, cancelUrl);
		},
		[],
	);

	// Create organization using Better Auth organization plugin
	const createOrganization = useCallback(
		async (
			name: string,
			slug?: string,
		): Promise<{ success: boolean; error?: string }> => {
			try {
				const result = await authClient.organization.create({
					name,
					slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
				});

				if (result.error) {
					return {
						success: false,
						error: result.error.message || "Failed to create organization",
					};
				}

				// Set the new organization as active
				if (result.data?.id) {
					await authClient.organization.setActive({
						organizationId: result.data.id,
					});
				}

				// Refresh state
				await refreshOnboardingStatus();

				return { success: true };
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to create organization",
				};
			}
		},
		[refreshOnboardingStatus],
	);

	// Accept invitation using Better Auth organization plugin
	const acceptInvitation = useCallback(
		async (
			invitationId: string,
			organizationId?: string,
		): Promise<{ success: boolean; error?: string }> => {
			try {
				const result = await authClient.organization.acceptInvitation({
					invitationId,
				});

				if (result.error) {
					return {
						success: false,
						error: result.error.message || "Failed to accept invitation",
					};
				}

				// Update seat count in Stripe after accepting invitation
				// This is done asynchronously and doesn't block the user flow
				if (organizationId) {
					fetch(`${getAuthCoreBaseUrl()}/api/organization/update-seats`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({ organizationId }),
					}).catch((err) => {
						// Log but don't fail - seat update can be synced later
						Sentry.captureException(err, {
							tags: { context: "onboarding-seat-update-failed" },
						});
					});
				}

				// Refresh state to update organization membership
				await refreshOnboardingStatus();

				return { success: true };
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to accept invitation",
				};
			}
		},
		[refreshOnboardingStatus],
	);

	// Decline invitation using Better Auth organization plugin
	const declineInvitation = useCallback(
		async (
			invitationId: string,
		): Promise<{ success: boolean; error?: string }> => {
			try {
				const result = await authClient.organization.rejectInvitation({
					invitationId,
				});

				if (result.error) {
					return {
						success: false,
						error: result.error.message || "Failed to decline invitation",
					};
				}

				// Clear pending invitation from state
				setState((prev) => ({
					...prev,
					pendingInvitation: null,
				}));

				return { success: true };
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to decline invitation",
				};
			}
		},
		[],
	);

	// Validate license key
	const validateLicense = useCallback(
		async (
			key: string,
		): Promise<{ valid: boolean; license?: License; error?: string }> => {
			try {
				const baseUrl = getAuthCoreBaseUrl();
				const response = await fetch(
					`${baseUrl}/api/subscription/license/validate`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({ key }),
					},
				);

				const result = (await response.json()) as {
					success: boolean;
					data?: {
						key: string;
						organizationName: string;
						plan: string;
						expiresAt: string | null;
						limits: LicenseLimits | null;
						isActive: boolean;
					};
					error?: string;
				};

				if (!response.ok || !result.success || !result.data) {
					return { valid: false, error: result.error || "Invalid license key" };
				}

				return { valid: true, license: result.data };
			} catch (error) {
				return {
					valid: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to validate license",
				};
			}
		},
		[],
	);

	// Activate license
	const activateLicense = useCallback(
		async (license: License): Promise<{ success: boolean; error?: string }> => {
			try {
				const baseUrl = getAuthCoreBaseUrl();
				const response = await fetch(
					`${baseUrl}/api/subscription/license/activate`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({ key: license.key }),
					},
				);

				const result = (await response.json()) as {
					success: boolean;
					error?: string;
				};

				if (!response.ok || !result.success) {
					return {
						success: false,
						error: result.error || "Failed to activate license",
					};
				}

				// Update state with the license
				setState((prev) => ({
					...prev,
					license,
					hasSubscription: true,
					canCreateOrganization: true,
				}));

				return { success: true };
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to activate license",
				};
			}
		},
		[],
	);

	// Reset state (for testing/demo)
	const reset = useCallback(() => {
		setState(initialState);
		setCheckoutOpen(false);
		setSelectedPlan(null);
	}, []);

	return (
		<OnboardingContext.Provider
			value={{
				state,
				updateUserProfile,
				startSubscriptionFlow,
				createOrganization,
				acceptInvitation,
				declineInvitation,
				validateLicense,
				activateLicense,
				isCheckoutOpen,
				setCheckoutOpen,
				selectedPlan,
				setSelectedPlan,
				refreshOnboardingStatus,
				reset,
			}}
		>
			{children}
		</OnboardingContext.Provider>
	);
}

// ============================================================================
// Hook
// ============================================================================

export function useOnboarding() {
	const context = useContext(OnboardingContext);
	if (!context) {
		throw new Error("useOnboarding must be used within an OnboardingProvider");
	}
	return context;
}
