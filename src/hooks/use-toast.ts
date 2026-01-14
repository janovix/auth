/**
 * Toast hook using sonner
 */

import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";

export interface ToastProps {
	title?: string;
	description?: string;
	variant?: "default" | "destructive" | "success";
}

export function useToast() {
	const toast = useCallback((props: ToastProps) => {
		const { title, description, variant = "default" } = props;

		if (variant === "destructive") {
			sonnerToast.error(title, { description });
		} else if (variant === "success") {
			sonnerToast.success(title, { description });
		} else {
			sonnerToast(title, { description });
		}
	}, []);

	return { toast };
}

// Re-export sonner's toast for direct usage
export { toast as sonnerToast } from "sonner";
