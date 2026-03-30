import type React from "react";
import type { Metadata } from "next";
import { getSidebarCollapsedServer } from "@/lib/settings/settingsServer";
import { SettingsLayoutClient } from "@/components/layout/SettingsLayoutClient";

export const metadata: Metadata = {
	title: "Your Products | Janovix",
	description: "Open AML, Watchlist, and other products included in your plan.",
};

export default async function ProductsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const initialSidebarCollapsed = await getSidebarCollapsedServer();

	return (
		<SettingsLayoutClient initialSidebarCollapsed={initialSidebarCollapsed}>
			{children}
		</SettingsLayoutClient>
	);
}
