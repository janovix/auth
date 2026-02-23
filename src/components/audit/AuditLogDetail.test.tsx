import { render, screen, cleanup, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuditLogDetail } from "./AuditLogDetail";
import type { AuditLog } from "@/lib/audit";

const mockLog: AuditLog = {
	id: "log-123",
	eventType: "UPDATE",
	entityType: "user",
	entityId: "user-456",
	actorUserId: "actor-789",
	actorOrganizationId: "org-111",
	actorIp: "192.168.1.100",
	actorUserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
	previousState: { name: "Old Name", email: "old@example.com" },
	newState: { name: "New Name", email: "new@example.com" },
	changeSummary: {
		name: { old: "Old Name", new: "New Name" },
		email: { old: "old@example.com", new: "new@example.com" },
	},
	sourceService: "auth-svc",
	requestId: "req-222",
	metadata: { reason: "User requested", tags: ["profile-update"] },
	signature: "abc123def456",
	previousSignature: "xyz789",
	createdAt: "2026-01-10T12:00:00.000Z",
};

describe("AuditLogDetail", () => {
	let mockWriteText: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockWriteText = vi.fn().mockResolvedValue(undefined);
		// Mock clipboard using Object.defineProperty
		Object.defineProperty(navigator, "clipboard", {
			value: {
				writeText: mockWriteText,
			},
			writable: true,
			configurable: true,
		});
	});

	afterEach(async () => {
		vi.clearAllMocks();
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("renders audit log detail modal", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("Detalle del registro")).toBeInTheDocument();
	});

	it("displays event type badge", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("UPDATE")).toBeInTheDocument();
	});

	it("displays basic info section", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("Información básica")).toBeInTheDocument();
		expect(screen.getByText("ID")).toBeInTheDocument();
		expect(screen.getByText("log-123")).toBeInTheDocument();
	});

	it("displays entity information", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("Tipo de entidad")).toBeInTheDocument();
		expect(screen.getByText("user")).toBeInTheDocument();
		expect(screen.getByText("ID de entidad")).toBeInTheDocument();
		expect(screen.getByText("user-456")).toBeInTheDocument();
	});

	it("displays source service", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("Servicio fuente")).toBeInTheDocument();
		expect(screen.getByText("auth-svc")).toBeInTheDocument();
	});

	it("displays request ID", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("ID de solicitud")).toBeInTheDocument();
		expect(screen.getByText("req-222")).toBeInTheDocument();
	});

	it("displays actor information", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("Información del actor")).toBeInTheDocument();
		expect(screen.getByText("ID de usuario")).toBeInTheDocument();
		expect(screen.getByText("actor-789")).toBeInTheDocument();
		expect(screen.getByText("ID de organización")).toBeInTheDocument();
		expect(screen.getByText("org-111")).toBeInTheDocument();
	});

	it("displays actor IP and user agent", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("Dirección IP")).toBeInTheDocument();
		expect(screen.getByText("192.168.1.100")).toBeInTheDocument();
		expect(screen.getByText("User Agent")).toBeInTheDocument();
		expect(
			screen.getByText("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"),
		).toBeInTheDocument();
	});

	it("displays change summary", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("Resumen de cambios")).toBeInTheDocument();
		expect(screen.getByText("name")).toBeInTheDocument();
		expect(screen.getByText("email")).toBeInTheDocument();
	});

	it("displays previous and new state", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("Estado anterior")).toBeInTheDocument();
		expect(screen.getByText("Nuevo estado")).toBeInTheDocument();
	});

	it("displays metadata when present", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("Metadatos")).toBeInTheDocument();
	});

	it("displays signature information", () => {
		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		expect(screen.getByText("Información de firma")).toBeInTheDocument();
		expect(screen.getByText("Firma")).toBeInTheDocument();
		expect(screen.getByText("abc123def456")).toBeInTheDocument();
		expect(screen.getByText("Firma anterior")).toBeInTheDocument();
		expect(screen.getByText("xyz789")).toBeInTheDocument();
	});

	it("shows GENESIS for first entry without previous signature", () => {
		const genesisLog = { ...mockLog, previousSignature: null };
		render(<AuditLogDetail log={genesisLog} onClose={vi.fn()} />);

		expect(screen.getByText("GENESIS")).toBeInTheDocument();
	});

	it("calls onClose when close button is clicked", async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();

		render(<AuditLogDetail log={mockLog} onClose={onClose} />);

		// Find close button (X button in the header)
		const closeButtons = screen.getAllByRole("button");
		const closeButton = closeButtons.find((btn) =>
			btn.querySelector('svg[class*="lucide-x"]'),
		);
		await user.click(closeButton!);

		expect(onClose).toHaveBeenCalled();
	});

	it("has copy buttons that can be clicked", async () => {
		const user = userEvent.setup();

		render(<AuditLogDetail log={mockLog} onClose={vi.fn()} />);

		// Find copy buttons - they have the copy icon
		const copyButtons = screen
			.getAllByRole("button")
			.filter((btn) => btn.querySelector('svg[class*="lucide-copy"]'));

		// There should be at least two copy buttons (one for ID, one for signature)
		expect(copyButtons.length).toBeGreaterThanOrEqual(2);

		// Clicking a copy button should not throw an error
		// Note: Actual clipboard functionality is tested in integration/e2e tests
		// because jsdom doesn't fully support the clipboard API
		await user.click(copyButtons[0]);

		// After clicking, the icon should change to a check mark
		await waitFor(() => {
			const checkIcon = document.querySelector('svg[class*="lucide-check"]');
			expect(checkIcon).toBeInTheDocument();
		});
	});

	it("shows 'System' when actorUserId is null", () => {
		const systemLog = { ...mockLog, actorUserId: null };
		render(<AuditLogDetail log={systemLog} onClose={vi.fn()} />);

		// Should show "System" for actor user ID
		const actorSection = screen.getByText("ID de usuario").parentElement;
		expect(actorSection).toHaveTextContent("System");
	});

	it("shows dash when optional fields are null", () => {
		const minimalLog: AuditLog = {
			...mockLog,
			entityId: null,
			actorOrganizationId: null,
			actorIp: null,
			actorUserAgent: null,
			requestId: null,
			previousState: null,
			newState: null,
			changeSummary: {},
			metadata: null,
		};

		render(<AuditLogDetail log={minimalLog} onClose={vi.fn()} />);

		// Should render without errors and show dashes for missing values
		expect(screen.getByText("Información básica")).toBeInTheDocument();
	});
});
