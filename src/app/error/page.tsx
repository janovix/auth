"use client";

import Link from "next/link";
import { ArrowLeft, Home, ServerCrash } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useSetPageStatus } from "@/contexts/page-status-context";
import { ErrorPageLayout } from "@/components/auth/ErrorPageLayout";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

/**
 * Signin Error page.
 * Displays when there's an error during the signin process.
 * Uses the same layout as the 404/forbidden pages for consistency.
 */
export default function SigninErrorPage() {
	const { t } = useLanguage();

	// Set page status for breadcrumb display
	useSetPageStatus("error");

	return (
		<ErrorPageLayout>
			<Card>
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<Logo variant="logo" />
					</div>
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<ServerCrash className="h-8 w-8 text-destructive" />
					</div>
					<CardTitle className="text-2xl font-semibold">
						{t("errorSigninTitle")}
					</CardTitle>
					<CardDescription className="text-base">
						{t("errorSigninDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent className="text-center text-sm text-muted-foreground">
					<p>{t("errorServerHelp")}</p>
				</CardContent>
				<CardFooter className="flex gap-3 pb-6">
					<Button
						variant="outline"
						className="flex-1"
						onClick={() => window.history.back()}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("errorGoBack")}
					</Button>
					<Button asChild className="flex-1">
						<Link href="/">
							<Home className="mr-2 h-4 w-4" />
							{t("errorHome")}
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</ErrorPageLayout>
	);
}
