"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface LoginSuccessAnimationProps {
	userName?: string;
	onComplete?: () => void;
	delay?: number; // ms before redirect
}

export function LoginSuccessAnimation({
	userName,
	onComplete,
	delay = 2500,
}: LoginSuccessAnimationProps) {
	const [showCheck, setShowCheck] = useState(false);
	const [showText, setShowText] = useState(false);

	useEffect(() => {
		// Stagger the animations
		const checkTimer = setTimeout(() => setShowCheck(true), 100);
		const textTimer = setTimeout(() => setShowText(true), 600);
		const redirectTimer = setTimeout(() => {
			onComplete?.();
		}, delay);

		return () => {
			clearTimeout(checkTimer);
			clearTimeout(textTimer);
			clearTimeout(redirectTimer);
		};
	}, [delay, onComplete]);

	const greeting = userName
		? `¡Bienvenido, ${userName.split(" ")[0]}!`
		: "¡Bienvenido!";

	return (
		<div className="flex flex-col items-center justify-center gap-6 py-12 animate-fade-in">
			{/* Animated checkmark circle */}
			<div
				className={`relative transition-all duration-700 ease-out ${
					showCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"
				}`}
			>
				{/* Outer ring animation */}
				<div className="absolute inset-0 animate-success-ring rounded-full" />

				{/* Check icon with draw animation */}
				<div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30">
					<CheckCircle2
						className={`w-14 h-14 text-white transition-all duration-500 ${
							showCheck ? "scale-100 opacity-100" : "scale-0 opacity-0"
						}`}
						style={{
							transitionDelay: "200ms",
						}}
						strokeWidth={2.5}
					/>
				</div>

				{/* Sparkle effects */}
				<div className="absolute -top-2 -right-2 w-4 h-4 animate-sparkle-1">
					<div className="w-full h-full bg-green-400 rounded-full opacity-80" />
				</div>
				<div className="absolute -bottom-1 -left-3 w-3 h-3 animate-sparkle-2">
					<div className="w-full h-full bg-green-300 rounded-full opacity-70" />
				</div>
				<div className="absolute top-1/2 -right-4 w-2 h-2 animate-sparkle-3">
					<div className="w-full h-full bg-green-500 rounded-full opacity-60" />
				</div>
			</div>

			{/* Welcome text */}
			<div
				className={`text-center transition-all duration-700 ease-out ${
					showText ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
				}`}
			>
				<h2 className="text-2xl font-bold text-foreground mb-2">{greeting}</h2>
				<p className="text-muted-foreground text-sm">
					Redirigiendo a tu cuenta...
				</p>
			</div>

			{/* Loading dots */}
			<div
				className={`flex gap-1.5 transition-all duration-500 ${
					showText ? "opacity-100" : "opacity-0"
				}`}
				style={{ transitionDelay: "300ms" }}
			>
				<div className="w-2 h-2 bg-green-500 rounded-full animate-bounce-dot-1" />
				<div className="w-2 h-2 bg-green-500 rounded-full animate-bounce-dot-2" />
				<div className="w-2 h-2 bg-green-500 rounded-full animate-bounce-dot-3" />
			</div>
		</div>
	);
}
