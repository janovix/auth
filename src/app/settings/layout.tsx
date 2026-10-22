import type React from "react";
import type { Metadata } from "next";
import { getSidebarCollapsedServer } from "@/lib/settings/settingsServer";
import { SettingsLayoutClient } from "@/components/layout/SettingsLayoutClient";

export const metadata: Metadata = {
	title: "Settings | Janovix",
	description: "Manage your account settings and preferences.",
};

export default async function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Fetch sidebar collapsed state server-side to avoid flash
	const initialSidebarCollapsed = await getSidebarCollapsedServer();

	return (
		<SettingsLayoutClient initialSidebarCollapsed={initialSidebarCollapsed}>
			{children}
		</SettingsLayoutClient>
	);
}
