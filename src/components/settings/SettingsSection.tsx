import type React from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	variant?: "default" | "danger";
}

/**
 * Section header with title, description, and content area
 */
export function SettingsSection({
	title,
	description,
	children,
	variant = "default",
}: SettingsSectionProps) {
	return (
		<section>
			<div className="mb-4">
				<h2
					className={cn(
						"text-lg font-semibold",
						variant === "danger" ? "text-destructive" : "text-foreground",
					)}
				>
					{title}
				</h2>
				{description && (
					<p className="text-sm text-muted-foreground mt-0.5">{description}</p>
				)}
			</div>
			{children}
		</section>
	);
}
