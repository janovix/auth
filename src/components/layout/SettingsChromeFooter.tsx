"use client";

import { NavbarClock } from "@/components/ui/navbar-clock";
import { useSidebar } from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export interface SettingsChromeFooterProps {
	timezone: string | null;
	clockFormat: "12h" | "24h";
}

/**
 * Bottom chrome bar aligned with AML DashboardFooter (no UMA): clock + logo,
 * height tracks sidebar icon rail when collapsed.
 */
export function SettingsChromeFooter({
	timezone,
	clockFormat,
}: SettingsChromeFooterProps) {
	const { state, isMobile } = useSidebar();
	const iconRail = state === "collapsed" && !isMobile;

	return (
		<footer
			className={cn(
				"box-border flex shrink-0 items-center justify-between border-t border-sidebar-border bg-background px-4 py-2",
				iconRail ? "h-[calc(1rem+2rem+1px)]" : "h-[calc(1rem+3rem+1px)]",
			)}
		>
			<div
				className={cn(
					"flex items-center gap-2 overflow-hidden",
					iconRail ? "min-h-8 max-h-8" : "min-h-12 max-h-12",
				)}
			>
				<NavbarClock
					timezone={timezone ?? undefined}
					defaultFormat={clockFormat}
					size="sm"
					showTimezoneMismatch={true}
				/>
			</div>
			<Logo
				variant="logo"
				className={cn("opacity-40", iconRail ? "max-h-6" : "max-h-8")}
			/>
		</footer>
	);
}
