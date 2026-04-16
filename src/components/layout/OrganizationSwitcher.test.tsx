import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
	OrganizationSwitcher,
	type Organization,
} from "./OrganizationSwitcher";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LanguageProvider } from "@/contexts/language-context";
import { EnvironmentContext } from "@algenium/blocks";

describe("OrganizationSwitcher", () => {
	const mockOrganizations: Organization[] = [
		{
			id: "1",
			name: "Org One",
			slug: "org-one",
			logo: undefined,
			role: "owner",
		},
		{
			id: "2",
			name: "Org Two",
			slug: "org-two",
			logo: undefined,
			role: "owner",
		},
	];

	it("shows environment mini badge when EnvironmentContext is provided", async () => {
		const setEnvironment = vi.fn();
		render(
			<LanguageProvider>
				<EnvironmentContext.Provider
					value={{
						environment: "development",
						setEnvironment,
						environments: ["production", "staging", "development"],
					}}
				>
					<SidebarProvider defaultOpen={true}>
						<OrganizationSwitcher
							organizations={mockOrganizations}
							activeOrganization={mockOrganizations[0]}
							onOrganizationChange={vi.fn()}
							isLoading={false}
						/>
					</SidebarProvider>
				</EnvironmentContext.Provider>
			</LanguageProvider>,
		);

		expect(await screen.findByText("Dev")).toBeInTheDocument();
	});
});
