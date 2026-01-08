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

const languageLabels: Record<"en" | "es" | "pt", string> = {
	en: "EN",
	es: "ES",
	pt: "PT",
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
					{languageLabels[language]}
					<ChevronDown className="size-3 opacity-60" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				side="top"
				align="center"
				sideOffset={8}
				className="min-w-[3.5rem]"
			>
				<DropdownMenuItem
					onClick={() => setLanguage("pt")}
					className={cn(
						"justify-center text-xs font-semibold cursor-pointer",
						language === "pt" && "bg-accent",
					)}
				>
					PT
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setLanguage("es")}
					className={cn(
						"justify-center text-xs font-semibold cursor-pointer",
						language === "es" && "bg-accent",
					)}
				>
					ES
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setLanguage("en")}
					className={cn(
						"justify-center text-xs font-semibold cursor-pointer",
						language === "en" && "bg-accent",
					)}
				>
					EN
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
