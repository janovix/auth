"use client";

import {
	ArrowLeft,
	CheckCircle2,
	LogIn,
	MailCheck,
	XCircle,
} from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { useLanguage } from "@/contexts/language-context";

type VerifyEmailViewProps = {
	success?: boolean;
	error?: string;
	email?: string;
};

/**
 * VerifyEmailView - Success/error page for email verification.
 *
 * This page is shown after successful OTP verification or if there's an error.
 * Note: Email verification now uses OTP codes entered inline in the signup flow,
 * so this page mainly serves as a success confirmation or error display.
 */
export const VerifyEmailView = ({ success, error }: VerifyEmailViewProps) => {
	const { t } = useLanguage();

	// Determine the current state for card description
	const getDescription = () => {
		if (success) {
			return t("verify.success.description");
		}
		if (error) {
			return t("verify.error.description");
		}
		return t("verify.default.description");
	};

	return (
		<div className="flex flex-col gap-4 sm:gap-6 w-full">
			<div className="flex justify-center mb-2">
				<Logo variant="logo" />
			</div>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">{t("verify.title")}</CardTitle>
					<CardDescription>{getDescription()}</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						{/* Success State */}
						{success ? (
							<>
								<Field>
									<Alert role="status" data-testid="verify-success-alert">
										<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
										<AlertTitle>{t("verify.success.title")}</AlertTitle>
										<AlertDescription>
											{t("verify.success.message")}
										</AlertDescription>
									</Alert>
								</Field>

								<Field>
									<div className="flex items-start gap-3 rounded-lg border border-dashed border-primary/20 bg-muted/40 p-4 text-sm">
										<MailCheck
											className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
											aria-hidden="true"
										/>
										<p className="text-muted-foreground">
											{t("verify.success.ready")}
										</p>
									</div>
								</Field>

								<Field>
									<Button asChild className="w-full">
										<Link href="/login">
											<LogIn className="h-4 w-4" aria-hidden="true" />
											{t("verify.success.button")}
										</Link>
									</Button>
								</Field>
							</>
						) : null}

						{/* Error State */}
						{error && !success ? (
							<>
								<Field>
									<Alert
										variant="destructive"
										role="alert"
										data-testid="verify-error-alert"
									>
										<XCircle className="h-4 w-4" aria-hidden="true" />
										<AlertTitle>{t("verify.error.title")}</AlertTitle>
										<AlertDescription>
											{t("verify.error.message")}
										</AlertDescription>
									</Alert>
								</Field>

								<Field>
									<Button asChild className="w-full">
										<Link href="/login">
											<LogIn className="h-4 w-4" aria-hidden="true" />
											{t("verify.success.button")}
										</Link>
									</Button>
								</Field>

							</>
						) : null}

						{/* Default State - No success or error */}
						{!success && !error ? (
							<>
								<Field>
									<div className="flex items-start gap-3 rounded-lg border border-dashed border-primary/20 bg-muted/40 p-4 text-sm">
										<MailCheck
											className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
											aria-hidden="true"
										/>
										<p className="text-muted-foreground">
											{t("verify.default.message")}
										</p>
									</div>
								</Field>

								<Field>
									<FieldDescription className="text-center">
										<Link
											href="/login"
											className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
										>
											<ArrowLeft className="h-3 w-3" aria-hidden="true" />
											{t("verify.default.backToLogin")}
										</Link>
									</FieldDescription>
								</Field>
							</>
						) : null}
					</FieldGroup>
				</CardContent>
			</Card>
		</div>
	);
};
