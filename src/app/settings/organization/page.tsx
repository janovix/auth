import { OrganizationSettingsView } from "@/components/settings/OrganizationSettingsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Organization Settings | Janovix",
	description: "Manage your organization profile and default settings.",
};

export default function OrganizationSettingsPage() {
	return <OrganizationSettingsView />;
}
