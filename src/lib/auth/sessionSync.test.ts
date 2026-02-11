import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
	broadcastSignOut,
	broadcastSessionUpdate,
	revalidateSession,
	initSessionSync,
	closeSyncChannel,
	type SessionSyncMessage,
} from "./sessionSync";
import { sessionStore } from "./sessionStore";
import { authClient } from "./authClient";

// Mock authClient
vi.mock("./authClient", () => ({
	authClient: {
		getSession: vi.fn(),
	},
}));

// Mock BroadcastChannel
class MockBroadcastChannel {
	name: string;
	onmessage: ((event: MessageEvent) => void) | null = null;
	private listeners: Array<(event: MessageEvent) => void> = [];

	constructor(name: string) {
		this.name = name;
		// Store instance globally for testing
		(globalThis as any).__mockBroadcastChannel = this;
	}

	postMessage(message: any) {
		// Simulate message delivery to other tabs (not self)
		// In tests, we'll manually trigger this
	}

	addEventListener(type: string, listener: (event: MessageEvent) => void) {
		if (type === "message") {
			this.listeners.push(listener);
		}
	}

	removeEventListener(type: string, listener: (event: MessageEvent) => void) {
		if (type === "message") {
			this.listeners = this.listeners.filter((l) => l !== listener);
		}
	}

	close() {
		this.listeners = [];
	}

	// Test helper to simulate receiving a message
	_simulateMessage(message: any) {
		const event = new MessageEvent("message", { data: message });
		this.listeners.forEach((listener) => listener(event));
	}
}

describe("sessionSync", () => {
	beforeEach(() => {
		// Setup BroadcastChannel mock
		(globalThis as any).BroadcastChannel = MockBroadcastChannel;
		(globalThis as any).__mockBroadcastChannel = null;

		// Setup localStorage mock
		const localStorageMock: Record<string, string> = {};
		(globalThis as any).localStorage = {
			getItem: vi.fn((key: string) => localStorageMock[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				localStorageMock[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete localStorageMock[key];
			}),
		};

		// Setup window
		(globalThis as any).window = globalThis;

		// Reset session store
		sessionStore.set({ data: null, error: null, isPending: false });

		// Clear all mocks
		vi.clearAllMocks();
	});

	afterEach(() => {
		closeSyncChannel();
		delete (globalThis as any).__mockBroadcastChannel;
	});

	describe("broadcastSignOut", () => {
		it("posts SESSION_SIGNED_OUT message to BroadcastChannel", () => {
			broadcastSignOut();

			// Get the stored message from localStorage (fallback mechanism)
			const setItemCalls = (globalThis.localStorage.setItem as any).mock.calls;
			const syncCall = setItemCalls.find(
				(call: any) => call[0] === "janovix-session-sync-event",
			);

			expect(syncCall).toBeDefined();
			const message = JSON.parse(syncCall[1]) as SessionSyncMessage;
			expect(message.type).toBe("SESSION_SIGNED_OUT");
			expect(message.timestamp).toBeTypeOf("number");
		});
	});

	describe("broadcastSessionUpdate", () => {
		it("posts SESSION_UPDATED message to BroadcastChannel", () => {
			broadcastSessionUpdate();

			// Get the stored message from localStorage (fallback mechanism)
			const setItemCalls = (globalThis.localStorage.setItem as any).mock.calls;
			const syncCall = setItemCalls.find(
				(call: any) => call[0] === "janovix-session-sync-event",
			);

			expect(syncCall).toBeDefined();
			const message = JSON.parse(syncCall[1]) as SessionSyncMessage;
			expect(message.type).toBe("SESSION_UPDATED");
			expect(message.timestamp).toBeTypeOf("number");
		});
	});

	describe("revalidateSession", () => {
		it("updates session store when session is valid", async () => {
			const mockSession = {
				user: {
					id: "user-123",
					name: "Test User",
					email: "test@example.com",
					image: null,
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
					role: "user",
				},
				session: {
					id: "session-123",
					userId: "user-123",
					token: "token-123",
					expiresAt: new Date(Date.now() + 3600000),
					createdAt: new Date(),
					updatedAt: new Date(),
					ipAddress: "127.0.0.1",
					userAgent: "test-agent",
				},
			};

			vi.mocked(authClient.getSession).mockResolvedValue({
				data: mockSession,
				error: null,
			});

			const result = await revalidateSession();

			expect(result).toBe(true);
			expect(sessionStore.get().data).toBeDefined();
			expect(sessionStore.get().data?.user.id).toBe("user-123");
		});

		it("clears session store when session is invalid", async () => {
			// Set initial session
			sessionStore.set({
				data: {
					user: {
						id: "user-123",
						name: "Test User",
						email: "test@example.com",
						image: null,
						emailVerified: true,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					session: {
						id: "session-123",
						userId: "user-123",
						token: "token-123",
						expiresAt: new Date(),
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				},
				error: null,
				isPending: false,
			});

			vi.mocked(authClient.getSession).mockResolvedValue({
				data: null,
				error: new Error("Session expired"),
			});

			const result = await revalidateSession();

			expect(result).toBe(false);
			expect(sessionStore.get().data).toBeNull();
		});

		it("clears session store when getSession throws", async () => {
			vi.mocked(authClient.getSession).mockRejectedValue(
				new Error("Network error"),
			);

			const result = await revalidateSession();

			expect(result).toBe(false);
			expect(sessionStore.get().data).toBeNull();
		});
	});

	describe("initSessionSync", () => {
		it("sets up BroadcastChannel listener", () => {
			const mockCallback = vi.fn();
			const cleanup = initSessionSync(mockCallback);

			// Get the BroadcastChannel instance
			const channel = (globalThis as any).__mockBroadcastChannel;
			expect(channel).toBeDefined();

			// Simulate receiving a message
			const message: SessionSyncMessage = {
				type: "SESSION_SIGNED_OUT",
				timestamp: Date.now(),
			};
			channel._simulateMessage(message);

			expect(mockCallback).toHaveBeenCalledWith(message);

			// Cleanup
			cleanup();
		});

		it("sets up localStorage listener", () => {
			const mockCallback = vi.fn();
			const cleanup = initSessionSync(mockCallback);

			// Create storage event listeners array
			const storageListeners: Array<(event: StorageEvent) => void> = [];
			(globalThis as any).addEventListener = vi.fn(
				(type: string, listener: any) => {
					if (type === "storage") {
						storageListeners.push(listener);
					}
				},
			);
			(globalThis as any).removeEventListener = vi.fn();

			// Re-initialize to register with our mock addEventListener
			cleanup();
			initSessionSync(mockCallback);

			// Simulate storage event
			const message: SessionSyncMessage = {
				type: "SESSION_UPDATED",
				timestamp: Date.now(),
			};
			const event = new StorageEvent("storage", {
				key: "janovix-session-sync-event",
				newValue: JSON.stringify(message),
			});

			storageListeners.forEach((listener) => listener(event));

			expect(mockCallback).toHaveBeenCalledWith(message);
		});

		it("returns cleanup function that removes listeners", () => {
			const mockCallback = vi.fn();
			const cleanup = initSessionSync(mockCallback);

			// Cleanup should not throw
			expect(() => cleanup()).not.toThrow();

			// After cleanup, messages should not trigger callback
			const channel = (globalThis as any).__mockBroadcastChannel;
			if (channel) {
				const message: SessionSyncMessage = {
					type: "SESSION_SIGNED_OUT",
					timestamp: Date.now(),
				};
				channel._simulateMessage(message);

				// Callback should not be called after cleanup
				expect(mockCallback).not.toHaveBeenCalled();
			}
		});
	});

	describe("closeSyncChannel", () => {
		it("closes the BroadcastChannel", () => {
			// Initialize channel by calling broadcastSignOut
			broadcastSignOut();

			const channel = (globalThis as any).__mockBroadcastChannel;
			expect(channel).toBeDefined();

			const closeSpy = vi.spyOn(channel, "close");

			closeSyncChannel();

			expect(closeSpy).toHaveBeenCalled();
		});
	});

	describe("graceful degradation", () => {
		it("falls back to localStorage when BroadcastChannel is unavailable", () => {
			// Remove BroadcastChannel
			delete (globalThis as any).BroadcastChannel;

			broadcastSignOut();

			// Should still post to localStorage
			const setItemCalls = (globalThis.localStorage.setItem as any).mock.calls;
			const syncCall = setItemCalls.find(
				(call: any) => call[0] === "janovix-session-sync-event",
			);

			expect(syncCall).toBeDefined();
			const message = JSON.parse(syncCall[1]) as SessionSyncMessage;
			expect(message.type).toBe("SESSION_SIGNED_OUT");
		});
	});
});
