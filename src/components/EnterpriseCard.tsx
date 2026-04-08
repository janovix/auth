"use client";

import { useState, useEffect } from "react";
import { Building2, ExternalLink, Key, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";
import { TaxComplianceBanner } from "@/components/TaxComplianceBanner";

interface EnterpriseCardProps {
	/** Called when the user submits a license key. Should resolve after
	 *  activation (or after showing a confirmation dialog). */
	onRedeem: (key: string) => Promise<void>;
	/** When true, the license key field is shown expanded on mount (e.g. license-only onboarding). */
	defaultLicenseInputExpanded?: boolean;
}

export function EnterpriseCard({
	onRedeem,
	defaultLicenseInputExpanded = false,
}: EnterpriseCardProps) {
	const { t } = useLanguage();
	const [showInput, setShowInput] = useState(defaultLicenseInputExpanded);
	const [licenseKey, setLicenseKey] = useState("");

	useEffect(() => {
		if (defaultLicenseInputExpanded) {
			setShowInput(true);
		}
	}, [defaultLicenseInputExpanded]);
	const [isRedeeming, setIsRedeeming] = useState(false);

	const handleSubmit = async () => {
		if (!licenseKey.trim()) return;
		setIsRedeeming(true);
		try {
			await onRedeem(licenseKey.trim());
			setLicenseKey("");
			setShowInput(false);
		} finally {
			setIsRedeeming(false);
		}
	};

	return (
		<Card className="border-border bg-card">
			<CardContent className="p-6 flex flex-col gap-5">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-4">
						<div className="h-12 w-12 rounded-xl bg-secondary flex shrink-0 items-center justify-center">
							<Building2 className="h-6 w-6 text-foreground" />
						</div>
						<div>
							<h3 className="text-base font-bold text-foreground">
								{t("onboarding.plans.enterprise.title")}
							</h3>
							<p className="text-sm text-muted-foreground">
								{t("onboarding.plans.enterprise.description")}
							</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-2 shrink-0">
						<Button variant="outline" className="gap-2 bg-transparent" asChild>
							<a
								href="https://www.janovix.com/contact"
								target="_blank"
								rel="noopener noreferrer"
							>
								{t("onboarding.plans.enterprise.contact")}
								<ExternalLink className="h-4 w-4" />
							</a>
						</Button>
						<Button
							variant="default"
							className="gap-2"
							onClick={() => setShowInput((v) => !v)}
						>
							<Key className="h-4 w-4" />
							{t("onboarding.plans.enterprise.license")}
						</Button>
					</div>
				</div>

				{showInput && (
					<div className="pt-1 border-t border-border">
						<div className="flex gap-2 mt-3">
							<div className="flex-1">
								<Label htmlFor="enterprise-license-key" className="sr-only">
									{t("settings.billing.licenseKey")}
								</Label>
								<Input
									id="enterprise-license-key"
									placeholder={t("settings.billing.licenseKeyPlaceholder")}
									value={licenseKey}
									onChange={(e) => setLicenseKey(e.target.value)}
									disabled={isRedeeming}
									autoFocus
								/>
							</div>
							<Button
								onClick={handleSubmit}
								disabled={!licenseKey.trim() || isRedeeming}
							>
								{isRedeeming ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									t("settings.billing.redeem")
								)}
							</Button>
						</div>
					</div>
				)}

				<TaxComplianceBanner />
			</CardContent>
		</Card>
	);
}
