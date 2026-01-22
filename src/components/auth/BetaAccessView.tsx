"use client";

import { signOut } from "@/lib/auth/authActions";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { Clock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button, Card, CardContent } from "@/components/ui";
import { useLanguage } from "@/contexts/language-context";

/**
 * BetaAccessView displays a waiting page for users with "visitor" role.
 *
 * This component is shown to users who have registered but have not yet
 * been promoted to "user" role by an admin. It informs them that:
 * - Their registration was received
 * - The platform is in beta phase
 * - They will receive an email when access is granted
 *
 * The session is automatically signed out on mount to prevent visitors
 * from having active sessions. The user sees the message and can return
 * to the login page.
 */
export const BetaAccessView = () => {
	const { t } = useLanguage();
	const session = useAuthSession();
	const data = session.data;
	const signOutAttempted = useRef(false);

	// Auto sign-out if there's an active session (visitor session cleanup)
	useEffect(() => {
		if (signOutAttempted.current) return;
		if (session.isPending) return; // Wait for session to load
		if (!data) return; // No session, nothing to sign out

		signOutAttempted.current = true;

		// Sign out in background without redirect
		signOut().catch((error) => {
			console.error("[BetaAccess] Failed to sign out:", error);
		});
	}, [session.isPending, data]);

	const userName = data?.user?.name || data?.user?.email?.split("@")[0] || "";

	return (
		<div className="w-full flex justify-center my-auto pt-6 px-3">
			<div className="w-full max-w-lg">
				{/* Header with Logo and Icon */}
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<Logo variant="logo" />
					</div>
					<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
						<Clock className="h-8 w-8 text-primary" aria-hidden="true" />
					</div>
					<h1 className="text-2xl font-bold text-foreground mb-2">
						{t("beta.title")}
					</h1>
					{userName && (
						<p className="text-muted-foreground">
							{t("beta.greeting").replace("{name}", userName)}
						</p>
					)}
				</div>

				{/* Main Card */}
				<Card>
					<CardContent className="pt-6 space-y-6">
						{/* Message Box */}
						<div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
							<Mail
								className="mt-0.5 h-5 w-5 text-muted-foreground flex-shrink-0"
								aria-hidden="true"
							/>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{t("beta.message")}
							</p>
						</div>

						{/* Check Email Note */}
						<div className="text-center text-sm text-muted-foreground">
							<p>{t("beta.checkEmail")}</p>
						</div>

						{/* Back to Login Button */}
						<Button asChild variant="outline" className="w-full h-12" size="lg">
							<Link href="/login">
								<LogIn className="mr-2 h-4 w-4" />
								{t("beta.backToLogin")}
							</Link>
						</Button>

						{/* Footer Note */}
						<div className="text-center">
							<p className="text-xs text-muted-foreground">
								{t("beta.footerNote")}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Footer with Language/Theme Switchers */}
				<div className="border-t border-border pt-6 mt-6 flex items-center justify-center gap-2">
					<LanguageSwitcher showIcon />
					<ThemeSwitcher />
				</div>
			</div>
		</div>
	);
};

export default BetaAccessView;
