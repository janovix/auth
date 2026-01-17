/**
 * @name AvatarEditorDialog
 * @description A complete avatar editing experience with a preview display and edit dialog.
 * Shows a large avatar with an edit button. Opens fullscreen dialog on mobile, modal on desktop.
 * Handles save/upload callbacks with success/error feedback.
 *
 * @example
 * ```tsx
 * import { AvatarEditorDialog } from "@/components/ui/avatar-editor-dialog"
 *
 * export default function ProfilePage() {
 *   const [avatar, setAvatar] = useState<string | null>(null)
 *
 *   const handleSave = async (dataUrl: string) => {
 *     await uploadAvatar(dataUrl)
 *   }
 *
 *   return (
 *     <AvatarEditorDialog
 *       value={avatar}
 *       onChange={setAvatar}
 *       onSave={handleSave}
 *     />
 *   )
 * }
 * ```
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import { Pencil, User, X, Check, Loader2 } from "lucide-react";
import { AvatarEditor } from "@/components/ui/avatar-editor";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerFooter,
	DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface AvatarEditorDialogProps {
	/** Current avatar URL or data URL */
	value?: string | null;
	/** Callback when avatar changes (after accepting) */
	onChange?: (dataUrl: string | null) => void;
	/** Async callback for saving/uploading - return true for success, false for failure */
	onSave?: (dataUrl: string) => Promise<boolean> | boolean;
	/** Size of the displayed avatar in pixels */
	displaySize?: number;
	/** Size of the editor in the dialog */
	editorSize?: number;
	/** Output image size */
	outputSize?: number;
	/** Placeholder text when no avatar */
	placeholder?: string;
	/** Edit button label for accessibility */
	editLabel?: string;
	/** Dialog title */
	dialogTitle?: string;
	/** Accept button text */
	acceptText?: string;
	/** Cancel button text */
	cancelText?: string;
	/** Success message */
	successMessage?: string;
	/** Error message */
	errorMessage?: string;
	/** Additional class names */
	className?: string;
}

function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}
		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [matches, query]);

	return matches;
}

export function AvatarEditorDialog({
	value,
	onChange,
	onSave,
	displaySize = 120,
	editorSize = 280,
	outputSize = 256,
	placeholder = "Add Photo",
	editLabel = "Edit avatar",
	dialogTitle = "Edit Avatar",
	acceptText = "Accept",
	cancelText = "Cancel",
	successMessage = "Avatar saved successfully!",
	errorMessage = "Failed to save avatar. Please try again.",
	className,
}: AvatarEditorDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [editedValue, setEditedValue] = useState<string | null>(value ?? null);
	const [isSaving, setIsSaving] = useState(false);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const isMobile = useMediaQuery("(max-width: 640px)");

	// Sync edited value when dialog opens
	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (open) {
				setEditedValue(value ?? null);
				setFeedback(null);
			}
			setIsOpen(open);
		},
		[value],
	);

	// Handle accept/save
	const handleAccept = useCallback(async () => {
		if (!editedValue) return;

		setIsSaving(true);
		setFeedback(null);

		try {
			if (onSave) {
				const result = await onSave(editedValue);
				if (result) {
					onChange?.(editedValue);
					setFeedback({ type: "success", message: successMessage });
					setTimeout(() => {
						setIsOpen(false);
						setFeedback(null);
					}, 1500);
				} else {
					setFeedback({ type: "error", message: errorMessage });
				}
			} else {
				onChange?.(editedValue);
				setFeedback({ type: "success", message: successMessage });
				setTimeout(() => {
					setIsOpen(false);
					setFeedback(null);
				}, 1500);
			}
		} catch {
			setFeedback({ type: "error", message: errorMessage });
		} finally {
			setIsSaving(false);
		}
	}, [editedValue, onChange, onSave, successMessage, errorMessage]);

	// Calculate mobile editor size
	const mobileEditorSize = isMobile
		? Math.min(
				editorSize + 40,
				typeof window !== "undefined" ? window.innerWidth - 48 : editorSize,
			)
		: editorSize;

	// Avatar display component
	const AvatarDisplay = (
		<div
			className={cn("relative group", className)}
			style={{ width: displaySize, height: displaySize }}
		>
			{/* Avatar circle */}
			<div
				className="w-full h-full rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center"
				style={{ width: displaySize, height: displaySize }}
			>
				{value ? (
					<img
						src={value || "/placeholder.svg"}
						alt="Avatar"
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
						<User className="w-1/3 h-1/3" />
						<span className="text-xs">{placeholder}</span>
					</div>
				)}
			</div>

			{/* Edit button - bottom right */}
			<button
				onClick={() => handleOpenChange(true)}
				className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
				aria-label={editLabel}
				type="button"
			>
				<Pencil className="w-4 h-4" />
			</button>
		</div>
	);

	// Editor content (shared between dialog and drawer)
	const EditorContent = (
		<div className="flex flex-col items-center gap-4 w-full">
			<div style={{ width: mobileEditorSize, maxWidth: "100%" }}>
				<AvatarEditor
					value={editedValue}
					onChange={setEditedValue}
					size={mobileEditorSize}
					outputSize={outputSize}
					controlSize={isMobile ? "large" : "default"}
				/>
			</div>

			{/* Feedback message */}
			<AnimatePresence>
				{feedback && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className={cn(
							"flex items-center gap-2 rounded-lg font-medium",
							isMobile ? "px-5 py-3 text-base" : "px-4 py-2 text-sm",
							feedback.type === "success"
								? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
								: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
						)}
					>
						{feedback.type === "success" ? (
							<Check className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
						) : (
							<X className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
						)}
						{feedback.message}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);

	// Footer buttons (shared)
	const FooterButtons = (
		<>
			{isMobile ? (
				<DrawerClose asChild>
					<Button
						variant="outline"
						disabled={isSaving}
						size="lg"
						className="flex-1 bg-transparent"
					>
						{cancelText}
					</Button>
				</DrawerClose>
			) : (
				<DialogClose asChild>
					<Button variant="outline" disabled={isSaving}>
						{cancelText}
					</Button>
				</DialogClose>
			)}
			<Button
				onClick={handleAccept}
				disabled={!editedValue || isSaving || feedback?.type === "success"}
				size={isMobile ? "lg" : "default"}
				className={isMobile ? "flex-1" : ""}
			>
				{isSaving ? (
					<>
						<Loader2
							className={cn(
								"mr-2 animate-spin",
								isMobile ? "w-5 h-5" : "w-4 h-4",
							)}
						/>
						Saving...
					</>
				) : feedback?.type === "success" ? (
					<>
						<Check className={cn("mr-2", isMobile ? "w-5 h-5" : "w-4 h-4")} />
						Saved!
					</>
				) : (
					acceptText
				)}
			</Button>
		</>
	);

	// Mobile: Drawer (fullscreen-like)
	if (isMobile) {
		return (
			<>
				{AvatarDisplay}
				<Drawer open={isOpen} onOpenChange={handleOpenChange}>
					<DrawerContent className="max-h-[96vh]">
						<DrawerHeader className="text-center">
							<DrawerTitle className="text-xl">{dialogTitle}</DrawerTitle>
						</DrawerHeader>
						<div className="px-6 pb-6 overflow-y-auto">{EditorContent}</div>
						<DrawerFooter className="flex-row gap-3 px-6 pb-8">
							{FooterButtons}
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			</>
		);
	}

	// Desktop: Dialog (modal)
	return (
		<>
			{AvatarDisplay}
			<Dialog open={isOpen} onOpenChange={handleOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{dialogTitle}</DialogTitle>
					</DialogHeader>
					<div className="flex justify-center py-4">{EditorContent}</div>
					<DialogFooter className="gap-2 sm:gap-0">
						{FooterButtons}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
