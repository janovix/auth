// Mock next/navigation at module level for Storybook
// This ensures router mocks are available before components render

const mockRouter = {
	push: () => {},
	replace: () => {},
	refresh: () => {},
	back: () => {},
	forward: () => {},
	prefetch: () => Promise.resolve(),
};

// Mock useRouter hook
export const useRouter = () => mockRouter;

// Mock usePathname hook (if used)
export const usePathname = () => "/";

// Mock useSearchParams hook (if used)
export const useSearchParams = () => new URLSearchParams();
