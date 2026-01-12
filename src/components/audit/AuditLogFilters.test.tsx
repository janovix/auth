import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuditLogFilters } from "./AuditLogFilters";
import type { AuditLogFilters as FiltersType } from "@/lib/audit";

describe("AuditLogFilters", () => {
	afterEach(async () => {
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		cleanup();
	});

	it("renders search input", () => {
		render(<AuditLogFilters filters={{}} onFiltersChange={vi.fn()} />);

		expect(
			screen.getByPlaceholderText("Buscar en registros..."),
		).toBeInTheDocument();
	});

	it("renders event type select in advanced filters", async () => {
		const user = userEvent.setup();
		render(<AuditLogFilters filters={{}} onFiltersChange={vi.fn()} />);

		await user.click(screen.getByText("Filtros avanzados"));

		expect(screen.getByText("Tipo de evento")).toBeInTheDocument();
	});

	it("renders entity type select in advanced filters", async () => {
		const user = userEvent.setup();
		render(<AuditLogFilters filters={{}} onFiltersChange={vi.fn()} />);

		await user.click(screen.getByText("Filtros avanzados"));

		expect(screen.getByText("Tipo de entidad")).toBeInTheDocument();
	});

	it("renders source service select in advanced filters", async () => {
		const user = userEvent.setup();
		render(<AuditLogFilters filters={{}} onFiltersChange={vi.fn()} />);

		await user.click(screen.getByText("Filtros avanzados"));

		expect(screen.getByText("Servicio fuente")).toBeInTheDocument();
	});

	it("calls onFiltersChange when search input changes", async () => {
		const onFiltersChange = vi.fn();
		const user = userEvent.setup();

		render(<AuditLogFilters filters={{}} onFiltersChange={onFiltersChange} />);

		const searchInput = screen.getByPlaceholderText("Buscar en registros...");
		await user.type(searchInput, "test");

		// The handler is called for each character typed
		// Since the input is controlled, each call only passes the current value
		expect(onFiltersChange).toHaveBeenCalledTimes(4);
		// Verify it was called with the search value
		expect(onFiltersChange).toHaveBeenCalledWith({ search: "t" });
		expect(onFiltersChange).toHaveBeenCalledWith({ search: "e" });
		expect(onFiltersChange).toHaveBeenCalledWith({ search: "s" });
		expect(onFiltersChange).toHaveBeenCalledWith({ search: "t" });
	});

	it("renders advanced filters toggle button", () => {
		render(<AuditLogFilters filters={{}} onFiltersChange={vi.fn()} />);

		expect(screen.getByText("Filtros avanzados")).toBeInTheDocument();
	});

	it("shows advanced filters when toggle is clicked", async () => {
		const user = userEvent.setup();

		render(<AuditLogFilters filters={{}} onFiltersChange={vi.fn()} />);

		await user.click(screen.getByText("Filtros avanzados"));

		// Check for advanced filter fields
		expect(screen.getByText("Fecha inicio")).toBeInTheDocument();
		expect(screen.getByText("Fecha fin")).toBeInTheDocument();
		expect(screen.getByText("ID de usuario actor")).toBeInTheDocument();
		expect(screen.getByText("ID de organización")).toBeInTheDocument();
	});

	it("shows clear filters button when filters are active", () => {
		const activeFilters: FiltersType = {
			eventType: "CREATE",
		};

		render(
			<AuditLogFilters filters={activeFilters} onFiltersChange={vi.fn()} />,
		);

		expect(screen.getByText("Limpiar filtros")).toBeInTheDocument();
	});

	it("does not show clear filters button when no filters are active", () => {
		render(<AuditLogFilters filters={{}} onFiltersChange={vi.fn()} />);

		expect(screen.queryByText("Limpiar filtros")).not.toBeInTheDocument();
	});

	it("clears all filters when clear button is clicked", async () => {
		const onFiltersChange = vi.fn();
		const user = userEvent.setup();

		const activeFilters: FiltersType = {
			eventType: "CREATE",
			entityType: "user",
			search: "test",
		};

		render(
			<AuditLogFilters
				filters={activeFilters}
				onFiltersChange={onFiltersChange}
			/>,
		);

		await user.click(screen.getByText("Limpiar filtros"));

		expect(onFiltersChange).toHaveBeenCalledWith({});
	});

	it("updates event type filter when select changes", async () => {
		const onFiltersChange = vi.fn();
		const user = userEvent.setup();

		render(<AuditLogFilters filters={{}} onFiltersChange={onFiltersChange} />);

		// Open advanced filters first
		await user.click(screen.getByText("Filtros avanzados"));

		const eventTypeSelect = screen.getAllByRole("combobox")[0];
		await user.selectOptions(eventTypeSelect, "CREATE");

		expect(onFiltersChange).toHaveBeenCalledWith({ eventType: "CREATE" });
	});

	it("preserves other filters when updating one filter", async () => {
		const onFiltersChange = vi.fn();
		const user = userEvent.setup();

		const existingFilters: FiltersType = {
			eventType: "CREATE",
		};

		render(
			<AuditLogFilters
				filters={existingFilters}
				onFiltersChange={onFiltersChange}
			/>,
		);

		const searchInput = screen.getByPlaceholderText("Buscar en registros...");
		await user.type(searchInput, "x");

		expect(onFiltersChange).toHaveBeenCalledWith({
			eventType: "CREATE",
			search: "x",
		});
	});

	it("renders date inputs in advanced filters", async () => {
		const user = userEvent.setup();

		render(<AuditLogFilters filters={{}} onFiltersChange={vi.fn()} />);

		await user.click(screen.getByText("Filtros avanzados"));

		// Check for date labels
		expect(screen.getByText("Fecha inicio")).toBeInTheDocument();
		expect(screen.getByText("Fecha fin")).toBeInTheDocument();
	});

	it("updates actor user ID filter", async () => {
		const onFiltersChange = vi.fn();
		const user = userEvent.setup();

		render(<AuditLogFilters filters={{}} onFiltersChange={onFiltersChange} />);

		// Open advanced filters
		await user.click(screen.getByText("Filtros avanzados"));

		const actorInput = screen.getByPlaceholderText("ID del usuario");
		await user.type(actorInput, "u");

		// Verify it was called with the typed character
		expect(onFiltersChange).toHaveBeenCalledWith({ actorUserId: "u" });
	});
});
