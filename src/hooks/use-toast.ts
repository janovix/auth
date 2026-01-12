/**
 * Simple toast hook placeholder
 *
 * This is a simple implementation that logs toasts to console.
 * In a production environment, this should be replaced with a proper toast system.
 */

import { useCallback } from "react";

export interface ToastProps {
	title?: string;
	description?: string;
	variant?: "default" | "destructive";
}

export function useToast() {
	const toast = useCallback((props: ToastProps) => {
		// For now, just log to console
		// In production, this would show a toast notification
		if (props.variant === "destructive") {
			console.error("[Toast]", props.title, props.description);
		} else {
			console.log("[Toast]", props.title, props.description);
		}
	}, []);

	return { toast };
}
