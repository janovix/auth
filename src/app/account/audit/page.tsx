import { AuditView } from "@/components/audit/AuditView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Audit Logs | Janovix",
	description:
		"View and manage audit logs for compliance and security monitoring.",
};

/**
 * Audit page - displays audit logs for admin users.
 *
 * This page requires admin access. Non-admin users will see an access denied message.
 * The middleware.ts ensures only authenticated users reach this page.
 */
export default function AuditPage() {
	return <AuditView />;
}
