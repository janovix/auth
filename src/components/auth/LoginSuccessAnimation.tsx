"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface LoginSuccessAnimationProps {
	onComplete?: () => void;
	delay?: number; // ms before redirect
}

export function LoginSuccessAnimation({
	onComplete,
	delay = 2000,
}: LoginSuccessAnimationProps) {
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		// Fade in the content
		const showTimer = setTimeout(() => setShowContent(true), 100);
		const redirectTimer = setTimeout(() => {
			onComplete?.();
		}, delay);

		return () => {
			clearTimeout(showTimer);
			clearTimeout(redirectTimer);
		};
	}, [delay, onComplete]);

	return (
		<div className="flex flex-col items-center justify-center gap-6 py-12">
			{/* Simple checkmark icon with fade */}
			<div
				className={`flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 transition-all duration-500 ease-out ${
					showContent ? "opacity-100 scale-100" : "opacity-0 scale-90"
				}`}
			>
				<Check className="w-8 h-8 text-green-500" strokeWidth={2.5} />
			</div>

			{/* Redirecting caption */}
			<p
				className={`text-sm text-muted-foreground transition-opacity duration-500 ${
					showContent ? "opacity-100" : "opacity-0"
				}`}
				style={{ transitionDelay: "150ms" }}
			>
				Redirigiendo...
			</p>
		</div>
	);
}
