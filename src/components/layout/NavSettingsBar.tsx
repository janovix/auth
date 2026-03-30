"use client";

// Intentional @algenium/blocks usage: matches SettingsLayoutClient (mini LanguageSwitcher +
// ThemeSwitcher with shared labels/tooltips). The repo’s shadcn-io ThemeSwitcher has a
// different API (no mini variant / label map), and there is no local LanguageSwitcher.
import { LanguageSwitcher, ThemeSwitcher } from "@algenium/blocks";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/language-context";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/supportedLanguages";

/**
 * Compact theme + language pickers for top-right placement (auth, onboarding, error pages).
 */
export function NavSettingsBar() {
	const { language, setLanguage, t } = useLanguage();
	return (
		<TooltipProvider delayDuration={0}>
			<div className="fixed top-3 right-4 z-50 flex items-center gap-2">
				<LanguageSwitcher
					languages={SUPPORTED_LANGUAGES}
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
