"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	User,
	Building2,
	Shield,
	Users,
	CreditCard,
	CheckCircle2,
	Circle,
	Search,
	LayoutDashboard,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { authClient } from "@/lib/auth/authClient";
import {
	OrganizationSwitcher,
	type Organization,
} from "./OrganizationSwitcher";
import { NavUser } from "./NavUser";
import { AppSwitcher } from "./AppSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { getAmlAppUrl, getWatchlistAppUrl } from "@/lib/auth/authCoreConfig";
import { useLanguage } from "@/contexts/language-context";

type NavItem = {
	name: string;
	href: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	complete: boolean;
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	organizations: Organization[];
	activeOrganization: Organization | null;
	onOrganizationChange: (organization: Organization) => void;
	completionStatus: Record<string, boolean>;
	isLoading?: boolean;
	organizationsOwned?: number;
	organizationsLimit?: number;
}

export function AppSidebar({
	organizations,
	activeOrganization,
	onOrganizationChange,
	completionStatus,
	isLoading = false,
	organizationsOwned = 0,
	organizationsLimit = 0,
	...props
}: AppSidebarProps) {
	const { t } = useLanguage();
	const pathname = usePathname();
	const router = useRouter();
	const { isMobile, setOpenMobile } = useSidebar();
	const { data: session, isPending } = useAuthSession();

	// User settings navigation items
	const userNavItems: NavItem[] = [
		{
			name: t("settings.nav.personal"),
			href: "/settings",
			icon: User,
			complete: completionStatus.personal ?? true,
		},
		{
			name: t("settings.nav.billing"),
			href: "/settings/billing",
			icon: CreditCard,
			complete: completionStatus.billing ?? false,
		},
	];

	// Organization settings navigation items
	const orgNavItems: NavItem[] = [
		{
			name: t("settings.nav.organization"),
			href: "/settings/organization",
			icon: Building2,
			complete: completionStatus.organization ?? true,
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

	// Products navigation items (external links)
	const productsNavItems = [
		{
			name: t("settings.nav.aml"),
			href: getAmlAppUrl(),
			icon: LayoutDashboard,
			external: true,
		},
		{
			name: t("settings.nav.watchlist"),
			href: getWatchlistAppUrl(),
			icon: Search,
			external: true,
		},
	];

	const userCompletedCount = userNavItems.filter((s) => s.complete).length;
	const orgCompletedCount = orgNavItems.filter((s) => s.complete).length;

	// Check if a nav item is active
	const isNavActive = React.useCallback(
		(itemHref: string) => {
			if (!pathname) return false;
			// For root settings page, only match exact path
			if (itemHref === "/settings") {
				return pathname === "/settings";
			}
			return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
		},
		[pathname],
	);

	const handleLinkClick = React.useCallback(() => {
		if (isMobile) {
			setOpenMobile(false);
		}
	}, [isMobile, setOpenMobile]);

	const handleCreateOrganization = React.useCallback(() => {
		router.push("/settings/organization/new");
	}, [router]);

	const handleLogout = async () => {
		try {
			await authClient.signOut();
			window.location.href = "/login";
		} catch (error) {
			console.error("Failed to sign out:", error);
			// Still redirect to login on failure - session may be invalid anyway
			window.location.href = "/login";
		}
	};

	const user = session?.user
		? {
				name: session.user.name || "User",
				email: session.user.email || "",
				avatar: session.user.image || undefined,
			}
		: null;

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader className="h-16 border-b border-sidebar-border flex items-center justify-center">
				{/* App Switcher (replaces static Logo) */}
				<AppSwitcher />
			</SidebarHeader>

			<SidebarContent>
				{/* Organization Switcher */}
				<div className="p-2 border-b border-sidebar-border">
					<OrganizationSwitcher
						organizations={organizations}
						activeOrganization={activeOrganization}
						onOrganizationChange={onOrganizationChange}
						onCreateOrganization={handleCreateOrganization}
						isLoading={isLoading || isPending}
						organizationsOwned={organizationsOwned}
						organizationsLimit={organizationsLimit}
					/>
				</div>
				{/* User Settings Group */}
				<SidebarGroup>
					{/* User Progress Header */}
					<div className="px-3 pt-3 pb-2 group-data-[collapsible=icon]:hidden">
						<div className="flex items-center justify-between mb-1.5">
							<span className="text-xs font-medium text-muted-foreground">
								{t("settings.nav.userSettings")}
							</span>
							<span className="text-xs font-semibold text-muted-foreground">
								{userCompletedCount}/{userNavItems.length}
							</span>
						</div>
						<div className="h-1 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-primary rounded-full transition-all duration-300"
								style={{
									width: `${(userCompletedCount / userNavItems.length) * 100}%`,
								}}
							/>
						</div>
					</div>
					<SidebarGroupContent>
						<SidebarMenu>
							{userNavItems.map((item) => {
								const Icon = item.icon;
								const isActive = isNavActive(item.href);

								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.name}
										>
											<Link href={item.href} onClick={handleLinkClick}>
												<Icon />
												<span className="flex-1">{item.name}</span>
												{item.complete ? (
													<CheckCircle2
														className={cn(
															"h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden",
															isActive
																? "text-sidebar-accent-foreground/70"
																: "text-success",
														)}
													/>
												) : (
													<Circle
														className={cn(
															"h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden",
															isActive
																? "text-sidebar-accent-foreground/40"
																: "text-muted-foreground/50",
														)}
													/>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Organization Settings Group */}
				<SidebarGroup>
					{/* Organization Progress Header */}
					<div className="px-3 pt-3 pb-2 group-data-[collapsible=icon]:hidden">
						<div className="flex items-center justify-between mb-1.5">
							<span className="text-xs font-medium text-muted-foreground">
								{t("settings.nav.orgSettings")}
							</span>
							<span className="text-xs font-semibold text-muted-foreground">
								{orgCompletedCount}/{orgNavItems.length}
							</span>
						</div>
						<div className="h-1 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-primary rounded-full transition-all duration-300"
								style={{
									width: `${(orgCompletedCount / orgNavItems.length) * 100}%`,
								}}
							/>
						</div>
					</div>
					<SidebarGroupContent>
						<SidebarMenu>
							{orgNavItems.map((item) => {
								const Icon = item.icon;
								const isActive = isNavActive(item.href);

								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.name}
										>
											<Link href={item.href} onClick={handleLinkClick}>
												<Icon />
												<span className="flex-1">{item.name}</span>
												{item.complete ? (
													<CheckCircle2
														className={cn(
															"h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden",
															isActive
																? "text-sidebar-accent-foreground/70"
																: "text-success",
														)}
													/>
												) : (
													<Circle
														className={cn(
															"h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden",
															isActive
																? "text-sidebar-accent-foreground/40"
																: "text-muted-foreground/50",
														)}
													/>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Products Group */}
				<SidebarGroup>
					<SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
						{t("settings.nav.products")}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{productsNavItems.map((item) => {
								const Icon = item.icon;

								return (
									<SidebarMenuItem key={item.name}>
										<SidebarMenuButton asChild tooltip={item.name}>
											<a
												href={item.href}
												onClick={handleLinkClick}
												target="_blank"
												rel="noopener noreferrer"
											>
												<Icon />
												<span>{item.name}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border">
				{/* Language and Theme Switchers */}
				<div className="flex items-center justify-between px-2 py-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-1">
					<LanguageSwitcher
						variant="default"
						size="sm"
						shape="rounded"
						showIcon
						side="right"
						align="start"
						className="group-data-[collapsible=icon]:hidden"
					/>
					<LanguageSwitcher
						variant="mini"
						size="sm"
						shape="rounded"
						side="right"
						align="center"
						className="hidden group-data-[collapsible=icon]:flex"
					/>
					<ThemeSwitcher
						variant="default"
						size="sm"
						shape="rounded"
						side="right"
						align="start"
						className="group-data-[collapsible=icon]:hidden"
					/>
					<ThemeSwitcher
						variant="mini"
						size="sm"
						shape="rounded"
						side="right"
						align="center"
						className="hidden group-data-[collapsible=icon]:flex"
					/>
				</div>
				<NavUser user={user} isLoading={isPending} onLogout={handleLogout} />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
