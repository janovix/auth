"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Gift, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button, Label, Badge } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";
import { SettingsCard, SettingsSection } from "@/components/settings";
import { fetchReferralMe, generateReferralCode, type ReferralMeData } from "@/lib/referrals";
import { cn } from "@/lib/utils";

export function ReferralSettingsCard() {
	const { language } = useLanguage();
	const [data, setData] = useState<ReferralMeData | null>(null);
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const isEn = language === "en" || !language;

	const load = useCallback(async () => {
		setLoading(true);
		const res = await fetchReferralMe();
		if (res.ok && res.data) {
			setData(res.data);
		} else {
			setData({
				code: null,
				shareUrl: null,
				successfulReferrals: 0,
				recentConversions: [],
			});
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const onGenerate = async () => {
		setGenerating(true);
		try {
			const res = await generateReferralCode();
			if (!res.ok || !res.data) {
				toast.error(res.error || (isEn ? "Could not create code" : "No se pudo crear el código"));
				return;
			}
			setData((prev) => ({
				...(prev ?? {
					code: null,
					shareUrl: null,
					successfulReferrals: 0,
					recentConversions: [],
				}),
				code: res.data!.code,
				shareUrl: res.data!.shareUrl,
			}));
			toast.success(
				isEn ? "Your referral code is ready" : "Tu código de referido está listo",
			);
		} finally {
			setGenerating(false);
		}
	};

	const onCopy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(isEn ? "Copied" : "Copiado");
		} catch {
			toast.error(isEn ? "Copy failed" : "Error al copiar");
		}
	};

	if (loading) {
		return (
			<SettingsSection
				title={isEn ? "Referrals" : "Referidos"}
				description={isEn ? "Invite others and grow together." : "Invita a otros a unirse."}
			>
				<SettingsCard>
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<Loader2 className="h-4 w-4 animate-spin" />
						{isEn ? "Loading…" : "Cargando…"}
					</div>
				</SettingsCard>
			</SettingsSection>
		);
	}

	const hasCode = Boolean(data?.code);
	const count = data?.successfulReferrals ?? 0;
	const list = data?.recentConversions ?? [];
	const shareUrl = data?.shareUrl ?? "";
	const code = data?.code ?? "";

	return (
		<SettingsSection
			title={isEn ? "Referral program" : "Programa de referidos"}
			description={
				isEn
					? "Generate a code once, share the link. We count successful sign-ups (first paid subscription invoice or enterprise license)."
					: "Genera un código único, comparte el enlace. Contamos suscripciones pagadas o licencias enterprise."
			}
		>
			<SettingsCard>
				{!hasCode ? (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							{isEn
								? "You don’t have a code yet. Generate a single 8‑character code to share. When someone joins from your link and subscribes or redeems a license, it counts as a success."
								: "Aún no tienes un código. Genera un código único para compartir. Cuando alguien se una desde tu enlace y pague o active una licencia, contará como éxito."}
						</p>
						<Button onClick={onGenerate} disabled={generating} className="gap-2">
							{generating ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Gift className="h-4 w-4" />
							)}
							{isEn ? "Generate my referral code" : "Generar mi código de referido"}
						</Button>
					</div>
				) : (
					<div className="space-y-6">
						<div className="grid gap-4 sm:grid-cols-2 sm:items-end">
							<div className="space-y-2">
								<Label className="flex items-center gap-1">
									<Users className="h-3.5 w-3.5" />
									{isEn ? "Successful referrals" : "Referidos exitosos"}
								</Label>
								<div
									className={cn(
										"text-3xl font-semibold tabular-nums",
										count > 0 ? "text-foreground" : "text-muted-foreground",
									)}
								>
									{count}
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="refCode">{isEn ? "Your code" : "Tu código"}</Label>
								<div className="flex gap-2">
									<Input
										id="refCode"
										readOnly
										className="font-mono"
										value={code}
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={() => onCopy(code)}
										aria-label={isEn ? "Copy code" : "Copiar código"}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="refUrl">{isEn ? "Share link" : "Enlace para compartir"}</Label>
							<div className="flex flex-col sm:flex-row gap-2">
								<Input
									id="refUrl"
									readOnly
									className="font-mono text-xs"
									value={shareUrl}
								/>
								<Button
									type="button"
									variant="secondary"
									onClick={() => onCopy(shareUrl)}
									className="shrink-0"
								>
									<Copy className="h-4 w-4 sm:mr-1" />
									{isEn ? "Copy link" : "Copiar enlace"}
								</Button>
							</div>
						</div>
						{list.length > 0 && (
							<div>
								<h4 className="text-sm font-medium mb-2">
									{isEn ? "Recent successful referrals" : "Referidos recientes exitosos"}
								</h4>
								<ul className="text-sm text-muted-foreground space-y-1.5 list-none p-0 m-0">
									{list.map((row) => (
										<li
											key={`${row.maskedEmail}-${row.convertedAt}`}
											className="flex flex-wrap items-center gap-2"
										>
											<span>{row.maskedEmail}</span>
											<Badge variant="secondary" className="text-xs font-normal">
												{row.conversionType}
											</Badge>
											<span className="text-xs text-muted-foreground/80">
												{new Date(row.convertedAt).toLocaleString()}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}
			</SettingsCard>
		</SettingsSection>
	);
}
