"use client";

import { usePathname } from "next/navigation";

import { ThemeSwitcher } from "@janovix/auth-ui";
import { GlobalAuroraBackground } from "@/components/aurora";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { useLanguage } from "@/contexts/language-context";
import { AuroraProvider } from "@/contexts/aurora-context";
import { LanguageProvider } from "@/contexts/language-context";
import { OnboardingProvider } from "@/contexts/onboarding-context";
import { PageStatusProvider } from "@/contexts/page-status-context";
import { TurnstileProvider } from "@/contexts/turnstile-context";

// Turnstile site key from environment variable
// In production, this comes from Cloudflare Dashboard
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

function SettingsBar() {
	const { t } = useLanguage();
	return (
		<div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
			<LanguageSwitcher showIcon />
			<ThemeSwitcher
				labels={{
					theme: t("theme.label"),
					system: t("theme.system"),
					light: t("theme.light"),
					dark: t("theme.dark"),
				}}
			/>
		</div>
	);
}

function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuroraProvider>
			<div className="flex h-svh w-full flex-col overflow-hidden relative">
				{/* Aurora background - always shown on auth pages */}
				<GlobalAuroraBackground />

				{/* Language and Theme pickers - bottom right */}
				<SettingsBar />

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
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

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

	const content = (
		<>
			{isAuthRoute || isErrorPageRoute ? (
				<AuthLayout>{children}</AuthLayout>
			) : isOnboardingRoute ? (
				<OnboardingProvider>
					<AuroraProvider>{children}</AuroraProvider>
				</OnboardingProvider>
			) : (
				// Settings and other routes - no SettingsBar (they have their own controls in the header)
				children
			)}
			<Toaster position="top-right" richColors closeButton />
		</>
	);

	return (
		<ThemeProvider>
			<LanguageProvider>
				<PageStatusProvider>
					{TURNSTILE_SITE_KEY ? (
						<TurnstileProvider siteKey={TURNSTILE_SITE_KEY}>
							{content}
						</TurnstileProvider>
					) : (
						content
					)}
				</PageStatusProvider>
			</LanguageProvider>
		</ThemeProvider>
	);
}
