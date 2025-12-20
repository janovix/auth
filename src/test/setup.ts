import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Set default environment variables for tests (must include https://)
if (!process.env.NEXT_PUBLIC_AUTH_SERVICE_URL) {
	process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
		"https://auth-svc.example.workers.dev";
}
if (!process.env.NEXT_PUBLIC_AUTH_APP_URL) {
	process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.workers.dev";
}
if (!process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL) {
	process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL = "https://app.example.workers.dev";
}

// Mock Turnstile component for tests
vi.mock("@marsidev/react-turnstile", () => ({
	Turnstile: vi.fn(({ onSuccess, siteKey }) => {
		// Auto-verify in tests by calling onSuccess after a brief delay
		React.useEffect(() => {
			if (onSuccess) {
				const timer = setTimeout(() => onSuccess("mock-turnstile-token"), 50);
				return () => clearTimeout(timer);
			}
		}, [onSuccess]);

		return React.createElement("div", {
			"data-testid": "turnstile-widget",
			"data-site-key": siteKey,
		});
	}),
}));

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
	observe() {
		// Mock implementation
	}
	unobserve() {
		// Mock implementation
	}
	disconnect() {
		// Mock implementation
	}
};

// Ensure window exists for React DOM scheduler
if (typeof window !== "undefined") {
	// Mock window.matchMedia for next-themes
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(), // deprecated
			removeListener: vi.fn(), // deprecated
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});

	// Mock requestAnimationFrame for React DOM scheduler
	if (typeof window.requestAnimationFrame === "undefined") {
		window.requestAnimationFrame = vi.fn((cb) => {
			return Number(setTimeout(cb, 0));
		}) as typeof window.requestAnimationFrame;
		window.cancelAnimationFrame = vi.fn((id) => {
			clearTimeout(id);
		}) as typeof window.cancelAnimationFrame;
	}
}
