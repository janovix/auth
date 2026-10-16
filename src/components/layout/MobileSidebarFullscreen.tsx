"use client";

import * as React from "react";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { ShaderBackdrop } from "@/components/shader/shader-backdrop";
import { AppSwitcher } from "./AppSwitcher";

interface MobileSidebarFullscreenProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Content for the fixed top section (e.g., OrgSwitcher) */
	topContent?: React.ReactNode;
	/** Main scrollable navigation content */
	children: React.ReactNode;
	/** Content for the fixed bottom section (e.g., Language/Theme/User) */
	bottomContent?: React.ReactNode;
}

export function MobileSidebarFullscreen({
	open,
	onOpenChange,
	topContent,
	children,
	bottomContent,
}: MobileSidebarFullscreenProps) {
	const { t } = useLanguage();

	// Gesture thresholds
	const SWIPE_THRESHOLD = 100; // px
	const VELOCITY_THRESHOLD = 500; // px/s

	const handleDragEnd = React.useCallback(
		(_: unknown, info: PanInfo) => {
			const { offset, velocity } = info;

			// Close if dragged right far enough or with enough velocity
			if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
				onOpenChange(false);
			}
		},
		[onOpenChange],
	);

	// Prevent body scroll when open and add class for dropdown styling
	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
			document.body.classList.add("mobile-sidebar-open");
		} else {
			document.body.style.overflow = "";
			document.body.classList.remove("mobile-sidebar-open");
		}
		return () => {
			document.body.style.overflow = "";
			document.body.classList.remove("mobile-sidebar-open");
		};
	}, [open]);

	return (
		<AnimatePresence mode="wait">
			{open && (
				<>
					{/* Backdrop - z-[100] to be above app navbar */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
						onClick={() => onOpenChange(false)}
						aria-hidden="true"
					/>

					{/* Fullscreen sidebar - z-[100] to be above app navbar */}
					<motion.div
						initial={{ x: "-100%", opacity: 0.8 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: "-100%", opacity: 0.8 }}
						transition={{
							type: "spring",
							damping: 30,
							stiffness: 300,
						}}
						drag="x"
						dragDirectionLock
						dragConstraints={{ left: 0, right: 0 }}
						dragElastic={{ left: 0, right: 0.5 }}
						onDragEnd={handleDragEnd}
						className={cn(
							"fixed inset-0 z-[100] flex flex-col",
							"touch-pan-y", // Allow vertical scrolling
						)}
						role="dialog"
						aria-modal="true"
						aria-label={t("mobileSidebar.navigation")}
					>
						<ShaderBackdrop position="absolute" />

						{/* Content container */}
						<div className="relative flex h-full flex-col">
							{/* Fixed header - App switcher + close button */}
							<header className="shrink-0 border-b border-white/20 bg-background/90 backdrop-blur-xl">
								<div className="flex h-18 items-center justify-between px-5">
									<AppSwitcher variant="mobile-fullscreen" />

									<button
										onClick={() => onOpenChange(false)}
										className={cn(
											"flex size-12 items-center justify-center rounded-2xl",
											"bg-white/10 text-foreground/80 transition-all duration-200",
											"border border-white/15",
											"hover:bg-white/20 hover:text-foreground hover:scale-105",
											"active:scale-95 active:bg-white/25",
											"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
											"shadow-lg shadow-black/10",
										)}
										aria-label={t("mobileSidebar.close")}
									>
										<X className="size-6" />
									</button>
								</div>
							</header>

							{/* Fixed top: Org Switcher */}
							{topContent && (
								<div
									className={cn(
										"shrink-0 px-4 py-2",
										// Style the org switcher menu button
										"[&_[data-sidebar=menu-button]]:min-h-14 [&_[data-sidebar=menu-button]]:text-base",
										"[&_[data-sidebar=menu-button]]:rounded-xl [&_[data-sidebar=menu-button]]:px-3",
										"[&_[data-sidebar=menu-button]_svg]:size-5",
										// Remove extra padding from the org switcher wrapper
										"[&>div]:p-0 [&>div]:border-0",
										// Ensure dropdowns appear above sidebar
										"[&_[data-radix-popper-content-wrapper]]:z-[200]",
									)}
									data-mobile-section="top"
								>
									{topContent}
								</div>
							)}

							{/* Scrollable middle: Navigation groups */}
							<div
								className={cn(
									"flex-1 overflow-y-auto overscroll-contain px-4 py-2 mobile-sidebar-fullscreen",
									// Mobile-optimized styles for larger touch targets
									"[&_[data-sidebar=menu-button]]:min-h-14 [&_[data-sidebar=menu-button]]:text-base [&_[data-sidebar=menu-button]]:py-3",
									"[&_[data-sidebar=menu-button]]:rounded-xl [&_[data-sidebar=menu-button]]:px-3 [&_[data-sidebar=menu-button]]:my-0.5",
									"[&_[data-sidebar=menu-button][data-active=true]]:bg-white/15 [&_[data-sidebar=menu-button][data-active=true]]:border [&_[data-sidebar=menu-button][data-active=true]]:border-white/20",
									"[&_[data-sidebar=menu-button]_svg]:size-5",
									// Group styling with dividers
									"[&_[data-sidebar=group]]:py-3 [&_[data-sidebar=group]]:px-0",
									"[&_[data-sidebar=group]]:border-b [&_[data-sidebar=group]]:border-white/10",
									"[&_[data-sidebar=group]:last-child]:border-b-0",
									// Label alignment - match menu button padding (px-3 + icon width + gap)
									"[&_[data-sidebar=group-label]]:text-sm [&_[data-sidebar=group-label]]:px-3 [&_[data-sidebar=group-label]]:opacity-70 [&_[data-sidebar=group-label]]:mb-1",
									"[&_[data-sidebar=separator]]:my-2 [&_[data-sidebar=separator]]:bg-white/10",
									"[&_[data-sidebar=content]]:gap-1",
									// Ensure dropdowns appear above sidebar
									"[&_[data-radix-popper-content-wrapper]]:z-[200]",
								)}
							>
								{children}
							</div>

							{/* Fixed bottom: Language, Theme, User */}
							{bottomContent && (
								<div
									className={cn(
										"shrink-0 border-t border-white/10 bg-background/50 backdrop-blur-xl px-4 py-3",
										// Style footer elements
										"[&_[data-sidebar=menu-button]]:min-h-14 [&_[data-sidebar=menu-button]]:text-base",
										"[&_[data-sidebar=menu-button]]:rounded-xl [&_[data-sidebar=menu-button]]:px-3 [&_[data-sidebar=menu-button]]:my-1",
										"[&_[data-sidebar=menu-button]_svg]:size-5",
										// Ensure dropdowns appear above sidebar
										"[&_[data-radix-popper-content-wrapper]]:z-[200]",
									)}
									data-mobile-section="bottom"
								>
									{bottomContent}
								</div>
							)}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

// Glassmorphism nav item component for mobile sidebar
interface MobileNavItemProps {
	icon: React.ReactNode;
	label: string;
	description?: string;
	isActive?: boolean;
	isComplete?: boolean;
	onClick?: () => void;
	href?: string;
}

export function MobileNavItem({
	icon,
	label,
	description,
	isActive,
	isComplete,
	onClick,
	href,
}: MobileNavItemProps) {
	const content = (
		<>
			<div
				className={cn(
					"flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors",
					isActive
						? "bg-primary text-primary-foreground"
						: "bg-white/10 text-foreground",
				)}
			>
				{icon}
			</div>
			<div className="flex-1 text-left">
				<div className="flex items-center gap-2">
					<span
						className={cn(
							"text-base font-medium",
							isActive && "text-primary-foreground",
						)}
					>
						{label}
					</span>
					{isComplete !== undefined && (
						<div
							className={cn(
								"size-2 rounded-full",
								isComplete ? "bg-green-500" : "bg-muted-foreground/30",
							)}
						/>
					)}
				</div>
				{description && (
					<span className="text-sm text-muted-foreground">{description}</span>
				)}
			</div>
		</>
	);

	const className = cn(
		"flex w-full items-center gap-4 rounded-2xl p-4 transition-all",
		"bg-white/5 backdrop-blur-sm",
		"border border-white/10",
		"hover:bg-white/10 hover:border-white/20",
		"active:scale-[0.98] active:bg-white/15",
		"focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
		isActive && "bg-primary/10 border-primary/30",
	);

	if (href) {
		return (
			<a href={href} className={className} onClick={onClick}>
				{content}
			</a>
		);
	}

	return (
		<button onClick={onClick} className={className}>
			{content}
		</button>
	);
}

// Section header for grouping nav items
interface MobileNavSectionProps {
	title: string;
	progress?: { completed: number; total: number };
	children: React.ReactNode;
}

export function MobileNavSection({
	title,
	progress,
	children,
}: MobileNavSectionProps) {
	return (
		<div className="mb-6">
			<div className="mb-3 flex items-center justify-between px-1">
				<h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
				{progress && (
					<div className="flex items-center gap-2">
						<div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
							<div
								className="h-full rounded-full bg-primary transition-all duration-300"
								style={{
									width: `${(progress.completed / progress.total) * 100}%`,
								}}
							/>
						</div>
						<span className="text-xs tabular-nums text-muted-foreground">
							{progress.completed}/{progress.total}
						</span>
					</div>
				)}
			</div>
			<div className="space-y-2">{children}</div>
		</div>
	);
}
