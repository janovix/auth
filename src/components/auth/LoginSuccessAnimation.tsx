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
		<div
			className={`flex items-center justify-center gap-3 transition-all duration-500 ease-out ${
				showContent ? "opacity-100 scale-100" : "opacity-0 scale-90"
			}`}
		>
			{/* Checkmark icon on the left */}
			<div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
				<Check className="w-5 h-5 text-green-500" strokeWidth={2.5} />
			</div>

			{/* Redirecting caption on the right */}
			<p className="text-sm text-muted-foreground">Redirigiendo...</p>
		</div>
	);
}
