import "@testing-library/jest-dom/vitest";

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
