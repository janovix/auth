import { Skeleton } from "@/components/ui/skeleton";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

/**
 * Matches PricingTable desktop layout: plan limits card + table rows.
 * Server-safe for reuse from loading states.
 */
export function PricingTableSkeleton() {
	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Skeleton className="h-5 w-5 rounded" />
						<Skeleton className="h-6 w-48" />
					</CardTitle>
					<CardDescription>
						<Skeleton className="h-4 w-full max-w-lg" />
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="hidden md:block overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<Skeleton className="h-4 w-24" />
									</TableHead>
									{[1, 2, 3, 4].map((i) => (
										<TableHead key={i} className="text-center">
											<Skeleton className="h-4 w-20 mx-auto" />
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{[1, 2, 3, 4, 5, 6].map((row) => (
									<TableRow key={row}>
										<TableCell>
											<Skeleton className="h-4 w-32" />
										</TableCell>
										{[1, 2, 3, 4].map((col) => (
											<TableCell key={col} className="text-center">
												<Skeleton className="h-4 w-16 mx-auto" />
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<div className="md:hidden space-y-4">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-24 w-full rounded-lg" />
						))}
					</div>
				</CardContent>
			</Card>
			<Skeleton className="h-64 w-full rounded-xl" />
		</div>
	);
}
