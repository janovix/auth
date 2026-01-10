"use client";

import { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
	ChevronLeft,
	ChevronRight,
	Eye,
	Shield,
	ShieldAlert,
	ShieldCheck,
} from "lucide-react";
import { Button, Badge, Card, CardContent, Spinner } from "@/components/ui";
import { useLanguage } from "@/contexts/language-context";
import type { AuditLog } from "@/lib/audit";

interface AuditLogTableProps {
	logs: AuditLog[];
	loading: boolean;
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	onPageChange: (page: number) => void;
	onViewDetails: (log: AuditLog) => void;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
	CREATE:
		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	LOGIN:
		"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
	LOGOUT: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
	PASSWORD_RESET:
		"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
	EMAIL_VERIFIED:
		"bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
	ROLE_CHANGE:
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
	SYSTEM:
		"bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

export function AuditLogTable({
	logs,
	loading,
	pagination,
	onPageChange,
	onViewDetails,
}: AuditLogTableProps) {
	const { t, language } = useLanguage();
	const locale = language === "es" ? es : enUS;

	const formatTime = useCallback(
		(dateStr: string) => {
			try {
				return formatDistanceToNow(new Date(dateStr), {
					addSuffix: true,
					locale,
				});
			} catch {
				return dateStr;
			}
		},
		[locale],
	);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Spinner className="h-8 w-8" />
			</div>
		);
	}

	if (logs.length === 0) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<p className="text-muted-foreground">{t("audit.noLogs")}</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<div className="rounded-lg border overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-muted/50">
						<tr>
							<th className="px-4 py-3 text-left font-medium">
								{t("audit.table.event")}
							</th>
							<th className="px-4 py-3 text-left font-medium">
								{t("audit.table.entity")}
							</th>
							<th className="px-4 py-3 text-left font-medium">
								{t("audit.table.actor")}
							</th>
							<th className="px-4 py-3 text-left font-medium">
								{t("audit.table.source")}
							</th>
							<th className="px-4 py-3 text-left font-medium">
								{t("audit.table.time")}
							</th>
							<th className="px-4 py-3 text-right font-medium">
								{t("audit.table.actions")}
							</th>
						</tr>
					</thead>
					<tbody className="divide-y">
						{logs.map((log) => (
							<tr key={log.id} className="hover:bg-muted/30 transition-colors">
								<td className="px-4 py-3">
									<Badge
										className={
											EVENT_TYPE_COLORS[log.eventType] ||
											EVENT_TYPE_COLORS.SYSTEM
										}
										variant="secondary"
									>
										{log.eventType}
									</Badge>
								</td>
								<td className="px-4 py-3">
									<div className="flex flex-col">
										<span className="font-medium">{log.entityType}</span>
										{log.entityId && (
											<span className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">
												{log.entityId}
											</span>
										)}
									</div>
								</td>
								<td className="px-4 py-3">
									<div className="flex flex-col">
										{log.actorUserId ? (
											<span className="text-xs font-mono truncate max-w-[150px]">
												{log.actorUserId}
											</span>
										) : (
											<span className="text-muted-foreground text-xs">
												System
											</span>
										)}
										{log.actorIp && (
											<span className="text-xs text-muted-foreground">
												{log.actorIp}
											</span>
										)}
									</div>
								</td>
								<td className="px-4 py-3">
									<span className="font-mono text-xs">{log.sourceService}</span>
								</td>
								<td className="px-4 py-3">
									<span className="text-muted-foreground text-xs">
										{formatTime(log.createdAt)}
									</span>
								</td>
								<td className="px-4 py-3 text-right">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onViewDetails(log)}
									>
										<Eye className="h-4 w-4" />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{t("audit.pagination.showing")
						.replace(
							"{start}",
							String((pagination.page - 1) * pagination.limit + 1),
						)
						.replace(
							"{end}",
							String(
								Math.min(pagination.page * pagination.limit, pagination.total),
							),
						)
						.replace("{total}", String(pagination.total))}
				</p>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(pagination.page - 1)}
						disabled={pagination.page <= 1}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<span className="text-sm">
						{pagination.page} / {pagination.totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(pagination.page + 1)}
						disabled={pagination.page >= pagination.totalPages}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
