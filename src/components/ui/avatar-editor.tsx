/**
 * @name AvatarEditor
 * @description A compact, reusable avatar editor component that fits within a square container.
 * Supports image cropping, zooming, rotating, and repositioning with an optional grid overlay.
 * This is a controlled component - the parent manages the image state.
 *
 * @example
 * ```tsx
 * import { AvatarEditor } from "@/components/ui/avatar-editor"
 *
 * export default function ProfileForm() {
 *   const [avatarData, setAvatarData] = useState<string | null>(null)
 *
 *   return (
 *     <form>
 *       <AvatarEditor
 *         value={avatarData}
 *         onChange={setAvatarData}
 *         size={280}
 *       />
 *       <button type="submit">Submit Form</button>
 *     </form>
 *   )
 * }
 * ```
 *
 * @props
 * - `value` - The current cropped image as a data URL (controlled)
 * - `onChange` - Callback when the cropped image changes
 * - `size` - Size of the editor container in pixels (default: 280)
 * - `showGrid` - Whether to show the alignment grid overlay (default: false)
 * - `outputSize` - Size of the output image in pixels (default: 256)
 * - `outputFormat` - Output format: 'png' | 'jpeg' | 'webp' (default: 'png')
 * - `outputQuality` - Quality for jpeg/webp output 0-1 (default: 0.92)
 * - `className` - Additional class names
 * - `controlSize` - Control size variant - 'default' for desktop, 'large' for mobile/touch devices (default: 'default')
 *
 * @accessibility
 * - Full keyboard navigation support
 * - ARIA labels for all controls
 * - High contrast focus indicators
 *
 * @dependencies
 * - lucide-react (icons)
 * - @/components/ui/button
 * - @/components/ui/slider
 * - @/components/ui/toggle
 */
"use client";

import type * as React from "react";
import { useCallback, useRef, useState, useEffect } from "react";
import {
	Upload,
	ZoomIn,
	ZoomOut,
	RotateCcw,
	RotateCw,
	Grid3X3,
	X,
	Move,
	RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export interface AvatarEditorProps {
	/** Current cropped image as data URL (controlled) */
	value?: string | null;
	/** Callback when the cropped image changes */
	onChange?: (dataUrl: string | null) => void;
	/** Size of the editor container in pixels */
	size?: number;
	/** Whether to show grid overlay by default */
	showGrid?: boolean;
	/** Output image size in pixels */
	outputSize?: number;
	/** Output format */
	outputFormat?: "png" | "jpeg" | "webp";
	/** Output quality for jpeg/webp (0-1) */
	outputQuality?: number;
	/** Additional class names */
	className?: string;
	/** Control size variant - 'default' for desktop, 'large' for mobile/touch devices */
	controlSize?: "default" | "large";
	/** @deprecated Use value instead. Default image URL to load */
	defaultImage?: string;
	/** Initials to show in the placeholder (for backward compatibility, not displayed in current UI) */
	initials?: string;
}

export function AvatarEditor({
	value,
	onChange,
	size = 280,
	showGrid: initialShowGrid = false,
	outputSize = 256,
	outputFormat = "png",
	outputQuality = 0.92,
	className,
	controlSize = "default",
	defaultImage,
	initials: _initials,
}: AvatarEditorProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Support both value and defaultImage props
	const imageSource = value ?? defaultImage;

	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [zoom, setZoom] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [showGrid, setShowGrid] = useState(initialShowGrid);

	// Load image from imageSource (value or defaultImage)
	useEffect(() => {
		if (imageSource && !imageSource.startsWith("data:")) {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => {
				setImage(img);
				setImageLoaded(true);
				setZoom(1);
				setRotation(0);
				setPosition({ x: 0, y: 0 });
			};
			img.src = imageSource;
		}
	}, [imageSource]);

	const generateOutput = useCallback(() => {
		if (!canvasRef.current || !image) return null;

		const outputCanvas = document.createElement("canvas");
		outputCanvas.width = outputSize;
		outputCanvas.height = outputSize;
		const ctx = outputCanvas.getContext("2d");
		if (!ctx) return null;

		ctx.drawImage(canvasRef.current, 0, 0, outputSize, outputSize);

		const mimeType = `image/${outputFormat}`;
		return outputCanvas.toDataURL(mimeType, outputQuality);
	}, [image, outputSize, outputFormat, outputQuality]);

	useEffect(() => {
		if (!canvasRef.current || !image || !imageLoaded) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const displaySize = size;
		canvas.width = displaySize;
		canvas.height = displaySize;

		ctx.clearRect(0, 0, displaySize, displaySize);
		ctx.fillStyle = "#1a1a2e";
		ctx.fillRect(0, 0, displaySize, displaySize);

		ctx.save();
		ctx.translate(displaySize / 2, displaySize / 2);
		ctx.rotate((rotation * Math.PI) / 180);

		const scale = zoom;
		const imgAspect = image.width / image.height;
		let drawWidth, drawHeight;

		if (imgAspect > 1) {
			drawHeight = displaySize * scale;
			drawWidth = drawHeight * imgAspect;
		} else {
			drawWidth = displaySize * scale;
			drawHeight = drawWidth / imgAspect;
		}

		ctx.drawImage(
			image,
			-drawWidth / 2 + position.x,
			-drawHeight / 2 + position.y,
			drawWidth,
			drawHeight,
		);
		ctx.restore();

		ctx.globalCompositeOperation = "destination-in";
		ctx.beginPath();
		ctx.arc(
			displaySize / 2,
			displaySize / 2,
			displaySize / 2 - 4,
			0,
			Math.PI * 2,
		);
		ctx.fill();

		ctx.globalCompositeOperation = "source-over";
		ctx.strokeStyle = "hsl(var(--primary))";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(
			displaySize / 2,
			displaySize / 2,
			displaySize / 2 - 2,
			0,
			Math.PI * 2,
		);
		ctx.stroke();

		const dataUrl = generateOutput();
		if (dataUrl) {
			onChange?.(dataUrl);
		}
	}, [
		image,
		imageLoaded,
		zoom,
		rotation,
		position,
		size,
		generateOutput,
		onChange,
	]);

	const resetTransforms = useCallback(() => {
		setZoom(1);
		setRotation(0);
		setPosition({ x: 0, y: 0 });
	}, []);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (event) => {
				const img = new Image();
				img.crossOrigin = "anonymous";
				img.onload = () => {
					setImage(img);
					setImageLoaded(true);
					resetTransforms();
				};
				img.src = event.target?.result as string;
			};
			reader.readAsDataURL(file);
		},
		[resetTransforms],
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (!imageLoaded) return;
			setIsDragging(true);
			setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
		},
		[imageLoaded, position],
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging) return;
			setPosition({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y,
			});
		},
		[isDragging, dragStart],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			if (!imageLoaded) return;
			const touch = e.touches[0];
			setIsDragging(true);
			setDragStart({
				x: touch.clientX - position.x,
				y: touch.clientY - position.y,
			});
		},
		[imageLoaded, position],
	);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!isDragging) return;
			const touch = e.touches[0];
			setPosition({
				x: touch.clientX - dragStart.x,
				y: touch.clientY - dragStart.y,
			});
		},
		[isDragging, dragStart],
	);

	const handleDiscard = useCallback(() => {
		setImage(null);
		setImageLoaded(false);
		resetTransforms();
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		onChange?.(null);
	}, [resetTransforms, onChange]);

	const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
	const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
	const handleRotateLeft = () => setRotation((r) => r - 15);
	const handleRotateRight = () => setRotation((r) => r + 15);

	const isLarge = controlSize === "large";
	const buttonSize = isLarge ? "h-12 w-12" : "h-8 w-8";
	const iconSize = isLarge ? "w-6 h-6" : "w-4 h-4";
	const smallIconSize = isLarge ? "w-5 h-5" : "w-3 h-3";
	const textSize = isLarge ? "text-sm" : "text-xs";
	const uploadIconSize = isLarge ? "w-12 h-12" : "w-8 h-8";
	const uploadContainerSize = isLarge ? "w-24 h-24" : "w-16 h-16";
	const gapSize = isLarge ? "gap-6" : "gap-4";
	const controlGap = isLarge ? "gap-3" : "gap-2";
	const sliderHeight = isLarge
		? "[&_[role=slider]]:h-6 [&_[role=slider]]:w-6"
		: "";

	return (
		<div
			className={cn("flex flex-col", gapSize, className)}
			style={{ width: size }}
		>
			{/* Canvas Container */}
			<div
				ref={containerRef}
				className="relative bg-muted rounded-2xl overflow-hidden"
				style={{ width: size, height: size }}
			>
				{/* Upload placeholder */}
				{!imageLoaded && (
					<button
						onClick={() => fileInputRef.current?.click()}
						className={cn(
							"absolute inset-0 z-10 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer",
							isLarge ? "gap-4" : "gap-3",
						)}
						aria-label="Upload image"
						type="button"
					>
						<div
							className={cn(
								"rounded-full bg-primary/10 flex items-center justify-center",
								uploadContainerSize,
							)}
						>
							<Upload className={cn("text-primary", uploadIconSize)} />
						</div>
						<span
							className={cn("font-medium", isLarge ? "text-base" : "text-sm")}
						>
							Click to upload
						</span>
						<span className={cn("text-muted-foreground", textSize)}>
							PNG, JPG up to 10MB
						</span>
					</button>
				)}

				{/* Canvas */}
				<canvas
					ref={canvasRef}
					className={cn(
						"absolute inset-0",
						imageLoaded ? "cursor-move" : "pointer-events-none opacity-0",
					)}
					style={{ width: size, height: size }}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleMouseUp}
				/>

				{/* Grid Overlay */}
				{showGrid && imageLoaded && (
					<div
						className="absolute inset-0 pointer-events-none"
						style={{ width: size, height: size }}
					>
						<svg width={size} height={size} className="opacity-30">
							<line
								x1={size / 3}
								y1={0}
								x2={size / 3}
								y2={size}
								stroke="white"
								strokeWidth="1"
							/>
							<line
								x1={(size * 2) / 3}
								y1={0}
								x2={(size * 2) / 3}
								y2={size}
								stroke="white"
								strokeWidth="1"
							/>
							<line
								x1={0}
								y1={size / 3}
								x2={size}
								y2={size / 3}
								stroke="white"
								strokeWidth="1"
							/>
							<line
								x1={0}
								y1={(size * 2) / 3}
								x2={size}
								y2={(size * 2) / 3}
								stroke="white"
								strokeWidth="1"
							/>
							<line
								x1={size / 2 - 10}
								y1={size / 2}
								x2={size / 2 + 10}
								y2={size / 2}
								stroke="white"
								strokeWidth="1"
							/>
							<line
								x1={size / 2}
								y1={size / 2 - 10}
								x2={size / 2}
								y2={size / 2 + 10}
								stroke="white"
								strokeWidth="1"
							/>
						</svg>
					</div>
				)}

				{/* Drag indicator */}
				{imageLoaded && isDragging && (
					<div
						className={cn(
							"absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 rounded text-white flex items-center",
							isLarge ? "px-3 py-2 text-sm gap-2" : "px-2 py-1 text-xs gap-1",
						)}
					>
						<Move className={smallIconSize} />
						Dragging
					</div>
				)}
			</div>

			{/* Controls - only show when image is loaded */}
			{imageLoaded && (
				<div className={cn("space-y-4", isLarge && "space-y-5")}>
					{/* Zoom Slider */}
					<div className={cn("flex items-center", controlGap)}>
						<Button
							variant="ghost"
							size="icon"
							className={cn(buttonSize, "shrink-0")}
							onClick={handleZoomOut}
							aria-label="Zoom out"
							type="button"
						>
							<ZoomOut className={iconSize} />
						</Button>
						<Slider
							value={[zoom]}
							onValueChange={([v]) => setZoom(v)}
							min={0.5}
							max={3}
							step={0.01}
							className={cn("flex-1", sliderHeight)}
							aria-label="Zoom level"
						/>
						<Button
							variant="ghost"
							size="icon"
							className={cn(buttonSize, "shrink-0")}
							onClick={handleZoomIn}
							aria-label="Zoom in"
							type="button"
						>
							<ZoomIn className={iconSize} />
						</Button>
					</div>

					{/* Rotation & Grid Controls */}
					<div className={cn("flex items-center justify-between", controlGap)}>
						<div
							className={cn("flex items-center", isLarge ? "gap-2" : "gap-1")}
						>
							<Button
								variant="ghost"
								size="icon"
								className={buttonSize}
								onClick={handleRotateLeft}
								aria-label="Rotate left 15 degrees"
								type="button"
							>
								<RotateCcw className={iconSize} />
							</Button>
							<span
								className={cn(
									"text-muted-foreground text-center tabular-nums",
									textSize,
									isLarge ? "w-16" : "w-12",
								)}
							>
								{rotation}°
							</span>
							<Button
								variant="ghost"
								size="icon"
								className={buttonSize}
								onClick={handleRotateRight}
								aria-label="Rotate right 15 degrees"
								type="button"
							>
								<RotateCw className={iconSize} />
							</Button>
						</div>

						<div
							className={cn("flex items-center", isLarge ? "gap-2" : "gap-1")}
						>
							<Toggle
								pressed={showGrid}
								onPressedChange={setShowGrid}
								size="sm"
								className={cn(buttonSize, "p-0")}
								aria-label="Toggle grid overlay"
							>
								<Grid3X3 className={iconSize} />
							</Toggle>
							<Button
								variant="ghost"
								size="icon"
								className={buttonSize}
								onClick={resetTransforms}
								aria-label="Reset all transforms"
								type="button"
							>
								<RefreshCw className={iconSize} />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className={buttonSize}
								onClick={() => fileInputRef.current?.click()}
								aria-label="Upload new image"
								type="button"
							>
								<Upload className={iconSize} />
							</Button>
							{/* Discard button */}
							<Button
								variant="ghost"
								size="icon"
								className={cn(
									buttonSize,
									"text-destructive hover:text-destructive hover:bg-destructive/10",
								)}
								onClick={handleDiscard}
								aria-label="Discard image"
								type="button"
							>
								<X className={iconSize} />
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
				aria-hidden="true"
			/>
		</div>
	);
}
