/**
 * @name AvatarEditor
 * @description A responsive avatar editor component that takes full width of its container.
 * Supports image cropping, zooming, rotating, and repositioning with an optional grid overlay.
 * The parent form handles the actual save/upload - this component just manages image editing.
 *
 * @example
 * ```tsx
 * import { AvatarEditor } from "@/components/ui/avatar-editor"
 *
 * export default function ProfilePage() {
 *   const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <div className="max-w-xs mx-auto">
 *         <AvatarEditor
 *           onChange={(dataUrl) => setAvatarDataUrl(dataUrl)}
 *           initials="JD"
 *         />
 *       </div>
 *       <button type="submit">Save Profile</button>
 *     </form>
 *   )
 * }
 * ```
 *
 * @props
 * - `onChange` - Callback fired when the image changes, receives the cropped image as a data URL
 * - `initials` - Initials to show in the placeholder (default: "?")
 * - `showGrid` - Whether to show the alignment grid overlay (default: false)
 * - `defaultImage` - Optional default image URL to load
 * - `outputSize` - Size of the output image in pixels (default: 256)
 * - `outputFormat` - Output format: 'png' | 'jpeg' | 'webp' (default: 'png')
 * - `outputQuality` - Quality for jpeg/webp output 0-1 (default: 0.92)
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
	Move,
	RefreshCw,
	Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export interface AvatarEditorProps {
	/** Callback fired when the edited image changes (receives data URL or null if cleared) */
	onChange?: (dataUrl: string | null) => void;
	/** Initials to show in the placeholder avatar */
	initials?: string;
	/** Whether to show grid overlay by default */
	showGrid?: boolean;
	/** Default image URL to load */
	defaultImage?: string;
	/** Output image size in pixels */
	outputSize?: number;
	/** Output format */
	outputFormat?: "png" | "jpeg" | "webp";
	/** Output quality for jpeg/webp (0-1) */
	outputQuality?: number;
	/** Additional class names */
	className?: string;
}

export function AvatarEditor({
	onChange,
	initials = "?",
	showGrid: initialShowGrid = false,
	defaultImage,
	outputSize = 256,
	outputFormat = "png",
	outputQuality = 0.92,
	className,
}: AvatarEditorProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [zoom, setZoom] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [showGrid, setShowGrid] = useState(initialShowGrid);
	const [containerSize, setContainerSize] = useState(280);

	// Observe container size for responsive canvas
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateSize = () => {
			const width = container.clientWidth;
			if (width > 0) {
				setContainerSize(width);
			}
		};

		// Initial size
		updateSize();

		// ResizeObserver for responsive updates
		const resizeObserver = new ResizeObserver(updateSize);
		resizeObserver.observe(container);

		return () => resizeObserver.disconnect();
	}, []);

	// Load default image
	useEffect(() => {
		if (defaultImage) {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => {
				setImage(img);
				setImageLoaded(true);
				setZoom(1);
				setRotation(0);
				setPosition({ x: 0, y: 0 });
			};
			img.src = defaultImage;
		}
	}, [defaultImage]);

	// Generate output data URL
	const generateOutputDataUrl = useCallback(() => {
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

	// Draw canvas and notify parent of changes
	useEffect(() => {
		if (!canvasRef.current || !image || !imageLoaded) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const displaySize = containerSize;
		canvas.width = displaySize;
		canvas.height = displaySize;

		// Clear canvas
		ctx.clearRect(0, 0, displaySize, displaySize);

		// Fill with background
		ctx.fillStyle = "#1a1a2e";
		ctx.fillRect(0, 0, displaySize, displaySize);

		// Save context state
		ctx.save();

		// Move to center
		ctx.translate(displaySize / 2, displaySize / 2);

		// Apply rotation
		ctx.rotate((rotation * Math.PI) / 180);

		// Apply zoom and position
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

		// Draw image centered with position offset
		ctx.drawImage(
			image,
			-drawWidth / 2 + position.x,
			-drawHeight / 2 + position.y,
			drawWidth,
			drawHeight,
		);

		// Restore context
		ctx.restore();

		// Draw circular mask
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

		// Reset composite operation
		ctx.globalCompositeOperation = "source-over";

		// Draw border ring
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

		// Notify parent of the change after rendering is complete
		const dataUrl = generateOutputDataUrl();
		onChange?.(dataUrl);
	}, [image, imageLoaded, zoom, rotation, position, containerSize, generateOutputDataUrl, onChange]);

	const resetTransforms = useCallback(() => {
		setZoom(1);
		setRotation(0);
		setPosition({ x: 0, y: 0 });
	}, []);

	// Discard the image entirely
	const handleDiscard = useCallback(() => {
		setImage(null);
		setImageLoaded(false);
		setZoom(1);
		setRotation(0);
		setPosition({ x: 0, y: 0 });
		// Reset the file input so the same file can be selected again
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		onChange?.(null);
	}, [onChange]);

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
					setZoom(1);
					setRotation(0);
					setPosition({ x: 0, y: 0 });
				};
				img.src = event.target?.result as string;
			};
			reader.readAsDataURL(file);
		},
		[],
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

	const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
	const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
	const handleRotateLeft = () => setRotation((r) => r - 15);
	const handleRotateRight = () => setRotation((r) => r + 15);

	return (
		<div className={cn("flex flex-col gap-4 w-full", className)}>
			{/* Canvas Container - Square aspect ratio, full width */}
			<div
				ref={containerRef}
				className="relative w-full aspect-square bg-muted rounded-2xl overflow-hidden"
			>
				{/* Upload placeholder with avatar initials */}
				{!imageLoaded && (
					<button
						onClick={() => fileInputRef.current?.click()}
						className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 hover:bg-muted/80 transition-colors cursor-pointer group"
						aria-label="Upload image"
						type="button"
					>
						{/* Avatar circle with initials */}
						<div className="w-3/4 aspect-square max-w-[200px] rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
							<span className="text-primary-foreground font-bold text-4xl sm:text-5xl md:text-6xl select-none">
								{initials}
							</span>
						</div>
						{/* Upload hint */}
						<div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
							<Upload className="w-4 h-4" />
							<span className="text-sm font-medium">Click to upload</span>
						</div>
					</button>
				)}

				{/* Canvas */}
				<canvas
					ref={canvasRef}
					className={cn(
						"absolute inset-0 w-full h-full",
						imageLoaded ? "cursor-move" : "pointer-events-none opacity-0",
					)}
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
					<svg
						className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
						viewBox="0 0 100 100"
						preserveAspectRatio="none"
					>
						{/* Vertical lines */}
						<line x1="33.33" y1="0" x2="33.33" y2="100" stroke="white" strokeWidth="0.5" />
						<line x1="66.66" y1="0" x2="66.66" y2="100" stroke="white" strokeWidth="0.5" />
						{/* Horizontal lines */}
						<line x1="0" y1="33.33" x2="100" y2="33.33" stroke="white" strokeWidth="0.5" />
						<line x1="0" y1="66.66" x2="100" y2="66.66" stroke="white" strokeWidth="0.5" />
						{/* Center crosshair */}
						<line x1="45" y1="50" x2="55" y2="50" stroke="white" strokeWidth="0.5" />
						<line x1="50" y1="45" x2="50" y2="55" stroke="white" strokeWidth="0.5" />
					</svg>
				)}

				{/* Drag indicator */}
				{imageLoaded && isDragging && (
					<div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/60 rounded text-xs text-white flex items-center gap-1">
						<Move className="w-3 h-3" />
						Dragging
					</div>
				)}
			</div>

			{/* Controls - only show when image is loaded */}
			{imageLoaded && (
				<div className="space-y-3">
					{/* Zoom Slider */}
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 shrink-0"
							onClick={handleZoomOut}
							aria-label="Zoom out"
							type="button"
						>
							<ZoomOut className="w-4 h-4" />
						</Button>
						<Slider
							value={[zoom]}
							onValueChange={([v]) => setZoom(v)}
							min={0.5}
							max={3}
							step={0.01}
							className="flex-1"
							aria-label="Zoom level"
						/>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 shrink-0"
							onClick={handleZoomIn}
							aria-label="Zoom in"
							type="button"
						>
							<ZoomIn className="w-4 h-4" />
						</Button>
					</div>

					{/* Rotation & Grid Controls */}
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={handleRotateLeft}
								aria-label="Rotate left 15 degrees"
								type="button"
							>
								<RotateCcw className="w-4 h-4" />
							</Button>
							<span className="text-xs text-muted-foreground w-12 text-center tabular-nums">
								{rotation}°
							</span>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={handleRotateRight}
								aria-label="Rotate right 15 degrees"
								type="button"
							>
								<RotateCw className="w-4 h-4" />
							</Button>
						</div>

						<div className="flex items-center gap-1">
							<Toggle
								pressed={showGrid}
								onPressedChange={setShowGrid}
								size="sm"
								className="h-8 w-8 p-0"
								aria-label="Toggle grid overlay"
							>
								<Grid3X3 className="w-4 h-4" />
							</Toggle>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={resetTransforms}
								aria-label="Reset all transforms"
								type="button"
							>
								<RefreshCw className="w-4 h-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
								onClick={handleDiscard}
								aria-label="Discard image"
								type="button"
							>
								<Trash2 className="w-4 h-4" />
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
