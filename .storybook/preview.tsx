import type { Preview } from "@storybook/react";
import { useEffect } from "react";

import "../src/app/globals.css";

export const globalTypes = {
	theme: {
		description: "Global theme for components (light/dark)",
		defaultValue: "light",
		toolbar: {
			icon: "mirror",
			items: [
				{ value: "light", title: "Light" },
				{ value: "dark", title: "Dark" },
			],
			dynamicTitle: true,
		},
	},
};

// Mock router functions for Next.js navigation
const mockRouter = {
	push: () => {},
	replace: () => {},
	refresh: () => {},
	back: () => {},
	forward: () => {},
	prefetch: () => Promise.resolve(),
};

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: "^on[A-Z].*" },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: "app",
			values: [{ name: "app", value: "transparent" }],
		},
		nextjs: {
			router: mockRouter,
		},
	},
	decorators: [
		(Story, context) => {
			const theme = context.globals.theme as string | undefined;

			useEffect(() => {
				const root = document.documentElement;
				root.classList.toggle("dark", theme === "dark");
			}, [theme]);

			// Ensure router mocks are available before rendering
			if (typeof window !== "undefined") {
				// Set router mocks in window for Storybook Next.js framework
				(window as any).__NEXT_ROUTER_MOCKS__ = mockRouter;
			}

			return (
				<div className="min-h-screen bg-background text-foreground p-6">
					<Story />
				</div>
			);
		},
	],
};

export default preview;
