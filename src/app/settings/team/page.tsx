import { TeamSettingsView } from "@/components/settings/TeamSettingsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Team Settings | Janovix",
	description:
		"Manage your organization's team members, roles, and invitations.",
};

export default function TeamSettingsPage() {
	return <TeamSettingsView />;
}
