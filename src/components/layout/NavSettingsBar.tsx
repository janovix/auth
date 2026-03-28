"use client";

import { LanguageSwitcher, ThemeSwitcher } from "@algenium/blocks";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/language-context";

const languages = [
	{ key: "en", label: "EN", nativeName: "English" },
	{ key: "es", label: "ES", nativeName: "Español" },
];

/**
 * Compact theme + language pickers for top-right placement (auth, onboarding, error pages).
 */
export function NavSettingsBar() {
	const { language, setLanguage, t } = useLanguage();
	return (
		<TooltipProvider delayDuration={0}>
			<div className="fixed top-3 right-4 z-50 flex items-center gap-2">
				<LanguageSwitcher
					languages={languages}
					currentLanguage={language}
					onLanguageChange={(key) => setLanguage(key as "en" | "es")}
					labels={{ language: t("language.label") }}
					variant="mini"
					size="sm"
					shape="rounded"
					side="bottom"
					align="end"
				/>
				<ThemeSwitcher
					variant="mini"
					size="sm"
					shape="rounded"
					side="bottom"
					align="end"
					labels={{
						theme: t("theme.label"),
						system: t("theme.system"),
						light: t("theme.light"),
						dark: t("theme.dark"),
					}}
				/>
			</div>
		</TooltipProvider>
	);
}
