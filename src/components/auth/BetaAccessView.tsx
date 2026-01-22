"use client";

import { signOut } from "@/lib/auth/authActions";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { Clock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui";
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
		<section className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
			<div className="mx-auto w-full max-w-lg">
				<Card className="border-border/50 shadow-lg">
					<CardHeader className="text-center pb-2">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							<Clock className="h-8 w-8 text-primary" aria-hidden="true" />
						</div>
						<CardTitle className="text-2xl font-semibold">
							{t("beta.title")}
						</CardTitle>
						{userName && (
							<CardDescription className="text-base">
								{t("beta.greeting").replace("{name}", userName)}
							</CardDescription>
						)}
					</CardHeader>

					<CardContent className="space-y-6 pt-4">
						<div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
							<Mail
								className="mt-0.5 h-5 w-5 text-muted-foreground flex-shrink-0"
								aria-hidden="true"
							/>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{t("beta.message")}
							</p>
						</div>

						<div className="text-center text-sm text-muted-foreground">
							<p>{t("beta.checkEmail")}</p>
						</div>
					</CardContent>

					<CardFooter className="flex flex-col gap-3 pt-2">
						<Button asChild variant="outline" className="w-full">
							<Link href="/login">
								<LogIn className="mr-2 h-4 w-4" />
								{t("beta.backToLogin")}
							</Link>
						</Button>
					</CardFooter>
				</Card>
			</div>
		</section>
	);
};

export default BetaAccessView;
