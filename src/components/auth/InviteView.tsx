"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Building2,
	Check,
	X,
	Loader2,
	Mail,
	UserPlus,
	ArrowLeft,
	AlertCircle,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import {
	useOnboarding,
	type PendingInvitation,
} from "@/contexts/onboarding-context";
import { getAuthRedirectUrl } from "@/lib/auth/redirectConfig";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";

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

	const [isAccepting, setIsAccepting] = useState(false);
	const [isDeclining, setIsDeclining] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [isLoadingInvitation, setIsLoadingInvitation] = useState(false);
	const [specificInvitation, setSpecificInvitation] =
		useState<PendingInvitation | null>(null);

	const redirectTo = searchParams.get("redirect_to") || undefined;
	const invitationIdFromUrl = searchParams.get("invitationId");

	// Use specific invitation from URL if provided, otherwise use pending invitation from context
	const invitation = specificInvitation || state.pendingInvitation;

	// Fetch specific invitation by ID if provided in URL
	const fetchInvitationById = useCallback(async (invitationId: string) => {
		setIsLoadingInvitation(true);
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
					setError("This invitation was not found or has expired.");
				} else {
					setError("Failed to load invitation details.");
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
				setError(result.error || "Failed to load invitation.");
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
			setError("Failed to load invitation details.");
		} finally {
			setIsLoadingInvitation(false);
		}
	}, []);

	// Fetch invitation on mount
	useEffect(() => {
		if (invitationIdFromUrl) {
			// Fetch specific invitation from URL
			fetchInvitationById(invitationIdFromUrl);
		} else {
			// Refresh onboarding status to get pending invitation
			refreshOnboardingStatus();
		}
	}, [invitationIdFromUrl, fetchInvitationById, refreshOnboardingStatus]);

	const handleAccept = async () => {
		if (!invitation) return;

		setIsAccepting(true);
		setError(null);

		const result = await acceptInvitation(invitation.id);

		if (!result.success) {
			setError(result.error || "Failed to accept invitation");
			setIsAccepting(false);
			return;
		}

		setSuccess(true);

		// Redirect after a short delay
		setTimeout(() => {
			const targetUrl = getAuthRedirectUrl(redirectTo);
			window.location.href = targetUrl;
		}, 1500);
	};

	const handleDecline = async () => {
		if (!invitation) return;

		setIsDeclining(true);
		setError(null);

		const result = await declineInvitation(invitation.id);

		if (!result.success) {
			setError(result.error || "Failed to decline invitation");
			setIsDeclining(false);
			return;
		}

		// Go back to onboarding to choose subscription/license
		router.push("/onboarding");
	};

	const handleBack = () => {
		router.push("/onboarding");
	};

	// Show loading state
	if (state.isLoading || isLoadingInvitation) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading invitation...</p>
				</div>
			</div>
		);
	}

	// No invitation found
	if (!invitation) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<div className="w-full max-w-md text-center">
					<div className="flex justify-center mb-6">
						<Logo variant="logo" />
					</div>
					<div className="bg-card rounded-xl border border-border p-8 shadow-sm">
						<div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
							<Mail className="h-8 w-8 text-muted-foreground" />
						</div>
						<h1 className="text-xl font-semibold text-foreground mb-2">
							No pending invitation
						</h1>
						<p className="text-muted-foreground mb-6">
							You don't have any pending organization invitations. If someone
							sent you an invitation, please check your email or ask them to
							resend it.
						</p>
						<Button onClick={handleBack} className="w-full">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Onboarding
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Success state
	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<div className="w-full max-w-md text-center">
					<div className="flex justify-center mb-6">
						<Logo variant="logo" />
					</div>
					<div className="bg-card rounded-xl border border-success/30 p-8 shadow-sm">
						<div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
							<Check className="h-8 w-8 text-success" />
						</div>
						<h1 className="text-xl font-semibold text-foreground mb-2">
							Welcome to {invitation.organizationName}!
						</h1>
						<p className="text-muted-foreground mb-4">
							You've successfully joined the organization. Redirecting...
						</p>
						<div className="flex justify-center">
							<Loader2 className="h-5 w-5 animate-spin text-primary" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Get organization initials for avatar
	const orgInitials = invitation.organizationName
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	// Format role for display
	const roleDisplay = {
		member: "Member",
		admin: "Admin",
		owner: "Owner",
	}[invitation.role];

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-6">
					<div className="flex justify-center mb-4">
						<Logo variant="logo" />
					</div>
				</div>

				{/* Invitation Card */}
				<div className="bg-card rounded-xl border border-border p-8 shadow-sm">
					<div className="text-center mb-6">
						<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
							<UserPlus className="h-8 w-8 text-primary" />
						</div>
						<h1 className="text-xl font-semibold text-foreground mb-1">
							You've been invited!
						</h1>
						<p className="text-muted-foreground">
							{invitation.inviterName || invitation.inviterEmail || "Someone"}{" "}
							invited you to join their organization.
						</p>
					</div>

					{error && (
						<div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6">
							<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					{/* Organization Info */}
					<div className="bg-muted/50 rounded-lg p-4 mb-6">
						<div className="flex items-center gap-4">
							<Avatar className="h-14 w-14 border-2 border-background shadow">
								<AvatarImage src={invitation.organizationLogo || undefined} />
								<AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
									{orgInitials}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<h2 className="font-semibold text-foreground truncate">
									{invitation.organizationName}
								</h2>
								<div className="flex items-center gap-2 mt-1">
									<Badge variant="secondary" className="text-xs">
										{roleDisplay}
									</Badge>
									{invitation.expiresAt && (
										<span className="text-xs text-muted-foreground">
											Expires{" "}
											{new Date(invitation.expiresAt).toLocaleDateString()}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<Button
							variant="outline"
							className="flex-1"
							onClick={handleDecline}
							disabled={isAccepting || isDeclining}
						>
							{isDeclining ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<>
									<X className="h-4 w-4 mr-2" />
									Decline
								</>
							)}
						</Button>
						<Button
							className="flex-1"
							onClick={handleAccept}
							disabled={isAccepting || isDeclining}
						>
							{isAccepting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Joining...
								</>
							) : (
								<>
									<Check className="h-4 w-4 mr-2" />
									Accept
								</>
							)}
						</Button>
					</div>

					{/* Info note */}
					<p className="text-xs text-center text-muted-foreground mt-4">
						By accepting, you'll join as {roleDisplay.toLowerCase()} and can
						start collaborating immediately.
					</p>
				</div>

				{/* Back link */}
				<div className="text-center mt-4">
					<button
						type="button"
						onClick={handleBack}
						className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to onboarding
					</button>
				</div>
			</div>
		</div>
	);
}
