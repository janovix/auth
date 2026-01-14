import type React from "react";
import type { LucideIcon } from "lucide-react";

interface SettingsPageHeaderProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: React.ReactNode;
}

/**
 * Page header with icon, title, description, and optional action button
 */
export function SettingsPageHeader({
	icon: Icon,
	title,
	description,
	action,
}: SettingsPageHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div className="flex items-center gap-3">
				<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
					<Icon className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h1 className="text-2xl font-semibold text-foreground">{title}</h1>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</div>
	);
}
