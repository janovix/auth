import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Filter bar placeholder matching AuditLogFilters search row height.
 */
function AuditFiltersSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Skeleton className="h-10 flex-1 rounded-md" />
				<Skeleton className="h-10 w-24 shrink-0 rounded-md" />
			</div>
		</div>
	);
}

/**
 * Table body skeleton matching AuditLogTable (6 columns + pagination row).
 */
export function AuditLogTableSkeleton() {
	return (
		<div className="space-y-4">
			<div className="rounded-lg border overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-muted/50">
						<tr>
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<th key={i} className="px-4 py-3 text-left font-medium">
									<Skeleton className="h-4 w-16" />
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<tr key={i}>
								<td className="px-4 py-3">
									<Skeleton className="h-6 w-20 rounded-full" />
								</td>
								<td className="px-4 py-3">
									<div className="space-y-1">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-32" />
									</div>
								</td>
								<td className="px-4 py-3">
									<div className="space-y-1">
										<Skeleton className="h-3 w-28" />
										<Skeleton className="h-3 w-20" />
									</div>
								</td>
								<td className="px-4 py-3">
									<Skeleton className="h-4 w-16" />
								</td>
								<td className="px-4 py-3">
									<Skeleton className="h-4 w-24" />
								</td>
								<td className="px-4 py-3 text-right">
									<Skeleton className="ml-auto h-8 w-8 rounded-md" />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-48" />
				<div className="flex items-center gap-2">
					<Skeleton className="h-9 w-9 rounded-md" />
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-9 w-9 rounded-md" />
				</div>
			</div>
		</div>
	);
}

/**
 * Full audit page skeleton: header row + integrity card strip + filters + table.
 * Server-safe for route loading.tsx.
 */
export function AuditViewSkeleton() {
	return (
		<section className="min-h-screen bg-linear-to-b from-background to-muted/30 px-4 py-12">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-72 max-w-full" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-24 rounded-md" />
						<Skeleton className="h-9 w-24 rounded-md" />
					</div>
				</div>
				<Card>
					<CardContent className="py-6">
						<Skeleton className="h-16 w-full max-w-xl" />
					</CardContent>
				</Card>
				<AuditFiltersSkeleton />
				<AuditLogTableSkeleton />
			</div>
		</section>
	);
}
