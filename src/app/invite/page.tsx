import { InviteView } from "@/components/auth/InviteView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Organization Invitation | Janovix",
	description: "Accept or decline your organization invitation.",
};

export default function InvitePage() {
	return <InviteView />;
}
