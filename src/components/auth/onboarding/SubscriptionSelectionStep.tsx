"use client";

import * as Sentry from "@sentry/nextjs";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail, LogOut, Loader2, Pencil } from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { ThemeSwitcher, LanguageSwitcher } from "@algenium/blocks";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language-context";

const languages = [
	{ key: "en", label: "EN", nativeName: "English" },
	{ key: "es", label: "ES", nativeName: "Español" },
];
import { useOnboarding, type Plan } from "@/contexts/onboarding-context";
import { authClient } from "@/lib/auth/authClient";
import { signOut } from "@/lib/auth/authActions";
import {
	getPublicPlans,
	getSubscriptionPrice,
	activateLicenseKey,
	type PublicPlanInfo,
} from "@/lib/billing";
import {
	PricingTable,
	SettingsPageHeader,
	SettingsSection,
} from "@/components/settings";
import { useToast } from "@/hooks/use-toast";
import { PlanSelectionGrid } from "@/components/PlanSelectionGrid";
import { EnterpriseCard } from "@/components/EnterpriseCard";
import { WatchlistCard } from "@/components/WatchlistCard";

export function SubscriptionSelectionStep() {
	const { language, setLanguage, t } = useLanguage();
	const { toast } = useToast();
	const router = useRouter();
	const searchParams = useSearchParams();
	const {
		state,
		setSelectedPlan,
		startSubscriptionFlow,
		refreshOnboardingStatus,
	} = useOnboarding();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [plans, setPlans] = useState<PublicPlanInfo[]>([]);
	const [isLoadingPlans, setIsLoadingPlans] = useState(true);

	// Fetch plans from API
	useEffect(() => {
		async function loadPlans() {
			try {
				const fetchedPlans = await getPublicPlans();
				// Sort plans by subscription price (lowest first)
				fetchedPlans.sort((a, b) => {
					const priceA = getSubscriptionPrice(a)?.amount ?? 0;
					const priceB = getSubscriptionPrice(b)?.amount ?? 0;
					return priceA - priceB;
				});
				setPlans(fetchedPlans);
			} catch (error) {
				console.error("Failed to load plans:", error);
			} finally {
				setIsLoadingPlans(false);
			}
		}
		loadPlans();
	}, []);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await signOut();
		window.location.href = "/login";
	};

	const handleSelectPlan = async (plan: PublicPlanInfo) => {
		setIsRedirecting(true);
		try {
			const subscriptionPrice = getSubscriptionPrice(plan);
			const selectedPlan: Plan = {
				id: plan.name,
				name: plan.displayName,
				price: subscriptionPrice ? subscriptionPrice.amount / 100 : 0,
			};
			setSelectedPlan(selectedPlan);

			// Get current URL for success/cancel redirects
			const baseUrl = window.location.origin;
			const successUrl = `${baseUrl}/onboarding?subscription_success=true`;
			const cancelUrl = `${baseUrl}/onboarding?subscription_canceled=true`;

			const result = await startSubscriptionFlow(
				selectedPlan,
				successUrl,
				cancelUrl,
			);

			if (result.url) {
				window.location.href = result.url;
			}
		} catch (error) {
			console.error("Failed to start subscription:", error);
			setIsRedirecting(false);
		}
	};

	const handleGoToInvite = () => {
		router.push("/invite");
	};

	const handleEditProfile = () => {
		const redirectTo = searchParams.get("redirect_to");
		const editUrl = new URL("/onboarding", window.location.origin);
		editUrl.searchParams.set("edit_profile", "true");
		if (redirectTo) {
			editUrl.searchParams.set("redirect_to", redirectTo);
		}
		router.push(editUrl.toString());
	};

	const handleRedeemLicense = async (key: string) => {
		try {
			await activateLicenseKey(key);
			await refreshOnboardingStatus();
		} catch (error) {
			Sentry.captureException(error, {
				tags: { context: "license-activation-error" },
			});
			toast({
				title: t("settings.billing.error"),
				description: error instanceof Error ? error.message : undefined,
				variant: "destructive",
			});
			throw error;
		}
	};

	const firstName =
		state.userProfile.firstName || t("onboarding.plans.welcomeFallback");

	// Determine which plan is recommended (middle tier - pro)
	const recommendedPlan = "pro";

	return (
		<div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-10 space-y-8">
			<div className="flex items-center justify-between gap-4">
				<Logo variant="logo" />
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<span className="hidden sm:inline">
						{state.userProfile.firstName} {state.userProfile.lastName}
					</span>
					<div className="relative">
						<Avatar className="h-8 w-8">
							<AvatarImage src={state.userProfile.avatarUrl || undefined} />
							<AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
								{state.userProfile.firstName.charAt(0)}
								{state.userProfile.lastName.charAt(0)}
							</AvatarFallback>
						</Avatar>
						<Button
							type="button"
							variant="secondary"
							size="icon"
							className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full shadow-sm"
							onClick={handleEditProfile}
							disabled={isLoggingOut || isRedirecting}
							aria-label={t("onboarding.plans.editProfile")}
						>
							<Pencil className="h-3 w-3" />
						</Button>
					</div>
				</div>
			</div>

			<SettingsPageHeader
				icon={Sparkles}
				title={t("onboarding.plans.title")}
				description={t("onboarding.plans.description")}
			/>
			<p className="text-sm text-muted-foreground -mt-4">
				{t("onboarding.plans.note")}
			</p>

			<div className="text-center">
				<div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
					<Sparkles className="h-4 w-4" />
					{t("onboarding.plans.welcome").replace("{name}", firstName)}
				</div>
			</div>

			<SettingsSection
				title={t("onboarding.plans.before.title")}
				description={t("onboarding.plans.before.description")}
			>
				<div className="space-y-4">
					{state.pendingInvitation ? (
						<Card className="border-primary/30 bg-primary/10 shadow-lg shadow-primary/10">
							<CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<div className="flex items-start gap-3">
									<div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
										<Mail className="h-5 w-5 text-primary" />
									</div>
									<div>
										<p className="text-base font-semibold text-foreground mb-1">
											{t("onboarding.plans.invite.title")}
										</p>
										<p className="text-sm text-muted-foreground">
											{t("onboarding.plans.invite.description")
												.replace(
													"{inviter}",
													state.pendingInvitation.inviterName ||
														t("onboarding.invite.someone"),
												)
												.replace(
													"{organization}",
													state.pendingInvitation.organizationName,
												)}
										</p>
									</div>
								</div>
								<Button
									variant="default"
									size="lg"
									className="shrink-0 gap-2"
									onClick={handleGoToInvite}
								>
									<Mail className="h-4 w-4" />
									{t("onboarding.plans.invite.cta")}
								</Button>
							</CardContent>
						</Card>
					) : (
						<Card className="border-border bg-muted/50">
							<CardContent className="p-4 flex items-start gap-3">
								<Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
								<div>
									<p className="text-sm font-medium text-foreground">
										{t("onboarding.plans.invite.empty.title")}
									</p>
									<p className="text-sm text-muted-foreground">
										{t("onboarding.plans.invite.empty.description")}
									</p>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</SettingsSection>

			<SettingsSection
				title={t("onboarding.plans.select.title")}
				description={t("onboarding.plans.select.description")}
			>
				{isLoadingPlans ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : (
					<div className="space-y-6">
						<PlanSelectionGrid
							plans={plans}
							onSelectPlan={handleSelectPlan}
							isActionLoading={isRedirecting}
							recommendedPlan={recommendedPlan}
						/>

						<EnterpriseCard onRedeem={handleRedeemLicense} />

						{(() => {
							const watchlistPlan = plans.find((p) => p.name === "watchlist");
							const subscriptionPrice = watchlistPlan
								? getSubscriptionPrice(watchlistPlan)
								: null;
							return (
								<WatchlistCard
									displayPrice={subscriptionPrice?.amount ?? 49900}
									interval={subscriptionPrice?.interval ?? "month"}
									onSelect={() =>
										watchlistPlan ? handleSelectPlan(watchlistPlan) : undefined
									}
									isLoading={isRedirecting}
									canSubscribe={Boolean(watchlistPlan && subscriptionPrice)}
								/>
							);
						})()}
					</div>
				)}
			</SettingsSection>

			<SettingsSection
				title={t("onboarding.plans.detailed.title")}
				description={t("onboarding.plans.detailed.description")}
			>
				<Accordion type="single" collapsible>
					<AccordionItem value="pricing">
						<AccordionTrigger className="text-sm font-semibold">
							{t("onboarding.plans.detailed.trigger")}
						</AccordionTrigger>
						<AccordionContent>
							<PricingTable currentPlan={null} />
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</SettingsSection>

			<div className="border-t border-border pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<LanguageSwitcher
						languages={languages}
						currentLanguage={language}
						onLanguageChange={(key) => setLanguage(key as "en" | "es")}
						labels={{ language: t("language.label") }}
						showIcon
					/>
					<ThemeSwitcher
						labels={{
							theme: t("theme.label"),
							system: t("theme.system"),
							light: t("theme.light"),
							dark: t("theme.dark"),
						}}
					/>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleLogout}
					disabled={isLoggingOut || isRedirecting}
					className="gap-2"
				>
					{isLoggingOut ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<LogOut className="h-4 w-4" />
					)}
					{t("settings.nav.signOut")}
				</Button>
			</div>
		</div>
	);
}
