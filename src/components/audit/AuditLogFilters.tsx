"use client";

import { useState, useCallback } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { useLanguage } from "@/contexts/language-context";
import type { AuditLogFilters as Filters } from "@/lib/audit";

interface AuditLogFiltersProps {
	filters: Filters;
	onFiltersChange: (filters: Filters) => void;
}

const EVENT_TYPES = [
	"CREATE",
	"UPDATE",
	"DELETE",
	"LOGIN",
	"LOGOUT",
	"PASSWORD_RESET",
	"EMAIL_VERIFIED",
	"ROLE_CHANGE",
	"PERMISSION_CHANGE",
	"EXPORT",
	"IMPORT",
	"SYSTEM",
];

const ENTITY_TYPES = [
	"user",
	"organization",
	"member",
	"invitation",
	"session",
	"settings",
	"operation",
	"client",
	"alert",
	"report",
	"notice",
];

const SOURCE_SERVICES = [
	"auth-svc",
	"aml-svc",
	"import-svc",
	"notifications-svc",
];

export function AuditLogFilters({
	filters,
	onFiltersChange,
}: AuditLogFiltersProps) {
	const { t } = useLanguage();
	const [showAdvanced, setShowAdvanced] = useState(false);

	const handleChange = useCallback(
		(key: keyof Filters, value: string) => {
			onFiltersChange({
				...filters,
				[key]: value || undefined,
			});
		},
		[filters, onFiltersChange],
	);

	const clearFilters = useCallback(() => {
		onFiltersChange({});
	}, [onFiltersChange]);

	const hasActiveFilters = Object.values(filters).some((v) => v);

	return (
		<div className="space-y-4">
			{/* Search bar */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={t("audit.filters.searchPlaceholder")}
						value={filters.search || ""}
						onChange={(e) => handleChange("search", e.target.value)}
						className="pl-10"
					/>
				</div>
				<Button
					variant="outline"
					onClick={() => setShowAdvanced(!showAdvanced)}
					className="flex items-center gap-2"
				>
					<Filter className="h-4 w-4" />
					{t("audit.filters.advanced")}
				</Button>
				{hasActiveFilters && (
					<Button
						variant="ghost"
						onClick={clearFilters}
						className="flex items-center gap-2"
					>
						<X className="h-4 w-4" />
						{t("audit.filters.clear")}
					</Button>
				)}
			</div>

			{/* Advanced filters */}
			{showAdvanced && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/30">
					{/* Event Type */}
					<div className="space-y-2">
						<Label>{t("audit.filters.eventType")}</Label>
						<select
							value={filters.eventType || ""}
							onChange={(e) => handleChange("eventType", e.target.value)}
							className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							<option value="">{t("audit.filters.all")}</option>
							{EVENT_TYPES.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>

					{/* Entity Type */}
					<div className="space-y-2">
						<Label>{t("audit.filters.entityType")}</Label>
						<select
							value={filters.entityType || ""}
							onChange={(e) => handleChange("entityType", e.target.value)}
							className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							<option value="">{t("audit.filters.all")}</option>
							{ENTITY_TYPES.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>

					{/* Source Service */}
					<div className="space-y-2">
						<Label>{t("audit.filters.sourceService")}</Label>
						<select
							value={filters.sourceService || ""}
							onChange={(e) => handleChange("sourceService", e.target.value)}
							className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							<option value="">{t("audit.filters.all")}</option>
							{SOURCE_SERVICES.map((service) => (
								<option key={service} value={service}>
									{service}
								</option>
							))}
						</select>
					</div>

					{/* Entity ID */}
					<div className="space-y-2">
						<Label>{t("audit.filters.entityId")}</Label>
						<Input
							placeholder={t("audit.filters.entityIdPlaceholder")}
							value={filters.entityId || ""}
							onChange={(e) => handleChange("entityId", e.target.value)}
						/>
					</div>

					{/* Date Range */}
					<div className="space-y-2">
						<Label>{t("audit.filters.startDate")}</Label>
						<Input
							type="datetime-local"
							value={filters.startDate?.slice(0, 16) || ""}
							onChange={(e) =>
								handleChange(
									"startDate",
									e.target.value ? new Date(e.target.value).toISOString() : "",
								)
							}
						/>
					</div>

					<div className="space-y-2">
						<Label>{t("audit.filters.endDate")}</Label>
						<Input
							type="datetime-local"
							value={filters.endDate?.slice(0, 16) || ""}
							onChange={(e) =>
								handleChange(
									"endDate",
									e.target.value ? new Date(e.target.value).toISOString() : "",
								)
							}
						/>
					</div>

					{/* Actor User ID */}
					<div className="space-y-2">
						<Label>{t("audit.filters.actorUserId")}</Label>
						<Input
							placeholder={t("audit.filters.actorUserIdPlaceholder")}
							value={filters.actorUserId || ""}
							onChange={(e) => handleChange("actorUserId", e.target.value)}
						/>
					</div>

					{/* Actor Organization ID */}
					<div className="space-y-2">
						<Label>{t("audit.filters.actorOrgId")}</Label>
						<Input
							placeholder={t("audit.filters.actorOrgIdPlaceholder")}
							value={filters.actorOrganizationId || ""}
							onChange={(e) =>
								handleChange("actorOrganizationId", e.target.value)
							}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
