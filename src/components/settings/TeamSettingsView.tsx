"use client";

import { useCallback, useEffect, useState } from "react";
import {
	Users,
	UserPlus,
	Mail,
	MoreHorizontal,
	Shield,
	ShieldCheck,
	User,
	Clock,
	X,
	Loader2,
	Trash2,
	ArrowRightLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Label, Badge } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/language-context";
import {
	getOrganizationMembership,
	type OrganizationMembership,
} from "@/lib/settings";
import { authClient } from "@/lib/auth/authClient";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import {
	getSubscriptionStatus,
	type UserSubscriptionStatus,
} from "@/lib/billing";
import {
	SettingsCard,
	SettingsSection,
	SettingsPageHeader,
	TeamSettingsViewSkeleton,
} from "@/components/settings";

type Role = "owner" | "admin" | "member";

interface Member {
	id: string;
	userId: string;
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
	};
	role: Role;
	createdAt: string;
}

interface Invitation {
	id: string;
	email: string;
	role: Role;
	status: "pending" | "accepted" | "rejected" | "canceled";
	expiresAt: string;
	invitedBy: {
		name: string;
		email: string;
	};
}

const ROLE_CONFIG: Record<
	Role,
	{ labelKey: string; icon: typeof Shield; colorClass: string; bgClass: string }
> = {
	owner: {
		labelKey: "settings.team.roleOwner",
		icon: ShieldCheck,
		colorClass: "text-warning-foreground",
		bgClass: "bg-warning/10",
	},
	admin: {
		labelKey: "settings.team.roleAdmin",
		icon: Shield,
		colorClass: "text-primary",
		bgClass: "bg-primary/10",
	},
	member: {
		labelKey: "settings.team.roleMember",
		icon: User,
		colorClass: "text-muted-foreground",
		bgClass: "bg-muted",
	},
};

export function TeamSettingsView() {
	const { t } = useLanguage();
	const { data: session } = useAuthSession();
	const user = session?.user;

	const [loading, setLoading] = useState(true);

	const [members, setMembers] = useState<Member[]>([]);
	const [invitations, setInvitations] = useState<Invitation[]>([]);
	const [membership, setMembership] = useState<OrganizationMembership | null>(
		null,
	);
	const [subscriptionStatus, setSubscriptionStatus] =
		useState<UserSubscriptionStatus | null>(null);

	// Invite form state
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<Role>("member");
	const [inviting, setInviting] = useState(false);
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	const isOwner = membership?.role === "owner";
	const isAdmin = membership?.role === "admin";
	const canManageTeam = isOwner || isAdmin;

	const usersPerOrg = subscriptionStatus?.limits?.usersPerOrg ?? 0;
	const atMemberLimit =
		usersPerOrg > 0 && members.length + invitations.length >= usersPerOrg;

	const loadData = useCallback(async () => {
		if (!activeOrgId) {
			setLoading(false);
			return;
		}

		try {
			setLoading(true);

			const [orgResult, membershipData, statusData] = await Promise.all([
				authClient.organization.getFullOrganization({
					query: { organizationId: activeOrgId },
				}),
				getOrganizationMembership(activeOrgId),
				getSubscriptionStatus().catch(() => null),
			]);

			setSubscriptionStatus(statusData);

			setMembership(membershipData);

			if (orgResult.data) {
				// Transform members
				const membersList = (orgResult.data.members || []).map((m: any) => ({
					id: m.id,
					userId: m.userId,
					user: {
						id: m.user.id,
						name: m.user.name,
						email: m.user.email,
						image: m.user.image,
					},
					role: m.role as Role,
					createdAt: m.createdAt,
				}));
				setMembers(membersList);

				// Transform invitations (filter pending only)
				const invitationsList = (orgResult.data.invitations || [])
					.filter((i: any) => i.status === "pending")
					.map((i: any) => ({
						id: i.id,
						email: i.email,
						role: i.role as Role,
						status: i.status,
						expiresAt: i.expiresAt,
						invitedBy: {
							name: i.inviter?.name || "Unknown",
							email: i.inviter?.email || "",
						},
					}));
				setInvitations(invitationsList);
			}
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to load team data",
			);
		} finally {
			setLoading(false);
		}
	}, [activeOrgId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const showSuccess = useCallback((message: string) => {
		toast.success(message);
	}, []);

	const handleInvite = async () => {
		if (!activeOrgId || !canManageTeam || !inviteEmail) return;

		if (atMemberLimit) {
			toast.error(t("settings.team.memberLimitReached"));
			return;
		}

		try {
			setInviting(true);

			await authClient.organization.inviteMember({
				organizationId: activeOrgId,
				email: inviteEmail,
				role: inviteRole,
			});

			showSuccess(t("settings.team.inviteSent"));
			setInviteEmail("");
			setInviteRole("member");
			setInviteDialogOpen(false);
			loadData(); // Reload to show new invitation
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : t("settings.team.inviteError"),
			);
		} finally {
			setInviting(false);
		}
	};

	const handleRoleChange = async (memberId: string, newRole: Role) => {
		if (!activeOrgId || !isOwner) return;

		try {
			await authClient.organization.updateMemberRole({
				organizationId: activeOrgId,
				memberId,
				role: newRole,
			});
			showSuccess(t("settings.team.roleUpdated"));
			loadData();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : t("settings.team.roleUpdateError"),
			);
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		if (!activeOrgId || !canManageTeam) return;

		try {
			await authClient.organization.removeMember({
				organizationId: activeOrgId,
				memberIdOrEmail: memberId,
			});
			showSuccess(t("settings.team.memberRemoved"));
			loadData();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : t("settings.team.removeError"),
			);
		}
	};

	const handleCancelInvitation = async (invitationId: string) => {
		if (!activeOrgId || !canManageTeam) return;

		try {
			await authClient.organization.cancelInvitation({
				invitationId,
			});
			showSuccess(t("settings.team.invitationCanceled"));
			loadData();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : t("settings.team.cancelError"),
			);
		}
	};

	const handleTransferOwnership = async (newOwnerUserId: string) => {
		if (!activeOrgId || !isOwner) return;

		try {
			const response = await fetch(
				`${getAuthCoreBaseUrl()}/api/organization/transfer-ownership`,
				{
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						organizationId: activeOrgId,
						newOwnerUserId,
					}),
				},
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					(result as { error?: string }).error ??
						"Failed to transfer ownership",
				);
			}

			showSuccess(t("settings.team.transferSuccess"));
			loadData();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : t("settings.team.transferError"),
			);
		}
	};

	const RoleBadge = ({ role }: { role: Role }) => {
		const config = ROLE_CONFIG[role];
		const Icon = config.icon;
		return (
			<Badge
				variant="secondary"
				className={`${config.bgClass} ${config.colorClass} border-0`}
			>
				<Icon className="h-3 w-3 mr-1" />
				{t(config.labelKey)}
			</Badge>
		);
	};

	if (loading) {
		return <TeamSettingsViewSkeleton />;
	}

	if (!activeOrgId) {
		return (
			<div className="space-y-8">
				<SettingsPageHeader
					icon={Users}
					title={t("settings.team.title")}
					description={t("settings.organization.noOrg")}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Page Header with Invite Button */}
			<SettingsPageHeader
				icon={Users}
				title={t("settings.team.title")}
				description={t("settings.team.description")}
				action={
					canManageTeam && (
						<Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
							<DialogTrigger asChild>
								<Button
									className="gap-2"
									disabled={atMemberLimit}
									title={
										atMemberLimit
											? t("settings.team.memberLimitReached")
											: undefined
									}
								>
									<UserPlus className="h-4 w-4" />
									{t("settings.team.inviteMember")}
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
								<DialogHeader>
									<DialogTitle>{t("settings.team.inviteMember")}</DialogTitle>
									<DialogDescription>
										{t("settings.team.inviteDesc")}
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<Label htmlFor="email">{t("settings.team.email")}</Label>
										<Input
											id="email"
											type="email"
											placeholder="colleague@company.com"
											value={inviteEmail}
											onChange={(e) => setInviteEmail(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="role">{t("settings.team.role")}</Label>
										<Select
											value={inviteRole}
											onValueChange={(v: string) => setInviteRole(v as Role)}
										>
											<SelectTrigger id="role">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="member">
													{t("settings.team.roleMember")}
												</SelectItem>
												<SelectItem value="admin">
													{t("settings.team.roleAdmin")}
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<DialogFooter className="flex-col sm:flex-row gap-2">
									<Button
										variant="outline"
										onClick={() => setInviteDialogOpen(false)}
										className="w-full sm:w-auto"
									>
										{t("settings.team.cancel")}
									</Button>
									<Button
										onClick={handleInvite}
										disabled={!inviteEmail || inviting}
										className="w-full sm:w-auto"
									>
										{inviting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												{t("settings.team.sending")}
											</>
										) : (
											<>
												<Mail className="mr-2 h-4 w-4" />
												{t("settings.team.sendInvite")}
											</>
										)}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					)
				}
			/>

			{/* Member limit banner */}
			{canManageTeam && atMemberLimit && (
				<div className="rounded-lg border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-warning-foreground flex items-center justify-between gap-4">
					<span>
						{t("settings.team.memberLimitBanner")
							.replace("{used}", String(members.length + invitations.length))
							.replace("{limit}", String(usersPerOrg))}
					</span>
				</div>
			)}

			{/* Team Members */}
			<SettingsSection
				title={`${t("settings.team.members")} (${members.length})`}
				description={
					t("settings.team.membersDesc") ||
					"People with access to this organization"
				}
			>
				<SettingsCard className="divide-y divide-border p-0 overflow-hidden">
					{members.map((member) => {
						const isCurrentUser = member.userId === user?.id;
						const canModify =
							isOwner && !isCurrentUser && member.role !== "owner";

						return (
							<div
								key={member.id}
								className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
							>
								<div className="flex items-center gap-3 min-w-0">
									<Avatar className="h-10 w-10 shrink-0">
										<AvatarImage src={member.user.image || undefined} />
										<AvatarFallback className="bg-primary text-primary-foreground">
											{member.user.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="text-sm font-medium text-foreground">
												{member.user.name}
											</span>
											{isCurrentUser && (
												<Badge variant="secondary" className="text-xs">
													{t("settings.team.you")}
												</Badge>
											)}
										</div>
										<span className="text-sm text-muted-foreground">
											{member.user.email}
										</span>
									</div>
								</div>

								<div className="flex items-center gap-3 shrink-0">
									<RoleBadge role={member.role} />
									{canModify && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => handleRoleChange(member.id, "admin")}
													disabled={member.role === "admin"}
												>
													<Shield className="mr-2 h-4 w-4" />
													{t("settings.team.makeAdmin")}
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleRoleChange(member.id, "member")}
													disabled={member.role === "member"}
												>
													<User className="mr-2 h-4 w-4" />
													{t("settings.team.makeMember")}
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<DropdownMenuItem
															onSelect={(e) => e.preventDefault()}
														>
															<ArrowRightLeft className="mr-2 h-4 w-4" />
															{t("settings.team.transferOwnership")}
														</DropdownMenuItem>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																{t("settings.team.transferConfirmTitle")}
															</AlertDialogTitle>
															<AlertDialogDescription>
																{t("settings.team.transferConfirmDesc").replace(
																	"{name}",
																	member.user.name,
																)}
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>
																{t("settings.team.cancel")}
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() =>
																	handleTransferOwnership(member.userId)
																}
															>
																{t("settings.team.transferOwnership")}
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<DropdownMenuItem
															className="text-destructive"
															onSelect={(e) => e.preventDefault()}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															{t("settings.team.remove")}
														</DropdownMenuItem>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																{t("settings.team.removeConfirmTitle")}
															</AlertDialogTitle>
															<AlertDialogDescription>
																{t("settings.team.removeConfirmDesc").replace(
																	"{name}",
																	member.user.name,
																)}
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>
																{t("settings.team.cancel")}
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleRemoveMember(member.id)}
																className="bg-destructive text-destructive-foreground"
															>
																{t("settings.team.remove")}
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</DropdownMenuContent>
										</DropdownMenu>
									)}
								</div>
							</div>
						);
					})}
				</SettingsCard>
			</SettingsSection>

			{/* Pending Invitations */}
			{invitations.length > 0 && (
				<SettingsSection
					title={`${t("settings.team.pendingInvitations")} (${invitations.length})`}
				>
					<SettingsCard className="divide-y divide-border p-0 overflow-hidden border-dashed">
						{invitations.map((invitation) => (
							<div
								key={invitation.id}
								className="flex items-center justify-between p-4"
							>
								<div className="flex items-center gap-3 min-w-0">
									<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
										<Mail className="h-5 w-5 text-muted-foreground" />
									</div>
									<div className="min-w-0">
										<span className="text-sm font-medium truncate block">
											{invitation.email}
										</span>
										<p className="text-sm text-muted-foreground flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{t("settings.team.invitedBy")}:{" "}
											{invitation.invitedBy.name}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2 shrink-0">
									<RoleBadge role={invitation.role} />
									{canManageTeam && (
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => handleCancelInvitation(invitation.id)}
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>
						))}
					</SettingsCard>
				</SettingsSection>
			)}

			{/* Role Permissions */}
			<SettingsSection
				title={t("settings.team.rolePermissions")}
				description={t("settings.team.rolePermissionsDesc")}
			>
				<div className="grid sm:grid-cols-3 gap-4">
					{(["owner", "admin", "member"] as Role[]).map((role) => {
						const config = ROLE_CONFIG[role];
						const Icon = config.icon;
						return (
							<SettingsCard key={role} className="h-full">
								<div className="flex items-center gap-3 mb-4">
									<div
										className={`h-10 w-10 rounded-lg ${config.bgClass} flex items-center justify-center`}
									>
										<Icon className={`h-5 w-5 ${config.colorClass}`} />
									</div>
									<h4 className="font-semibold text-foreground">
										{t(config.labelKey)}
									</h4>
								</div>
								<ul className="space-y-2">
									{role === "owner" && (
										<>
											<li className="text-sm text-muted-foreground flex items-start gap-2">
												<span className="text-muted-foreground/50 mt-0.5">
													•
												</span>
												{t("settings.team.perm.all")}
											</li>
											<li className="text-sm text-muted-foreground flex items-start gap-2">
												<span className="text-muted-foreground/50 mt-0.5">
													•
												</span>
												{t("settings.team.perm.delete")}
											</li>
											<li className="text-sm text-muted-foreground flex items-start gap-2">
												<span className="text-muted-foreground/50 mt-0.5">
													•
												</span>
												{t("settings.team.perm.transfer")}
											</li>
										</>
									)}
									{role === "admin" && (
										<>
											<li className="text-sm text-muted-foreground flex items-start gap-2">
												<span className="text-muted-foreground/50 mt-0.5">
													•
												</span>
												{t("settings.team.perm.manage")}
											</li>
											<li className="text-sm text-muted-foreground flex items-start gap-2">
												<span className="text-muted-foreground/50 mt-0.5">
													•
												</span>
												{t("settings.team.perm.invite")}
											</li>
											<li className="text-sm text-muted-foreground flex items-start gap-2">
												<span className="text-muted-foreground/50 mt-0.5">
													•
												</span>
												{t("settings.team.perm.settings")}
											</li>
										</>
									)}
									{role === "member" && (
										<>
											<li className="text-sm text-muted-foreground flex items-start gap-2">
												<span className="text-muted-foreground/50 mt-0.5">
													•
												</span>
												{t("settings.team.perm.view")}
											</li>
											<li className="text-sm text-muted-foreground flex items-start gap-2">
												<span className="text-muted-foreground/50 mt-0.5">
													•
												</span>
												{t("settings.team.perm.use")}
											</li>
										</>
									)}
								</ul>
							</SettingsCard>
						);
					})}
				</div>
			</SettingsSection>
		</div>
	);
}
