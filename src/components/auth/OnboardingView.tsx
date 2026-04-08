"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAurora } from "@/contexts/aurora-context";
import { OnboardingViewSkeleton } from "@/components/auth/OnboardingViewSkeleton";
import { useOnboarding } from "@/contexts/onboarding-context";
import { resolveSafeRedirectUrl } from "@/lib/auth/safeRedirect";
import {
	ProfileCompletionStep,
	SubscriptionSelectionStep,
	CreateOrganizationStep,
	PasskeySetupStep,
} from "./onboarding";

interface OnboardingViewProps {
	redirectTo?: string;
}

export const OnboardingView = ({ redirectTo }: OnboardingViewProps) => {
	const { setPageProfile } = useAurora();
	const { state, refreshOnboardingStatus } = useOnboarding();
	const searchParams = useSearchParams();

	// Show passkey setup step after profile completion (only once per session)
	const [showPasskeyStep, setShowPasskeyStep] = useState(false);

	const handleProfileComplete = useCallback(() => {
		setShowPasskeyStep(true);
	}, []);

	const handlePasskeyContinue = useCallback(() => {
		setShowPasskeyStep(false);
	}, []);

	// Set aurora page profile on mount
	useEffect(() => {
		setPageProfile("onboarding");
	}, [setPageProfile]);

	// Handle subscription success/cancel from Stripe redirect
	useEffect(() => {
		const subscriptionSuccess = searchParams.get("subscription_success");
		const subscriptionCanceled = searchParams.get("subscription_canceled");

		if (subscriptionSuccess === "true") {
			// Refresh status to get updated subscription state
			refreshOnboardingStatus();
			// Clean up URL
			const url = new URL(window.location.href);
			url.searchParams.delete("subscription_success");
			window.history.replaceState({}, "", url.toString());
		}

		if (subscriptionCanceled === "true") {
			// Clean up URL
			const url = new URL(window.location.href);
			url.searchParams.delete("subscription_canceled");
			window.history.replaceState({}, "", url.toString());
		}
	}, [searchParams, refreshOnboardingStatus]);

	// Show loading state while fetching initial data
	if (state.isLoading) {
		return <OnboardingViewSkeleton />;
	}

	// Redirect if fully onboarded (has profile, organization)
	if (state.userProfile.isComplete && state.hasOrganization) {
		window.location.href = resolveSafeRedirectUrl(
			redirectTo ?? null,
			window.location.origin,
		);
		return <OnboardingViewSkeleton />;
	}

	// Step 1: Profile completion (name/avatar)
	const editProfile = searchParams.get("edit_profile") === "true";

	if (editProfile || !state.userProfile.isComplete) {
		return <ProfileCompletionStep onComplete={handleProfileComplete} />;
	}

	// Step 1b: Optional passkey setup (shown once after profile completion)
	if (showPasskeyStep) {
		return <PasskeySetupStep onContinue={handlePasskeyContinue} />;
	}

	// Step 2: If user has subscription but no organization, show org creation
	if (state.canCreateOrganization && !state.hasOrganization) {
		return <CreateOrganizationStep redirectTo={redirectTo} />;
	}

	// Step 3: Subscription selection (or invitation handling)
	// User has completed profile but needs subscription/organization
	return <SubscriptionSelectionStep />;
};
