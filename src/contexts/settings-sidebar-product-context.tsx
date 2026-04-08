"use client";

import * as React from "react";

export type SettingsSidebarProductAccessValue = {
	hasAmlAccess: boolean;
	hasWatchlistAccess: boolean;
	/** Active organization display name for entitlement copy (org-owner plan scope). */
	activeOrganizationName: string | null;
	/** True after org-scoped billing entitlements have been evaluated (or no active org). */
	hasResolvedEntitlements: boolean;
};

const defaultValue: SettingsSidebarProductAccessValue = {
	hasAmlAccess: true,
	hasWatchlistAccess: true,
	activeOrganizationName: null,
	hasResolvedEntitlements: false,
};

const SettingsSidebarProductContext =
	React.createContext<SettingsSidebarProductAccessValue>(defaultValue);

export function SettingsSidebarProductProvider({
	hasAmlAccess,
	hasWatchlistAccess,
	activeOrganizationName,
	hasResolvedEntitlements,
	children,
}: {
	hasAmlAccess: boolean;
	hasWatchlistAccess: boolean;
	activeOrganizationName: string | null;
	hasResolvedEntitlements: boolean;
	children: React.ReactNode;
}) {
	const value = React.useMemo(
		() => ({
			hasAmlAccess,
			hasWatchlistAccess,
			activeOrganizationName,
			hasResolvedEntitlements,
		}),
		[
			hasAmlAccess,
			hasWatchlistAccess,
			activeOrganizationName,
			hasResolvedEntitlements,
		],
	);
	return (
		<SettingsSidebarProductContext.Provider value={value}>
			{children}
		</SettingsSidebarProductContext.Provider>
	);
}

export function useSettingsSidebarProductAccess(): SettingsSidebarProductAccessValue {
	return React.useContext(SettingsSidebarProductContext);
}
