"use client";

import Link from "next/link";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useSetPageStatus } from "@/contexts/page-status-context";
import { ThemeSwitcher } from "@janovix/auth-ui";
import { GlobalAuroraBackground } from "@/components/aurora";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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

/**
 * Global 404 Not Found page.
 * Always renders with the full auth layout (logo, aurora background, lang/theme pickers)
 * to provide a consistent experience regardless of where the 404 occurs.
 */
export default function NotFound() {
	const { t } = useLanguage();

	// Set page status for breadcrumb display
	useSetPageStatus("not-found");

	return (
		<AuroraProvider>
			<div className="flex h-svh w-full flex-col overflow-hidden relative">
				{/* Aurora background */}
				<GlobalAuroraBackground />

				{/* Language and Theme pickers - bottom right */}
				<SettingsBar />

				{/* Main content area - centered */}
				<div className="flex-1 w-full flex flex-col items-center px-4 md:px-10 py-6 sm:py-8 relative z-10 overflow-y-auto min-h-0">
					<div className="flex w-full max-w-md flex-col gap-4 lg:gap-6 my-auto">
						<div className="flex justify-center mb-2">
							<Logo variant="logo" />
						</div>
						<Card>
							<CardHeader className="text-center">
								<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
									<FileQuestion className="h-10 w-10 text-muted-foreground" />
								</div>
								<CardTitle className="text-3xl font-bold">404</CardTitle>
								<CardDescription className="text-lg">
									{t("errorNotFoundTitle")}
								</CardDescription>
							</CardHeader>
							<CardContent className="text-center text-sm text-muted-foreground">
								<p>{t("errorNotFoundDescription")}</p>
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
					</div>
				</div>
			</div>
		</AuroraProvider>
	);
}
