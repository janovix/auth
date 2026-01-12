"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { getPortalUrl } from "@/lib/billing";
import { ExternalLink } from "lucide-react";

interface CustomerPortalButtonProps {
	disabled?: boolean;
}

export function CustomerPortalButton({ disabled }: CustomerPortalButtonProps) {
	const { t } = useLanguage();
	const [loading, setLoading] = useState(false);

	const handleClick = async () => {
		setLoading(true);
		try {
			const returnUrl = window.location.href;
			const { url } = await getPortalUrl(returnUrl);
			window.location.href = url;
		} catch (error) {
			console.error("Failed to open portal:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			variant="outline"
			onClick={handleClick}
			disabled={disabled || loading}
			className="w-full sm:w-auto"
		>
			<ExternalLink className="h-4 w-4 mr-2" />
			{loading ? "Loading..." : t("settings.billing.managePortal")}
		</Button>
	);
}
