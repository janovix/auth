import { ApiKeysView } from "@/components/settings/ApiKeysView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "API Keys | Janovix",
	description: "Manage API keys for programmatic access to the Janovix API.",
};

export default function ApiKeysSettingsPage() {
	return <ApiKeysView />;
}
