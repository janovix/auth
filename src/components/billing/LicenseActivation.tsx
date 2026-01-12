"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";
import type { LicenseStatus } from "@/lib/billing";
import { formatDate } from "@/lib/billing";
import { Key, Check, AlertCircle, Shield } from "lucide-react";

interface LicenseActivationProps {
	license: LicenseStatus | null;
	onActivate: (licenseKey: string) => Promise<void>;
	isOwner: boolean;
	loading?: boolean;
}

export function LicenseActivation({
	license,
	onActivate,
	isOwner,
	loading,
}: LicenseActivationProps) {
	const { t } = useLanguage();
	const [licenseKey, setLicenseKey] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isActivating, setIsActivating] = useState(false);

	const handleActivate = async () => {
		if (!licenseKey.trim()) return;

		setIsActivating(true);
		setError(null);

		try {
			await onActivate(licenseKey.trim());
			setLicenseKey("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Activation failed");
		} finally {
			setIsActivating(false);
		}
	};

	// If license is active, show status
	if (license?.isActive) {
		return (
			<Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Shield className="h-5 w-5 text-emerald-600" />
							<CardTitle className="text-emerald-900 dark:text-emerald-100">
								{t("settings.billing.enterprise")}
							</CardTitle>
						</div>
						<Badge className="bg-emerald-500 hover:bg-emerald-600">
							<Check className="h-3 w-3 mr-1" />
							{t("settings.billing.licenseActive")}
						</Badge>
					</div>
					{license.customerName && (
						<CardDescription className="text-emerald-700 dark:text-emerald-300">
							{license.customerName}
						</CardDescription>
					)}
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">
								{t("settings.billing.notices")}:
							</span>
							<span className="ml-2 font-medium">
								{license.limits.noticesPerMonth}/month
							</span>
						</div>
						<div>
							<span className="text-muted-foreground">
								{t("settings.billing.users")}:
							</span>
							<span className="ml-2 font-medium">
								{license.limits.maxUsers} max
							</span>
						</div>
					</div>

					<div className="flex items-center gap-2 text-sm">
						<span className="text-muted-foreground">
							{t("settings.billing.licenseExpires").replace(
								"{date}",
								formatDate(license.expiresAt),
							)}
						</span>
						{license.daysUntilExpiry < 30 && (
							<Badge variant="destructive" className="text-xs">
								{license.daysUntilExpiry} days left
							</Badge>
						)}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Show activation form
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Key className="h-5 w-5 text-muted-foreground" />
					<CardTitle>{t("settings.billing.enterprise")}</CardTitle>
				</div>
				<CardDescription>
					Have an enterprise license? Activate it here.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{isOwner ? (
					<>
						<div className="space-y-2">
							<Label htmlFor="licenseKey">License Key</Label>
							<Input
								id="licenseKey"
								placeholder={t("settings.billing.licensePlaceholder")}
								value={licenseKey}
								onChange={(e) => setLicenseKey(e.target.value)}
								disabled={isActivating || loading}
								className="font-mono text-sm"
							/>
						</div>

						{error && (
							<div className="flex items-center gap-2 text-sm text-destructive">
								<AlertCircle className="h-4 w-4" />
								{error}
							</div>
						)}

						<Button
							onClick={handleActivate}
							disabled={!licenseKey.trim() || isActivating || loading}
						>
							{isActivating
								? "Activating..."
								: t("settings.billing.activateLicense")}
						</Button>
					</>
				) : (
					<p className="text-sm text-muted-foreground">
						{t("settings.billing.ownerOnly")}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
