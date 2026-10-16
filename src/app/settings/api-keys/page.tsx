import { ApiKeysView } from "@/components/settings/ApiKeysView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "API Keys | Yenio",
	description: "Manage API keys for programmatic access to the Yenio API.",
};

export default function ApiKeysSettingsPage() {
	return <ApiKeysView />;
}
