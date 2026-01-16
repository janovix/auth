"use client";

import Link from "next/link";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useSetPageStatus } from "@/contexts/page-status-context";
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
 * Settings-specific 404 Not Found page.
 * Renders within the settings layout (which has its own header with breadcrumbs).
 */
export default function SettingsNotFound() {
	const { t } = useLanguage();

	// Set page status for breadcrumb display
	useSetPageStatus("not-found");

	return (
		<div className="flex flex-1 items-center justify-center p-4">
			<Card className="w-full max-w-md">
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
						<Link href="/settings">
							<Home className="mr-2 h-4 w-4" />
							{t("settings.title")}
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
