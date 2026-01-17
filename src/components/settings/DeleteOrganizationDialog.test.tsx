import {
	render,
	screen,
	waitFor,
	act,
	cleanup,
	fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteOrganizationDialog } from "./DeleteOrganizationDialog";
import { authClient } from "@/lib/auth/authClient";
import { mockToast } from "@/test/setup";

// Mock the auth client
vi.mock("@/lib/auth/authClient", () => ({
	authClient: {
		organization: {
			delete: vi.fn(),
		},
	},
}));

// Mock language context
vi.mock("@/contexts/language-context", () => ({
	useLanguage: vi.fn(() => ({
		t: (key: string) => key,
		language: "en",
		setLanguage: vi.fn(),
	})),
}));

const defaultProps = {
	organizationId: "org-123",
	organizationName: "Test Organization",
	organizationSlug: "test-org",
};

describe("DeleteOrganizationDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(async () => {
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("renders the delete button", () => {
		render(<DeleteOrganizationDialog {...defaultProps} />);

		expect(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		).toBeInTheDocument();
	});

	it("disables the button when disabled prop is true", () => {
		render(<DeleteOrganizationDialog {...defaultProps} disabled />);

		expect(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		).toBeDisabled();
	});

	it("opens dialog when button is clicked", async () => {
		const user = userEvent.setup();
		render(<DeleteOrganizationDialog {...defaultProps} />);

		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(
				screen.getByText("settings.org.deleteConfirmTitle"),
			).toBeInTheDocument();
		});
	});

	it("shows warning message in the dialog", async () => {
		const user = userEvent.setup();
		render(<DeleteOrganizationDialog {...defaultProps} />);

		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(
				screen.getByText("settings.org.deleteWarning"),
			).toBeInTheDocument();
		});
	});

	it("shows slug confirmation input", async () => {
		const user = userEvent.setup();
		render(<DeleteOrganizationDialog {...defaultProps} />);

		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(screen.getByPlaceholderText("test-org")).toBeInTheDocument();
		});
	});

	it("disables delete confirm button until slug is typed correctly", async () => {
		const user = userEvent.setup();
		render(<DeleteOrganizationDialog {...defaultProps} />);

		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(
				screen.getByText("settings.org.deleteConfirmTitle"),
			).toBeInTheDocument();
		});

		// Get the confirm button - it should be disabled
		const confirmButton = screen.getByRole("button", {
			name: /settings\.org\.deleteButtonConfirm/i,
		});
		expect(confirmButton).toBeDisabled();

		// Type wrong slug
		const input = screen.getByPlaceholderText("test-org");
		await user.type(input, "wrong-slug");
		expect(confirmButton).toBeDisabled();
	});

	it("enables delete confirm button when correct slug is typed", async () => {
		const user = userEvent.setup();
		render(<DeleteOrganizationDialog {...defaultProps} />);

		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(
				screen.getByText("settings.org.deleteConfirmTitle"),
			).toBeInTheDocument();
		});

		// Type correct slug
		const input = screen.getByPlaceholderText("test-org");
		await user.type(input, "test-org");

		const confirmButton = screen.getByRole("button", {
			name: /settings\.org\.deleteButtonConfirm/i,
		});
		expect(confirmButton).not.toBeDisabled();
	});

	it("clears input when dialog is closed", async () => {
		const user = userEvent.setup();
		render(<DeleteOrganizationDialog {...defaultProps} />);

		// Open dialog
		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(
				screen.getByText("settings.org.deleteConfirmTitle"),
			).toBeInTheDocument();
		});

		// Type something
		const input = screen.getByPlaceholderText("test-org");
		await user.type(input, "test");

		// Close dialog via cancel button
		await user.click(
			screen.getByRole("button", { name: /settings\.org\.cancel/i }),
		);

		// Reopen dialog
		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(screen.getByPlaceholderText("test-org")).toHaveValue("");
		});
	});

	it("calls delete API when confirmed", async () => {
		const user = userEvent.setup();
		const onDeleted = vi.fn();

		vi.mocked(authClient.organization.delete).mockResolvedValue({
			data: { success: true },
			error: null,
		});

		render(
			<DeleteOrganizationDialog {...defaultProps} onDeleted={onDeleted} />,
		);

		// Open dialog
		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(
				screen.getByText("settings.org.deleteConfirmTitle"),
			).toBeInTheDocument();
		});

		// Type correct slug
		const input = screen.getByPlaceholderText("test-org");
		await user.type(input, "test-org");

		// Click confirm
		await user.click(
			screen.getByRole("button", {
				name: /settings\.org\.deleteButtonConfirm/i,
			}),
		);

		await waitFor(() => {
			expect(authClient.organization.delete).toHaveBeenCalledWith({
				organizationId: "org-123",
			});
		});

		await waitFor(() => {
			expect(mockToast.success).toHaveBeenCalledWith(
				"settings.org.deleteSuccess",
			);
			expect(onDeleted).toHaveBeenCalled();
		});
	});

	it("shows error toast when delete fails", async () => {
		const user = userEvent.setup();

		vi.mocked(authClient.organization.delete).mockResolvedValue({
			data: null,
			error: { message: "Delete failed", code: "DELETE_FAILED" },
		});

		render(<DeleteOrganizationDialog {...defaultProps} />);

		// Open dialog
		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(
				screen.getByText("settings.org.deleteConfirmTitle"),
			).toBeInTheDocument();
		});

		// Type correct slug
		const input = screen.getByPlaceholderText("test-org");
		await user.type(input, "test-org");

		// Click confirm
		await user.click(
			screen.getByRole("button", {
				name: /settings\.org\.deleteButtonConfirm/i,
			}),
		);

		await waitFor(() => {
			expect(mockToast.error).toHaveBeenCalledWith("Delete failed");
		});
	});

	it("shows loading state while deleting", async () => {
		const user = userEvent.setup();

		// Make delete hang
		vi.mocked(authClient.organization.delete).mockImplementation(
			() => new Promise(() => {}),
		);

		render(<DeleteOrganizationDialog {...defaultProps} />);

		// Open dialog
		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(
				screen.getByText("settings.org.deleteConfirmTitle"),
			).toBeInTheDocument();
		});

		// Type correct slug
		const input = screen.getByPlaceholderText("test-org");
		await user.type(input, "test-org");

		// Click confirm
		await user.click(
			screen.getByRole("button", {
				name: /settings\.org\.deleteButtonConfirm/i,
			}),
		);

		await waitFor(() => {
			expect(screen.getByText("settings.org.deleting")).toBeInTheDocument();
		});
	});

	it("applies error styling when partial wrong slug is entered", async () => {
		const user = userEvent.setup();
		render(<DeleteOrganizationDialog {...defaultProps} />);

		await user.click(
			screen.getByRole("button", { name: /settings\.org\.deleteButton/i }),
		);

		await waitFor(() => {
			expect(
				screen.getByText("settings.org.deleteConfirmTitle"),
			).toBeInTheDocument();
		});

		// Type partial wrong slug
		const input = screen.getByPlaceholderText("test-org");
		await user.type(input, "wrong");

		// Check for error styling class
		expect(input).toHaveClass("border-destructive");
	});
});
