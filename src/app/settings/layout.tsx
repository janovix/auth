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

	// Fetch org name if we have an active org
	useEffect(() => {
		if (activeOrgId) {
			authClient.organization
				.getFullOrganization({
					query: { organizationId: activeOrgId },
				})
				.then((result) => {
					if (result.data) {
						setOrgName(result.data.name);
					}
				})
				.catch(() => {
					setOrgName("Organization");
				});
		}
	}, [activeOrgId]);

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
										<DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-foreground max-w-[180px] sm:max-w-[200px] lg:max-w-none">
											<span className="truncate">{orgName}</span>
											<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start">
											<DropdownMenuLabel>
												{t("settings.nav.organizations")}
											</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem>
												<Building2 className="mr-2 h-4 w-4" />
												{orgName}
											</DropdownMenuItem>
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
