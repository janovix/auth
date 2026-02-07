"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { AvatarEditor } from "@algenium/blocks";
import { useLanguage } from "@/contexts/language-context";
import { getAuthCoreBaseUrl } from "@/lib/auth/authCoreConfig";

interface AvatarUploadDialogProps {
	/** Button content that triggers the dialog */
	trigger: React.ReactNode;
	/** User or org initials to display in placeholder */
	initials: string;
	/** Current avatar URL if one exists */
	currentAvatarUrl?: string | null;
	/** Called when upload succeeds with the new public URL */
	onUploadSuccess: (url: string) => void;
	/** Optional dialog title */
	title?: string;
	/** Optional dialog description */
	description?: string;
}

/**
 * Dialog component that wraps AvatarEditor and handles R2 upload
 */
export function AvatarUploadDialog({
	trigger,
	initials,
	currentAvatarUrl,
	onUploadSuccess,
	title,
	description,
}: AvatarUploadDialogProps) {
	const { t } = useLanguage();
	const [open, setOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(
		currentAvatarUrl || null,
	);

	const handleAvatarChange = useCallback((dataUrl: string | null) => {
		setAvatarDataUrl(dataUrl);
		setError(null);
	}, []);

	const handleUpload = async () => {
		if (!avatarDataUrl) {
			setError(t("settings.avatar.noImage") || "Please select an image first");
			return;
		}

		setUploading(true);
		setError(null);

		try {
			// Convert data URL to Blob
			const response = await fetch(avatarDataUrl);
			const blob = await response.blob();

			// Create form data
			const formData = new FormData();
			formData.append("file", blob, "avatar.png");

			// Upload to auth service
			const authServiceUrl = getAuthCoreBaseUrl();
			const uploadResponse = await fetch(
				`${authServiceUrl}/api/upload/avatar`,
				{
					method: "POST",
					credentials: "include",
					body: formData,
				},
			);

			if (!uploadResponse.ok) {
				const errorData = await uploadResponse.json().catch(() => ({}));
				throw new Error(
					(errorData as { error?: string }).error ||
						`Upload failed: ${uploadResponse.status}`,
				);
			}

			const result = (await uploadResponse.json()) as {
				success: boolean;
				data?: { url: string };
				error?: string;
			};

			if (!result.success || !result.data?.url) {
				throw new Error(result.error || "Upload failed");
			}

			// Success - notify parent and close dialog
			onUploadSuccess(result.data.url);
			setOpen(false);
			setAvatarDataUrl(null);
		} catch (err) {
			console.error("[AvatarUpload] Error:", err);
			setError(
				err instanceof Error
					? err.message
					: t("settings.avatar.uploadError") || "Failed to upload avatar",
			);
		} finally {
			setUploading(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			// Reset state when closing
			setAvatarDataUrl(null);
			setError(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{title || t("settings.avatar.title") || "Change Avatar"}
					</DialogTitle>
					<DialogDescription>
						{description ||
							t("settings.avatar.description") ||
							"Upload and edit your profile picture"}
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<div className="max-w-[280px] mx-auto">
						<AvatarEditor
							value={avatarDataUrl}
							onChange={handleAvatarChange}
							outputSize={256}
							outputFormat="png"
						/>
					</div>

					{error && (
						<p className="text-sm text-destructive text-center mt-4">{error}</p>
					)}
				</div>

				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={uploading}
						className="w-full sm:w-auto"
					>
						{t("settings.cancel") || "Cancel"}
					</Button>
					<Button
						onClick={handleUpload}
						disabled={!avatarDataUrl || uploading}
						className="w-full sm:w-auto"
					>
						{uploading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{t("settings.uploading") || "Uploading..."}
							</>
						) : (
							t("settings.avatar.save") || "Save Avatar"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
