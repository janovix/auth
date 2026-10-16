import { WebhooksView } from "@/components/settings/WebhooksView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Webhooks | Yenio",
	description:
		"Manage webhook endpoints for receiving event notifications from Yenio.",
};

export default function WebhooksPage() {
	return <WebhooksView />;
}
