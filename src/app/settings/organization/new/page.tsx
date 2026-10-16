import { CreateOrganizationView } from "@/components/settings/CreateOrganizationView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Create Organization | Yenio",
	description: "Create a new organization in Yenio.",
};

export default function CreateOrganizationPage() {
	return <CreateOrganizationView />;
}
