"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useRef,
	useCallback,
	type ReactNode,
} from "react";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import { getNotificationsServiceUrl } from "@/lib/auth/authCoreConfig";

export interface Notification {
	id: string;
	channelId: string | null;
	channelSlug: string | null;
	type: string;
	title: string;
	body: string;
	payload: Record<string, unknown> | null;
	severity: "info" | "warn" | "error";
	callbackUrl: string | null;
	createdAt: string;
}

interface NotificationsContextValue {
	notifications: Notification[];
	unreadCount: number;
	isConnected: boolean;
	markAsRead: (channelId: string, upToNotificationId: string) => Promise<void>;
	clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
	null,
);

export function useNotifications() {
	const context = useContext(NotificationsContext);
	if (!context) {
		throw new Error(
			"useNotifications must be used within a NotificationsProvider",
		);
	}
	return context;
}

interface NotificationsProviderProps {
	children: ReactNode;
}

export function NotificationsProvider({
	children,
}: NotificationsProviderProps) {
	const { data: session } = useAuthSession();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isConnected, setIsConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const reconnectAttempts = useRef(0);

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	const userId = session?.user?.id;

	// Extract JWT token from session for WebSocket authentication
	const getAuthToken = useCallback((): string | null => {
		// Try to get token from document cookie
		const cookies = document.cookie.split(";");
		for (const cookie of cookies) {
			const [name, value] = cookie.trim().split("=");
			// Better Auth typically uses 'better-auth.session_token' or similar
			if (
				name === "better-auth.session_token" ||
				name === "session_token" ||
				name === "auth_session"
			) {
				return decodeURIComponent(value);
			}
		}
		return null;
	}, []);

	// Connect to WebSocket
	const connect = useCallback(() => {
		if (!activeOrgId || !userId) return;

		// Clean up existing connection
		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		try {
			const baseUrl = getNotificationsServiceUrl();
			const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";
			const wsHost = baseUrl.replace(/^https?:\/\//, "");

			// Get auth token for WebSocket authentication
			const token = getAuthToken();
			if (!token) {
				console.error(
					"[Notifications] No auth token found, cannot connect to WebSocket",
				);
				return;
			}

			// Connect to org-wide broadcasts with token in query param
			const wsUrl = `${wsProtocol}://${wsHost}/realtime/org?token=${encodeURIComponent(token)}`;
			const orgWs = new WebSocket(wsUrl);

			orgWs.onopen = () => {
				console.log("[Notifications] WebSocket connected");
				setIsConnected(true);
				reconnectAttempts.current = 0;

				// Send client_hello with topic subscriptions
				orgWs.send(
					JSON.stringify({
						type: "client_hello",
						topics: ["system", "billing", "security"], // Subscribe to relevant channels
					}),
				);
			};

			orgWs.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);

					if (message.type === "notify") {
						// New notification received
						const notification = message.notification;
						setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
						setUnreadCount((prev) => prev + 1);

						// Show toast notification (optional)
						console.log("[Notifications] New notification:", notification);
					} else if (message.type === "server_hello") {
						console.log(
							"[Notifications] Subscribed to topics:",
							message.subscribedTopics,
						);
					} else if (message.type === "read_ack") {
						// Update unread count after mark as read
						setUnreadCount(message.unreadCount || 0);
					}
				} catch (error) {
					console.error("[Notifications] Failed to parse message:", error);
				}
			};

			orgWs.onerror = (error) => {
				console.error("[Notifications] WebSocket error:", error);
			};

			orgWs.onclose = () => {
				console.log("[Notifications] WebSocket disconnected");
				setIsConnected(false);

				// Attempt to reconnect with exponential backoff
				if (reconnectAttempts.current < 10) {
					const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
					reconnectTimeoutRef.current = setTimeout(() => {
						reconnectAttempts.current++;
						connect();
					}, delay);
				}
			};

			wsRef.current = orgWs;
		} catch (error) {
			console.error("[Notifications] Failed to establish connection:", error);
		}
	}, [activeOrgId, userId]);

	// Fetch initial unread count
	const fetchUnreadCount = useCallback(async () => {
		if (!activeOrgId) return;

		try {
			const baseUrl = getNotificationsServiceUrl();
			const response = await fetch(`${baseUrl}/api/notifications/unread`, {
				credentials: "include",
			});

			if (response.ok) {
				const data = (await response.json()) as {
					success: boolean;
					data?: { total: number };
				};
				setUnreadCount(data.data?.total || 0);
			}
		} catch (error) {
			console.error("[Notifications] Failed to fetch unread count:", error);
		}
	}, [activeOrgId]);

	// Fetch recent notifications
	const fetchNotifications = useCallback(async () => {
		if (!activeOrgId) return;

		try {
			const baseUrl = getNotificationsServiceUrl();
			const response = await fetch(`${baseUrl}/api/notifications?limit=20`, {
				credentials: "include",
			});

			if (response.ok) {
				const data = (await response.json()) as {
					success: boolean;
					data?: Notification[];
				};
				setNotifications(data.data || []);
			}
		} catch (error) {
			console.error("[Notifications] Failed to fetch notifications:", error);
		}
	}, [activeOrgId]);

	// Mark notifications as read
	const markAsRead = useCallback(
		async (channelId: string, upToNotificationId: string) => {
			if (!activeOrgId) return;

			try {
				const baseUrl = getNotificationsServiceUrl();
				const response = await fetch(`${baseUrl}/api/notifications/read`, {
					method: "POST",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ channelId, upToNotificationId }),
				});

				if (response.ok) {
					const data = (await response.json()) as {
						success: boolean;
						data?: { unreadCount: number };
					};
					setUnreadCount(data.data?.unreadCount || 0);
				}
			} catch (error) {
				console.error("[Notifications] Failed to mark as read:", error);
			}
		},
		[activeOrgId],
	);

	// Clear all notifications
	const clearAll = useCallback(() => {
		setNotifications([]);
	}, []);

	// Initialize connection and fetch data
	useEffect(() => {
		if (activeOrgId && userId) {
			connect();
			fetchUnreadCount();
			fetchNotifications();
		}

		return () => {
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
			}
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
		};
	}, [activeOrgId, userId, connect, fetchUnreadCount, fetchNotifications]);

	const value: NotificationsContextValue = {
		notifications,
		unreadCount,
		isConnected,
		markAsRead,
		clearAll,
	};

	return (
		<NotificationsContext.Provider value={value}>
			{children}
		</NotificationsContext.Provider>
	);
}
