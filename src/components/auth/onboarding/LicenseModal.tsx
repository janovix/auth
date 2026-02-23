"use client";

import { useState } from "react";
import { Key, Check, Loader2, AlertCircle, Building2 } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboarding, type License } from "@/contexts/onboarding-context";
import { useLanguage } from "@/contexts/language-context";

interface LicenseModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LicenseModal({ open, onOpenChange }: LicenseModalProps) {
	const { t } = useLanguage();
	const { validateLicense, activateLicense, refreshOnboardingStatus } =
		useOnboarding();

	const [licenseKey, setLicenseKey] = useState("");
	const [isValidating, setIsValidating] = useState(false);
	const [isActivating, setIsActivating] = useState(false);
	const [validatedLicense, setValidatedLicense] = useState<License | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);

	const handleValidate = async () => {
		if (!licenseKey.trim()) return;

		setIsValidating(true);
		setError(null);
		setValidatedLicense(null);

		const result = await validateLicense(licenseKey.trim());

		setIsValidating(false);

		if (!result.valid || !result.license) {
			setError(result.error || t("onboarding.license.invalid"));
			return;
		}

		setValidatedLicense(result.license);
	};

	const handleActivate = async () => {
		if (!validatedLicense) return;

		setIsActivating(true);
		setError(null);

		const result = await activateLicense(validatedLicense);

		setIsActivating(false);

		if (!result.success) {
			setError(result.error || t("onboarding.license.activateFailed"));
			return;
		}

		// Refresh onboarding status and close modal
		await refreshOnboardingStatus();
		onOpenChange(false);
		resetState();
	};

	const resetState = () => {
		setLicenseKey("");
		setValidatedLicense(null);
		setError(null);
		setIsValidating(false);
		setIsActivating(false);
	};

	const handleClose = () => {
		onOpenChange(false);
		resetState();
	};

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return t("onboarding.license.noExpiration");
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatLimit = (value: number | undefined) => {
		if (value === undefined || value === null) return "—";
		if (value === 0) return t("onboarding.license.unlimited");
		return value.toLocaleString();
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
						<Key className="h-6 w-6 text-primary" />
					</div>
					<DialogTitle>{t("onboarding.license.title")}</DialogTitle>
					<DialogDescription>
						{t("onboarding.license.description")}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{error && (
						<div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
							<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					{!validatedLicense ? (
						<div className="space-y-2">
							<Label htmlFor="license-key">
								{t("onboarding.license.label")}
							</Label>
							<div className="flex gap-2">
								<Input
									id="license-key"
									placeholder="XXXX-XXXX-XXXX-XXXX"
									value={licenseKey}
									onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
									className="font-mono tracking-wider"
									disabled={isValidating}
								/>
								<Button
									onClick={handleValidate}
									disabled={!licenseKey.trim() || isValidating}
								>
									{isValidating ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										t("onboarding.license.validate")
									)}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								{t("onboarding.license.contactAdmin")}
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{/* Validated License Info */}
							<div className="rounded-lg border border-success/30 bg-success/5 p-4">
								<div className="flex items-center gap-2 text-success font-medium mb-3">
									<Check className="h-4 w-4" />
									{t("onboarding.license.valid")}
								</div>
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<Building2 className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">
											{t("onboarding.license.organization")}:
										</span>
										<span className="font-medium text-foreground">
											{validatedLicense.organizationName}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											{t("onboarding.license.plan")}:
										</span>
										<span className="font-medium text-foreground">
											{validatedLicense.plan}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											{t("onboarding.license.validUntil")}:
										</span>
										<span className="font-medium text-foreground">
											{formatDate(validatedLicense.expiresAt)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											{t("onboarding.license.users")}:
										</span>
										<span className="font-medium text-foreground">
											{formatLimit(validatedLicense.limits?.maxUsers)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											{t("onboarding.license.notices")}:
										</span>
										<span className="font-medium text-foreground">
											{formatLimit(validatedLicense.limits?.noticesPerMonth)}
										</span>
									</div>
								</div>
							</div>

							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => {
									setValidatedLicense(null);
									setLicenseKey("");
								}}
							>
								{t("onboarding.license.useDifferent")}
							</Button>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="ghost" onClick={handleClose}>
						{t("onboarding.license.cancel")}
					</Button>
					{validatedLicense && (
						<Button onClick={handleActivate} disabled={isActivating}>
							{isActivating ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{t("onboarding.license.activating")}
								</>
							) : (
								t("onboarding.license.activate")
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
