export type SettingsNavLanguage = {
	key: string;
	label: string;
	nativeName: string;
};

export const SUPPORTED_LANGUAGES: SettingsNavLanguage[] = [
	{ key: "en", label: "EN", nativeName: "English" },
	{ key: "es", label: "ES", nativeName: "Español" },
];
