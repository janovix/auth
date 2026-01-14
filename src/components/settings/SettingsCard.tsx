import type React from "react";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
	children: React.ReactNode;
	className?: string;
	variant?: "default" | "danger";
}

/**
 * Reusable card component for settings pages with optional danger styling
 */
export function SettingsCard({
	children,
	className,
	variant = "default",
}: SettingsCardProps) {
	return (
		<div
			className={cn(
				"rounded-xl border bg-card p-6",
				variant === "danger" && "border-destructive/30 bg-destructive/5",
				className,
			)}
		>
			{children}
		</div>
	);
}
