import { SettingsView } from "@/components/settings/SettingsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Settings | Janovix",
	description: "Manage your account settings and preferences in Janovix.",
};

/**
 * Settings page - displays user settings and preferences.
 *
 * The session is already hydrated at the root layout level,
 * so SettingsView has immediate access to session data without any blink.
 * The middleware.ts ensures only authenticated users reach this page.
 */
export default function SettingsPage() {
	return <SettingsView />;
}
