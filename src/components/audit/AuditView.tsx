"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileJson, FileSpreadsheet, Shield } from "lucide-react";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Spinner,
} from "@/components/ui";
import { useLanguage } from "@/contexts/language-context";
import {
	listAuditLogs,
	downloadAuditLogs,
	type AuditLog,
	type AuditLogFilters,
} from "@/lib/audit";
import { AuditLogTable } from "./AuditLogTable";
import { AuditLogFilters as FiltersComponent } from "./AuditLogFilters";
import { AuditLogDetail } from "./AuditLogDetail";
import { IntegrityChecker } from "./IntegrityChecker";

export function AuditView() {
	const { t } = useLanguage();
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<AuditLogFilters>({});
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0,
	});
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
	const [exporting, setExporting] = useState(false);

	const fetchLogs = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await listAuditLogs(filters, {
				page: pagination.page,
				limit: pagination.limit,
			});
			setLogs(result.data);
			setPagination(result.pagination);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to load audit logs",
			);
		} finally {
			setLoading(false);
		}
	}, [filters, pagination.page, pagination.limit]);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	const handlePageChange = useCallback((page: number) => {
		setPagination((prev) => ({ ...prev, page }));
	}, []);

	const handleFiltersChange = useCallback((newFilters: AuditLogFilters) => {
		setFilters(newFilters);
		setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
	}, []);

	const handleExport = useCallback(
		async (format: "json" | "csv") => {
			try {
				setExporting(true);
				await downloadAuditLogs(format, filters);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Export failed");
			} finally {
				setExporting(false);
			}
		},
		[filters],
	);

	if (error === "Admin access required") {
		return (
			<section className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
				<div className="mx-auto w-full max-w-6xl">
					<Card>
						<CardContent className="py-12 text-center">
							<Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
							<h2 className="text-xl font-semibold mb-2">
								{t("audit.accessDenied.title")}
							</h2>
							<p className="text-muted-foreground">
								{t("audit.accessDenied.description")}
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		);
	}

	return (
		<section className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-12">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							{t("audit.title")}
						</h1>
						<p className="text-muted-foreground">{t("audit.description")}</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleExport("json")}
							disabled={exporting}
						>
							<FileJson className="h-4 w-4 mr-2" />
							JSON
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleExport("csv")}
							disabled={exporting}
						>
							<FileSpreadsheet className="h-4 w-4 mr-2" />
							CSV
						</Button>
					</div>
				</div>

				{/* Error message */}
				{error && error !== "Admin access required" && (
					<div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
						{error}
					</div>
				)}

				{/* Integrity Checker */}
				<IntegrityChecker />

				{/* Filters */}
				<FiltersComponent
					filters={filters}
					onFiltersChange={handleFiltersChange}
				/>

				{/* Table */}
				<AuditLogTable
					logs={logs}
					loading={loading}
					pagination={pagination}
					onPageChange={handlePageChange}
					onViewDetails={setSelectedLog}
				/>

				{/* Detail Modal */}
				{selectedLog && (
					<AuditLogDetail
						log={selectedLog}
						onClose={() => setSelectedLog(null)}
					/>
				)}
			</div>
		</section>
	);
}
