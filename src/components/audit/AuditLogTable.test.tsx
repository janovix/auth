import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuditLogTable } from "./AuditLogTable";
import type { AuditLog } from "@/lib/audit";

const mockLogs: AuditLog[] = [
	{
		id: "log-1",
		eventType: "CREATE",
		entityType: "user",
		entityId: "user-123",
		actorUserId: "actor-1",
		actorOrganizationId: "org-1",
		actorIp: "192.168.1.1",
		actorUserAgent: "Mozilla/5.0",
		previousState: null,
		newState: { name: "Test User" },
		changeSummary: {},
		sourceService: "auth-svc",
		requestId: "req-1",
		metadata: null,
		signature: "abc123",
		previousSignature: null,
		createdAt: new Date().toISOString(),
	},
	{
		id: "log-2",
		eventType: "UPDATE",
		entityType: "organization",
		entityId: "org-456",
		actorUserId: "actor-2",
		actorOrganizationId: "org-1",
		actorIp: "192.168.1.2",
		actorUserAgent: "Chrome/100",
		previousState: { name: "Old Org" },
		newState: { name: "New Org" },
		changeSummary: { name: { old: "Old Org", new: "New Org" } },
		sourceService: "aml-svc",
		requestId: "req-2",
		metadata: null,
		signature: "def456",
		previousSignature: "abc123",
		createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
	},
	{
		id: "log-3",
		eventType: "DELETE",
		entityType: "alert",
		entityId: "alert-789",
		actorUserId: null, // System action
		actorOrganizationId: null,
		actorIp: null,
		actorUserAgent: null,
		previousState: { status: "active" },
		newState: null,
		changeSummary: {},
		sourceService: "aml-svc",
		requestId: "req-3",
		metadata: null,
		signature: "ghi789",
		previousSignature: "def456",
		createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
	},
];

const mockPagination = {
	page: 1,
	limit: 20,
	total: 3,
	totalPages: 1,
};

describe("AuditLogTable", () => {
	afterEach(async () => {
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("renders loading spinner when loading", () => {
		render(
			<AuditLogTable
				logs={[]}
				loading={true}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		expect(document.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("renders empty state when no logs", () => {
		render(
			<AuditLogTable
				logs={[]}
				loading={false}
				pagination={{ ...mockPagination, total: 0 }}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		expect(
			screen.getByText("No hay registros de auditoría"),
		).toBeInTheDocument();
	});

	it("renders table headers", () => {
		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		expect(screen.getByText("Evento")).toBeInTheDocument();
		expect(screen.getByText("Entidad")).toBeInTheDocument();
		expect(screen.getByText("Actor")).toBeInTheDocument();
		expect(screen.getByText("Fuente")).toBeInTheDocument();
		expect(screen.getByText("Hora")).toBeInTheDocument();
		expect(screen.getByText("Acciones")).toBeInTheDocument();
	});

	it("renders log entries with correct event types", () => {
		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		expect(screen.getByText("CREATE")).toBeInTheDocument();
		expect(screen.getByText("UPDATE")).toBeInTheDocument();
		expect(screen.getByText("DELETE")).toBeInTheDocument();
	});

	it("renders entity types and IDs", () => {
		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		expect(screen.getByText("user")).toBeInTheDocument();
		expect(screen.getByText("organization")).toBeInTheDocument();
		expect(screen.getByText("alert")).toBeInTheDocument();
		expect(screen.getByText("user-123")).toBeInTheDocument();
		expect(screen.getByText("org-456")).toBeInTheDocument();
	});

	it("shows 'System' for logs without actor", () => {
		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		expect(screen.getByText("System")).toBeInTheDocument();
	});

	it("renders source services", () => {
		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		expect(screen.getByText("auth-svc")).toBeInTheDocument();
		expect(screen.getAllByText("aml-svc")).toHaveLength(2);
	});

	it("calls onViewDetails when view button is clicked", async () => {
		const onViewDetails = vi.fn();
		const user = userEvent.setup();

		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={onViewDetails}
			/>,
		);

		const viewButtons = screen.getAllByRole("button");
		// Filter to only the view buttons (ones with Eye icon)
		const eyeButtons = viewButtons.filter(
			(btn) => btn.querySelector("svg") !== null,
		);
		await user.click(eyeButtons[0]);

		expect(onViewDetails).toHaveBeenCalledWith(mockLogs[0]);
	});

	it("renders pagination info", () => {
		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		expect(screen.getByText("1 / 1")).toBeInTheDocument();
	});

	it("disables previous button on first page", () => {
		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		const buttons = screen.getAllByRole("button");
		const prevButton = buttons.find((btn) =>
			btn.querySelector('svg[class*="lucide-chevron-left"]'),
		);
		expect(prevButton).toBeDisabled();
	});

	it("disables next button on last page", () => {
		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		const buttons = screen.getAllByRole("button");
		const nextButton = buttons.find((btn) =>
			btn.querySelector('svg[class*="lucide-chevron-right"]'),
		);
		expect(nextButton).toBeDisabled();
	});

	it("calls onPageChange when pagination buttons are clicked", async () => {
		const onPageChange = vi.fn();
		const user = userEvent.setup();

		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={{ ...mockPagination, page: 2, totalPages: 3 }}
				onPageChange={onPageChange}
				onViewDetails={vi.fn()}
			/>,
		);

		// Find navigation buttons by their position
		const buttons = screen.getAllByRole("button");
		const navButtons = buttons.filter(
			(btn) => btn.querySelector('svg[class*="lucide-chevron"]') !== null,
		);

		// Click previous (first nav button)
		await user.click(navButtons[0]);
		expect(onPageChange).toHaveBeenCalledWith(1);

		// Click next (second nav button)
		await user.click(navButtons[1]);
		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it("renders IP addresses when available", () => {
		render(
			<AuditLogTable
				logs={mockLogs}
				loading={false}
				pagination={mockPagination}
				onPageChange={vi.fn()}
				onViewDetails={vi.fn()}
			/>,
		);

		expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
		expect(screen.getByText("192.168.1.2")).toBeInTheDocument();
	});
});
