import type { Preview } from "@storybook/react";
import { useEffect } from "react";

// Import setup file to initialize router mocks before any components render
import "./setup";

import "../src/app/globals.css";
import { ThemeProvider } from "../src/components/ThemeProvider";
import { LanguageProvider } from "../src/contexts/language-context";
import { mockRouter } from "../src/stories/mocks/router";

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

			return (
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<LanguageProvider>
						<div className="min-h-screen bg-background text-foreground p-6">
							<Story />
						</div>
					</LanguageProvider>
				</ThemeProvider>
			);
		},
	],
};

export default preview;
