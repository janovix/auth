"use client";

import { useCallback, useEffect, useState } from "react";
import {
	Users,
	UserPlus,
	Mail,
	MoreVertical,
	Shield,
	ShieldCheck,
	User,
	Clock,
	X,
	Loader2,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";
import {
	Button,
	Card,
	CardContent,
	Label,
	Input,
	Spinner,
	Badge,
} from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
import { useAuthSession } from "@/lib/auth/useAuthSession";

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

const ROLE_LABELS: Record<
	Role,
	{ labelKey: string; icon: typeof Shield; color: string }
> = {
	owner: {
		labelKey: "settings.team.roleOwner",
		icon: ShieldCheck,
		color: "text-yellow-500",
	},
	admin: {
		labelKey: "settings.team.roleAdmin",
		icon: Shield,
		color: "text-blue-500",
	},
	member: {
		labelKey: "settings.team.roleMember",
		icon: User,
		color: "text-gray-500",
	},
};

export function TeamSettingsView() {
	const { t } = useLanguage();
	const { data: session } = useAuthSession();
	const user = session?.user;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const [members, setMembers] = useState<Member[]>([]);
	const [invitations, setInvitations] = useState<Invitation[]>([]);
	const [membership, setMembership] = useState<OrganizationMembership | null>(
		null,
	);

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

	const loadData = useCallback(async () => {
		if (!activeOrgId) {
			setLoading(false);
			return;
		}

		try {
			setLoading(true);

			const [orgResult, membershipData] = await Promise.all([
				authClient.organization.getFullOrganization({
					query: { organizationId: activeOrgId },
				}),
				getOrganizationMembership(activeOrgId),
			]);

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
			setError(err instanceof Error ? err.message : "Failed to load team data");
		} finally {
			setLoading(false);
		}
	}, [activeOrgId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const showSuccess = useCallback((message: string) => {
		setSuccessMessage(message);
		setTimeout(() => setSuccessMessage(null), 3000);
	}, []);

	const handleInvite = async () => {
		if (!activeOrgId || !canManageTeam || !inviteEmail) return;

		try {
			setInviting(true);
			setError(null);

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
			setError(
				err instanceof Error ? err.message : t("settings.team.inviteError"),
			);
		} finally {
			setInviting(false);
		}
	};

	const handleRoleChange = async (memberId: string, newRole: Role) => {
		if (!activeOrgId || !isOwner) return;

		try {
			setError(null);
			await authClient.organization.updateMemberRole({
				organizationId: activeOrgId,
				memberId,
				role: newRole,
			});
			showSuccess(t("settings.team.roleUpdated"));
			loadData();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : t("settings.team.roleUpdateError"),
			);
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		if (!activeOrgId || !canManageTeam) return;

		try {
			setError(null);
			await authClient.organization.removeMember({
				organizationId: activeOrgId,
				memberIdOrEmail: memberId,
			});
			showSuccess(t("settings.team.memberRemoved"));
			loadData();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : t("settings.team.removeError"),
			);
		}
	};

	const handleCancelInvitation = async (invitationId: string) => {
		if (!activeOrgId || !canManageTeam) return;

		try {
			setError(null);
			await authClient.organization.cancelInvitation({
				invitationId,
			});
			showSuccess(t("settings.team.invitationCanceled"));
			loadData();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : t("settings.team.cancelError"),
			);
		}
	};

	const RoleBadge = ({ role }: { role: Role }) => {
		const { labelKey, icon: Icon, color } = ROLE_LABELS[role];
		return (
			<Badge variant="outline" className="gap-1">
				<Icon className={`h-3 w-3 ${color}`} />
				{t(labelKey)}
			</Badge>
		);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Spinner className="h-8 w-8" />
			</div>
		);
	}

	if (!activeOrgId) {
		return (
			<div className="space-y-6">
				<div>
					<h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
						{t("settings.team.title")}
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						{t("settings.organization.noOrg")}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
						<Users className="h-6 w-6" />
						{t("settings.team.title")}
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						{t("settings.team.description")}
					</p>
				</div>

				{canManageTeam && (
					<Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<UserPlus className="mr-2 h-4 w-4" />
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
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="email">{t("settings.team.email")}</Label>
									<Input
										id="email"
										type="email"
										placeholder="colleague@company.com"
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
									/>
								</div>
								<div className="grid gap-2">
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
				)}
			</div>

			{/* Success/Error Messages */}
			{successMessage && (
				<div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
					<CheckCircle className="h-4 w-4" />
					{successMessage}
				</div>
			)}
			{error && (
				<div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
					<AlertTriangle className="h-4 w-4" />
					{error}
				</div>
			)}

			<Separator />

			{/* Team Members */}
			<section className="space-y-4">
				<div>
					<h3 className="text-base sm:text-lg font-medium">
						{t("settings.team.members")} ({members.length})
					</h3>
				</div>

				<div className="grid gap-3">
					{members.map((member) => {
						const isCurrentUser = member.userId === user?.id;
						const canModify =
							isOwner && !isCurrentUser && member.role !== "owner";

						return (
							<Card key={member.id}>
								<CardContent className="p-4">
									<div className="flex items-center justify-between gap-4">
										<div className="flex items-center gap-3 min-w-0">
											<Avatar className="h-10 w-10 shrink-0">
												<AvatarImage src={member.user.image || undefined} />
												<AvatarFallback className="text-sm">
													{member.user.name
														.split(" ")
														.map((n) => n[0])
														.join("")
														.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="font-medium truncate">
														{member.user.name}
													</span>
													{isCurrentUser && (
														<Badge variant="secondary" className="text-xs">
															{t("settings.team.you")}
														</Badge>
													)}
												</div>
												<p className="text-sm text-muted-foreground truncate">
													{member.user.email}
												</p>
											</div>
										</div>

										<div className="flex items-center gap-2 shrink-0">
											<RoleBadge role={member.role} />
											{canModify && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() =>
																handleRoleChange(member.id, "admin")
															}
															disabled={member.role === "admin"}
														>
															<Shield className="mr-2 h-4 w-4" />
															{t("settings.team.makeAdmin")}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleRoleChange(member.id, "member")
															}
															disabled={member.role === "member"}
														>
															<User className="mr-2 h-4 w-4" />
															{t("settings.team.makeMember")}
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<AlertDialog>
															<AlertDialogTrigger asChild>
																<DropdownMenuItem
																	className="text-destructive"
																	onSelect={(e) => e.preventDefault()}
																>
																	<X className="mr-2 h-4 w-4" />
																	{t("settings.team.remove")}
																</DropdownMenuItem>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		{t("settings.team.removeConfirmTitle")}
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		{t(
																			"settings.team.removeConfirmDesc",
																		).replace("{name}", member.user.name)}
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>
																		{t("settings.team.cancel")}
																	</AlertDialogCancel>
																	<AlertDialogAction
																		onClick={() =>
																			handleRemoveMember(member.id)
																		}
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
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Pending Invitations */}
			{invitations.length > 0 && (
				<>
					<Separator />
					<section className="space-y-4">
						<div>
							<h3 className="text-base sm:text-lg font-medium">
								{t("settings.team.pendingInvitations")} ({invitations.length})
							</h3>
						</div>

						<div className="grid gap-3">
							{invitations.map((invitation) => (
								<Card key={invitation.id} className="border-dashed">
									<CardContent className="p-4">
										<div className="flex items-center justify-between gap-4">
											<div className="flex items-center gap-3 min-w-0">
												<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
													<Mail className="h-5 w-5 text-muted-foreground" />
												</div>
												<div className="min-w-0">
													<span className="font-medium truncate block">
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
														onClick={() =>
															handleCancelInvitation(invitation.id)
														}
													>
														<X className="h-4 w-4" />
													</Button>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</section>
				</>
			)}

			{/* Permissions Info */}
			<Separator />
			<section className="space-y-4">
				<div>
					<h3 className="text-base sm:text-lg font-medium">
						{t("settings.team.rolePermissions")}
					</h3>
					<p className="text-sm text-muted-foreground">
						{t("settings.team.rolePermissionsDesc")}
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					{(["owner", "admin", "member"] as Role[]).map((role) => {
						const { labelKey, icon: Icon, color } = ROLE_LABELS[role];
						return (
							<Card key={role}>
								<CardContent className="p-4">
									<div className="flex items-center gap-2 mb-2">
										<Icon className={`h-5 w-5 ${color}`} />
										<span className="font-medium">{t(labelKey)}</span>
									</div>
									<ul className="text-sm text-muted-foreground space-y-1">
										{role === "owner" && (
											<>
												<li>• {t("settings.team.perm.all")}</li>
												<li>• {t("settings.team.perm.delete")}</li>
												<li>• {t("settings.team.perm.transfer")}</li>
											</>
										)}
										{role === "admin" && (
											<>
												<li>• {t("settings.team.perm.manage")}</li>
												<li>• {t("settings.team.perm.invite")}</li>
												<li>• {t("settings.team.perm.settings")}</li>
											</>
										)}
										{role === "member" && (
											<>
												<li>• {t("settings.team.perm.view")}</li>
												<li>• {t("settings.team.perm.use")}</li>
											</>
										)}
									</ul>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>
		</div>
	);
}
