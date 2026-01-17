"use client";

import { useState, useCallback } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
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
import { useLanguage } from "@/contexts/language-context";
import { authClient } from "@/lib/auth/authClient";

interface DeleteOrganizationDialogProps {
	organizationId: string;
	organizationName: string;
	organizationSlug: string;
	disabled?: boolean;
	onDeleted?: () => void;
}

export function DeleteOrganizationDialog({
	organizationId,
	organizationName,
	organizationSlug,
	disabled = false,
	onDeleted,
}: DeleteOrganizationDialogProps) {
	const { t } = useLanguage();
	const [open, setOpen] = useState(false);
	const [confirmationSlug, setConfirmationSlug] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const isConfirmed = confirmationSlug === organizationSlug;

	const handleOpenChange = useCallback((newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			// Reset confirmation input when dialog closes
			setConfirmationSlug("");
		}
	}, []);

	const handleDelete = useCallback(async () => {
		if (!isConfirmed || isDeleting) return;

		try {
			setIsDeleting(true);

			const result = await authClient.organization.delete({
				organizationId,
			});

			if (result.error) {
				throw new Error(result.error.message || t("settings.org.deleteError"));
			}

			toast.success(t("settings.org.deleteSuccess"));
			setOpen(false);
			onDeleted?.();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : t("settings.org.deleteError"),
			);
		} finally {
			setIsDeleting(false);
		}
	}, [isConfirmed, isDeleting, organizationId, t, onDeleted]);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="destructive" className="shrink-0" disabled={disabled}>
					<Trash2 className="h-4 w-4 mr-2" />
					{t("settings.org.deleteButton")}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						{t("settings.org.deleteConfirmTitle")}
					</DialogTitle>
					<DialogDescription className="text-left">
						{t("settings.org.deleteConfirmDesc").replace(
							"{name}",
							organizationName,
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Warning box */}
					<div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
						<p className="text-sm text-destructive font-medium">
							{t("settings.org.deleteWarning")}
						</p>
					</div>

					{/* Slug confirmation input */}
					<div className="space-y-2">
						<Label htmlFor="confirm-slug" className="text-sm">
							{t("settings.org.deleteSlugPrompt").replace(
								"{slug}",
								organizationSlug,
							)}
						</Label>
						<Input
							id="confirm-slug"
							value={confirmationSlug}
							onChange={(e) => setConfirmationSlug(e.target.value)}
							placeholder={organizationSlug}
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							disabled={isDeleting}
							className={
								confirmationSlug.length > 0 && !isConfirmed
									? "border-destructive focus-visible:ring-destructive"
									: ""
							}
						/>
					</div>
				</div>

				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isDeleting}
						className="w-full sm:w-auto"
					>
						{t("settings.org.cancel")}
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={!isConfirmed || isDeleting}
						className="w-full sm:w-auto"
					>
						{isDeleting ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								{t("settings.org.deleting")}
							</>
						) : (
							<>
								<Trash2 className="h-4 w-4 mr-2" />
								{t("settings.org.deleteButtonConfirm")}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
