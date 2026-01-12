"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useLanguage } from "@/contexts/language-context";
import type { Invoice } from "@/lib/billing";
import { formatCurrency, formatDate } from "@/lib/billing";
import { Download, FileText, ExternalLink } from "lucide-react";

interface InvoiceHistoryProps {
	invoices: Invoice[];
	loading?: boolean;
}

export function InvoiceHistory({ invoices, loading }: InvoiceHistoryProps) {
	const { t } = useLanguage();

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "paid":
				return (
					<Badge className="bg-emerald-500 hover:bg-emerald-600">
						{t("settings.billing.invoicePaid")}
					</Badge>
				);
			case "open":
			case "draft":
				return (
					<Badge variant="secondary">
						{t("settings.billing.invoicePending")}
					</Badge>
				);
			case "uncollectible":
			case "void":
				return (
					<Badge variant="destructive">
						{t("settings.billing.invoiceFailed")}
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("settings.billing.invoices")}</CardTitle>
				<CardDescription>
					{invoices.length === 0
						? t("settings.billing.noInvoices")
						: `${invoices.length} invoices`}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{invoices.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
						<FileText className="h-12 w-12 mb-2 opacity-50" />
						<p>{t("settings.billing.noInvoices")}</p>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("settings.billing.invoiceDate")}</TableHead>
								<TableHead>{t("settings.billing.invoiceAmount")}</TableHead>
								<TableHead>{t("settings.billing.invoiceStatus")}</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{invoices.map((invoice) => (
								<TableRow key={invoice.id}>
									<TableCell>
										<div className="flex flex-col">
											<span className="font-medium">
												{formatDate(invoice.created)}
											</span>
											{invoice.number && (
												<span className="text-xs text-muted-foreground">
													#{invoice.number}
												</span>
											)}
										</div>
									</TableCell>
									<TableCell>
										{formatCurrency(invoice.amountDue, invoice.currency)}
									</TableCell>
									<TableCell>{getStatusBadge(invoice.status)}</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-1">
											{invoice.hostedInvoiceUrl && (
												<Button variant="ghost" size="icon" asChild>
													<a
														href={invoice.hostedInvoiceUrl}
														target="_blank"
														rel="noopener noreferrer"
													>
														<ExternalLink className="h-4 w-4" />
													</a>
												</Button>
											)}
											{invoice.invoicePdf && (
												<Button variant="ghost" size="icon" asChild>
													<a
														href={invoice.invoicePdf}
														target="_blank"
														rel="noopener noreferrer"
													>
														<Download className="h-4 w-4" />
													</a>
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
