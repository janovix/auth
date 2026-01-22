import type { Meta, StoryObj } from "@storybook/react";
import {
	OrganizationSwitcher,
	type Organization,
} from "@/components/layout/OrganizationSwitcher";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/language-context";

const meta: Meta<typeof OrganizationSwitcher> = {
	title: "Layout/OrganizationSwitcher",
	component: OrganizationSwitcher,
	parameters: {
		layout: "centered",
	},
	decorators: [
		(Story) => (
			<LanguageProvider>
				<TooltipProvider>
					<SidebarProvider>
						<div className="w-64 p-4 bg-sidebar">
							<Story />
						</div>
					</SidebarProvider>
				</TooltipProvider>
			</LanguageProvider>
		),
	],
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof OrganizationSwitcher>;

const mockOrganizations: Organization[] = [
	{
		id: "org-1",
		name: "Acme Corporation",
		slug: "acme-corp",
		logo: null,
	},
	{
		id: "org-2",
		name: "Tech Startup Inc",
		slug: "tech-startup",
		logo: "https://avatars.githubusercontent.com/u/1?v=4",
	},
	{
		id: "org-3",
		name: "Global Enterprise",
		slug: "global-enterprise",
		logo: null,
	},
];

const activeOrganization: Organization = {
	id: "org-2",
	name: "Tech Startup Inc",
	slug: "tech-startup",
	logo: "https://avatars.githubusercontent.com/u/1?v=4",
};

/**
 * Default organization switcher with multiple organizations
 */
export const Default: Story = {
	args: {
		organizations: mockOrganizations,
		activeOrganization: activeOrganization,
		onOrganizationChange: () => {},
		onCreateOrganization: () => {},
		isLoading: false,
		organizationsOwned: 2,
		organizationsLimit: 5,
	},
};

/**
 * Organization switcher with logo displayed
 */
export const WithLogo: Story = {
	args: {
		organizations: mockOrganizations,
		activeOrganization: activeOrganization,
		onOrganizationChange: () => {},
		onCreateOrganization: () => {},
		isLoading: false,
		organizationsOwned: 2,
		organizationsLimit: 5,
	},
};

/**
 * Organization switcher without logo (shows initials)
 */
export const WithoutLogo: Story = {
	args: {
		organizations: mockOrganizations,
		activeOrganization: {
			id: "org-1",
			name: "Acme Corporation",
			slug: "acme-corp",
			logo: null,
		},
		onOrganizationChange: () => {},
		onCreateOrganization: () => {},
		isLoading: false,
		organizationsOwned: 1,
		organizationsLimit: 3,
	},
};

/**
 * Loading state
 */
export const Loading: Story = {
	args: {
		organizations: [],
		activeOrganization: null,
		onOrganizationChange: () => {},
		onCreateOrganization: () => {},
		isLoading: true,
		organizationsOwned: 0,
		organizationsLimit: 0,
	},
};

/**
 * No organizations - shows create button
 */
export const Empty: Story = {
	args: {
		organizations: [],
		activeOrganization: null,
		onOrganizationChange: () => {},
		onCreateOrganization: () => {},
		isLoading: false,
		organizationsOwned: 0,
		organizationsLimit: 1,
	},
};

/**
 * At organization limit - shows full progress indicator
 */
export const AtLimit: Story = {
	args: {
		organizations: mockOrganizations,
		activeOrganization: activeOrganization,
		onOrganizationChange: () => {},
		onCreateOrganization: () => {},
		isLoading: false,
		organizationsOwned: 5,
		organizationsLimit: 5,
	},
};

/**
 * Single organization (no dropdown needed)
 */
export const SingleOrganization: Story = {
	args: {
		organizations: [mockOrganizations[0]],
		activeOrganization: mockOrganizations[0],
		onOrganizationChange: () => {},
		onCreateOrganization: () => {},
		isLoading: false,
		organizationsOwned: 1,
		organizationsLimit: 1,
	},
};
