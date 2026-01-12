import { ComplianceSettingsView } from "@/components/settings/ComplianceSettingsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "AML Compliance Settings | Janovix",
	description:
		"Manage your organization's AML compliance settings including RFC and vulnerable activity configuration.",
};

export default function ComplianceSettingsPage() {
	return <ComplianceSettingsView />;
}
