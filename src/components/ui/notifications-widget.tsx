"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	Bell,
	CheckCheck,
	Trash2,
	X,
	Info,
	AlertTriangle,
	CheckCircle,
	XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/**
 * NotificationsWidget - A compact notification bell for navigation bars
 *
 * @description
 * Displays a bell icon with unread count badge, plays sound on new notifications,
 * and shows a popover with recent notifications that can be marked as read or dismissed.
 *
 * @example
 * ```tsx
 * <NotificationsWidget
 *   notifications={notifications}
 *   onMarkAsRead={(id) => markAsRead(id)}
 *   onMarkAllAsRead={() => markAllAsRead()}
 *   onDismiss={(id) => dismiss(id)}
 *   onClearAll={() => clearAll()}
 *   playSound={true}
 * />
 * ```
 */

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
	id: string;
	title: string;
	message?: string;
	type?: NotificationType;
	timestamp: Date;
	read?: boolean;
	href?: string;
	channelId?: string;
}

type WidgetSize = "sm" | "md" | "lg";
type DotColor = "red" | "blue" | "green" | "amber" | "purple" | "primary";
type SoundType = "chime" | "bell" | "pop" | "ding" | "none";
type PulseStyle = "ring" | "glow" | "bounce" | "none";

export interface NotificationsWidgetProps {
	notifications: Notification[];
	/**
	 * Called when a notification becomes visible (scroll into view).
	 * Should return a Promise - if rejected, the notification will be reverted to unread.
	 * Uses optimistic update: marks as read immediately, reverts on failure.
	 */
	onMarkAsRead?: (id: string) => void | Promise<void>;
	/**
	 * Called when "Mark all as read" button is clicked.
	 * Should return a Promise - if rejected, notifications will be reverted to unread.
	 * Uses optimistic update: marks all as read immediately, reverts on failure.
	 */
	onMarkAllAsRead?: () => void | Promise<void>;
	onDismiss?: (id: string) => void;
	onClearAll?: () => void;
	onNotificationClick?: (notification: Notification) => void;
	size?: WidgetSize;
	/**
	 * Maximum number of notifications to show in the list.
	 * Default: 5 on desktop. Scroll to see more.
	 */
	maxVisible?: number;
	playSound?: boolean;
	soundUrl?: string;
	className?: string;
	emptyMessage?: string;
	title?: string;
	dotColor?: DotColor;
	showPulse?: boolean;
	soundType?: SoundType;
	pulseStyle?: PulseStyle;
	soundCooldown?: number;
}

const sizeConfig = {
	sm: {
		button: "h-8 w-8",
		icon: "w-4 h-4",
		badge: "min-w-[16px] h-4 text-[10px] -top-1 -right-1",
		dot: "w-2.5 h-2.5 top-0 right-0",
	},
	md: {
		button: "h-9 w-9",
		icon: "w-5 h-5",
		badge: "min-w-[18px] h-[18px] text-[11px] -top-1 -right-1",
		dot: "w-3 h-3 top-0 right-0",
	},
	lg: {
		button: "h-10 w-10",
		icon: "w-6 h-6",
		badge: "min-w-[20px] h-5 text-xs -top-1.5 -right-1.5",
		dot: "w-3.5 h-3.5 top-0 right-0",
	},
};

const typeConfig: Record<
	NotificationType,
	{ icon: typeof Info; color: string; bg: string }
> = {
	info: {
		icon: Info,
		color: "text-blue-500",
		bg: "bg-blue-500/10",
	},
	success: {
		icon: CheckCircle,
		color: "text-green-500",
		bg: "bg-green-500/10",
	},
	warning: {
		icon: AlertTriangle,
		color: "text-amber-500",
		bg: "bg-amber-500/10",
	},
	error: {
		icon: XCircle,
		color: "text-red-500",
		bg: "bg-red-500/10",
	},
};

const dotColorConfig: Record<DotColor, string> = {
	red: "bg-red-500",
	blue: "bg-blue-500",
	green: "bg-green-500",
	amber: "bg-amber-500",
	purple: "bg-purple-500",
	primary: "bg-primary",
};

const soundConfig: Record<
	Exclude<SoundType, "none">,
	{ frequencies: number[]; durations: number[]; gain: number }
> = {
	chime: {
		frequencies: [880, 1100],
		durations: [0.1, 0.2],
		gain: 0.3,
	},
	bell: {
		frequencies: [523, 659, 784],
		durations: [0.15, 0.15, 0.2],
		gain: 0.25,
	},
	pop: {
		frequencies: [400, 600],
		durations: [0.05, 0.08],
		gain: 0.4,
	},
	ding: {
		frequencies: [1200],
		durations: [0.15],
		gain: 0.2,
	},
};

const pulseVariants: Record<
	Exclude<PulseStyle, "none">,
	{ animate: object; transition: object }
> = {
	ring: {
		animate: { scale: [1, 1.8], opacity: [0.6, 0] },
		transition: {
			duration: 1.2,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeOut",
		},
	},
	glow: {
		animate: { scale: [1, 1.3, 1], opacity: [0.8, 0.4, 0.8] },
		transition: {
			duration: 1.5,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		},
	},
	bounce: {
		animate: { scale: [1, 1.2, 1], y: [0, -2, 0] },
		transition: {
			duration: 0.6,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		},
	},
};

function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSecs < 60) return "just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;
	return date.toLocaleDateString();
}

// Simple notification sound using Web Audio API
function playNotificationSound(
	soundType: SoundType = "chime",
	soundUrl?: string,
) {
	if (typeof window === "undefined" || soundType === "none") return;

	if (soundUrl) {
		const audio = new Audio(soundUrl);
		audio.volume = 0.5;
		audio.play().catch(() => {});
		return;
	}

	const config = soundConfig[soundType];
	if (!config) return;

	try {
		const audioContext = new (
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext
		)();

		let currentTime = audioContext.currentTime;

		config.frequencies.forEach((freq, i) => {
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.frequency.setValueAtTime(freq, currentTime);
			gainNode.gain.setValueAtTime(config.gain, currentTime);
			gainNode.gain.exponentialRampToValueAtTime(
				0.01,
				currentTime + config.durations[i],
			);

			oscillator.start(currentTime);
			oscillator.stop(currentTime + config.durations[i]);

			currentTime += config.durations[i] * 0.7;
		});
	} catch {
		// Silently fail if audio is not supported
	}
}

export function NotificationsWidget({
	notifications,
	onMarkAsRead,
	onMarkAllAsRead,
	onDismiss,
	onClearAll,
	onNotificationClick,
	size = "md",
	maxVisible = 5,
	playSound = true,
	soundUrl,
	className,
	emptyMessage = "No notifications",
	title = "Notifications",
	dotColor = "red",
	showPulse = true,
	soundType = "chime",
	pulseStyle = "ring",
	soundCooldown = 2000,
}: NotificationsWidgetProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [prevCount, setPrevCount] = React.useState(0);
	const lastSoundPlayedRef = React.useRef<number>(0);
	const styles = sizeConfig[size];
	const dotBgColor = dotColorConfig[dotColor];

	// Track optimistically marked-as-read notifications (before API confirms)
	const [optimisticReadIds, setOptimisticReadIds] = React.useState<Set<string>>(
		new Set(),
	);
	// Track notifications that are being processed (to avoid duplicate calls)
	const processingIdsRef = React.useRef<Set<string>>(new Set());
	// Track notifications that have been marked via intersection observer (to avoid re-marking)
	const intersectedIdsRef = React.useRef<Set<string>>(new Set());
	// Scroll container ref for IntersectionObserver
	const scrollContainerRef = React.useRef<HTMLDivElement>(null);

	// Compute read state considering both server state and optimistic updates
	const getIsRead = React.useCallback(
		(notification: Notification) => {
			return notification.read || optimisticReadIds.has(notification.id);
		},
		[optimisticReadIds],
	);

	// Store latest notifications and read checker in refs for IntersectionObserver
	// (initialized after getIsRead is defined to avoid circular dependency)
	const notificationsRef = React.useRef<Notification[]>(notifications);
	const getIsReadRef = React.useRef(getIsRead);

	// Keep refs up to date
	React.useEffect(() => {
		notificationsRef.current = notifications;
	}, [notifications]);

	React.useEffect(() => {
		getIsReadRef.current = getIsRead;
	}, [getIsRead]);

	const unreadCount = notifications.filter((n) => !getIsRead(n)).length;

	// Clean up optimistic read IDs when server confirms (notification.read becomes true)
	// Also remove stale IDs that no longer exist in the notifications array
	React.useEffect(() => {
		setOptimisticReadIds((prev) => {
			const next = new Set(prev);
			let changed = false;
			const notificationIds = new Set(notifications.map((n) => n.id));

			// Remove IDs that are now confirmed read by server OR don't exist anymore
			prev.forEach((id) => {
				const notification = notifications.find((n) => n.id === id);

				// Remove if notification doesn't exist anymore (stale ID)
				if (!notificationIds.has(id)) {
					next.delete(id);
					changed = true;
					return;
				}

				// Remove if server confirmed it as read
				if (notification?.read === true) {
					next.delete(id);
					changed = true;
				}
			});
			return changed ? next : prev;
		});
	}, [notifications]);

	// Sort notifications by timestamp (most recent first) for better UX
	const sortedNotifications = React.useMemo(
		() =>
			[...notifications].sort(
				(a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
			),
		[notifications],
	);

	// Calculate max height based on notification count (each ~72px, show max 5)
	const notificationHeight = 72; // Approximate height per notification
	const maxListHeight = Math.min(maxVisible, 5) * notificationHeight;

	const hasMore = sortedNotifications.length > maxVisible;

	// Play sound when new notifications arrive (with cooldown)
	// Note: We play sound when unreadCount increases, even if going from 0 to 1+
	React.useEffect(() => {
		if (playSound && soundType !== "none" && unreadCount > prevCount) {
			const now = Date.now();
			if (now - lastSoundPlayedRef.current >= soundCooldown) {
				playNotificationSound(soundType, soundUrl);
				lastSoundPlayedRef.current = now;
			}
		}
		setPrevCount(unreadCount);
	}, [unreadCount, prevCount, soundType, soundUrl, soundCooldown, playSound]);

	/**
	 * Optimistic mark-as-read with rollback on failure
	 * 1. Mark as read immediately (optimistic)
	 * 2. Call async API
	 * 3. If API fails, revert to unread (rollback)
	 */
	const handleMarkAsRead = React.useCallback(
		async (notificationId: string) => {
			// Skip if already read, already processing, or no handler
			if (!onMarkAsRead) return;
			if (processingIdsRef.current.has(notificationId)) return;

			// Use refs to access latest state
			const notification = notificationsRef.current.find(
				(n) => n.id === notificationId,
			);
			if (!notification || getIsReadRef.current(notification)) {
				return;
			}

			// Mark as processing
			processingIdsRef.current.add(notificationId);

			// Optimistic update - mark as read immediately
			setOptimisticReadIds((prev) => new Set(prev).add(notificationId));

			try {
				// Call the async handler
				await Promise.resolve(onMarkAsRead(notificationId));
				// Success - keep optimistic state until server updates notification.read
				// DON'T clear optimisticReadIds here, let it persist until server confirms
			} catch {
				// Rollback - revert to unread
				setOptimisticReadIds((prev) => {
					const next = new Set(prev);
					next.delete(notificationId);
					return next;
				});
			} finally {
				// Remove from processing
				processingIdsRef.current.delete(notificationId);
			}
		},
		[onMarkAsRead],
	);

	/**
	 * Optimistic mark-all-as-read with rollback on failure
	 */
	const handleMarkAllAsRead = React.useCallback(async () => {
		if (!onMarkAllAsRead) return;

		// Get all unread notification IDs
		const unreadIds = notifications
			.filter((n) => !getIsRead(n))
			.map((n) => n.id);

		if (unreadIds.length === 0) return;

		// Optimistic update - mark all as read immediately
		setOptimisticReadIds((prev) => {
			const next = new Set(prev);
			unreadIds.forEach((id) => next.add(id));
			return next;
		});

		try {
			// Call the async handler
			await Promise.resolve(onMarkAllAsRead());
			// Success - keep the optimistic state
		} catch {
			// Rollback - revert all to unread
			setOptimisticReadIds((prev) => {
				const next = new Set(prev);
				unreadIds.forEach((id) => next.delete(id));
				return next;
			});
		}
	}, [notifications, onMarkAllAsRead, getIsRead]);

	/**
	 * IntersectionObserver to detect visible notifications and mark as read
	 * IMPORTANT: Only create observer once when popover opens, don't recreate on every notification change
	 */
	React.useEffect(() => {
		if (!isOpen || !onMarkAsRead) return;

		// Reset intersected IDs when popover opens
		intersectedIdsRef.current.clear();

		// Wait a tick for the DOM to render
		const timeoutId = setTimeout(() => {
			const scrollContainer = scrollContainerRef.current;
			if (!scrollContainer) {
				return;
			}

			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const notificationId = entry.target.getAttribute(
								"data-notification-id",
							);
							if (
								notificationId &&
								!intersectedIdsRef.current.has(notificationId)
							) {
								// Mark this notification as having been intersected
								intersectedIdsRef.current.add(notificationId);

								// Use refs to access latest state without recreating observer
								const notification = notificationsRef.current.find(
									(n) => n.id === notificationId,
								);
								const isRead = notification
									? getIsReadRef.current(notification)
									: false;

								if (notification && !isRead) {
									handleMarkAsRead(notificationId);
								}
							}
						}
					});
				},
				{
					root: scrollContainer,
					threshold: 0.5, // Trigger when 50% visible
				},
			);

			// Observe all notification elements within the scroll container
			const notificationElements = scrollContainer.querySelectorAll(
				"[data-notification-id]",
			);
			notificationElements.forEach((el) => observer.observe(el));

			// Store cleanup function
			return () => {
				observer.disconnect();
			};
		}, 100);

		return () => {
			clearTimeout(timeoutId);
		};
		// CRITICAL: Only depend on isOpen and onMarkAsRead, NOT notifications or getIsRead
		// This prevents recreating the observer when notifications are marked as read
		// We use refs to access the latest notification/read state
	}, [isOpen, onMarkAsRead, handleMarkAsRead]);

	const handleNotificationClick = (notification: Notification) => {
		// Mark as read when clicked (if not already)
		if (!getIsRead(notification)) {
			handleMarkAsRead(notification.id);
		}
		if (notification.href) {
			onNotificationClick?.(notification);
		}
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<motion.button
					className={cn(
						"relative inline-flex items-center justify-center rounded-lg",
						"bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors",
						styles.button,
						className,
					)}
					whileTap={{ scale: 0.95 }}
					aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
				>
					<Bell className={cn(styles.icon, "text-muted-foreground")} />

					{/* Unread indicator - only show dot, no number */}
					<AnimatePresence>
						{unreadCount > 0 && (
							<motion.div
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}
								className={cn(
									"absolute rounded-full z-10",
									dotBgColor,
									styles.dot,
								)}
							/>
						)}
					</AnimatePresence>

					{/* Pulse animation for new notifications */}
					<AnimatePresence>
						{unreadCount > 0 && showPulse && pulseStyle !== "none" && (
							<motion.div
								initial={{ scale: 1, opacity: 0.5 }}
								animate={pulseVariants[pulseStyle].animate as never}
								transition={pulseVariants[pulseStyle].transition}
								className={cn(
									"absolute rounded-full z-0",
									dotBgColor,
									styles.dot,
								)}
							/>
						)}
					</AnimatePresence>
				</motion.button>
			</PopoverTrigger>

			<PopoverContent
				side="bottom"
				align="end"
				className="w-80 p-0 overflow-hidden"
			>
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-border">
					<div className="flex items-center gap-2">
						<h4 className="font-semibold text-sm">{title}</h4>
						{unreadCount > 0 && (
							<span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
								{unreadCount} new
							</span>
						)}
					</div>
					<div className="flex items-center gap-1">
						{unreadCount > 0 && onMarkAllAsRead && (
							<Button
								variant="ghost"
								size="sm"
								className="h-7 px-2 text-xs"
								onClick={handleMarkAllAsRead}
							>
								<CheckCheck className="w-3.5 h-3.5 mr-1" />
								Mark all read
							</Button>
						)}
					</div>
				</div>

				{/* Notification List */}
				{sortedNotifications.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 px-4 text-center">
						<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
							<Bell className="w-6 h-6 text-muted-foreground" />
						</div>
						<p className="text-sm text-muted-foreground">{emptyMessage}</p>
					</div>
				) : (
					<>
						<div
							ref={scrollContainerRef}
							className="overflow-y-auto"
							style={{ maxHeight: `${maxListHeight}px` }}
						>
							<div className="divide-y divide-border">
								{sortedNotifications
									.slice(0, maxVisible)
									.map((notification) => {
										const config = typeConfig[notification.type || "info"];
										const Icon = config.icon;
										const hasLink = !!notification.href;
										const isRead = getIsRead(notification);

										const handleClick = () =>
											handleNotificationClick(notification);
										const handleKeyDown = (
											e: React.KeyboardEvent<HTMLElement>,
										) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												handleNotificationClick(notification);
											}
										};

										// Use button for clickable notifications, div for non-clickable
										const MotionElement = hasLink ? motion.button : motion.div;
										const interactionProps = hasLink
											? {
													role: "button" as const,
													tabIndex: 0,
													onClick: handleClick,
													onKeyDown: handleKeyDown,
												}
											: {};

										return (
											<MotionElement
												key={notification.id}
												data-notification-id={notification.id}
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className={cn(
													"relative flex gap-3 px-4 py-3 transition-colors group w-full text-left border-0 bg-transparent",
													hasLink && "cursor-pointer hover:bg-muted/50",
													!hasLink && "cursor-default",
													!isRead && "bg-primary/5",
												)}
												{...interactionProps}
											>
												{/* Type Icon */}
												<div
													className={cn(
														"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
														config.bg,
													)}
												>
													<Icon className={cn("w-4 h-4", config.color)} />
												</div>

												{/* Content */}
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between gap-2">
														<p
															className={cn(
																"text-sm line-clamp-1",
																!isRead ? "font-semibold" : "font-medium",
																hasLink && "group-hover:underline",
															)}
														>
															{notification.title}
														</p>
													</div>
													{notification.message && (
														<p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
															{notification.message}
														</p>
													)}
													<p className="text-[10px] text-muted-foreground/70 mt-1">
														{formatTimeAgo(notification.timestamp)}
													</p>
												</div>

												<div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													{onDismiss && (
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 text-muted-foreground hover:text-destructive"
															onClick={(e) => {
																e.stopPropagation();
																onDismiss(notification.id);
															}}
														>
															<X className="w-3 h-3" />
														</Button>
													)}
												</div>
											</MotionElement>
										);
									})}
							</div>
						</div>

						{/* Footer */}
						{(hasMore || onClearAll) && (
							<div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
								{hasMore && (
									<span className="text-xs text-muted-foreground">
										+{sortedNotifications.length - maxVisible} more
									</span>
								)}
								{onClearAll && sortedNotifications.length > 0 && (
									<Button
										variant="ghost"
										size="sm"
										className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
										onClick={() => onClearAll()}
									>
										<Trash2 className="w-3 h-3 mr-1" />
										Clear all
									</Button>
								)}
							</div>
						)}
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}
