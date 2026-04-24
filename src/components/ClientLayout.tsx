"use client";

import { usePathname } from "next/navigation";

import { GlobalAuroraBackground } from "@/components/aurora";
import { NavSettingsBar } from "@/components/layout/NavSettingsBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuroraProvider } from "@/contexts/aurora-context";
import { LanguageProvider } from "@/contexts/language-context";
import { OnboardingProvider } from "@/contexts/onboarding-context";
import { ReferralAttributionClient } from "@/components/referral/ReferralAttributionClient";
import { PageStatusProvider } from "@/contexts/page-status-context";
import { TurnstileProvider } from "@/contexts/turnstile-context";
import { useSessionSync } from "@/lib/auth/useSessionSync";
import { DataEnvironmentProvider } from "@/components/DataEnvironmentProvider";

function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuroraProvider>
			<div className="flex h-svh w-full flex-col overflow-hidden relative">
				{/* Aurora background - always shown on auth pages */}
				<GlobalAuroraBackground />

				{/* Language and Theme pickers - top right */}
				<NavSettingsBar />

				{/* Main content area - scrollable, vertically centered when content fits */}
				<div className="flex-1 w-full flex flex-col items-center px-4 md:px-10 py-6 sm:py-8 relative z-10 overflow-y-auto min-h-0">
					<div className="flex w-full max-w-md flex-col gap-4 lg:gap-6 animate-form-fade-in my-auto">
						{children}
					</div>
				</div>
			</div>
		</AuroraProvider>
	);
}

export default function ClientLayout({
	children,
	turnstileSiteKey,
}: {
	children: React.ReactNode;
	/** Server-resolved site key; `null` when E2E bypass header matches (no widget). */
	turnstileSiteKey?: string | null;
}) {
	const pathname = usePathname();

	// Enable cross-tab session synchronization
	useSessionSync();

	// Show centered layout with backdrop blur for auth routes (excluding onboarding which has its own layout)
	const isAuthRoute =
		pathname === "/" ||
		pathname.startsWith("/login") ||
		pathname.startsWith("/recover") ||
		pathname.startsWith("/verify");

	// Error pages should also use the auth layout (centered with aurora background)
	const isErrorPageRoute =
		pathname.startsWith("/forbidden") || pathname.startsWith("/unauthorized");

	// Onboarding and invite routes have their own full-screen layout but need OnboardingProvider
	const isOnboardingRoute =
		pathname.startsWith("/onboarding") || pathname.startsWith("/invite");

	// Only enable Turnstile on auth routes (login, recover, verify)
	// Don't enable on authenticated pages (settings, account, etc.)
	const shouldEnableTurnstile = Boolean(isAuthRoute && turnstileSiteKey);

	const authContent = shouldEnableTurnstile ? (
		<TurnstileProvider siteKey={turnstileSiteKey!}>
			<AuthLayout>{children}</AuthLayout>
		</TurnstileProvider>
	) : (
		<AuthLayout>{children}</AuthLayout>
	);

	const content = (
		<>
			{isAuthRoute || isErrorPageRoute ? (
				authContent
			) : isOnboardingRoute ? (
				<OnboardingProvider>
					<AuroraProvider>
						<NavSettingsBar />
						{children}
					</AuroraProvider>
				</OnboardingProvider>
			) : (
				// Settings and other routes - no SettingsBar (they have their own controls in the header)
				children
			)}
			<ReferralAttributionClient />
			<Toaster />
		</>
	);

	return (
		<ThemeProvider>
			<LanguageProvider>
				<DataEnvironmentProvider>
					<PageStatusProvider>{content}</PageStatusProvider>
				</DataEnvironmentProvider>
			</LanguageProvider>
		</ThemeProvider>
	);
}
