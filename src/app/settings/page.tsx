import { PersonalSettingsView } from "@/components/settings/PersonalSettingsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Personal Settings | Yenio",
	description: "Manage your personal preferences and profile settings.",
};

export default function PersonalSettingsPage() {
	return <PersonalSettingsView />;
}
