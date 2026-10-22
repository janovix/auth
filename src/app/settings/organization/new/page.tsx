import { CreateOrganizationView } from "@/components/settings/CreateOrganizationView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Create Organization | Janovix",
	description: "Create a new organization in Janovix.",
};

export default function CreateOrganizationPage() {
	return <CreateOrganizationView />;
}
