"use client";

import { useEffect, useState } from "react";
import { useAurora, rgbToString } from "@/contexts/aurora-context";

export function GlobalAuroraBackground() {
	const { currentPalette, blobPositions, animationSpeed } = useAurora();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const blob1Gradient = `linear-gradient(180deg, ${rgbToString(currentPalette.blob1Start)} 0%, ${rgbToString(currentPalette.blob1End)} 100%)`;
	const blob2Gradient = `linear-gradient(180deg, ${rgbToString(currentPalette.blob2Start)} 0%, ${rgbToString(currentPalette.blob2End)} 100%)`;
	const blob3Gradient = `linear-gradient(180deg, ${rgbToString(currentPalette.blob3Start)} 0%, ${rgbToString(currentPalette.blob3End)} 100%)`;

	// Calculate animation durations based on speed multiplier
	const blob1Duration = 8 * animationSpeed;
	const blob2Duration = 10 * animationSpeed;
	const blob3Duration = 7 * animationSpeed;

	return (
		<>
			{/* Background base */}
			<div
				className="fixed inset-0 bg-background pointer-events-none z-0"
				style={{
					// Extend beyond viewport to cover overscroll areas
					top: "-100vh",
					left: "-10vw",
					right: "-10vw",
					bottom: "-100vh",
					width: "120vw",
					height: "300vh",
				}}
				aria-hidden="true"
			/>

			{/* Aurora blobs container */}
			<div
				className="fixed inset-0 pointer-events-none overflow-hidden z-[1]"
				style={{
					top: "-50px",
					bottom: "-100px",
				}}
				aria-hidden="true"
			>
				{/* Blob 1 - dynamic position based on page profile */}
				<div
					className="absolute rounded-full blur-[80px] motion-reduce:animate-none transition-all duration-700 ease-in-out"
					style={{
						background: blob1Gradient,
						opacity: mounted ? 0.6 : 0,
						animation: `aurora-1 ${blob1Duration}s ease-in-out infinite`,
						willChange: "transform",
						top: blobPositions.blob1.top,
						bottom: blobPositions.blob1.bottom,
						left: blobPositions.blob1.left,
						right: blobPositions.blob1.right,
						width: blobPositions.blob1.width,
						height: blobPositions.blob1.height,
					}}
				/>
				{/* Blob 2 - dynamic position based on page profile */}
				<div
					className="absolute rounded-full blur-[70px] motion-reduce:animate-none transition-all duration-700 ease-in-out"
					style={{
						background: blob2Gradient,
						opacity: mounted ? 0.5 : 0,
						animation: `aurora-2 ${blob2Duration}s ease-in-out infinite`,
						willChange: "transform",
						top: blobPositions.blob2.top,
						bottom: blobPositions.blob2.bottom,
						left: blobPositions.blob2.left,
						right: blobPositions.blob2.right,
						width: blobPositions.blob2.width,
						height: blobPositions.blob2.height,
					}}
				/>
				{/* Blob 3 - dynamic position based on page profile */}
				<div
					className="absolute rounded-full blur-[90px] motion-reduce:animate-none transition-all duration-700 ease-in-out"
					style={{
						background: blob3Gradient,
						opacity: mounted ? 0.55 : 0,
						animation: `aurora-3 ${blob3Duration}s ease-in-out infinite`,
						willChange: "transform",
						top: blobPositions.blob3.top,
						bottom: blobPositions.blob3.bottom,
						left: blobPositions.blob3.left,
						right: blobPositions.blob3.right,
						width: blobPositions.blob3.width,
						height: blobPositions.blob3.height,
					}}
				/>
			</div>
		</>
	);
}
