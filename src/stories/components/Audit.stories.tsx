import type { Meta, StoryObj } from "@storybook/react";
import { AuditView } from "@/components/audit/AuditView";
import { AuditLogTable } from "@/components/audit/AuditLogTable";
import { AuditLogFilters } from "@/components/audit/AuditLogFilters";
import { AuditLogDetail } from "@/components/audit/AuditLogDetail";
import { IntegrityChecker } from "@/components/audit/IntegrityChecker";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/language-context";
import {
	AuthSessionProvider,
	createSessionStore,
	type SessionSnapshot,
} from "@/lib/auth/useAuthSession";
import { Button } from "@/components/ui/button";
import type { AuditLog } from "@/lib/audit/types";
import type { AuditLogFilters as Filters } from "@/lib/audit/types";
import { useState } from "react";

const createSnapshot = (
	overrides?: Partial<SessionSnapshot>,
): SessionSnapshot => ({
	data: {
		user: {
			id: "story-user",
			name: "Usuario Storybook",
			email: "storybook@janovix.com",
			image: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			emailVerified: true,
		},
		session: {
			id: "session-story",
			userId: "story-user",
			token: "storybook-token",
			createdAt: new Date(),
			updatedAt: new Date(),
			expiresAt: new Date(Date.now() + 7200 * 1000),
			ipAddress: "127.0.0.1",
			userAgent: "Storybook",
		},
	},
	error: null,
	isPending: false,
	...overrides,
});

const decorators = [
	(Story: any) => (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<LanguageProvider>
				<AuthSessionProvider store={createSessionStore(createSnapshot())}>
					<div className="min-h-screen p-4 sm:p-6 lg:p-8">
						<Story />
					</div>
				</AuthSessionProvider>
			</LanguageProvider>
		</ThemeProvider>
	),
];

const mockAuditLogs: AuditLog[] = [
	{
		id: "log-1",
		eventType: "CREATE",
		entityType: "user",
		entityId: "user-123",
		actorUserId: "user-456",
		actorOrganizationId: "org-123",
		actorIp: "192.168.1.1",
		actorUserAgent: "Mozilla/5.0",
		previousState: null,
		newState: { name: "John Doe", email: "john@example.com" },
		changeSummary: null,
		sourceService: "auth-svc",
		requestId: "req-1",
		metadata: { action: "user_created", name: "John Doe" },
		signature: "hash-1",
		previousSignature: "hash-0",
		createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "log-2",
		eventType: "UPDATE",
		entityType: "organization",
		entityId: "org-123",
		actorUserId: "user-456",
		actorOrganizationId: "org-123",
		actorIp: "192.168.1.1",
		actorUserAgent: "Mozilla/5.0",
		previousState: { name: "Old Corp" },
		newState: { name: "Acme Corp" },
		changeSummary: { name: { old: "Old Corp", new: "Acme Corp" } },
		sourceService: "auth-svc",
		requestId: "req-2",
		metadata: { action: "org_updated", name: "Acme Corp" },
		signature: "hash-2",
		previousSignature: "hash-1",
		createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "log-3",
		eventType: "LOGIN",
		entityType: "session",
		entityId: "session-789",
		actorUserId: "user-123",
		actorOrganizationId: null,
		actorIp: "10.0.0.1",
		actorUserAgent: "Chrome/120.0",
		previousState: null,
		newState: { sessionId: "session-789" },
		changeSummary: null,
		sourceService: "auth-svc",
		requestId: "req-3",
		metadata: { action: "login_success" },
		signature: "hash-3",
		previousSignature: "hash-2",
		createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
	},
];

const meta = {
	title: "Components/Audit",
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AuditViewFull: Story = {
	render: () => <AuditView />,
	decorators,
};

export const AuditLogTableWithData: Story = {
	render: () => {
		const [page, setPage] = useState(1);
		return (
			<AuditLogTable
				logs={mockAuditLogs}
				loading={false}
				pagination={{
					page,
					limit: 20,
					total: 50,
					totalPages: 3,
				}}
				onPageChange={setPage}
				onViewDetails={(log) => console.log("View details:", log)}
			/>
		);
	},
	decorators,
};

export const AuditLogTableLoading: Story = {
	render: () => (
		<AuditLogTable
			logs={[]}
			loading={true}
			pagination={{
				page: 1,
				limit: 20,
				total: 0,
				totalPages: 0,
			}}
			onPageChange={() => {}}
			onViewDetails={() => {}}
		/>
	),
	decorators,
};

export const AuditLogTableEmpty: Story = {
	render: () => (
		<AuditLogTable
			logs={[]}
			loading={false}
			pagination={{
				page: 1,
				limit: 20,
				total: 0,
				totalPages: 0,
			}}
			onPageChange={() => {}}
			onViewDetails={() => {}}
		/>
	),
	decorators,
};

export const AuditLogFiltersDefault: Story = {
	render: () => {
		const [filters, setFilters] = useState<Filters>({});
		return <AuditLogFilters filters={filters} onFiltersChange={setFilters} />;
	},
	decorators,
};

export const AuditLogFiltersWithValues: Story = {
	render: () => {
		const [filters, setFilters] = useState<Filters>({
			eventType: "CREATE",
			entityType: "user",
			sourceService: "auth-svc",
		});
		return <AuditLogFilters filters={filters} onFiltersChange={setFilters} />;
	},
	decorators,
};

export const AuditLogDetailView: Story = {
	render: () => {
		const [open, setOpen] = useState(true);
		if (!open)
			return <Button onClick={() => setOpen(true)}>Open Detail</Button>;
		return (
			<AuditLogDetail log={mockAuditLogs[0]} onClose={() => setOpen(false)} />
		);
	},
	decorators,
};

export const IntegrityCheckerDefault: Story = {
	render: () => <IntegrityChecker />,
	decorators,
};

export const IntegrityCheckerValid: Story = {
	render: () => <IntegrityChecker />,
	decorators,
};

export const IntegrityCheckerInvalid: Story = {
	render: () => <IntegrityChecker />,
	decorators,
};
