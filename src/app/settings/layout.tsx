"use client";

import type React from "react";
import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, Spinner } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	User,
	Building2,
	Shield,
	Users,
	ChevronDown,
	Settings,
	LogOut,
	Menu,
	CreditCard,
	CheckCircle2,
	Circle,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/contexts/language-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { authClient } from "@/lib/auth/authClient";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";

interface NavItem {
	name: string;
	href: string;
	icon: typeof User;
	complete: boolean;
}

function SidebarContent({
	pathname,
	onNavClick,
	completionStatus,
}: {
	pathname: string;
	onNavClick?: () => void;
	completionStatus: Record<string, boolean>;
}) {
	const { t } = useLanguage();

	const navigation: NavItem[] = [
		{
			name: t("settings.nav.personal"),
			href: "/settings",
			icon: User,
			complete: completionStatus.personal ?? true,
		},
		{
			name: t("settings.nav.organization"),
			href: "/settings/organization",
			icon: Building2,
			complete: completionStatus.organization ?? true,
		},
		{
			name: t("settings.nav.billing"),
			href: "/settings/billing",
			icon: CreditCard,
			complete: completionStatus.billing ?? false,
		},
		{
			name: t("settings.nav.compliance"),
			href: "/settings/compliance",
			icon: Shield,
			complete: completionStatus.compliance ?? false,
		},
		{
			name: t("settings.nav.team"),
			href: "/settings/team",
			icon: Users,
			complete: completionStatus.team ?? true,
		},
	];

	const completedCount = navigation.filter((s) => s.complete).length;

	return (
		<div className="p-4 lg:p-6">
			<div className="mb-6">
				<h2 className="text-lg font-semibold text-foreground">
					{t("settings.title")}
				</h2>
				<p className="text-sm text-muted-foreground mt-0.5">
					{t("settings.description")}
				</p>
			</div>

			{/* Setup Progress */}
			<div className="mb-6 p-3 rounded-lg bg-secondary">
				<div className="flex items-center justify-between mb-2">
					<span className="text-xs font-medium text-muted-foreground">
						{t("settings.setupProgress") || "Setup Progress"}
					</span>
					<span className="text-xs font-semibold text-foreground">
						{completedCount}/{navigation.length}
					</span>
				</div>
				<div className="h-1.5 bg-muted rounded-full overflow-hidden">
					<div
						className="h-full bg-primary rounded-full transition-all duration-300"
						style={{ width: `${(completedCount / navigation.length) * 100}%` }}
					/>
				</div>
			</div>

			<nav className="space-y-1">
				{navigation.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href !== "/settings" && pathname.startsWith(item.href));
					return (
						<Link
							key={item.name}
							href={item.href}
							onClick={onNavClick}
							className={cn(
								"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
								"hover:bg-accent",
								isActive
									? "bg-primary text-primary-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<item.icon className="h-4 w-4 shrink-0" />
							<span className="flex-1 text-left truncate">{item.name}</span>
							{item.complete ? (
								<CheckCircle2
									className={cn(
										"h-4 w-4 shrink-0",
										isActive ? "text-primary-foreground/70" : "text-success",
									)}
								/>
							) : (
								<Circle
									className={cn(
										"h-4 w-4 shrink-0",
										isActive
											? "text-primary-foreground/40"
											: "text-muted-foreground/50",
									)}
								/>
							)}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);
	const { t } = useLanguage();
	const { data: session } = useAuthSession();

	const currentUser = {
		name: session?.user?.name || "User",
		email: session?.user?.email || "",
		image: session?.user?.image || null,
	};

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;
	const [orgName, setOrgName] = useState<string>("...");
	const [organizations, setOrganizations] = useState<
		Array<{ id: string; name: string; slug: string; logo?: string | null }>
	>([]);
	const [orgsLoading, setOrgsLoading] = useState(false);

	// Completion status for each section
	const [completionStatus, setCompletionStatus] = useState<
		Record<string, boolean>
	>({
		personal: true, // Profile always considered complete if user exists
		organization: true, // Org exists
		billing: false, // Has active subscription
		compliance: false, // Has AML settings
		team: true, // Has at least one member (owner)
	});

	// Fetch organizations and org name
	useEffect(() => {
		async function loadOrganizations() {
			try {
				setOrgsLoading(true);
				// List all organizations the user belongs to
				// Using direct API call to auth service
				const authServiceUrl = getAuthCoreBaseUrl();
				const response = await fetch(
					`${authServiceUrl}/api/auth/organization/list`,
					{
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
					},
				);

				if (response.ok) {
					const data = (await response.json()) as
						| Array<{
								id: string;
								name: string;
								slug: string;
								logo?: string | null;
						  }>
						| {
								organizations?: Array<{
									id: string;
									name: string;
									slug: string;
									logo?: string | null;
								}>;
						  };
					const orgs = Array.isArray(data) ? data : data.organizations || [];
					setOrganizations(
						orgs.map(
							(org: {
								id: string;
								name: string;
								slug: string;
								logo?: string | null;
							}) => ({
								id: org.id,
								name: org.name,
								slug: org.slug,
								logo: org.logo || null,
							}),
						),
					);

					// Set active org name
					if (activeOrgId) {
						const activeOrg = orgs.find(
							(o: { id: string }) => o.id === activeOrgId,
						);
						if (activeOrg) {
							setOrgName(activeOrg.name);
						} else {
							// Fallback: fetch full org details
							const fullOrgResult =
								await authClient.organization.getFullOrganization({
									query: { organizationId: activeOrgId },
								});
							if (fullOrgResult.data) {
								setOrgName(fullOrgResult.data.name);
							}
						}
					}
				}
			} catch {
				setOrgName("Organization");
			} finally {
				setOrgsLoading(false);
			}
		}
		loadOrganizations();
	}, [activeOrgId]);

	// Load completion status for sections
	useEffect(() => {
		async function loadCompletionStatus() {
			if (!activeOrgId) return;

			try {
				const authServiceUrl = getAuthCoreBaseUrl();

				// Check compliance settings
				const complianceResponse = await fetch(
					`${authServiceUrl}/api/settings/organization/${activeOrgId}/aml-compliance`,
					{ credentials: "include" },
				);
				if (complianceResponse.ok) {
					const complianceData = (await complianceResponse.json()) as {
						data?: { obligatedSubjectKey?: string };
					};
					setCompletionStatus((prev) => ({
						...prev,
						compliance: Boolean(complianceData.data?.obligatedSubjectKey),
					}));
				}

				// Check subscription status (billing)
				const billingResponse = await fetch(
					`${authServiceUrl}/api/billing/subscription/status`,
					{ credentials: "include" },
				);
				if (billingResponse.ok) {
					const billingData = (await billingResponse.json()) as {
						data?: { hasSubscription?: boolean };
					};
					setCompletionStatus((prev) => ({
						...prev,
						billing: Boolean(billingData.data?.hasSubscription),
					}));
				}
			} catch {
				// Silently fail - completion status is optional
			}
		}
		loadCompletionStatus();
	}, [activeOrgId]);

	const handleOrganizationChange = async (orgId: string) => {
		if (orgId === activeOrgId) return;

		try {
			const authServiceUrl = getAuthCoreBaseUrl();
			const response = await fetch(
				`${authServiceUrl}/api/auth/organization/set-active`,
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ organizationId: orgId }),
				},
			);

			if (!response.ok) {
				console.error("Failed to switch organization");
				return;
			}

			// Reload the page to reflect the new active organization
			window.location.reload();
		} catch (error) {
			console.error("Failed to switch organization:", error);
		}
	};

	const handleSignOut = async () => {
		await authClient.signOut();
		window.location.href = "/login";
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Top Navigation */}
			<header className="h-14 border-b border-border bg-card sticky top-0 z-40">
				<div className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between">
					{/* Logo & Org Selector */}
					<div className="flex items-center gap-2">
						<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="lg:hidden shrink-0"
								>
									<Menu className="h-5 w-5" />
									<span className="sr-only">Open menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-72 p-0">
								<SheetHeader className="p-4 border-b border-border">
									<SheetTitle className="flex items-center">
										<Logo variant="logo" width={100} height={18} />
									</SheetTitle>
								</SheetHeader>
								<SidebarContent
									pathname={pathname}
									onNavClick={() => setMobileOpen(false)}
									completionStatus={completionStatus}
								/>
							</SheetContent>
						</Sheet>

						<Link href="/" className="hidden lg:flex items-center">
							<Logo variant="logo" width={100} height={18} />
						</Link>

						{activeOrgId && (
							<>
								<span className="text-muted-foreground hidden lg:inline">
									/
								</span>
								<Suspense
									fallback={
										<div className="h-5 w-24 bg-muted animate-pulse rounded" />
									}
								>
									<DropdownMenu>
										<DropdownMenuTrigger
											disabled={orgsLoading}
											className="flex items-center gap-1 text-sm font-medium hover:text-foreground max-w-[180px] sm:max-w-[200px] lg:max-w-none disabled:opacity-50"
										>
											<span className="truncate">
												{orgsLoading ? "..." : orgName}
											</span>
											<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start" className="w-56">
											<DropdownMenuLabel>
												{t("settings.nav.organizations")}
											</DropdownMenuLabel>
											<DropdownMenuSeparator />
											{organizations.length === 0 ? (
												<DropdownMenuItem disabled>
													<span className="text-muted-foreground text-sm">
														No organizations
													</span>
												</DropdownMenuItem>
											) : (
												organizations.map((org) => (
													<DropdownMenuItem
														key={org.id}
														onClick={() => handleOrganizationChange(org.id)}
														className={cn(
															"flex items-center gap-2 cursor-pointer",
															org.id === activeOrgId && "bg-accent font-medium",
														)}
													>
														{org.logo ? (
															<img
																src={org.logo}
																alt={org.name}
																className="h-4 w-4 rounded object-contain"
															/>
														) : (
															<Building2 className="h-4 w-4 text-muted-foreground" />
														)}
														<span className="flex-1 truncate">{org.name}</span>
														{org.id === activeOrgId && (
															<span className="text-xs text-muted-foreground">
																{t("settings.nav.active") || "Active"}
															</span>
														)}
													</DropdownMenuItem>
												))
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</Suspense>
							</>
						)}
					</div>

					<div className="flex items-center gap-1 sm:gap-2">
						<div className="hidden sm:flex items-center gap-1">
							<ThemeSwitcher />
						</div>
						<LanguageSwitcher />
						<Suspense
							fallback={
								<div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
							}
						>
							<DropdownMenu>
								<DropdownMenuTrigger className="flex items-center gap-2">
									<Avatar className="h-8 w-8">
										<AvatarImage src={currentUser.image || undefined} />
										<AvatarFallback className="bg-primary text-primary-foreground text-sm">
											{currentUser.name
												.split(" ")
												.map((n: string) => n[0])
												.join("")
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel>
										<div className="flex flex-col">
											<span>{currentUser.name}</span>
											<span className="text-xs font-normal text-muted-foreground">
												{currentUser.email}
											</span>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<div className="px-2 py-1.5 sm:hidden">
										<ThemeSwitcher />
									</div>
									<DropdownMenuSeparator className="sm:hidden" />
									<DropdownMenuItem asChild>
										<Link href="/settings">
											<Settings className="mr-2 h-4 w-4" />
											{t("settings.title")}
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleSignOut}>
										<LogOut className="mr-2 h-4 w-4" />
										{t("settings.nav.signOut")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</Suspense>
					</div>
				</div>
			</header>

			<div className="flex">
				{/* Desktop Sidebar */}
				<aside className="hidden lg:block w-64 border-r border-border bg-card min-h-[calc(100vh-56px)] sticky top-14">
					<SidebarContent
						pathname={pathname}
						completionStatus={completionStatus}
					/>
				</aside>

				{/* Main Content */}
				<main className="flex-1 min-h-[calc(100vh-56px)]">
					<div className="max-w-4xl mx-auto p-6 lg:p-8">{children}</div>
				</main>
			</div>
		</div>
	);
}
