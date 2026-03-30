"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Check,
	X,
	Loader2,
	Mail,
	UserPlus,
	ArrowLeft,
	AlertCircle,
	LogOut,
	RefreshCw,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/language-context";
import {
	useOnboarding,
	type PendingInvitation,
} from "@/contexts/onboarding-context";
import { signOut } from "@/lib/auth/authActions";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";
import { resolveSafeRedirectUrl } from "@/lib/auth/safeRedirect";

// Skeleton for loading state
function InviteListSkeleton() {
	return (
		<div className="space-y-4">
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="bg-card rounded-xl border border-border p-4 shadow-sm"
				>
					<div className="flex items-center gap-4">
						<Skeleton className="h-12 w-12 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-24" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-9 w-20" />
							<Skeleton className="h-9 w-20" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

// Single invitation card component
function InvitationCard({
	invitation,
	onAccept,
	onDecline,
	isAccepting,
	isDeclining,
	acceptingId,
	decliningId,
}: {
	invitation: PendingInvitation;
	onAccept: (inv: PendingInvitation) => void;
	onDecline: (inv: PendingInvitation) => void;
	isAccepting: boolean;
	isDeclining: boolean;
	acceptingId: string | null;
	decliningId: string | null;
}) {
	const { t } = useLanguage();

	// Get organization initials for avatar
	const orgInitials = invitation.organizationName
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	// Format role for display
	const roleDisplay = {
		member: t("onboarding.invite.role.member"),
		admin: t("onboarding.invite.role.admin"),
		owner: t("onboarding.invite.role.owner"),
	}[invitation.role];

	const isThisAccepting = acceptingId === invitation.id;
	const isThisDeclining = decliningId === invitation.id;
	const isDisabled = isAccepting || isDeclining;

	return (
		<div className="bg-card rounded-xl border border-border p-4 shadow-sm">
			<div className="flex items-center gap-4">
				<Avatar className="h-12 w-12 border-2 border-background shadow">
					<AvatarImage src={invitation.organizationLogo || undefined} />
					<AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
						{orgInitials}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-foreground truncate">
						{invitation.organizationName}
					</h3>
					<div className="flex items-center gap-2 mt-0.5">
						<Badge variant="secondary" className="text-xs">
							{roleDisplay}
						</Badge>
						{invitation.inviterName && (
							<span className="text-xs text-muted-foreground truncate">
								{t("onboarding.invite.from").replace(
									"{name}",
									invitation.inviterName,
								)}
							</span>
						)}
					</div>
					{invitation.expiresAt && (
						<span className="text-xs text-muted-foreground">
							{t("onboarding.invite.expires").replace(
								"{date}",
								new Date(invitation.expiresAt).toLocaleDateString(),
							)}
						</span>
					)}
				</div>
				<div className="flex gap-2 shrink-0">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onDecline(invitation)}
						disabled={isDisabled}
					>
						{isThisDeclining ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<>
								<X className="h-4 w-4 mr-1" />
								{t("onboarding.invite.decline")}
							</>
						)}
					</Button>
					<Button
						size="sm"
						onClick={() => onAccept(invitation)}
						disabled={isDisabled}
					>
						{isThisAccepting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<>
								<Check className="h-4 w-4 mr-1" />
								{t("onboarding.invite.accept")}
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}

export function InviteView() {
	const { t } = useLanguage();
	const router = useRouter();
	const searchParams = useSearchParams();
	const {
		state,
		acceptInvitation,
		declineInvitation,
		refreshOnboardingStatus,
	} = useOnboarding();

	const [acceptingId, setAcceptingId] = useState<string | null>(null);
	const [decliningId, setDecliningId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<{
		organizationName: string;
	} | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isLoadingSpecific, setIsLoadingSpecific] = useState(false);
	const [specificInvitation, setSpecificInvitation] =
		useState<PendingInvitation | null>(null);

	const redirectTo = searchParams.get("redirect_to") || undefined;
	const invitationIdFromUrl = searchParams.get("invitationId");

	// Determine which invitations to show
	// If a specific invitation ID is in URL, show only that one
	// Otherwise show all pending invitations
	const invitations = specificInvitation
		? [specificInvitation]
		: state.pendingInvitations;

	// Fetch specific invitation by ID if provided in URL
	const fetchInvitationById = useCallback(
		async (invitationId: string) => {
			setIsLoadingSpecific(true);
			setError(null);

			try {
				const baseUrl = getAuthCoreBaseUrl();
				const response = await fetch(
					`${baseUrl}/api/organization/invitation/${invitationId}`,
					{
						credentials: "include",
					},
				);

				if (!response.ok) {
					if (response.status === 404) {
						setError(t("onboarding.invite.error.notFound"));
					} else {
						setError(t("onboarding.invite.error.load"));
					}
					return;
				}

				const result = (await response.json()) as {
					success: boolean;
					data?: {
						id: string;
						organizationId: string;
						organizationName: string;
						organizationLogo: string | null;
						role: string;
						inviterName: string | null;
						inviterEmail: string | null;
						expiresAt: string | null;
					};
					error?: string;
				};

				if (!result.success || !result.data) {
					setError(result.error || t("onboarding.invite.error.load"));
					return;
				}

				setSpecificInvitation({
					id: result.data.id,
					organizationId: result.data.organizationId,
					organizationName: result.data.organizationName,
					organizationLogo: result.data.organizationLogo,
					role: result.data.role as "member" | "admin" | "owner",
					inviterName: result.data.inviterName,
					inviterEmail: result.data.inviterEmail,
					expiresAt: result.data.expiresAt
						? new Date(result.data.expiresAt)
						: null,
				});
			} catch (err) {
				console.error("Failed to fetch invitation:", err);
				setError(t("onboarding.invite.error.load"));
			} finally {
				setIsLoadingSpecific(false);
			}
		},
		[t],
	);

	// Fetch invitation on mount
	useEffect(() => {
		if (invitationIdFromUrl) {
			// Fetch specific invitation from URL
			fetchInvitationById(invitationIdFromUrl);
		} else {
			// Refresh onboarding status to get all pending invitations
			refreshOnboardingStatus();
		}
	}, [invitationIdFromUrl, fetchInvitationById, refreshOnboardingStatus]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		setError(null);
		try {
			await refreshOnboardingStatus();
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleAccept = async (invitation: PendingInvitation) => {
		setAcceptingId(invitation.id);
		setError(null);

		// Pass organizationId to update seat count after acceptance
		const result = await acceptInvitation(
			invitation.id,
			invitation.organizationId,
		);

		if (!result.success) {
			setError(result.error || t("onboarding.invite.error.accept"));
			setAcceptingId(null);
			return;
		}

		setSuccess({ organizationName: invitation.organizationName });

		// Redirect after a short delay
		setTimeout(() => {
			window.location.href = resolveSafeRedirectUrl(
				redirectTo ?? null,
				window.location.origin,
			);
		}, 1500);
	};

	const handleDecline = async (invitation: PendingInvitation) => {
		setDecliningId(invitation.id);
		setError(null);

		const result = await declineInvitation(invitation.id);

		if (!result.success) {
			setError(result.error || t("onboarding.invite.error.decline"));
			setDecliningId(null);
			return;
		}

		setDecliningId(null);

		// If this was a specific invitation from URL, clear it and refresh
		if (specificInvitation?.id === invitation.id) {
			setSpecificInvitation(null);
			await refreshOnboardingStatus();
		}

		// If no more invitations, go back to onboarding
		if (state.pendingInvitations.length <= 1) {
			router.push("/onboarding");
		}
	};

	const handleBack = () => {
		router.push("/onboarding");
	};

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await signOut();
		window.location.href = "/login";
	};

	const isLoading = state.isLoading || isLoadingSpecific;

	// Show loading state
	if (isLoading) {
		return (
			<div className="w-full flex items-center justify-center my-auto p-4">
				<div className="w-full max-w-lg">
					<div className="flex justify-end mb-4">
						<Skeleton className="h-9 w-24" />
					</div>
					<div className="flex justify-center mb-6">
						<Logo variant="logo" />
					</div>
					<div className="text-center mb-6">
						<Skeleton className="h-6 w-48 mx-auto mb-2" />
						<Skeleton className="h-4 w-64 mx-auto" />
					</div>
					<InviteListSkeleton />
				</div>
			</div>
		);
	}

	// Success state
	if (success) {
		return (
			<div className="w-full flex items-center justify-center my-auto p-4">
				<div className="w-full max-w-md text-center">
					<div className="flex justify-end mb-4">
						<Button
							variant="outline"
							size="sm"
							onClick={handleLogout}
							disabled={isLoggingOut}
							className="gap-2"
						>
							{isLoggingOut ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<LogOut className="h-3.5 w-3.5" />
							)}
							{t("settings.nav.signOut")}
						</Button>
					</div>
					<div className="flex justify-center mb-6">
						<Logo variant="logo" />
					</div>
					<div className="bg-card rounded-xl border border-success/30 p-8 shadow-sm">
						<div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
							<Check className="h-8 w-8 text-success" />
						</div>
						<h1 className="text-xl font-semibold text-foreground mb-2">
							{t("onboarding.invite.success.title").replace(
								"{organization}",
								success.organizationName,
							)}
						</h1>
						<p className="text-muted-foreground mb-4">
							{t("onboarding.invite.success.description")}
						</p>
						<div className="flex justify-center">
							<Loader2 className="h-5 w-5 animate-spin text-primary" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	// No invitations found
	if (invitations.length === 0) {
		return (
			<div className="w-full flex items-center justify-center my-auto p-4">
				<div className="w-full max-w-md text-center">
					<div className="flex justify-end mb-4">
						<Button
							variant="outline"
							size="sm"
							onClick={handleLogout}
							disabled={isLoggingOut}
							className="gap-2"
						>
							{isLoggingOut ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<LogOut className="h-3.5 w-3.5" />
							)}
							{t("settings.nav.signOut")}
						</Button>
					</div>
					<div className="flex justify-center mb-6">
						<Logo variant="logo" />
					</div>
					<div className="bg-card rounded-xl border border-border p-8 shadow-sm">
						<div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
							<Mail className="h-8 w-8 text-muted-foreground" />
						</div>
						<h1 className="text-xl font-semibold text-foreground mb-2">
							{t("onboarding.invite.none.title")}
						</h1>
						<p className="text-muted-foreground mb-6">
							{t("onboarding.invite.none.description")}
						</p>
						<div className="flex flex-col gap-3">
							<Button
								variant="outline"
								onClick={handleRefresh}
								disabled={isRefreshing}
								className="w-full"
							>
								{isRefreshing ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<RefreshCw className="h-4 w-4 mr-2" />
								)}
								{t("onboarding.invite.refresh")}
							</Button>
							<Button onClick={handleBack} className="w-full">
								<ArrowLeft className="h-4 w-4 mr-2" />
								{t("onboarding.invite.none.back")}
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Multiple invitations list view
	return (
		<div className="w-full flex items-center justify-center my-auto p-4">
			<div className="w-full max-w-lg">
				<div className="flex justify-end mb-4">
					<Button
						variant="outline"
						size="sm"
						onClick={handleLogout}
						disabled={isLoggingOut || !!acceptingId || !!decliningId}
						className="gap-2"
					>
						{isLoggingOut ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<LogOut className="h-3.5 w-3.5" />
						)}
						{t("settings.nav.signOut")}
					</Button>
				</div>

				{/* Header */}
				<div className="text-center mb-6">
					<div className="flex justify-center mb-4">
						<Logo variant="logo" />
					</div>
					<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
						<UserPlus className="h-6 w-6 text-primary" />
					</div>
					<h1 className="text-xl font-semibold text-foreground mb-1">
						{invitations.length === 1
							? t("onboarding.invite.title")
							: t("onboarding.invite.titleMultiple").replace(
									"{count}",
									String(invitations.length),
								)}
					</h1>
					<p className="text-muted-foreground">
						{t("onboarding.invite.descriptionMultiple")}
					</p>
				</div>

				{error && (
					<div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
						<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
						<span>{error}</span>
					</div>
				)}

				{/* Invitations list */}
				<div className="space-y-3 mb-4">
					{invitations.map((invitation) => (
						<InvitationCard
							key={invitation.id}
							invitation={invitation}
							onAccept={handleAccept}
							onDecline={handleDecline}
							isAccepting={!!acceptingId}
							isDeclining={!!decliningId}
							acceptingId={acceptingId}
							decliningId={decliningId}
						/>
					))}
				</div>

				{/* Refresh and back links */}
				<div className="flex items-center justify-between">
					<button
						type="button"
						onClick={handleBack}
						className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
					>
						<ArrowLeft className="h-4 w-4" />
						{t("onboarding.invite.back")}
					</button>
					<button
						type="button"
						onClick={handleRefresh}
						disabled={isRefreshing}
						className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
					>
						<RefreshCw
							className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
						/>
						{t("onboarding.invite.refresh")}
					</button>
				</div>
			</div>
		</div>
	);
}
