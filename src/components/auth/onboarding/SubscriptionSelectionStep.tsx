"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	CreditCard,
	Check,
	Zap,
	Crown,
	Building2,
	ExternalLink,
	Lock,
	Sparkles,
	AlertCircle,
	Mail,
	Key,
	LogOut,
	Loader2,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/language-context";
import { useOnboarding, type Plan } from "@/contexts/onboarding-context";
import { authClient } from "@/lib/auth/authClient";
import { cn } from "@/lib/utils";

const plans: Array<{
	id: string;
	name: string;
	price: number;
	icon: typeof Zap;
	features: string[];
	recommended: boolean;
}> = [
	{
		id: "business",
		name: "Business",
		price: 100,
		icon: Zap,
		features: [
			"50 notices included",
			"5 users",
			"$2 per extra notice",
			"Data capture",
			"Compliance validation",
			"Report generation",
			"Alert tracking",
		],
		recommended: false,
	},
	{
		id: "pro",
		name: "Pro",
		price: 200,
		icon: Crown,
		features: [
			"150 notices included",
			"10 users",
			"$1.50 per extra notice",
			"Data capture",
			"Compliance validation",
			"Report generation",
			"Alert tracking",
			"Advanced roles",
			"Priority support",
			"Custom integrations",
		],
		recommended: true,
	},
];

interface SubscriptionSelectionStepProps {
	onOpenLicenseModal: () => void;
}

export function SubscriptionSelectionStep({
	onOpenLicenseModal,
}: SubscriptionSelectionStepProps) {
	const { t } = useLanguage();
	const router = useRouter();
	const { state, setSelectedPlan, setCheckoutOpen, startSubscriptionFlow } =
		useOnboarding();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await authClient.signOut();
		window.location.href = "/login";
	};

	const handleSelectPlan = async (plan: (typeof plans)[0]) => {
		setIsRedirecting(true);
		try {
			const selectedPlan: Plan = {
				id: plan.id,
				name: plan.name,
				price: plan.price,
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

	const firstName = state.userProfile.firstName || "there";

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="h-14 border-b border-border bg-card sticky top-0 z-40">
				<div className="h-full px-4 lg:px-6 flex items-center justify-between max-w-6xl mx-auto">
					<Logo variant="logo" />
					<div className="flex items-center gap-3">
						<span className="text-sm text-muted-foreground hidden sm:inline">
							{state.userProfile.firstName} {state.userProfile.lastName}
						</span>
						<Avatar className="h-8 w-8">
							<AvatarImage src={state.userProfile.avatarUrl || undefined} />
							<AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
								{state.userProfile.firstName.charAt(0)}
								{state.userProfile.lastName.charAt(0)}
							</AvatarFallback>
						</Avatar>
						<button
							type="button"
							onClick={handleLogout}
							disabled={isLoggingOut || isRedirecting}
							className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 ml-2"
							title="Sign out"
						>
							{isLoggingOut ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<LogOut className="h-4 w-4" />
							)}
							<span className="hidden sm:inline">Sign out</span>
						</button>
					</div>
				</div>
			</header>

			<div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
				{/* Welcome Header */}
				<div className="text-center mb-10">
					<div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
						<Sparkles className="h-4 w-4" />
						Welcome, {firstName}!
					</div>
					<h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
						Choose how to get started
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Subscribe monthly for flexible pay-as-you-go billing, or activate an
						annual license for fixed capacity
					</p>
				</div>

				{/* Warning Banner */}
				<div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-8 flex items-start gap-3 max-w-2xl mx-auto">
					<AlertCircle className="h-5 w-5 text-warning-foreground shrink-0 mt-0.5" />
					<div>
						<p className="text-sm font-medium text-foreground">
							Subscription or license required
						</p>
						<p className="text-sm text-muted-foreground">
							You need an active subscription or license to create an
							organization and access Janovix features.
						</p>
					</div>
				</div>

				{/* License Key Card */}
				<div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-2xl mx-auto">
					<div className="flex items-start gap-3">
						<Key className="h-5 w-5 text-primary shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-medium text-foreground">
								Have a license key?
							</p>
							<p className="text-sm text-muted-foreground">
								Activate your annual license for fixed capacity at a discounted
								rate.
							</p>
						</div>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="shrink-0 bg-transparent gap-2"
						onClick={onOpenLicenseModal}
					>
						<Key className="h-4 w-4" />
						Enter License Key
					</Button>
				</div>

				{/* Invitation Card */}
				{state.pendingInvitation ? (
					<div className="bg-success/5 border border-success/20 rounded-lg p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-2xl mx-auto">
						<div className="flex items-start gap-3">
							<Mail className="h-5 w-5 text-success shrink-0 mt-0.5" />
							<div>
								<p className="text-sm font-medium text-foreground">
									You have an invitation!
								</p>
								<p className="text-sm text-muted-foreground">
									{state.pendingInvitation.inviterName || "Someone"} invited you
									to join{" "}
									<strong>{state.pendingInvitation.organizationName}</strong>.
								</p>
							</div>
						</div>
						<Button
							variant="default"
							size="sm"
							className="shrink-0 gap-2"
							onClick={handleGoToInvite}
						>
							<Mail className="h-4 w-4" />
							View Invitation
						</Button>
					</div>
				) : (
					<div className="bg-muted/50 border border-border rounded-lg p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-2xl mx-auto">
						<div className="flex items-start gap-3">
							<Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
							<div>
								<p className="text-sm font-medium text-foreground">
									Have an invitation?
								</p>
								<p className="text-sm text-muted-foreground">
									If someone invited you to their organization, check your email
									for the invitation link.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Plan Cards */}
				<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
					{plans.map((plan) => {
						const Icon = plan.icon;

						return (
							<div
								key={plan.id}
								className={cn(
									"relative rounded-xl border-2 bg-card p-6 transition-all",
									plan.recommended
										? "border-primary shadow-lg shadow-primary/10"
										: "border-border hover:border-muted-foreground/30",
								)}
							>
								{plan.recommended && (
									<Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
										Recommended
									</Badge>
								)}

								<div className="text-center mb-6">
									<div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
										<Icon className="h-6 w-6 text-primary" />
									</div>
									<h3 className="text-xl font-semibold text-foreground">
										{plan.name}
									</h3>
									<div className="mt-3">
										<span className="text-4xl font-bold text-foreground">
											${plan.price}
										</span>
										<span className="text-muted-foreground">/month</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										+ metered usage at cycle end
									</p>
								</div>

								<div className="space-y-3 mb-6">
									{plan.features.slice(0, 5).map((feature, index) => (
										<div
											key={index}
											className="flex items-center gap-2 text-sm"
										>
											<Check className="h-4 w-4 text-success shrink-0" />
											<span className="text-muted-foreground">{feature}</span>
										</div>
									))}
									{plan.features.length > 5 && (
										<p className="text-xs text-primary pl-6 font-medium">
											+{plan.features.length - 5} more features
										</p>
									)}
								</div>

								<Button
									className="w-full"
									size="lg"
									variant={plan.recommended ? "default" : "outline"}
									onClick={() => handleSelectPlan(plan)}
									disabled={isRedirecting}
								>
									<Lock className="h-4 w-4 mr-2" />
									Subscribe to {plan.name}
								</Button>
							</div>
						);
					})}
				</div>

				{/* Enterprise Card */}
				<div className="max-w-4xl mx-auto rounded-xl border border-border bg-card p-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
								<Building2 className="h-6 w-6 text-foreground" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-foreground">
									Enterprise
								</h3>
								<p className="text-sm text-muted-foreground">
									Custom pricing for large organizations with dedicated support
								</p>
							</div>
						</div>
						<Button variant="outline" className="shrink-0 gap-2 bg-transparent">
							Contact Sales
							<ExternalLink className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Trust Badges */}
				<div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-muted-foreground">
					<div className="flex items-center gap-2 text-sm">
						<Lock className="h-4 w-4" />
						<span>Secured by Stripe</span>
					</div>
					<div className="flex items-center gap-2 text-sm">
						<Check className="h-4 w-4" />
						<span>Cancel anytime</span>
					</div>
					<div className="flex items-center gap-2 text-sm">
						<CreditCard className="h-4 w-4" />
						<span>All major cards accepted</span>
					</div>
				</div>
			</div>
		</div>
	);
}
