import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Set default environment variables for tests
if (!process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL) {
	process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL = "auth-svc.janovix.workers.dev";
}
if (!process.env.AUTH_CORE_BASE_URL) {
	process.env.AUTH_CORE_BASE_URL = "auth-svc.janovix.workers.dev";
}

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
