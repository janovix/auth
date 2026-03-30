import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	getAuthCoreBaseUrl,
	getAuthEnvironment,
	getDefaultAppUrlForPlan,
} from "./authCoreConfig";

describe("authCoreConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe("getAuthCoreBaseUrl", () => {
		it("returns URL from NEXT_PUBLIC_AUTH_SERVICE_URL", () => {
			process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
				"https://auth-svc.example.workers.dev";
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			const url = getAuthCoreBaseUrl();
			expect(url).toBe("https://auth-svc.example.workers.dev");
		});

		it("throws error when URL is missing protocol", () => {
			process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = "auth-svc.example.workers.dev";
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			expect(() => getAuthCoreBaseUrl()).toThrow(
				'NEXT_PUBLIC_AUTH_SERVICE_URL must include the protocol (https://). Got: "auth-svc.example.workers.dev"',
			);
		});

		it("throws error when environment variable is not set", () => {
			delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			expect(() => getAuthCoreBaseUrl()).toThrow(
				"Missing required environment variable: NEXT_PUBLIC_AUTH_SERVICE_URL",
			);
		});
	});

	describe("getAuthEnvironment", () => {
		it("returns prod for .janovix.com URL", () => {
			process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = "https://auth-svc.janovix.com";
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			const env = getAuthEnvironment();
			expect(env).toBe("prod");
		});

		it("returns dev for .workers.dev URL", () => {
			process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
				"https://auth-svc.example.workers.dev";
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			const env = getAuthEnvironment();
			expect(env).toBe("dev");
		});
	});

	describe("getDefaultAppUrlForPlan", () => {
		it("returns watchlist URL for watchlist plan", () => {
			process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
				"https://auth-svc.example.workers.dev";
			process.env.NEXT_PUBLIC_AML_APP_URL = "https://aml.example.com";
			process.env.NEXT_PUBLIC_WATCHLIST_APP_URL = "https://wl.example.com";
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			expect(getDefaultAppUrlForPlan("watchlist")).toBe(
				"https://wl.example.com",
			);
		});

		it("returns AML URL for business plan", () => {
			process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
				"https://auth-svc.example.workers.dev";
			process.env.NEXT_PUBLIC_AML_APP_URL = "https://aml.example.com";
			process.env.NEXT_PUBLIC_WATCHLIST_APP_URL = "https://wl.example.com";
			global.window = { location: {} } as unknown as Window & typeof globalThis;
			expect(getDefaultAppUrlForPlan("business")).toBe(
				"https://aml.example.com",
			);
		});
	});
});
