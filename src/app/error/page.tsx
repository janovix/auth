"use client";

import Link from "next/link";
import { Home, ServerCrash } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useSetPageStatus } from "@/contexts/page-status-context";
import { GlobalAuroraBackground } from "@/components/aurora";
import { NavSettingsBar } from "@/components/layout/NavSettingsBar";
import { Logo } from "@/components/Logo";
import { AuroraProvider } from "@/contexts/aurora-context";
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
 * Uses the same layout as the 404 page for consistency.
 */
export default function SigninErrorPage() {
	const { t } = useLanguage();

	// Set page status for breadcrumb display
	useSetPageStatus("error");

	return (
		<AuroraProvider>
			<div className="flex h-svh w-full flex-col overflow-hidden relative">
				{/* Aurora background */}
				<GlobalAuroraBackground />

				{/* Language and Theme pickers - top right */}
				<NavSettingsBar />

				{/* Main content area - centered */}
				<div className="flex-1 w-full flex flex-col items-center px-4 md:px-10 py-6 sm:py-8 relative z-10 overflow-y-auto min-h-0">
					<div className="flex w-full max-w-md flex-col gap-4 lg:gap-6 my-auto">
						<div className="flex justify-center mb-2">
							<Logo variant="logo" />
						</div>
						<Card>
							<CardHeader className="text-center">
								<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
									<ServerCrash className="h-10 w-10 text-destructive" />
								</div>
								<CardTitle className="text-3xl font-bold">
									{t("errorSigninTitle")}
								</CardTitle>
								<CardDescription className="text-lg">
									{t("errorSigninDescription")}
								</CardDescription>
							</CardHeader>
							<CardContent className="text-center text-sm text-muted-foreground">
								<p>{t("errorServerHelp")}</p>
							</CardContent>
							<CardFooter className="flex gap-3 pb-6">
								<Button asChild className="flex-1">
									<Link href="/">
										<Home className="mr-2 h-4 w-4" />
										{t("errorHome")}
									</Link>
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</AuroraProvider>
	);
}
