"use client";

import { X, Copy, Check, ArrowRight } from "lucide-react";
import { useState, useCallback } from "react";
import {
	Button,
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { useLanguage } from "@/contexts/language-context";
import type { AuditLog } from "@/lib/audit";

interface AuditLogDetailProps {
	log: AuditLog;
	onClose: () => void;
}

export function AuditLogDetail({ log, onClose }: AuditLogDetailProps) {
	const { t } = useLanguage();
	const [copiedField, setCopiedField] = useState<string | null>(null);

	const copyToClipboard = useCallback(async (text: string, field: string) => {
		await navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
	}, []);

	const formatJson = (obj: unknown) => {
		if (!obj) return null;
		return JSON.stringify(obj, null, 2);
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
			<div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center gap-3">
						<h2 className="text-lg font-semibold">{t("audit.detail.title")}</h2>
						<Badge variant="secondary">{log.eventType}</Badge>
					</div>
					<Button variant="ghost" size="sm" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{/* Basic Info */}
					<Card>
						<CardHeader className="py-3">
							<CardTitle className="text-sm">
								{t("audit.detail.basicInfo")}
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.id")}
								</p>
								<div className="flex items-center gap-2">
									<code className="text-xs font-mono">{log.id}</code>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 w-6 p-0"
										onClick={() => copyToClipboard(log.id, "id")}
									>
										{copiedField === "id" ? (
											<Check className="h-3 w-3 text-green-500" />
										) : (
											<Copy className="h-3 w-3" />
										)}
									</Button>
								</div>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.timestamp")}
								</p>
								<p>{new Date(log.createdAt).toLocaleString()}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.entityType")}
								</p>
								<p>{log.entityType}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.entityId")}
								</p>
								<code className="text-xs font-mono">{log.entityId || "—"}</code>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.sourceService")}
								</p>
								<p>{log.sourceService}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.requestId")}
								</p>
								<code className="text-xs font-mono">
									{log.requestId || "—"}
								</code>
							</div>
						</CardContent>
					</Card>

					{/* Actor Info */}
					<Card>
						<CardHeader className="py-3">
							<CardTitle className="text-sm">
								{t("audit.detail.actorInfo")}
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.actorUserId")}
								</p>
								<code className="text-xs font-mono">
									{log.actorUserId || "System"}
								</code>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.actorOrgId")}
								</p>
								<code className="text-xs font-mono">
									{log.actorOrganizationId || "—"}
								</code>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.actorIp")}
								</p>
								<p>{log.actorIp || "—"}</p>
							</div>
							<div className="col-span-2">
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.actorUserAgent")}
								</p>
								<p className="text-xs break-all">{log.actorUserAgent || "—"}</p>
							</div>
						</CardContent>
					</Card>

					{/* Change Summary */}
					{log.changeSummary && Object.keys(log.changeSummary).length > 0 && (
						<Card>
							<CardHeader className="py-3">
								<CardTitle className="text-sm">
									{t("audit.detail.changeSummary")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{Object.entries(log.changeSummary).map(([field, change]) => (
										<div
											key={field}
											className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded"
										>
											<span className="font-medium min-w-[120px]">{field}</span>
											<code className="text-xs bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-red-800 dark:text-red-300 max-w-[200px] truncate">
												{JSON.stringify(change.old)}
											</code>
											<ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
											<code className="text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-green-800 dark:text-green-300 max-w-[200px] truncate">
												{JSON.stringify(change.new)}
											</code>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Previous State */}
					{log.previousState && (
						<Card>
							<CardHeader className="py-3">
								<CardTitle className="text-sm">
									{t("audit.detail.previousState")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-[200px]">
									{formatJson(log.previousState)}
								</pre>
							</CardContent>
						</Card>
					)}

					{/* New State */}
					{log.newState && (
						<Card>
							<CardHeader className="py-3">
								<CardTitle className="text-sm">
									{t("audit.detail.newState")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-[200px]">
									{formatJson(log.newState)}
								</pre>
							</CardContent>
						</Card>
					)}

					{/* Metadata */}
					{log.metadata && (
						<Card>
							<CardHeader className="py-3">
								<CardTitle className="text-sm">
									{t("audit.detail.metadata")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-[200px]">
									{formatJson(log.metadata)}
								</pre>
							</CardContent>
						</Card>
					)}

					{/* Signature Info */}
					<Card>
						<CardHeader className="py-3">
							<CardTitle className="text-sm">
								{t("audit.detail.signatureInfo")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.signature")}
								</p>
								<div className="flex items-center gap-2">
									<code className="text-xs font-mono break-all">
										{log.signature}
									</code>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 w-6 p-0 flex-shrink-0"
										onClick={() => copyToClipboard(log.signature, "signature")}
									>
										{copiedField === "signature" ? (
											<Check className="h-3 w-3 text-green-500" />
										) : (
											<Copy className="h-3 w-3" />
										)}
									</Button>
								</div>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">
									{t("audit.detail.previousSignature")}
								</p>
								<code className="text-xs font-mono break-all">
									{log.previousSignature || "GENESIS"}
								</code>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
