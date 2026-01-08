"use client";

import { ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

export type LanguageSwitcherProps = {
	className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
	const { language, setLanguage } = useLanguage();

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={cn(
						"h-8 px-2 gap-1 text-xs font-semibold uppercase",
						className,
					)}
				>
					{language === "en" ? "EN" : "ES"}
					<ChevronDown className="size-3 opacity-60" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="center"
				sideOffset={4}
				avoidCollisions={false}
				className="min-w-0 w-14"
			>
				<DropdownMenuItem
					onClick={() => setLanguage("es")}
					className={cn(
						"justify-center text-xs font-semibold",
						language === "es" && "bg-accent",
					)}
				>
					ES
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setLanguage("en")}
					className={cn(
						"justify-center text-xs font-semibold",
						language === "en" && "bg-accent",
					)}
				>
					EN
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
