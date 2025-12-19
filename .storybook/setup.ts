// Storybook setup file - runs before all stories
// This ensures router mocks are available before any components render

import { mockRouter } from "../src/stories/mocks/router";

// Ensure router mocks are available globally before Storybook loads
if (typeof window !== "undefined") {
	(window as any).__NEXT_ROUTER_MOCKS__ = mockRouter;
}

// Also set up for the Storybook Next.js framework
if (typeof global !== "undefined") {
	(global as any).__NEXT_ROUTER_MOCKS__ = mockRouter;
}
