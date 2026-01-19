"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Check,
	Zap,
	Crown,
	Building2,
	ExternalLink,
	Lock,
	Sparkles,
	Mail,
	Key,
	LogOut,
	Loader2,
	Rocket,
	Search,
	Pencil,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useLanguage } from "@/contexts/language-context";
import { useOnboarding, type Plan } from "@/contexts/onboarding-context";
import { authClient } from "@/lib/auth/authClient";
import {
	getPublicPlans,
	getSubscriptionPrice,
	formatPriceMXN,
	type PublicPlanInfo,
} from "@/lib/billing";
import {
	PricingTable,
	SettingsPageHeader,
	SettingsSection,
} from "@/components/settings";
import { cn } from "@/lib/utils";

// Icons for each plan
const planIcons: Record<string, typeof Zap> = {
	watchlist: Search,
	business: Zap,
	pro: Crown,
	ultra: Rocket,
};

interface SubscriptionSelectionStepProps {
	onOpenLicenseModal: () => void;
}

export function SubscriptionSelectionStep({
	onOpenLicenseModal,
}: SubscriptionSelectionStepProps) {
	const { t } = useLanguage();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { state, setSelectedPlan, startSubscriptionFlow } = useOnboarding();
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
		await authClient.signOut();
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

	const firstName =
		state.userProfile.firstName || t("onboarding.plans.welcomeFallback");
	const planFeatures: Record<string, string[]> = {
		watchlist: [
			t("onboarding.plans.features.watchlist.1"),
			t("onboarding.plans.features.watchlist.2"),
			t("onboarding.plans.features.watchlist.3"),
			t("onboarding.plans.features.watchlist.4"),
			t("onboarding.plans.features.watchlist.5"),
		],
		business: [
			t("onboarding.plans.features.business.1"),
			t("onboarding.plans.features.business.2"),
			t("onboarding.plans.features.business.3"),
			t("onboarding.plans.features.business.4"),
			t("onboarding.plans.features.business.5"),
			t("onboarding.plans.features.business.6"),
		],
		pro: [
			t("onboarding.plans.features.pro.1"),
			t("onboarding.plans.features.pro.2"),
			t("onboarding.plans.features.pro.3"),
			t("onboarding.plans.features.pro.4"),
			t("onboarding.plans.features.pro.5"),
			t("onboarding.plans.features.pro.6"),
		],
		ultra: [
			t("onboarding.plans.features.ultra.1"),
			t("onboarding.plans.features.ultra.2"),
			t("onboarding.plans.features.ultra.3"),
			t("onboarding.plans.features.ultra.4"),
			t("onboarding.plans.features.ultra.5"),
			t("onboarding.plans.features.ultra.6"),
		],
	};

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
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{plans.map((plan) => {
								if (plan.name === "watchlist") {
									return null;
								}
								const Icon = planIcons[plan.name] ?? Zap;
								const features = planFeatures[plan.name] ?? [];
								const subscriptionPrice = getSubscriptionPrice(plan);
								const isRecommended = plan.name === recommendedPlan;

								return (
									<Card
										key={plan.id}
										className={cn(
											"relative border-2 transition-all flex flex-col",
											isRecommended
												? "border-primary shadow-lg shadow-primary/10"
												: "border-border hover:border-muted-foreground/30",
										)}
									>
										{isRecommended && (
											<Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
												{t("onboarding.plans.recommended")}
											</Badge>
										)}
										<CardContent className="p-6 flex flex-col h-full">
											<div className="text-center mb-6">
												<div
													className={cn(
														"h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3",
														isRecommended ? "bg-primary/10" : "bg-muted",
													)}
												>
													<Icon
														className={cn(
															"h-6 w-6",
															isRecommended
																? "text-primary"
																: "text-muted-foreground",
														)}
													/>
												</div>
												<h3 className="text-xl font-semibold text-foreground">
													{plan.displayName}
												</h3>
												<p className="text-xs text-muted-foreground mt-1">
													{t(`settings.billing.plans.${plan.name}.description`)}
												</p>
												<div className="mt-3">
													{subscriptionPrice ? (
														<>
															<span className="text-3xl lg:text-4xl font-bold text-foreground">
																{formatPriceMXN(subscriptionPrice.amount)}
															</span>
															<span className="text-muted-foreground">
																/
																{t(
																	`settings.billing.interval.${subscriptionPrice.interval || "month"}`,
																)}
															</span>
														</>
													) : (
														<span className="text-2xl font-bold text-foreground">
															{t("onboarding.plans.watchlist.contact")}
														</span>
													)}
												</div>
												{subscriptionPrice && (
													<p className="text-xs text-muted-foreground mt-1">
														{t("onboarding.plans.meteredNote")}
													</p>
												)}
											</div>

											<div className="space-y-3 mb-6 grow">
												{features.slice(0, 6).map((feature, index) => (
													<div
														key={index}
														className="flex items-center gap-2 text-sm"
													>
														<Check className="h-4 w-4 text-success shrink-0" />
														<span className="text-muted-foreground">
															{feature}
														</span>
													</div>
												))}
												{features.length > 6 && (
													<p className="text-xs text-primary pl-6 font-medium">
														+{features.length - 6} more features
													</p>
												)}
											</div>

											<Button
												className="w-full mt-auto"
												size="lg"
												variant={isRecommended ? "default" : "outline"}
												onClick={() => handleSelectPlan(plan)}
												disabled={isRedirecting || !subscriptionPrice}
											>
												{isRedirecting ? (
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												) : (
													<Lock className="h-4 w-4 mr-2" />
												)}
												{t("onboarding.plans.subscribe").replace(
													"{plan}",
													plan.displayName,
												)}
											</Button>
										</CardContent>
									</Card>
								);
							})}
						</div>

						<Card className="border-border bg-card">
							<CardContent className="p-6">
								<div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
									<div className="flex items-center gap-4">
										<div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
											<Building2 className="h-6 w-6 text-foreground" />
										</div>
										<div>
											<h3 className="text-lg font-semibold text-foreground">
												{t("onboarding.plans.enterprise.title")}
											</h3>
											<p className="text-sm text-muted-foreground">
												{t("onboarding.plans.enterprise.description")}
											</p>
										</div>
									</div>
									<div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
										<Button
											variant="outline"
											className="gap-2 bg-transparent w-full lg:w-auto"
											asChild
										>
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
											className="gap-2 w-full lg:w-auto"
											onClick={onOpenLicenseModal}
										>
											<Key className="h-4 w-4" />
											{t("onboarding.plans.enterprise.license")}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Watchlist Only Plan - At the bottom */}
						{(() => {
							const watchlistPlan = plans.find(
								(plan) => plan.name === "watchlist",
							);
							const subscriptionPrice = watchlistPlan
								? getSubscriptionPrice(watchlistPlan)
								: null;
							const displayPrice = subscriptionPrice?.amount ?? 49900;
							const canSubscribe = Boolean(watchlistPlan && subscriptionPrice);
							return (
								<Card className="border-border bg-card">
									<CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
										<div className="flex items-center gap-4">
											<div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
												<Search className="h-5 w-5 text-foreground" />
											</div>
											<div>
												<h3 className="text-base font-semibold text-foreground">
													{t("onboarding.plans.watchlist.title")}
												</h3>
												<p className="text-sm text-muted-foreground">
													{t("onboarding.plans.watchlist.description")}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<div className="text-right">
												<div className="text-xl font-bold">
													{formatPriceMXN(displayPrice)}
												</div>
												<span className="text-xs text-muted-foreground">
													/
													{t(
														`settings.billing.interval.${subscriptionPrice?.interval || "month"}`,
													)}
												</span>
											</div>
											<Button
												variant="outline"
												onClick={() =>
													watchlistPlan ? handleSelectPlan(watchlistPlan) : null
												}
												disabled={isRedirecting || !canSubscribe}
											>
												{canSubscribe
													? t("onboarding.plans.watchlist.cta")
													: t("onboarding.plans.watchlist.contact")}
											</Button>
										</div>
									</CardContent>
								</Card>
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
					<LanguageSwitcher showIcon />
					<ThemeSwitcher />
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
