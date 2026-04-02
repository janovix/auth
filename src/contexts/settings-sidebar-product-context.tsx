"use client";

import * as React from "react";

type Value = { hasAmlAccess: boolean };

const defaultValue: Value = { hasAmlAccess: true };

const SettingsSidebarProductContext = React.createContext<Value>(defaultValue);

export function SettingsSidebarProductProvider({
	hasAmlAccess,
	children,
}: {
	hasAmlAccess: boolean;
	children: React.ReactNode;
}) {
	const value = React.useMemo(() => ({ hasAmlAccess }), [hasAmlAccess]);
	return (
		<SettingsSidebarProductContext.Provider value={value}>
			{children}
		</SettingsSidebarProductContext.Provider>
	);
}

export function useSettingsSidebarProductAccess(): Value {
	return React.useContext(SettingsSidebarProductContext);
}
