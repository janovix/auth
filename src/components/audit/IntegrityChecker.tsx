"use client";

import { useState, useCallback } from "react";
import { ShieldCheck, ShieldAlert, Loader2, RefreshCw } from "lucide-react";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { useLanguage } from "@/contexts/language-context";
import { verifyChainIntegrity, type ChainIntegrityResult } from "@/lib/audit";

export function IntegrityChecker() {
	const { t } = useLanguage();
	const [checking, setChecking] = useState(false);
	const [result, setResult] = useState<ChainIntegrityResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleVerify = useCallback(async () => {
		setChecking(true);
		setError(null);
		try {
			const res = await verifyChainIntegrity();
			setResult(res);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Verification failed");
		} finally {
			setChecking(false);
		}
	}, []);

	return (
		<Card>
			<CardHeader className="py-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm flex items-center gap-2">
						{result?.valid === true && (
							<ShieldCheck className="h-4 w-4 text-green-500" />
						)}
						{result?.valid === false && (
							<ShieldAlert className="h-4 w-4 text-red-500" />
						)}
						{result === null && (
							<ShieldCheck className="h-4 w-4 text-muted-foreground" />
						)}
						{t("audit.integrity.title")}
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={handleVerify}
						disabled={checking}
					>
						{checking ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<RefreshCw className="h-4 w-4" />
						)}
						<span className="ml-2">{t("audit.integrity.verify")}</span>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{error && (
					<div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
						{error}
					</div>
				)}

				{result && !error && (
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground">
								{t("audit.integrity.status")}:
							</span>
							{result.valid ? (
								<span className="text-green-600 dark:text-green-400 font-medium">
									{t("audit.integrity.valid")}
								</span>
							) : (
								<span className="text-red-600 dark:text-red-400 font-medium">
									{t("audit.integrity.invalid")}
								</span>
							)}
						</div>
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground">
								{t("audit.integrity.verified")}:
							</span>
							<span>
								{result.totalVerified} {t("audit.integrity.entries")}
							</span>
						</div>
						{result.brokenAt && (
							<div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-800 dark:text-red-300">
								<p className="font-medium">{t("audit.integrity.brokenAt")}:</p>
								<code className="text-xs font-mono">{result.brokenAt}</code>
								{result.error && <p className="mt-1 text-xs">{result.error}</p>}
							</div>
						)}
					</div>
				)}

				{!result && !error && !checking && (
					<p className="text-sm text-muted-foreground">
						{t("audit.integrity.description")}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
