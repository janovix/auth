"use client";

import { useState, useCallback, useEffect } from "react";
import {
	ArrowRight,
	Fingerprint,
	LogOut,
	Pencil,
	Plus,
	ShieldCheck,
	ShieldOff,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { Button, Label, Badge } from "@/components/ui";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { authClient } from "@/lib/auth/authClient";
import { signOut } from "@/lib/auth/authActions";
import type { Passkey } from "@better-auth/passkey/client";

const MAX_PASSKEYS = 5;

interface PasskeySetupStepProps {
	onContinue: () => void;
}

export function PasskeySetupStep({ onContinue }: PasskeySetupStepProps) {
	const { t } = useLanguage();

	const [passkeys, setPasskeys] = useState<Passkey[]>([]);
	const [passkeysLoading, setPasskeysLoading] = useState(true);

	const [addPasskeyOpen, setAddPasskeyOpen] = useState(false);
	const [newPasskeyName, setNewPasskeyName] = useState("");
	const [newPasskeyAttachment, setNewPasskeyAttachment] = useState<
		"platform" | "cross-platform" | undefined
	>(undefined);
	const [addingPasskey, setAddingPasskey] = useState(false);

	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [renameOpen, setRenameOpen] = useState(false);

	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	useEffect(() => {
		async function loadPasskeys() {
			setPasskeysLoading(true);
			try {
				const { data } = await authClient.passkey.listUserPasskeys();
				setPasskeys(data ?? []);
			} catch {
				// Non-critical
			} finally {
				setPasskeysLoading(false);
			}
		}
		loadPasskeys();
	}, []);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		await signOut();
		window.location.href = "/login";
	};

	const handleAddPasskey = useCallback(async () => {
		setAddingPasskey(true);
		try {
			const { data, error } = await authClient.passkey.addPasskey({
				name: newPasskeyName.trim() || undefined,
				authenticatorAttachment: newPasskeyAttachment,
			});
			if (error) {
				toast.error(t("settings.personal.passkeys.addError"));
				return;
			}
			if (data) {
				setPasskeys((prev) => [...prev, data]);
			}
			toast.success(t("onboarding.passkey.added"));
			setAddPasskeyOpen(false);
			setNewPasskeyName("");
			setNewPasskeyAttachment(undefined);
		} catch {
			toast.error(t("settings.personal.passkeys.addError"));
		} finally {
			setAddingPasskey(false);
		}
	}, [newPasskeyName, newPasskeyAttachment, t]);

	const handleDeletePasskey = useCallback(
		async (id: string) => {
			setDeletingId(id);
			try {
				const { error } = await authClient.passkey.deletePasskey({ id });
				if (error) {
					toast.error(t("settings.personal.passkeys.deleteError"));
					return;
				}
				setPasskeys((prev) => prev.filter((p) => p.id !== id));
				toast.success(t("settings.personal.passkeys.deleteSuccess"));
			} catch {
				toast.error(t("settings.personal.passkeys.deleteError"));
			} finally {
				setDeletingId(null);
			}
		},
		[t],
	);

	const handleOpenRename = useCallback((pk: Passkey) => {
		setRenamingId(pk.id);
		setRenameValue(pk.name ?? "");
		setRenameOpen(true);
	}, []);

	const handleRenamePasskey = useCallback(async () => {
		if (!renamingId) return;
		try {
			const { error } = await authClient.passkey.updatePasskey({
				id: renamingId,
				name: renameValue.trim(),
			});
			if (error) {
				toast.error(t("settings.personal.passkeys.renameError"));
				return;
			}
			setPasskeys((prev) =>
				prev.map((p) =>
					p.id === renamingId ? { ...p, name: renameValue.trim() } : p,
				),
			);
			toast.success(t("settings.personal.passkeys.renameSuccess"));
			setRenameOpen(false);
			setRenamingId(null);
		} catch {
			toast.error(t("settings.personal.passkeys.renameError"));
		}
	}, [renamingId, renameValue, t]);

	return (
		<div className="w-full flex justify-center my-auto pt-6 px-3">
			<div className="w-full max-w-lg">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<Logo variant="logo" />
					</div>
					<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
						<Fingerprint className="h-8 w-8 text-primary" />
					</div>
					<h1 className="text-2xl font-bold text-foreground mb-2">
						{t("onboarding.passkey.title")}
					</h1>
					<p className="text-muted-foreground">
						{t("onboarding.passkey.description")}
					</p>
				</div>

				{/* Main card */}
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-base">
									{t("settings.personal.passkeys.title")}
								</CardTitle>
								<CardDescription className="text-sm mt-0.5">
									{t("settings.personal.passkeys.description")}
								</CardDescription>
							</div>
							{/* Add passkey button */}
							<Dialog open={addPasskeyOpen} onOpenChange={setAddPasskeyOpen}>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										disabled={
											passkeys.length >= MAX_PASSKEYS || passkeysLoading
										}
										className="gap-2 shrink-0"
									>
										<Plus className="h-4 w-4" />
										{t("settings.personal.passkeys.add")}
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-md">
									<DialogHeader>
										<DialogTitle>
											{t("settings.personal.passkeys.add")}
										</DialogTitle>
										<DialogDescription>
											{t("settings.personal.passkeys.addDesc")}
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-4 py-2">
										<div className="space-y-2">
											<Label htmlFor="passkey-name-ob">
												{t("settings.personal.passkeys.name")}
											</Label>
											<Input
												id="passkey-name-ob"
												placeholder={t(
													"settings.personal.passkeys.namePlaceholder",
												)}
												value={newPasskeyName}
												onChange={(e) => setNewPasskeyName(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter" && !addingPasskey) {
														handleAddPasskey();
													}
												}}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="passkey-type-ob">
												{t("settings.personal.passkeys.authenticatorType")}
											</Label>
											<Select
												value={newPasskeyAttachment ?? "any"}
												onValueChange={(v) => {
													setNewPasskeyAttachment(
														v === "any"
															? undefined
															: (v as "platform" | "cross-platform"),
													);
												}}
											>
												<SelectTrigger id="passkey-type-ob">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="any">
														{t("settings.personal.passkeys.any")}
													</SelectItem>
													<SelectItem value="platform">
														{t("settings.personal.passkeys.platform")}
													</SelectItem>
													<SelectItem value="cross-platform">
														{t("settings.personal.passkeys.crossPlatform")}
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<DialogFooter>
										<Button
											variant="outline"
											onClick={() => setAddPasskeyOpen(false)}
											disabled={addingPasskey}
										>
											{t("common.cancel")}
										</Button>
										<Button onClick={handleAddPasskey} disabled={addingPasskey}>
											<Fingerprint className="mr-2 h-4 w-4" />
											{addingPasskey
												? `${t("settings.personal.passkeys.add")}...`
												: t("settings.personal.passkeys.add")}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</CardHeader>

					<CardContent className="pt-0 space-y-3">
						{/* Max reached notice */}
						{passkeys.length >= MAX_PASSKEYS && (
							<p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
								{t("settings.personal.passkeys.maxReachedDesc")}
							</p>
						)}

						{/* Passkeys list */}
						{passkeysLoading ? (
							<div className="flex items-center gap-3 py-3">
								<Fingerprint className="h-5 w-5 text-muted-foreground animate-pulse" />
								<div className="h-4 w-48 bg-muted rounded animate-pulse" />
							</div>
						) : passkeys.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
								<Fingerprint className="h-8 w-8 text-muted-foreground/40" />
								<p className="text-sm font-medium text-foreground">
									{t("settings.personal.passkeys.noPasskeys")}
								</p>
								<p className="text-xs text-muted-foreground">
									{t("settings.personal.passkeys.noPasskeysDesc")}
								</p>
							</div>
						) : (
							<div className="space-y-2">
								{passkeys.map((pk) => (
									<div
										key={pk.id}
										className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
									>
										<div className="flex items-start gap-3">
											<Fingerprint className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
											<div className="min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="text-sm font-medium text-foreground truncate">
														{pk.name ||
															`${t("settings.personal.passkeys.deviceType")}: ${pk.deviceType}`}
													</span>
													{pk.backedUp ? (
														<Badge
															variant="secondary"
															className="gap-1 text-xs"
														>
															<ShieldCheck className="h-3 w-3" />
															{t("settings.personal.passkeys.backedUp")}
														</Badge>
													) : (
														<Badge
															variant="outline"
															className="gap-1 text-xs text-muted-foreground"
														>
															<ShieldOff className="h-3 w-3" />
															{t("settings.personal.passkeys.notBackedUp")}
														</Badge>
													)}
												</div>
												<p className="text-xs text-muted-foreground mt-0.5">
													{t("settings.personal.passkeys.deviceType")}:{" "}
													{pk.deviceType}
													{pk.createdAt && (
														<>
															{" · "}
															{t("settings.personal.passkeys.createdAt")}:{" "}
															{new Date(pk.createdAt).toLocaleDateString()}
														</>
													)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-1 shrink-0">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7"
												onClick={() => handleOpenRename(pk)}
												title={t("settings.personal.passkeys.rename")}
											>
												<Pencil className="h-3.5 w-3.5" />
											</Button>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 text-destructive hover:text-destructive"
														disabled={deletingId === pk.id}
														title={t("settings.personal.passkeys.delete")}
													>
														<Trash2 className="h-3.5 w-3.5" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															{t("settings.personal.passkeys.deleteConfirm")}
														</AlertDialogTitle>
														<AlertDialogDescription>
															{t(
																"settings.personal.passkeys.deleteConfirmDesc",
															)}
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>
															{t("common.cancel")}
														</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDeletePasskey(pk.id)}
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														>
															{t("settings.personal.passkeys.delete")}
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Continue / Skip */}
						<div className="pt-2 space-y-2">
							<Button className="w-full h-12" size="lg" onClick={onContinue}>
								{passkeys.length > 0
									? t("onboarding.passkey.continue")
									: t("onboarding.passkey.skip")}
								<ArrowRight className="h-4 w-4 ml-2" />
							</Button>
							{passkeys.length > 0 && (
								<p className="text-center text-xs text-muted-foreground">
									{t("onboarding.passkey.footerNote")}
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="border-t border-border pt-6 mt-6 flex flex-col sm:flex-row sm:items-center justify-end gap-4">
					<Button
						variant="outline"
						size="sm"
						onClick={handleLogout}
						loading={isLoggingOut}
						className="gap-2"
					>
						{!isLoggingOut && <LogOut className="h-3.5 w-3.5" />}
						{t("settings.nav.signOut")}
					</Button>
				</div>
			</div>

			{/* Rename passkey dialog */}
			<Dialog open={renameOpen} onOpenChange={setRenameOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{t("settings.personal.passkeys.renameTitle")}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-2 py-2">
						<Label htmlFor="rename-passkey-ob">
							{t("settings.personal.passkeys.newName")}
						</Label>
						<Input
							id="rename-passkey-ob"
							value={renameValue}
							onChange={(e) => setRenameValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleRenamePasskey();
							}}
							autoFocus
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRenameOpen(false)}>
							{t("common.cancel")}
						</Button>
						<Button
							onClick={handleRenamePasskey}
							disabled={!renameValue.trim()}
						>
							{t("settings.personal.passkeys.rename")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
