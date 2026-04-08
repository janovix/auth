export type Language = "en" | "es";

export function isLanguage(value: string): value is Language {
	return value === "en" || value === "es";
}

export type SettingsNavLanguage = {
	key: Language;
	label: string;
	nativeName: string;
};

export const SUPPORTED_LANGUAGES: SettingsNavLanguage[] = [
	{ key: "en", label: "EN", nativeName: "English" },
	{ key: "es", label: "ES", nativeName: "Español" },
];
