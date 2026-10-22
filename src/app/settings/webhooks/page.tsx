import { WebhooksView } from "@/components/settings/WebhooksView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Webhooks | Janovix",
	description:
		"Manage webhook endpoints for receiving event notifications from Janovix.",
};

export default function WebhooksPage() {
	return <WebhooksView />;
}
