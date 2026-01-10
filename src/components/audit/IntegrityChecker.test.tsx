import { render, screen, waitFor, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IntegrityChecker } from "./IntegrityChecker";
import * as auditClient from "@/lib/audit/auditClient";

// Mock the audit client
vi.mock("@/lib/audit/auditClient", () => ({
	verifyChainIntegrity: vi.fn(),
	listAuditLogs: vi.fn(),
	getAuditLog: vi.fn(),
	exportAuditLogs: vi.fn(),
	downloadAuditLogs: vi.fn(),
}));

describe("IntegrityChecker", () => {
	afterEach(async () => {
		vi.clearAllMocks();
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("renders integrity checker card", () => {
		render(<IntegrityChecker />);

		expect(screen.getByText("Verificación de integridad")).toBeInTheDocument();
		expect(screen.getByText("Verificar")).toBeInTheDocument();
	});

	it("shows description when no verification has been done", () => {
		render(<IntegrityChecker />);

		expect(
			screen.getByText("Verifica la integridad de la cadena de auditoría"),
		).toBeInTheDocument();
	});

	it("shows loading state while verifying", async () => {
		vi.mocked(auditClient.verifyChainIntegrity).mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(() => resolve({ valid: true, totalVerified: 10 }), 1000),
				),
		);

		const user = userEvent.setup();
		render(<IntegrityChecker />);

		await user.click(screen.getByText("Verificar"));

		// Should show loading spinner
		expect(document.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("shows valid result after successful verification", async () => {
		vi.mocked(auditClient.verifyChainIntegrity).mockResolvedValue({
			valid: true,
			totalVerified: 100,
		});

		const user = userEvent.setup();
		render(<IntegrityChecker />);

		await user.click(screen.getByText("Verificar"));

		await waitFor(() => {
			expect(screen.getByText("Válido")).toBeInTheDocument();
		});

		expect(screen.getByText(/Estado/)).toBeInTheDocument();
		expect(screen.getByText(/100/)).toBeInTheDocument();
		// Use regex for text that may have spaces
		expect(screen.getByText(/registros/)).toBeInTheDocument();
	});

	it("shows invalid result when chain is broken", async () => {
		vi.mocked(auditClient.verifyChainIntegrity).mockResolvedValue({
			valid: false,
			totalVerified: 50,
			brokenAt: "log-51",
			error: "Signature mismatch",
		});

		const user = userEvent.setup();
		render(<IntegrityChecker />);

		await user.click(screen.getByText("Verificar"));

		await waitFor(() => {
			expect(screen.getByText("Inválido")).toBeInTheDocument();
		});

		expect(screen.getByText(/Roto en/)).toBeInTheDocument();
		expect(screen.getByText("log-51")).toBeInTheDocument();
		expect(screen.getByText("Signature mismatch")).toBeInTheDocument();
	});

	it("shows error message when verification fails", async () => {
		vi.mocked(auditClient.verifyChainIntegrity).mockRejectedValue(
			new Error("Network error"),
		);

		const user = userEvent.setup();
		render(<IntegrityChecker />);

		await user.click(screen.getByText("Verificar"));

		await waitFor(() => {
			expect(screen.getByText("Network error")).toBeInTheDocument();
		});
	});

	it("can verify again after first verification", async () => {
		vi.mocked(auditClient.verifyChainIntegrity)
			.mockResolvedValueOnce({ valid: true, totalVerified: 100 })
			.mockResolvedValueOnce({ valid: true, totalVerified: 150 });

		const user = userEvent.setup();
		render(<IntegrityChecker />);

		// First verification
		await user.click(screen.getByText("Verificar"));

		await waitFor(() => {
			expect(screen.getByText(/100/)).toBeInTheDocument();
		});

		// Second verification
		await user.click(screen.getByText("Verificar"));

		await waitFor(() => {
			expect(screen.getByText(/150/)).toBeInTheDocument();
		});

		expect(auditClient.verifyChainIntegrity).toHaveBeenCalledTimes(2);
	});

	it("disables verify button while checking", async () => {
		let resolveVerify: (value: {
			valid: boolean;
			totalVerified: number;
		}) => void;
		vi.mocked(auditClient.verifyChainIntegrity).mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveVerify = resolve;
				}),
		);

		const user = userEvent.setup();
		render(<IntegrityChecker />);

		const verifyButton = screen.getByText("Verificar").closest("button");

		await user.click(verifyButton!);

		// Button should be disabled while verifying
		expect(verifyButton).toBeDisabled();

		// Resolve the verification
		await act(async () => {
			resolveVerify!({ valid: true, totalVerified: 10 });
		});

		await waitFor(() => {
			expect(verifyButton).not.toBeDisabled();
		});
	});
});
