"use client";

import { useTheme } from "next-themes";
import { ThemeSwitcher as ShadcnThemeSwitcher } from "@/components/ui/shadcn-io/theme-switcher";

export function ThemeSwitcher({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme();

	return (
		<ShadcnThemeSwitcher
			value={theme as "light" | "dark" | "system"}
			onChange={setTheme}
			className={className}
		/>
	);
}
