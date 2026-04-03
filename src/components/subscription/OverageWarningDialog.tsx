"use client";

import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface OverageWarningDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	/** When set, persists "don't show again" for this session in localStorage */
	sessionDismissStorageKey?: string;
	onConfirm: () => void;
}

/**
 * Optional confirmation when an action will incur metered overage charges.
 * Pair with `sessionDismissStorageKey` + user id for per-session dismissal.
 */
export function OverageWarningDialog({
	open,
	onOpenChange,
	title = "Metered usage",
	description,
	confirmLabel = "Continue",
	cancelLabel = "Cancel",
	sessionDismissStorageKey,
	onConfirm,
}: OverageWarningDialogProps) {
	const [dontShow, setDontShow] = useState(false);

	const handleConfirm = () => {
		if (dontShow && sessionDismissStorageKey && typeof window !== "undefined") {
			try {
				sessionStorage.setItem(sessionDismissStorageKey, "1");
			} catch {
				/* ignore */
			}
		}
		onOpenChange(false);
		onConfirm();
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				{sessionDismissStorageKey ? (
					<div className="flex items-center gap-2 py-2">
						<Checkbox
							id="overage-dismiss-session"
							checked={dontShow}
							onCheckedChange={(v) => setDontShow(v === true)}
						/>
						<Label
							htmlFor="overage-dismiss-session"
							className="text-sm font-normal cursor-pointer"
						>
							Don&apos;t show again this session
						</Label>
					</div>
				) : null}
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm}>
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
