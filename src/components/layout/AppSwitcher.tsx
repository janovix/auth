"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Home,
	LayoutGrid,
	LayoutDashboard,
	Search,
	Settings,
	ChevronDown,
	ExternalLink,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/contexts/language-context";
import { useSettingsSidebarProductAccess } from "@/contexts/settings-sidebar-product-context";
import {
	getHomepageUrl,
	getAmlAppUrl,
	getWatchlistAppUrl,
} from "@/lib/auth/authCoreConfig";
import { cn } from "@/lib/utils";

type AppItem = {
	id: string;
	name: string;
	description: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	external: boolean;
	current: boolean;
};

interface AppSwitcherProps {
	/** Variant for different contexts */
	variant?: "sidebar" | "mobile-fullscreen";
	/** Custom class name */
	className?: string;
}

export function AppSwitcher({
	variant = "sidebar",
	className,
}: AppSwitcherProps) {
	const pathname = usePathname();
	const { isMobile, state } = useSidebar();
	const isCollapsed = state === "collapsed";
	const { t } = useLanguage();
	const { hasAmlAccess } = useSettingsSidebarProductAccess();

	const apps: AppItem[] = React.useMemo(() => {
		const onProducts = pathname?.startsWith("/products") ?? false;
		const onSettings = pathname?.startsWith("/settings") ?? false;
		return [
			{
				id: "homepage",
				name: t("appSwitcher.homepage"),
				description: t("appSwitcher.homepageDescription"),
				href: getHomepageUrl(),
				icon: Home,
				external: true,
				current: false,
			},
			{
				id: "products",
				name: t("appSwitcher.products"),
				description: t("appSwitcher.productsDescription"),
				href: "/products",
				icon: LayoutGrid,
				external: false,
				current: onProducts,
			},
			...(hasAmlAccess
				? [
						{
							id: "aml",
							name: t("appSwitcher.aml"),
							description: t("appSwitcher.amlDescription"),
							href: getAmlAppUrl(),
							icon: LayoutDashboard,
							external: true,
							current: false,
						},
					]
				: []),
			{
				id: "watchlist",
				name: t("appSwitcher.watchlist"),
				description: t("appSwitcher.watchlistDescription"),
				href: getWatchlistAppUrl(),
				icon: Search,
				external: true,
				current: false,
			},
			{
				id: "settings",
				name: t("appSwitcher.settings"),
				description: t("appSwitcher.settingsDescription"),
				href: "/settings",
				icon: Settings,
				external: false,
				current: onSettings && !onProducts,
			},
		];
	}, [t, pathname, hasAmlAccess]);

	const currentApp =
		apps.find((app) => app.current) ??
		apps.find((a) => a.id === "products") ??
		apps[1];

	// Mobile fullscreen variant - larger, more prominent with full logo
	if (variant === "mobile-fullscreen") {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						className={cn(
							"flex items-center gap-2 rounded-xl px-3 py-2 transition-colors",
							"hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
							className,
						)}
					>
						<Logo variant="logo" width={120} height={28} />
						<ChevronDown className="size-5 opacity-70" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="w-72 rounded-xl border-white/10 bg-background/95 backdrop-blur-xl z-[200]"
					align="start"
					sideOffset={8}
				>
					<DropdownMenuLabel className="text-xs text-muted-foreground px-3 py-2">
						{t("appSwitcher.title")}
					</DropdownMenuLabel>
					<DropdownMenuSeparator className="bg-white/10" />
					{apps.map((app) => {
						const Icon = app.icon;
						const rowClass = "flex items-center gap-3";
						return (
							<DropdownMenuItem
								key={app.id}
								asChild
								className="cursor-pointer rounded-lg p-3 mx-1 my-0.5"
							>
								{app.external ? (
									<a
										href={app.href}
										target="_blank"
										rel="noopener noreferrer"
										className={rowClass}
									>
										<div
											className={cn(
												"flex size-10 items-center justify-center rounded-lg",
												app.current
													? "bg-primary/20 text-primary border border-primary/30"
													: "bg-muted text-muted-foreground",
											)}
										>
											<Icon className="size-5" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">{app.name}</span>
												{app.current && (
													<span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
														{t("appSwitcher.currentApp")}
													</span>
												)}
											</div>
											<span className="text-xs text-muted-foreground">
												{app.description}
											</span>
										</div>
										<ExternalLink className="size-4 text-muted-foreground" />
									</a>
								) : (
									<Link href={app.href} className={rowClass}>
										<div
											className={cn(
												"flex size-10 items-center justify-center rounded-lg",
												app.current
													? "bg-primary/20 text-primary border border-primary/30"
													: "bg-muted text-muted-foreground",
											)}
										>
											<Icon className="size-5" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">{app.name}</span>
												{app.current && (
													<span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
														{t("appSwitcher.currentApp")}
													</span>
												)}
											</div>
											<span className="text-xs text-muted-foreground">
												{app.description}
											</span>
										</div>
									</Link>
								)}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	// Collapsed sidebar variant - icon only
	if (isCollapsed) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="justify-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Logo variant="icon" width={32} height={32} />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="min-w-64 rounded-lg"
							align="start"
							side="right"
							sideOffset={4}
						>
							<DropdownMenuLabel className="text-xs text-muted-foreground">
								{t("appSwitcher.title")}
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{apps.map((app) => {
								const Icon = app.icon;
								const rowClass = "cursor-pointer gap-3 p-2 flex";
								return (
									<DropdownMenuItem key={app.id} asChild className={rowClass}>
										{app.external ? (
											<a
												href={app.href}
												target="_blank"
												rel="noopener noreferrer"
												className="flex gap-3"
											>
												<div
													className={cn(
														"flex size-8 items-center justify-center rounded-md",
														app.current
															? "bg-primary text-primary-foreground"
															: "bg-muted",
													)}
												>
													<Icon className="size-4" />
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<span className="font-medium">{app.name}</span>
														{app.current && (
															<span className="text-[10px] text-muted-foreground">
																{t("appSwitcher.currentApp")}
															</span>
														)}
													</div>
													<span className="text-xs text-muted-foreground">
														{app.description}
													</span>
												</div>
												<ExternalLink className="size-3.5 text-muted-foreground" />
											</a>
										) : (
											<Link href={app.href} className="flex gap-3">
												<div
													className={cn(
														"flex size-8 items-center justify-center rounded-md",
														app.current
															? "bg-primary text-primary-foreground"
															: "bg-muted",
													)}
												>
													<Icon className="size-4" />
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<span className="font-medium">{app.name}</span>
														{app.current && (
															<span className="text-[10px] text-muted-foreground">
																{t("appSwitcher.currentApp")}
															</span>
														)}
													</div>
													<span className="text-xs text-muted-foreground">
														{app.description}
													</span>
												</div>
											</Link>
										)}
									</DropdownMenuItem>
								);
							})}
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	// Expanded sidebar variant - full logo with dropdown (no icon, just logo)
	return (
		<SidebarMenu className={className}>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Logo variant="logo" width={120} height={28} />
							<ChevronDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-xs text-muted-foreground">
							{t("appSwitcher.title")}
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{apps.map((app) => {
							const Icon = app.icon;
							const rowClass = "cursor-pointer gap-3 p-2 flex";
							return (
								<DropdownMenuItem key={app.id} asChild className={rowClass}>
									{app.external ? (
										<a
											href={app.href}
											target="_blank"
											rel="noopener noreferrer"
											className="flex gap-3"
										>
											<div
												className={cn(
													"flex size-8 items-center justify-center rounded-md",
													app.current
														? "bg-primary text-primary-foreground"
														: "bg-muted",
												)}
											>
												<Icon className="size-4" />
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className="font-medium">{app.name}</span>
													{app.current && (
														<span className="text-[10px] text-muted-foreground">
															{t("appSwitcher.currentApp")}
														</span>
													)}
												</div>
												<span className="text-xs text-muted-foreground">
													{app.description}
												</span>
											</div>
											<ExternalLink className="size-3.5 text-muted-foreground" />
										</a>
									) : (
										<Link href={app.href} className="flex gap-3">
											<div
												className={cn(
													"flex size-8 items-center justify-center rounded-md",
													app.current
														? "bg-primary text-primary-foreground"
														: "bg-muted",
												)}
											>
												<Icon className="size-4" />
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className="font-medium">{app.name}</span>
													{app.current && (
														<span className="text-[10px] text-muted-foreground">
															{t("appSwitcher.currentApp")}
														</span>
													)}
												</div>
												<span className="text-xs text-muted-foreground">
													{app.description}
												</span>
											</div>
										</Link>
									)}
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
