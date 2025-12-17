// Shared router mocks for Storybook
export const mockRouter = {
	push: () => {},
	replace: () => {},
	refresh: () => {},
	back: () => {},
	forward: () => {},
	prefetch: () => Promise.resolve(),
};

// Initialize router mocks immediately
if (typeof window !== "undefined") {
	(window as any).__NEXT_ROUTER_MOCKS__ = mockRouter;
}
