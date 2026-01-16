"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAurora } from "@/contexts/aurora-context";
import { useLanguage } from "@/contexts/language-context";
import { useOnboarding } from "@/contexts/onboarding-context";
import { getAuthRedirectUrl } from "@/lib/auth/redirectConfig";
import {
	ProfileCompletionStep,
	SubscriptionSelectionStep,
	CreateOrganizationStep,
	LicenseModal,
} from "./onboarding";

interface OnboardingViewProps {
	redirectTo?: string;
}

export const OnboardingView = ({ redirectTo }: OnboardingViewProps) => {
	const { setPageProfile } = useAurora();
	const { state, refreshOnboardingStatus } = useOnboarding();
	const { t } = useLanguage();
	const searchParams = useSearchParams();

	// License modal state
	const [isLicenseModalOpen, setLicenseModalOpen] = useState(false);

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
		return (
			<div className="w-full flex items-center justify-center py-12">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">{t("onboarding.loading")}</p>
				</div>
			</div>
		);
	}

	// Redirect if fully onboarded (has profile, organization)
	if (state.userProfile.isComplete && state.hasOrganization) {
		const targetUrl = getAuthRedirectUrl(redirectTo);
		window.location.href = targetUrl;
		return (
			<div className="w-full flex items-center justify-center py-12">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">{t("onboarding.redirecting")}</p>
				</div>
			</div>
		);
	}

	// Step 1: Profile completion (name/avatar)
	const editProfile = searchParams.get("edit_profile") === "true";

	if (editProfile || !state.userProfile.isComplete) {
		return (
			<>
				<ProfileCompletionStep />
				<LicenseModal
					open={isLicenseModalOpen}
					onOpenChange={setLicenseModalOpen}
				/>
			</>
		);
	}

	// Step 2: If user has subscription but no organization, show org creation
	if (state.canCreateOrganization && !state.hasOrganization) {
		return (
			<>
				<CreateOrganizationStep redirectTo={redirectTo} />
				<LicenseModal
					open={isLicenseModalOpen}
					onOpenChange={setLicenseModalOpen}
				/>
			</>
		);
	}

	// Step 3: Subscription selection (or invitation handling)
	// User has completed profile but needs subscription/organization
	return (
		<>
			<SubscriptionSelectionStep
				onOpenLicenseModal={() => setLicenseModalOpen(true)}
			/>
			<LicenseModal
				open={isLicenseModalOpen}
				onOpenChange={setLicenseModalOpen}
			/>
		</>
	);
};
