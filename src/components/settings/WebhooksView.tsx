"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	Webhook,
	Plus,
	Copy,
	Check,
	Trash2,
	AlertTriangle,
	Pencil,
	CheckCircle2,
	XCircle,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Badge, Checkbox } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/language-context";
import { useAuthSession } from "@/lib/auth/useAuthSession";
import {
	SettingsCard,
	SettingsSection,
	SettingsPageHeader,
} from "@/components/settings";
import { WebhooksViewSkeleton } from "@/components/settings/SettingsSkeleton";
import { cn } from "@/lib/utils";
import {
	getWebhookEndpoints,
	createWebhookEndpoint,
	updateWebhookEndpoint,
	deleteWebhookEndpoint,
	getWebhookDeliveries,
} from "@/lib/settings/webhooksClient";
import {
	WEBHOOK_EVENTS,
	type ApiKeyEnvironment,
	type WebhookEndpoint,
	type WebhookDelivery,
	type WebhookEventType,
} from "@/lib/settings/types";

export function WebhooksView() {
	const { t } = useLanguage();
	const { data: session } = useAuthSession();

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const lastLoadedOrgIdRef = useRef<string | undefined>(undefined);
	const loadSeqRef = useRef(0);
	const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
	const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
	const [selectedEnvironment, setSelectedEnvironment] =
		useState<ApiKeyEnvironment>("production");

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [endpointUrl, setEndpointUrl] = useState("");
	const [endpointDescription, setEndpointDescription] = useState("");
	const [selectedEvents, setSelectedEvents] = useState<Set<WebhookEventType>>(
		new Set(),
	);
	const [creating, setCreating] = useState(false);

	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingEndpoint, setEditingEndpoint] =
		useState<WebhookEndpoint | null>(null);
	const [editUrl, setEditUrl] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editEvents, setEditEvents] = useState<Set<WebhookEventType>>(
		new Set(),
	);
	const [updating, setUpdating] = useState(false);

	const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
	const [secretDialogOpen, setSecretDialogOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	const loadData = useCallback(async () => {
		if (!activeOrgId) {
			lastLoadedOrgIdRef.current = undefined;
			loadSeqRef.current += 1;
			setLoading(false);
			setRefreshing(false);
			return;
		}

		const seq = ++loadSeqRef.current;
		const switchedOrg = lastLoadedOrgIdRef.current !== activeOrgId;
		lastLoadedOrgIdRef.current = activeOrgId;

		try {
			if (switchedOrg) {
				setLoading(true);
			} else {
				setRefreshing(true);
			}
			const [endpointsData, deliveriesData] = await Promise.all([
				getWebhookEndpoints(selectedEnvironment),
				getWebhookDeliveries(selectedEnvironment),
			]);
			if (seq !== loadSeqRef.current) return;
			setEndpoints(endpointsData);
			setDeliveries(deliveriesData);
		} catch (err) {
			if (seq !== loadSeqRef.current) return;
			toast.error(
				err instanceof Error ? err.message : "Failed to load webhooks",
			);
		} finally {
			if (seq === loadSeqRef.current) {
				setLoading(false);
				setRefreshing(false);
			}
		}
	}, [activeOrgId, selectedEnvironment]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const resetCreateForm = () => {
		setEndpointUrl("");
		setEndpointDescription("");
		setSelectedEvents(new Set());
	};

	const handleCreate = async () => {
		if (!endpointUrl.trim() || selectedEvents.size === 0) return;

		try {
			setCreating(true);
			const result = await createWebhookEndpoint({
				url: endpointUrl.trim(),
				events: Array.from(selectedEvents),
				description: endpointDescription.trim() || undefined,
				environment: selectedEnvironment,
			});
			setRevealedSecret(result.secret);
			setSecretDialogOpen(true);
			setCreateDialogOpen(false);
			resetCreateForm();
			loadData();
			toast.success("Webhook endpoint created successfully");
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to create webhook endpoint",
			);
		} finally {
			setCreating(false);
		}
	};

	const openEditDialog = (endpoint: WebhookEndpoint) => {
		setEditingEndpoint(endpoint);
		setEditUrl(endpoint.url);
		setEditDescription(endpoint.description || "");
		setEditEvents(new Set(endpoint.events));
		setEditDialogOpen(true);
	};

	const handleUpdate = async () => {
		if (!editingEndpoint || !editUrl.trim() || editEvents.size === 0) return;

		try {
			setUpdating(true);
			await updateWebhookEndpoint(editingEndpoint.id, {
				url: editUrl.trim(),
				events: Array.from(editEvents),
				description: editDescription.trim() || undefined,
			});
			setEditDialogOpen(false);
			setEditingEndpoint(null);
			loadData();
			toast.success("Webhook endpoint updated");
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to update webhook endpoint",
			);
		} finally {
			setUpdating(false);
		}
	};

	const handleToggleActive = async (endpoint: WebhookEndpoint) => {
		try {
			await updateWebhookEndpoint(endpoint.id, {
				active: !endpoint.active,
			});
			loadData();
			toast.success(
				endpoint.active
					? "Webhook endpoint disabled"
					: "Webhook endpoint enabled",
			);
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to toggle webhook endpoint",
			);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteWebhookEndpoint(id);
			toast.success("Webhook endpoint deleted");
			loadData();
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to delete webhook endpoint",
			);
		}
	};

	const handleCopySecret = async () => {
		if (!revealedSecret) return;
		try {
			await navigator.clipboard.writeText(revealedSecret);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy to clipboard");
		}
	};

	const toggleEvent = (
		event: WebhookEventType,
		set: Set<WebhookEventType>,
		setter: (s: Set<WebhookEventType>) => void,
	) => {
		const next = new Set(set);
		if (next.has(event)) {
			next.delete(event);
		} else {
			next.add(event);
		}
		setter(next);
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatRelativeDate = (dateStr: string | null) => {
		if (!dateStr) return "Never";
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 30) return `${diffDays}d ago`;
		return formatDate(dateStr);
	};

	const truncateUrl = (url: string, maxLen = 50) => {
		if (url.length <= maxLen) return url;
		return `${url.slice(0, maxLen)}...`;
	};

	const environmentLabels: Record<ApiKeyEnvironment, string> = {
		production: t("settings.apiKeys.envProduction") || "Production",
		staging: t("settings.apiKeys.envStaging") || "Staging",
		development: t("settings.apiKeys.envDevelopment") || "Development",
	};

	const environmentBadgeStyles: Record<ApiKeyEnvironment, string> = {
		production:
			"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		staging:
			"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		development:
			"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	};

	function EventCheckboxGrid({
		events,
		onToggle,
	}: {
		events: Set<WebhookEventType>;
		onToggle: (event: WebhookEventType) => void;
	}) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
				{WEBHOOK_EVENTS.map((event) => (
					<label
						key={event}
						className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm"
					>
						<Checkbox
							checked={events.has(event)}
							onCheckedChange={() => onToggle(event)}
						/>
						<span className="font-mono text-xs">{event}</span>
					</label>
				))}
			</div>
		);
	}

	if (loading) {
		return <WebhooksViewSkeleton />;
	}

	if (!activeOrgId) {
		return (
			<div className="space-y-8">
				<SettingsPageHeader
					icon={Webhook}
					title="Webhooks"
					description="Select an organization to manage webhooks"
				/>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<SettingsPageHeader
				icon={Webhook}
				title="Webhooks"
				description="Receive real-time notifications when events occur in your organization"
				action={
					<Dialog
						open={createDialogOpen}
						onOpenChange={(open) => {
							setCreateDialogOpen(open);
							if (!open) resetCreateForm();
						}}
					>
						<DialogTrigger asChild>
							<Button className="gap-2">
								<Plus className="h-4 w-4" />
								Create Endpoint
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Create Webhook Endpoint</DialogTitle>
								<DialogDescription>
									Configure a URL to receive event notifications. The signing
									secret will be shown once after creation.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="endpoint-url">Endpoint URL</Label>
									<Input
										id="endpoint-url"
										type="url"
										placeholder="https://your-app.com/webhooks"
										value={endpointUrl}
										onChange={(e) => setEndpointUrl(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="endpoint-description">
										Description (optional)
									</Label>
									<Input
										id="endpoint-description"
										placeholder="e.g., Production notification handler"
										value={endpointDescription}
										onChange={(e) => setEndpointDescription(e.target.value)}
									/>
								</div>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<span>Environment:</span>
									<Badge
										className={environmentBadgeStyles[selectedEnvironment]}
									>
										{environmentLabels[selectedEnvironment]}
									</Badge>
								</div>
								<div className="space-y-2">
									<Label>Events</Label>
									<EventCheckboxGrid
										events={selectedEvents}
										onToggle={(event) =>
											toggleEvent(event, selectedEvents, setSelectedEvents)
										}
									/>
									{selectedEvents.size === 0 && (
										<p className="text-xs text-muted-foreground">
											Select at least one event to subscribe to.
										</p>
									)}
								</div>
							</div>
							<DialogFooter className="flex-col sm:flex-row gap-2">
								<Button
									variant="outline"
									onClick={() => setCreateDialogOpen(false)}
									className="w-full sm:w-auto"
								>
									Cancel
								</Button>
								<Button
									onClick={handleCreate}
									loading={creating}
									disabled={!endpointUrl.trim() || selectedEvents.size === 0}
									className="w-full sm:w-auto"
								>
									{!creating && <Plus className="mr-2 h-4 w-4" />}
									{creating ? "Creating..." : "Create Endpoint"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				}
			/>

			<div className="relative">
				{refreshing ? (
					<div
						className="absolute inset-0 z-10 flex justify-center pt-16 sm:pt-20 rounded-lg bg-background/60 backdrop-blur-[1px]"
						aria-busy="true"
						aria-live="polite"
					>
						<Loader2
							className="h-7 w-7 shrink-0 animate-spin text-muted-foreground"
							aria-hidden
						/>
					</div>
				) : null}
				<div
					className={cn(
						"space-y-8",
						refreshing && "pointer-events-none select-none",
					)}
				>
					<Tabs
						value={selectedEnvironment}
						onValueChange={(v) =>
							setSelectedEnvironment(v as ApiKeyEnvironment)
						}
					>
						<TabsList>
							<TabsTrigger value="production">
								{environmentLabels.production}
							</TabsTrigger>
							<TabsTrigger value="staging">
								{environmentLabels.staging}
							</TabsTrigger>
							<TabsTrigger value="development">
								{environmentLabels.development}
							</TabsTrigger>
						</TabsList>
					</Tabs>

					{/* Endpoints List */}
					<SettingsSection
						title={`Endpoints (${endpoints.length})`}
						description="Webhook endpoints receiving event notifications"
					>
						{endpoints.length === 0 ? (
							<SettingsCard>
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<Webhook className="h-10 w-10 text-muted-foreground/40 mb-3" />
									<p className="text-sm text-muted-foreground">
										No webhook endpoints yet. Create one to start receiving
										event notifications.
									</p>
								</div>
							</SettingsCard>
						) : (
							<SettingsCard className="divide-y divide-border p-0 overflow-hidden">
								{endpoints.map((endpoint) => (
									<div
										key={endpoint.id}
										className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
									>
										<div className="min-w-0 space-y-1">
											<div className="flex items-center gap-2 flex-wrap">
												<span className="text-sm font-medium font-mono text-foreground">
													{truncateUrl(endpoint.url)}
												</span>
												<Badge
													variant={endpoint.active ? "secondary" : "outline"}
													className={
														endpoint.active
															? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
															: "text-muted-foreground"
													}
												>
													{endpoint.active ? "Active" : "Disabled"}
												</Badge>
												<Badge variant="secondary" className="text-xs">
													{endpoint.events.length} event
													{endpoint.events.length !== 1 ? "s" : ""}
												</Badge>
											</div>
											{endpoint.description && (
												<p className="text-xs text-muted-foreground">
													{endpoint.description}
												</p>
											)}
											<div className="text-xs text-muted-foreground">
												Created {formatDate(endpoint.createdAt)}
											</div>
										</div>
										<div className="flex items-center gap-2 shrink-0">
											<Button
												variant="ghost"
												size="sm"
												className="gap-1.5"
												onClick={() => handleToggleActive(endpoint)}
											>
												{endpoint.active ? (
													<XCircle className="h-3.5 w-3.5" />
												) : (
													<CheckCircle2 className="h-3.5 w-3.5" />
												)}
												{endpoint.active ? "Disable" : "Enable"}
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="gap-1.5"
												onClick={() => openEditDialog(endpoint)}
											>
												<Pencil className="h-3.5 w-3.5" />
												Edit
											</Button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														className="gap-1.5 text-destructive hover:text-destructive"
													>
														<Trash2 className="h-3.5 w-3.5" />
														Delete
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Delete Webhook Endpoint?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This action cannot be undone. The endpoint will
															stop receiving all event notifications
															immediately.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDelete(endpoint.id)}
															className="bg-destructive text-destructive-foreground"
														>
															Delete Endpoint
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</div>
								))}
							</SettingsCard>
						)}
					</SettingsSection>

					{/* Recent Deliveries */}
					{deliveries.length > 0 && (
						<SettingsSection
							title={`Recent Deliveries (${deliveries.length})`}
							description="Recent webhook delivery attempts"
						>
							<SettingsCard className="divide-y divide-border p-0 overflow-hidden">
								{deliveries.map((delivery) => (
									<div
										key={delivery.id}
										className="flex items-center justify-between p-4"
									>
										<div className="min-w-0 space-y-1">
											<div className="flex items-center gap-2 flex-wrap">
												<span className="text-sm font-mono">
													{delivery.eventType}
												</span>
												<Badge
													variant={
														delivery.status === "delivered"
															? "secondary"
															: "destructive"
													}
													className={
														delivery.status === "delivered"
															? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
															: ""
													}
												>
													{delivery.status === "delivered"
														? "Delivered"
														: "Failed"}
												</Badge>
												{delivery.lastResponseStatus && (
													<Badge
														variant="outline"
														className="text-xs font-mono"
													>
														{delivery.lastResponseStatus}
													</Badge>
												)}
											</div>
											<div className="flex items-center gap-3 text-xs text-muted-foreground">
												<span>
													{delivery.attempts} attempt
													{delivery.attempts !== 1 ? "s" : ""}
												</span>
												<span>
													{formatRelativeDate(delivery.lastAttemptAt)}
												</span>
												{delivery.lastError && (
													<span className="text-destructive truncate max-w-xs">
														{delivery.lastError}
													</span>
												)}
											</div>
										</div>
									</div>
								))}
							</SettingsCard>
						</SettingsSection>
					)}
				</div>

				{/* Secret Reveal Dialog — outside refresh pointer-lock */}
				<Dialog
					open={secretDialogOpen}
					onOpenChange={(open) => {
						if (!open) {
							setRevealedSecret(null);
							setCopied(false);
						}
						setSecretDialogOpen(open);
					}}
				>
					<DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<Webhook className="h-5 w-5" />
								Webhook Signing Secret
							</DialogTitle>
							<DialogDescription>
								<span className="flex items-start gap-2 mt-2 p-3 rounded-md bg-warning/10 text-warning-foreground text-sm">
									<AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
									This secret will only be shown once. Copy it now and store it
									securely. You will need it to verify webhook signatures.
								</span>
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="flex items-center gap-2">
								<code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all select-all">
									{revealedSecret}
								</code>
								<Button
									variant="outline"
									size="icon"
									onClick={handleCopySecret}
									className="shrink-0"
								>
									{copied ? (
										<Check className="h-4 w-4 text-success" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						<DialogFooter>
							<Button onClick={() => setSecretDialogOpen(false)}>Done</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Edit Endpoint Dialog */}
				<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
					<DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Edit Webhook Endpoint</DialogTitle>
							<DialogDescription>
								Update the endpoint URL, description, or subscribed events.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="edit-endpoint-url">Endpoint URL</Label>
								<Input
									id="edit-endpoint-url"
									type="url"
									placeholder="https://your-app.com/webhooks"
									value={editUrl}
									onChange={(e) => setEditUrl(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-endpoint-description">
									Description (optional)
								</Label>
								<Input
									id="edit-endpoint-description"
									placeholder="e.g., Production notification handler"
									value={editDescription}
									onChange={(e) => setEditDescription(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label>Events</Label>
								<EventCheckboxGrid
									events={editEvents}
									onToggle={(event) =>
										toggleEvent(event, editEvents, setEditEvents)
									}
								/>
							</div>
						</div>
						<DialogFooter className="flex-col sm:flex-row gap-2">
							<Button
								variant="outline"
								onClick={() => setEditDialogOpen(false)}
								className="w-full sm:w-auto"
							>
								Cancel
							</Button>
							<Button
								onClick={handleUpdate}
								loading={updating}
								disabled={!editUrl.trim() || editEvents.size === 0}
								className="w-full sm:w-auto"
							>
								{updating ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
