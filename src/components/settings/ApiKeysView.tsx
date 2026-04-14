"use client";

import { useCallback, useEffect, useState } from "react";
import {
	KeyRound,
	Plus,
	Copy,
	Check,
	RefreshCw,
	Trash2,
	AlertTriangle,
	Clock,
	ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Badge } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ApiKeysViewSkeleton } from "@/components/settings/SettingsSkeleton";
import {
	getApiKeys,
	createApiKey,
	revokeApiKey,
	rotateApiKey,
} from "@/lib/settings/apiKeysClient";
import type { ApiKey } from "@/lib/settings/types";

export function ApiKeysView() {
	const { t } = useLanguage();
	const { data: session } = useAuthSession();

	const [loading, setLoading] = useState(true);
	const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

	// Create dialog state
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [keyName, setKeyName] = useState("");
	const [creating, setCreating] = useState(false);

	// Plain key reveal dialog (shown after create or rotate)
	const [revealedKey, setRevealedKey] = useState<string | null>(null);
	const [revealDialogOpen, setRevealDialogOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const activeOrgId = (
		session?.session as { activeOrganizationId?: string } | undefined
	)?.activeOrganizationId;

	const activeKeys = apiKeys.filter((k) => !k.revokedAt);
	const revokedKeys = apiKeys.filter((k) => k.revokedAt);

	const loadData = useCallback(async () => {
		if (!activeOrgId) {
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			const keys = await getApiKeys();
			setApiKeys(keys);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to load API keys",
			);
		} finally {
			setLoading(false);
		}
	}, [activeOrgId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleCreate = async () => {
		if (!keyName.trim()) return;

		try {
			setCreating(true);
			const result = await createApiKey(keyName.trim());
			setRevealedKey(result.plainKey);
			setRevealDialogOpen(true);
			setCreateDialogOpen(false);
			setKeyName("");
			loadData();
			toast.success(
				t("settings.apiKeys.created") || "API key created successfully",
			);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to create API key",
			);
		} finally {
			setCreating(false);
		}
	};

	const handleRevoke = async (id: string) => {
		try {
			await revokeApiKey(id);
			toast.success(t("settings.apiKeys.revoked") || "API key revoked");
			loadData();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to revoke API key",
			);
		}
	};

	const handleRotate = async (id: string) => {
		try {
			const result = await rotateApiKey(id);
			setRevealedKey(result.plainKey);
			setRevealDialogOpen(true);
			toast.success(
				t("settings.apiKeys.rotated") || "API key rotated successfully",
			);
			loadData();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to rotate API key",
			);
		}
	};

	const handleCopyKey = async () => {
		if (!revealedKey) return;
		try {
			await navigator.clipboard.writeText(revealedKey);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy to clipboard");
		}
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatRelativeDate = (dateStr: string | null) => {
		if (!dateStr) return t("settings.apiKeys.never") || "Never";
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return t("settings.apiKeys.justNow") || "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 30) return `${diffDays}d ago`;
		return formatDate(dateStr);
	};

	if (loading) {
		return <ApiKeysViewSkeleton />;
	}

	if (!activeOrgId) {
		return (
			<div className="space-y-8">
				<SettingsPageHeader
					icon={KeyRound}
					title={t("settings.apiKeys.title") || "API Keys"}
					description={
						t("settings.organization.noOrg") ||
						"Select an organization to manage API keys"
					}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Page Header with Create Button */}
			<SettingsPageHeader
				icon={KeyRound}
				title={t("settings.apiKeys.title") || "API Keys"}
				description={
					t("settings.apiKeys.description") ||
					"Manage API keys for programmatic access to the Janovix API"
				}
				action={
					<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button className="gap-2">
								<Plus className="h-4 w-4" />
								{t("settings.apiKeys.create") || "Create API Key"}
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
							<DialogHeader>
								<DialogTitle>
									{t("settings.apiKeys.createTitle") || "Create API Key"}
								</DialogTitle>
								<DialogDescription>
									{t("settings.apiKeys.createDesc") ||
										"Give your API key a descriptive name to identify its usage."}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="key-name">
										{t("settings.apiKeys.keyName") || "Key Name"}
									</Label>
									<Input
										id="key-name"
										placeholder="e.g., Production, Staging, CI/CD"
										value={keyName}
										onChange={(e) => setKeyName(e.target.value)}
									/>
								</div>
							</div>
							<DialogFooter className="flex-col sm:flex-row gap-2">
								<Button
									variant="outline"
									onClick={() => setCreateDialogOpen(false)}
									className="w-full sm:w-auto"
								>
									{t("settings.apiKeys.cancel") || "Cancel"}
								</Button>
								<Button
									onClick={handleCreate}
									loading={creating}
									disabled={!keyName.trim()}
									className="w-full sm:w-auto"
								>
									{!creating && <Plus className="mr-2 h-4 w-4" />}
									{creating
										? t("settings.apiKeys.creating") || "Creating..."
										: t("settings.apiKeys.createBtn") || "Create Key"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				}
			/>

			{/* Plain Key Reveal Dialog */}
			<Dialog
				open={revealDialogOpen}
				onOpenChange={(open) => {
					if (!open) {
						setRevealedKey(null);
						setCopied(false);
					}
					setRevealDialogOpen(open);
				}}
			>
				<DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<KeyRound className="h-5 w-5" />
							{t("settings.apiKeys.keyCreated") || "Your API Key"}
						</DialogTitle>
						<DialogDescription>
							<span className="flex items-start gap-2 mt-2 p-3 rounded-md bg-warning/10 text-warning-foreground text-sm">
								<AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
								{t("settings.apiKeys.keyWarning") ||
									"This key will only be shown once. Copy it now and store it securely. You will not be able to see it again."}
							</span>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="flex items-center gap-2">
							<code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all select-all">
								{revealedKey}
							</code>
							<Button
								variant="outline"
								size="icon"
								onClick={handleCopyKey}
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
						<Button onClick={() => setRevealDialogOpen(false)}>
							{t("settings.apiKeys.done") || "Done"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Active Keys */}
			<SettingsSection
				title={`${t("settings.apiKeys.activeKeys") || "Active Keys"} (${activeKeys.length})`}
				description={
					t("settings.apiKeys.activeKeysDesc") ||
					"Keys currently authorized for API access"
				}
			>
				{activeKeys.length === 0 ? (
					<SettingsCard>
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<KeyRound className="h-10 w-10 text-muted-foreground/40 mb-3" />
							<p className="text-sm text-muted-foreground">
								{t("settings.apiKeys.noKeys") ||
									"No API keys yet. Create one to get started."}
							</p>
						</div>
					</SettingsCard>
				) : (
					<SettingsCard className="divide-y divide-border p-0 overflow-hidden">
						{activeKeys.map((key) => (
							<div
								key={key.id}
								className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
							>
								<div className="min-w-0 space-y-1">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-sm font-medium text-foreground">
											{key.name}
										</span>
										<Badge variant="secondary" className="font-mono text-xs">
											{key.keyPrefix}••••
										</Badge>
									</div>
									<div className="flex items-center gap-3 text-xs text-muted-foreground">
										<span>
											{t("settings.apiKeys.createdOn") || "Created"}{" "}
											{formatDate(key.createdAt)}
										</span>
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											{t("settings.apiKeys.lastUsed") || "Last used"}{" "}
											{formatRelativeDate(key.lastUsedAt)}
										</span>
									</div>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									{/* Rotate */}
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant="ghost" size="sm" className="gap-1.5">
												<RefreshCw className="h-3.5 w-3.5" />
												{t("settings.apiKeys.rotate") || "Rotate"}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													{t("settings.apiKeys.rotateTitle") ||
														"Rotate API Key?"}
												</AlertDialogTitle>
												<AlertDialogDescription>
													{t("settings.apiKeys.rotateDesc") ||
														"This will revoke the current key and generate a new one. Any systems using the old key will immediately stop working."}
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>
													{t("settings.apiKeys.cancel") || "Cancel"}
												</AlertDialogCancel>
												<AlertDialogAction onClick={() => handleRotate(key.id)}>
													{t("settings.apiKeys.rotateBtn") || "Rotate Key"}
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>

									{/* Revoke */}
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="gap-1.5 text-destructive hover:text-destructive"
											>
												<Trash2 className="h-3.5 w-3.5" />
												{t("settings.apiKeys.revoke") || "Revoke"}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													{t("settings.apiKeys.revokeTitle") ||
														"Revoke API Key?"}
												</AlertDialogTitle>
												<AlertDialogDescription>
													{t("settings.apiKeys.revokeDesc") ||
														"This action cannot be undone. The key will immediately stop working for any system using it."}
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>
													{t("settings.apiKeys.cancel") || "Cancel"}
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleRevoke(key.id)}
													className="bg-destructive text-destructive-foreground"
												>
													{t("settings.apiKeys.revokeBtn") || "Revoke Key"}
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

			{/* Revoked Keys */}
			{revokedKeys.length > 0 && (
				<SettingsSection
					title={`${t("settings.apiKeys.revokedKeys") || "Revoked Keys"} (${revokedKeys.length})`}
				>
					<SettingsCard className="divide-y divide-border p-0 overflow-hidden opacity-60">
						{revokedKeys.map((key) => (
							<div
								key={key.id}
								className="flex items-center justify-between p-4"
							>
								<div className="min-w-0 space-y-1">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-sm font-medium text-muted-foreground line-through">
											{key.name}
										</span>
										<Badge
											variant="secondary"
											className="font-mono text-xs opacity-70"
										>
											{key.keyPrefix}••••
										</Badge>
										<Badge variant="destructive" className="text-xs">
											<ShieldAlert className="h-3 w-3 mr-1" />
											{t("settings.apiKeys.revokedBadge") || "Revoked"}
										</Badge>
									</div>
									<div className="flex items-center gap-3 text-xs text-muted-foreground">
										<span>
											{t("settings.apiKeys.revokedOn") || "Revoked"}{" "}
											{key.revokedAt ? formatDate(key.revokedAt) : "—"}
										</span>
									</div>
								</div>
							</div>
						))}
					</SettingsCard>
				</SettingsSection>
			)}
		</div>
	);
}
