"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	AlertTriangle,
	FileQuestion,
	Lock,
	Settings,
	ShieldOff,
} from "lucide-react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLanguage } from "@/contexts/language-context";
import { usePageStatus, type PageStatus } from "@/contexts/page-status-context";

/**
 * Route segment to translation key mapping for settings pages
 */
const ROUTE_LABELS: Record<string, string> = {
	settings: "settings.title",
	organization: "settings.nav.organization",
	billing: "settings.nav.billing",
	compliance: "settings.nav.compliance",
	team: "settings.nav.team",
	"api-keys": "settings.nav.apiKeys",
	webhooks: "settings.nav.webhooks",
	new: "settings.organization.create",
};

/**
 * Page status to translation key mapping
 */
const STATUS_LABELS: Record<Exclude<PageStatus, "normal">, string> = {
	"not-found": "breadcrumb.notFound",
	error: "breadcrumb.error",
	forbidden: "breadcrumb.forbidden",
	unauthorized: "breadcrumb.unauthorized",
};

/**
 * Page status to icon mapping
 */
const STATUS_ICONS: Record<
	Exclude<PageStatus, "normal">,
	React.ComponentType<{ className?: string }>
> = {
	"not-found": FileQuestion,
	error: AlertTriangle,
	forbidden: ShieldOff,
	unauthorized: Lock,
};

interface BreadcrumbSegment {
	label: string;
	href: string;
	isCurrentPage: boolean;
}

export function NavBreadcrumb() {
	const pathname = usePathname();
	const { t } = useLanguage();
	const { status } = usePageStatus();

	const segments = React.useMemo((): BreadcrumbSegment[] => {
		if (!pathname) return [];

		const pathSegments = pathname.split("/").filter(Boolean);

		if (pathSegments.length === 0) {
			return [];
		}

		// Build breadcrumb segments
		const breadcrumbs: BreadcrumbSegment[] = [];
		let currentPath = "";

		for (let i = 0; i < pathSegments.length; i++) {
			const segment = pathSegments[i];
			currentPath += `/${segment}`;

			// Get translation key or fallback
			const labelKey = ROUTE_LABELS[segment];
			const label = labelKey
				? t(labelKey)
				: segment.charAt(0).toUpperCase() + segment.slice(1);

			breadcrumbs.push({
				label,
				href: currentPath,
				isCurrentPage: i === pathSegments.length - 1,
			});
		}

		return breadcrumbs;
	}, [pathname, t]);

	// Get error status display info if not in normal state
	const isErrorPage = status !== "normal";
	const StatusIcon = isErrorPage ? STATUS_ICONS[status] : null;
	const statusLabel = isErrorPage ? t(STATUS_LABELS[status]) : null;

	// Don't render if we're at the root or there are no segments
	if (segments.length === 0) {
		return (
			<Breadcrumb className="min-w-0 flex-1">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage className="flex items-center gap-1.5">
							{isErrorPage && StatusIcon ? (
								<>
									<StatusIcon className="h-4 w-4" />
									<span className="hidden sm:inline">{statusLabel}</span>
								</>
							) : (
								<>
									<Settings className="h-4 w-4" />
									<span className="hidden sm:inline">
										{t("settings.title")}
									</span>
								</>
							)}
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	// When in error state, replace the last segment with error status
	// and make all other segments links (since the last segment is the error)
	const displaySegments = isErrorPage ? segments.slice(0, -1) : segments;

	return (
		<Breadcrumb className="min-w-0 flex-1">
			<BreadcrumbList className="flex-nowrap overflow-x-auto scrollbar-hide">
				{displaySegments.map((segment, index) => (
					<React.Fragment key={segment.href}>
						{index > 0 && <BreadcrumbSeparator className="shrink-0" />}
						<BreadcrumbItem className="shrink-0">
							{segment.isCurrentPage && !isErrorPage ? (
								<BreadcrumbPage className="flex items-center gap-1.5">
									{index === 0 && <Settings className="h-4 w-4" />}
									{segment.label}
								</BreadcrumbPage>
							) : (
								<BreadcrumbLink asChild>
									<Link
										href={segment.href}
										className="flex items-center gap-1.5"
									>
										{index === 0 && <Settings className="h-4 w-4" />}
										{segment.label}
									</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</React.Fragment>
				))}
				{/* Error status segment - shown when page is in error state */}
				{isErrorPage && StatusIcon && statusLabel && (
					<>
						{displaySegments.length > 0 && (
							<BreadcrumbSeparator className="shrink-0" />
						)}
						<BreadcrumbItem className="shrink-0">
							<BreadcrumbPage className="flex items-center gap-1.5 text-muted-foreground">
								<StatusIcon className="h-4 w-4" />
								{statusLabel}
							</BreadcrumbPage>
						</BreadcrumbItem>
					</>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
