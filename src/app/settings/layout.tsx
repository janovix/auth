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
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/contexts/language-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { authClient } from "@/lib/auth/authClient";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";

function SidebarContent({
	pathname,
	onNavClick,
}: {
	pathname: string;
	onNavClick?: () => void;
}) {
	const { t } = useLanguage();

	const navigation = [
		{
			name: t("settings.nav.personal"),
			href: "/settings",
			icon: User,
		},
		{
			name: t("settings.nav.organization"),
			href: "/settings/organization",
			icon: Building2,
		},
		{
			name: t("settings.nav.compliance"),
			href: "/settings/compliance",
			icon: Shield,
		},
		{
			name: t("settings.nav.team"),
			href: "/settings/team",
			icon: Users,
		},
	];

	return (
		<>
			<div className="mb-6">
				<h1 className="text-lg font-semibold">{t("settings.title")}</h1>
				<p className="text-sm text-muted-foreground">
					{t("settings.description")}
				</p>
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
								"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
								isActive
									? "bg-primary text-primary-foreground font-medium"
									: "text-muted-foreground hover:bg-accent hover:text-foreground",
							)}
						>
							<item.icon className="h-4 w-4 shrink-0" />
							<span className="truncate">{item.name}</span>
						</Link>
					);
				})}
			</nav>
		</>
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
		<div className="min-h-screen bg-background pt-14">
			{/* Top Navigation */}
			<header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex h-14 items-center justify-between px-3 sm:px-4 lg:px-6">
					<div className="flex items-center gap-2 sm:gap-4">
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
								<div className="p-4">
									<SidebarContent
										pathname={pathname}
										onNavClick={() => setMobileOpen(false)}
									/>
								</div>
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
									<DropdownMenuItem
										className="text-destructive"
										onClick={handleSignOut}
									>
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
				<aside className="fixed top-14 left-0 hidden lg:block h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-border bg-background p-4 overflow-y-auto">
					<SidebarContent pathname={pathname} />
				</aside>

				{/* Main Content - full width on mobile */}
				<main className="flex-1 overflow-auto min-w-0 lg:ml-64">
					<div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">{children}</div>
				</main>
			</div>
		</div>
	);
}
