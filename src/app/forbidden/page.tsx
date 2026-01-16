"use client";

import Link from "next/link";
import { ArrowLeft, Home, ShieldX } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useSetPageStatus } from "@/contexts/page-status-context";
import { ErrorPageLayout } from "@/components/auth/ErrorPageLayout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ForbiddenPage() {
	const { t } = useLanguage();

	// Set page status for breadcrumb display
	useSetPageStatus("forbidden");

	return (
		<ErrorPageLayout>
			<Card>
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<ShieldX className="h-8 w-8 text-destructive" />
					</div>
					<CardTitle className="text-2xl font-semibold">
						{t("errorForbiddenTitle")}
					</CardTitle>
					<CardDescription className="text-base">
						{t("errorForbiddenDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent className="text-center text-sm text-muted-foreground">
					<p>{t("errorForbiddenReason")}</p>
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
