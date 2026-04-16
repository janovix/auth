import { Skeleton } from "@/components/ui/skeleton";
import { SettingsCard } from "./SettingsCard";

/**
 * Skeleton for page header with icon, title, description
 * Matches: SettingsPageHeader component structure exactly
 */
function SettingsPageHeaderSkeleton({
	hasAction = false,
}: {
	hasAction?: boolean;
}) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div className="flex items-center gap-3">
				{/* Icon container: h-10 w-10 rounded-lg bg-primary/10 */}
				<Skeleton className="h-10 w-10 rounded-lg" />
				<div>
					{/* h1: text-2xl font-semibold */}
					<Skeleton className="h-8 w-48 mb-1" />
					{/* p: text-sm text-muted-foreground */}
					<Skeleton className="h-5 w-64" />
				</div>
			</div>
			{hasAction && <Skeleton className="h-10 w-40 shrink-0" />}
		</div>
	);
}

/**
 * Skeleton for section header with title and description
 * Matches: SettingsSection component structure exactly
 */
function SettingsSectionSkeleton({
	hasDescription = true,
}: {
	hasDescription?: boolean;
}) {
	return (
		<div className="mb-4">
			{/* h2: text-lg font-semibold */}
			<Skeleton className="h-7 w-40" />
			{/* p: text-sm text-muted-foreground mt-0.5 */}
			{hasDescription && <Skeleton className="h-5 w-64 mt-0.5" />}
		</div>
	);
}

/**
 * Personal Settings View Skeleton
 * Matches PersonalSettingsView exactly:
 * - Page Header
 * - Profile Section (Avatar + Name + Email)
 * - Preferences Section (Theme, Timezone, Language, Date Format cards)
 */
export function PersonalSettingsViewSkeleton() {
	return (
		<div className="space-y-8">
			{/* Page Header */}
			<SettingsPageHeaderSkeleton />

			{/* Profile Section */}
			<section>
				<SettingsSectionSkeleton />
				<SettingsCard>
					<div className="flex flex-col sm:flex-row gap-6">
						{/* Avatar column */}
						<div className="flex flex-col items-center gap-3">
							{/* Avatar: h-20 w-20 */}
							<Skeleton className="h-20 w-20 rounded-full" />
							{/* Button variant="outline" size="sm" */}
							<Skeleton className="h-8 w-28" />
						</div>

						{/* Form Fields column */}
						<div className="flex-1 space-y-4">
							{/* Full Name field */}
							<div className="space-y-2">
								{/* Label */}
								<Skeleton className="h-5 w-24" />
								{/* Input h-10 */}
								<Skeleton className="h-10 w-full" />
								{/* Helper text: text-xs */}
								<Skeleton className="h-4 w-56" />
							</div>

							{/* Email field */}
							<div className="space-y-2">
								{/* Label */}
								<Skeleton className="h-5 w-16" />
								{/* Input + Badge row */}
								<div className="flex gap-2">
									<Skeleton className="h-10 flex-1" />
									{/* Badge with icon - shrink-0, roughly h-6 */}
									<Skeleton className="h-6 w-20 self-center shrink-0" />
								</div>
							</div>
						</div>
					</div>
				</SettingsCard>
			</section>

			{/* Preferences Section */}
			<section>
				<SettingsSectionSkeleton />

				{/* Theme Card */}
				<SettingsCard className="mb-4">
					<div className="space-y-3">
						{/* Header row */}
						<div className="flex items-start justify-between gap-4">
							<div>
								{/* h4: text-sm font-medium */}
								<Skeleton className="h-5 w-16 mb-1" />
								{/* p: text-sm */}
								<Skeleton className="h-5 w-56" />
							</div>
							{/* Switch row (shown when org exists) */}
							<div className="flex items-center gap-2 shrink-0">
								{/* Label: text-xs */}
								<Skeleton className="h-4 w-28" />
								{/* Switch: h-5 w-9 */}
								<Skeleton className="h-5 w-9 rounded-full" />
							</div>
						</div>
						{/* Theme selector grid - matches exact container */}
						<div className="grid grid-cols-3 gap-2 p-1 bg-secondary rounded-lg border border-border">
							{/* Each theme button: flex flex-col py-3 px-2 with icon + text */}
							<Skeleton className="h-[52px] rounded-md" />
							<Skeleton className="h-[52px] rounded-md" />
							<Skeleton className="h-[52px] rounded-md" />
						</div>
					</div>
				</SettingsCard>

				{/* Timezone Card */}
				<SettingsCard className="mb-4">
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
						{/* Left side with icon */}
						<div className="flex items-start gap-3">
							{/* Clock icon: h-5 w-5 mt-0.5 */}
							<Skeleton className="h-5 w-5 mt-0.5 shrink-0" />
							<div>
								{/* h4: text-sm font-medium */}
								<Skeleton className="h-5 w-24 mb-1" />
								{/* p: text-sm */}
								<Skeleton className="h-5 w-48" />
							</div>
						</div>
						{/* Right side */}
						<div className="flex flex-col items-end gap-2">
							{/* Switch row */}
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-5 w-9 rounded-full" />
							</div>
							{/* Select: w-[220px] h-10 */}
							<Skeleton className="h-10 w-[220px]" />
						</div>
					</div>
				</SettingsCard>

				{/* Language Card */}
				<SettingsCard className="mb-4">
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							{/* Globe icon */}
							<Skeleton className="h-5 w-5 mt-0.5 shrink-0" />
							<div>
								<Skeleton className="h-5 w-24 mb-1" />
								<Skeleton className="h-5 w-40" />
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-5 w-9 rounded-full" />
							</div>
							<Skeleton className="h-10 w-[220px]" />
						</div>
					</div>
				</SettingsCard>

				{/* Date Format Card */}
				<SettingsCard>
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							{/* Calendar icon */}
							<Skeleton className="h-5 w-5 mt-0.5 shrink-0" />
							<div>
								<Skeleton className="h-5 w-28 mb-1" />
								<Skeleton className="h-5 w-40" />
								{/* Additional example text: text-xs mt-1 */}
								<Skeleton className="h-4 w-32 mt-1" />
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-5 w-9 rounded-full" />
							</div>
							<Skeleton className="h-10 w-[220px]" />
						</div>
					</div>
				</SettingsCard>
			</section>
		</div>
	);
}

/**
 * Organization Settings View Skeleton
 * Matches OrganizationSettingsView exactly:
 * - Page Header
 * - Profile Section (Logo + Name + Slug + ID)
 * - Default Preferences (2x2 grid of selects)
 * - Danger Zone
 */
export function OrganizationSettingsViewSkeleton() {
	return (
		<div className="space-y-8">
			{/* Page Header */}
			<SettingsPageHeaderSkeleton />

			{/* Organization Profile */}
			<section>
				<SettingsSectionSkeleton />
				<SettingsCard>
					<div className="space-y-6">
						{/* Logo + Name/Slug row */}
						<div className="flex flex-col sm:flex-row gap-6">
							{/* Logo column */}
							<div className="flex flex-col items-center gap-3">
								{/* Avatar: h-20 w-20 */}
								<Skeleton className="h-20 w-20 rounded-full" />
								{/* Button variant="outline" size="sm" */}
								<Skeleton className="h-8 w-28" />
							</div>

							{/* Name/Slug column */}
							<div className="flex-1 space-y-4">
								{/* Organization Name */}
								<div className="space-y-2">
									{/* Label */}
									<Skeleton className="h-5 w-32" />
									{/* Input + Button row */}
									<div className="flex gap-2">
										<Skeleton className="h-10 flex-1" />
										{/* Save button: variant="outline" */}
										<Skeleton className="h-10 w-16" />
									</div>
								</div>

								{/* URL Slug */}
								<div className="space-y-2">
									{/* Label */}
									<Skeleton className="h-5 w-20" />
									{/* Prefix + Input row */}
									<div className="flex items-center">
										{/* Prefix: px-3 py-2 bg-muted rounded-l-md border */}
										<Skeleton className="h-10 w-28 rounded-l-md rounded-r-none" />
										<Skeleton className="h-10 flex-1 rounded-l-none" />
									</div>
								</div>
							</div>
						</div>

						{/* Organization ID */}
						<div className="space-y-2">
							{/* Label */}
							<Skeleton className="h-5 w-28" />
							{/* Code + Copy button row */}
							<div className="flex gap-2">
								{/* Code element: h-10 equivalent */}
								<Skeleton className="h-10 flex-1" />
								{/* Copy button: size="icon" */}
								<Skeleton className="h-10 w-10" />
							</div>
							{/* Helper text: text-xs */}
							<Skeleton className="h-4 w-64" />
						</div>
					</div>
				</SettingsCard>
			</section>

			{/* Default Preferences */}
			<section>
				<SettingsSectionSkeleton />
				<SettingsCard>
					<div className="grid sm:grid-cols-2 gap-6">
						{/* Theme */}
						<div className="space-y-2">
							<Skeleton className="h-5 w-20" />
							<Skeleton className="h-10 w-full" />
						</div>
						{/* Timezone */}
						<div className="space-y-2">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-10 w-full" />
						</div>
						{/* Language */}
						<div className="space-y-2">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-10 w-full" />
						</div>
						{/* Date Format */}
						<div className="space-y-2">
							<Skeleton className="h-5 w-36" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
				</SettingsCard>
			</section>

			{/* Danger Zone */}
			<section>
				<SettingsSectionSkeleton />
				<SettingsCard variant="danger">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							{/* h4: text-sm font-medium */}
							<Skeleton className="h-5 w-40 mb-1" />
							{/* p: text-sm */}
							<Skeleton className="h-5 w-80" />
						</div>
						{/* Delete button: variant="destructive" with icon */}
						<Skeleton className="h-10 w-44 shrink-0" />
					</div>
				</SettingsCard>
			</section>
		</div>
	);
}

/**
 * Team Settings View Skeleton
 * Matches TeamSettingsView exactly:
 * - Page Header with Invite button
 * - Members list (p-0 card with divide-y)
 * - Role Permissions grid (3 cards)
 */
export function TeamSettingsViewSkeleton() {
	return (
		<div className="space-y-8">
			{/* Page Header with Action Button */}
			<SettingsPageHeaderSkeleton hasAction />

			{/* Team Members Section */}
			<section>
				<SettingsSectionSkeleton />
				{/* Card with p-0 and divide-y for member rows */}
				<SettingsCard className="divide-y divide-border p-0 overflow-hidden">
					{[1, 2, 3].map((i) => (
						<div key={i} className="flex items-center justify-between p-4">
							{/* Left side: Avatar + Name/Email */}
							<div className="flex items-center gap-3 min-w-0">
								{/* Avatar: h-10 w-10 */}
								<Skeleton className="h-10 w-10 rounded-full shrink-0" />
								<div className="min-w-0">
									{/* Name row with optional "You" badge */}
									<div className="flex items-center gap-2 flex-wrap">
										{/* Name: text-sm font-medium */}
										<Skeleton className="h-5 w-32" />
										{/* "You" badge - only on first item */}
										{i === 1 && <Skeleton className="h-5 w-12" />}
									</div>
									{/* Email: text-sm */}
									<Skeleton className="h-5 w-48 mt-1" />
								</div>
							</div>

							{/* Right side: Role badge + Menu */}
							<div className="flex items-center gap-3 shrink-0">
								{/* Role badge */}
								<Skeleton className="h-6 w-20 rounded-full" />
								{/* Menu button (not on owner) */}
								{i !== 1 && <Skeleton className="h-8 w-8" />}
							</div>
						</div>
					))}
				</SettingsCard>
			</section>

			{/* Role Permissions Section */}
			<section>
				<SettingsSectionSkeleton />
				<div className="grid sm:grid-cols-3 gap-4">
					{/* Owner, Admin, Member cards */}
					{[{ permissions: 3 }, { permissions: 3 }, { permissions: 2 }].map(
						(card, i) => (
							<SettingsCard key={i} className="h-full">
								{/* Header: Icon + Title */}
								<div className="flex items-center gap-3 mb-4">
									{/* Icon container: h-10 w-10 rounded-lg */}
									<Skeleton className="h-10 w-10 rounded-lg" />
									{/* Title: font-semibold */}
									<Skeleton className="h-6 w-16" />
								</div>
								{/* Permission list */}
								<ul className="space-y-2">
									{Array.from({ length: card.permissions }).map((_, j) => (
										<li key={j} className="flex items-start gap-2">
											{/* Bullet point placeholder */}
											<Skeleton className="h-4 w-2 mt-0.5 shrink-0" />
											{/* Permission text: text-sm */}
											<Skeleton className="h-5 w-full" />
										</li>
									))}
								</ul>
							</SettingsCard>
						),
					)}
				</div>
			</section>
		</div>
	);
}

/**
 * Compliance Settings View Skeleton
 * Matches ComplianceSettingsView exactly:
 * - Page Header
 * - Warning Alert (shown when not configured)
 * - Obligated Subject form (RFC + Activity + Save button)
 * - Reporting Thresholds collapsible
 */
export function ComplianceSettingsViewSkeleton() {
	return (
		<div className="space-y-8">
			{/* Page Header */}
			<SettingsPageHeaderSkeleton />

			{/* Warning Alert - matches Alert component structure */}
			<div className="rounded-lg border p-4 flex gap-4">
				{/* AlertTriangle icon: h-5 w-5 */}
				<Skeleton className="h-5 w-5 shrink-0" />
				<div className="flex-1">
					{/* AlertTitle: font-semibold */}
					<Skeleton className="h-5 w-48 mb-1" />
					{/* AlertDescription */}
					<Skeleton className="h-5 w-full" />
				</div>
			</div>

			{/* Obligated Subject Information */}
			<section>
				<SettingsSectionSkeleton />
				<SettingsCard>
					<div className="space-y-6">
						{/* RFC field */}
						<div className="space-y-2">
							{/* Label with help icon */}
							<div className="flex items-center gap-2">
								<Skeleton className="h-5 w-12" />
								{/* HelpCircle: h-4 w-4 */}
								<Skeleton className="h-4 w-4 rounded-full" />
							</div>
							{/* Input: font-mono */}
							<Skeleton className="h-10 w-full" />
						</div>

						{/* Vulnerable Activity field */}
						<div className="space-y-2">
							{/* Label with help icon */}
							<div className="flex items-center gap-2">
								<Skeleton className="h-5 w-36" />
								<Skeleton className="h-4 w-4 rounded-full" />
							</div>
							{/* Select */}
							<Skeleton className="h-10 w-full" />
							{/* Activity description: text-sm */}
							<Skeleton className="h-5 w-80" />
						</div>

						{/* Save button area: pt-2 */}
						<div className="pt-2">
							{/* Button with icon */}
							<Skeleton className="h-10 w-40" />
						</div>
					</div>
				</SettingsCard>
			</section>

			{/* Reporting Thresholds */}
			<section>
				<SettingsSectionSkeleton />
				<SettingsCard>
					{/* Collapsible trigger: w-full flex items-center justify-between */}
					<div className="flex items-center justify-between">
						{/* Text: text-sm font-medium */}
						<Skeleton className="h-5 w-44" />
						{/* Chevron icon: h-4 w-4 */}
						<Skeleton className="h-4 w-4" />
					</div>
				</SettingsCard>
			</section>
		</div>
	);
}

/**
 * Billing Settings View Skeleton
 * Matches BillingSettingsView exactly:
 * - Page Header
 * - Current Subscription Card (uses Card component)
 * - Watchlist Plan section
 * - AML Plans grid (3 cards)
 * - Detailed Pricing Table
 */
export function BillingSettingsViewSkeleton() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<SettingsPageHeaderSkeleton />

			{/* Current Subscription Status - matches Card structure */}
			<div className="rounded-xl border bg-card">
				{/* CardHeader */}
				<div className="p-6 pb-4">
					<div className="flex items-center justify-between">
						<div>
							{/* CardTitle */}
							<Skeleton className="h-6 w-40 mb-2" />
							{/* CardDescription */}
							<Skeleton className="h-5 w-72" />
						</div>
						{/* Status Badge */}
						<Skeleton className="h-6 w-20 rounded-full" />
					</div>
				</div>
				{/* CardContent */}
				<div className="px-6 pb-4">
					{/* Stats grid */}
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-2">
							{/* Building2 icon: h-4 w-4 */}
							<Skeleton className="h-4 w-4" />
							{/* text-sm */}
							<Skeleton className="h-5 w-36" />
						</div>
						<div className="flex items-center gap-2">
							{/* FileText icon */}
							<Skeleton className="h-4 w-4" />
							<Skeleton className="h-5 w-44" />
						</div>
					</div>
					{/* Progress bar section: mt-4 */}
					<div className="mt-4">
						<div className="flex justify-between text-sm mb-1">
							<Skeleton className="h-5 w-36" />
							<Skeleton className="h-5 w-12" />
						</div>
						{/* Progress: h-2 */}
						<Skeleton className="h-2 w-full rounded-full" />
					</div>
				</div>
				{/* CardFooter: px-6 py-4 border-t */}
				<div className="flex flex-wrap gap-2 px-6 py-4 border-t">
					{/* Manage button */}
					<Skeleton className="h-10 w-36" />
					{/* Cancel button */}
					<Skeleton className="h-10 w-28" />
				</div>
			</div>

			{/* Watchlist Only Plan Section */}
			<div className="space-y-4">
				{/* Section header */}
				<div className="flex items-center gap-2">
					{/* Search icon: h-5 w-5 */}
					<Skeleton className="h-5 w-5" />
					{/* h3: text-lg font-semibold */}
					<Skeleton className="h-7 w-36" />
				</div>
				{/* Description: text-sm */}
				<Skeleton className="h-5 w-96 max-w-full" />

				{/* Watchlist Card */}
				<div className="rounded-xl border bg-card">
					{/* CardHeader pb-4 */}
					<div className="p-6 pb-4">
						<div className="flex items-center justify-between">
							{/* Left: Icon + Title/Description */}
							<div className="flex items-center gap-3">
								{/* Icon container: p-2 rounded-lg */}
								<Skeleton className="h-10 w-10 rounded-lg" />
								<div>
									{/* CardTitle */}
									<Skeleton className="h-6 w-24 mb-1" />
									{/* CardDescription */}
									<Skeleton className="h-5 w-56" />
								</div>
							</div>
							{/* Price */}
							<div className="text-right">
								{/* Price: text-2xl font-bold */}
								<Skeleton className="h-8 w-24 mb-1" />
								{/* Per month: text-sm */}
								<Skeleton className="h-5 w-16" />
							</div>
						</div>
					</div>
					{/* CardContent pt-0 */}
					<div className="px-6 pb-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{/* Included Features */}
							<div className="space-y-2">
								{/* Header: text-xs font-medium uppercase */}
								<Skeleton className="h-4 w-20" />
								<ul className="space-y-1.5">
									{[1, 2, 3, 4].map((j) => (
										<li key={j} className="flex items-center gap-2">
											<Skeleton className="h-4 w-4 shrink-0" />
											<Skeleton className="h-5 w-36" />
										</li>
									))}
								</ul>
							</div>
							{/* Not Included */}
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<ul className="space-y-1.5">
									{[1, 2, 3, 4].map((j) => (
										<li key={j} className="flex items-center gap-2">
											<Skeleton className="h-4 w-4 shrink-0" />
											<Skeleton className="h-5 w-40" />
										</li>
									))}
								</ul>
							</div>
							{/* Best For - spans 2 cols on lg */}
							<div className="space-y-2 md:col-span-2 lg:col-span-2">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-5 w-full" />
								{/* Button: w-full mt-3 */}
								<Skeleton className="h-10 w-full mt-3" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* AML Plans Section */}
			<div className="space-y-4">
				{/* Section header */}
				<div className="flex items-center gap-2">
					{/* Shield icon */}
					<Skeleton className="h-5 w-5" />
					<Skeleton className="h-7 w-28" />
				</div>
				<Skeleton className="h-5 w-80 max-w-full" />

				{/* Plans grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<div key={i} className="rounded-xl border bg-card flex flex-col">
							{/* CardHeader */}
							<div className="p-6">
								{/* CardTitle with icon */}
								<div className="flex items-center gap-2 mb-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-6 w-24" />
								</div>
								{/* CardDescription */}
								<Skeleton className="h-5 w-44" />
							</div>
							{/* CardContent flex-1 */}
							<div className="px-6 flex-1 space-y-4">
								{/* Price */}
								<Skeleton className="h-8 w-28" />
								{/* Features list */}
								<ul className="space-y-2">
									{[1, 2, 3, 4, 5, 6].map((j) => (
										<li key={j} className="flex items-center gap-2">
											<Skeleton className="h-4 w-4 shrink-0" />
											<Skeleton className="h-5 w-36" />
										</li>
									))}
								</ul>
							</div>
							{/* CardFooter pt-4 pb-6 */}
							<div className="p-6 pt-4">
								<Skeleton className="h-10 w-full" />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Detailed Pricing Table */}
			<div className="space-y-4">
				{/* h3: text-lg font-semibold */}
				<Skeleton className="h-7 w-40" />
				{/* PricingTable placeholder */}
				<Skeleton className="h-96 w-full rounded-xl" />
			</div>
		</div>
	);
}

/**
 * Webhooks view skeleton — page header + tabs + endpoints card + deliveries card.
 */
export function WebhooksViewSkeleton() {
	return (
		<div className="space-y-8">
			<SettingsPageHeaderSkeleton hasAction />

			{/* Environment tabs */}
			<Skeleton className="h-10 w-80" />

			{/* Endpoints section */}
			<section>
				<SettingsSectionSkeleton />
				<SettingsCard className="divide-y divide-border p-0 overflow-hidden">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4"
						>
							<div className="space-y-2 flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-64" />
									<Skeleton className="h-5 w-14" />
									<Skeleton className="h-5 w-20" />
								</div>
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-3 w-32" />
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<Skeleton className="h-8 w-20 rounded-md" />
								<Skeleton className="h-8 w-16 rounded-md" />
								<Skeleton className="h-8 w-20 rounded-md" />
							</div>
						</div>
					))}
				</SettingsCard>
			</section>

			{/* Deliveries section */}
			<section>
				<SettingsSectionSkeleton />
				<SettingsCard className="divide-y divide-border p-0 overflow-hidden">
					{[1, 2].map((i) => (
						<div key={i} className="flex items-center justify-between p-4">
							<div className="space-y-2 flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-40" />
									<Skeleton className="h-5 w-20" />
								</div>
								<Skeleton className="h-3 w-48" />
							</div>
						</div>
					))}
				</SettingsCard>
			</section>
		</div>
	);
}

/**
 * API Keys view skeleton — page header + card with table-style rows.
 */
export function ApiKeysViewSkeleton() {
	return (
		<div className="space-y-8">
			<SettingsPageHeaderSkeleton hasAction />
			<section>
				<SettingsSectionSkeleton hasDescription={false} />
				<SettingsCard className="divide-y divide-border p-0 overflow-hidden">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4"
						>
							<div className="space-y-2 flex-1 min-w-0">
								<Skeleton className="h-5 w-48" />
								<Skeleton className="h-4 w-full max-w-md" />
								<Skeleton className="h-3 w-32" />
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<Skeleton className="h-8 w-20 rounded-md" />
								<Skeleton className="h-8 w-8 rounded-md" />
							</div>
						</div>
					))}
				</SettingsCard>
			</section>
		</div>
	);
}
