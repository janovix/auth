import { describe, expect, it, vi } from "vitest";
import { getAuthCoreBaseUrl, resolveAuthEnvironment } from "./authCoreConfig";

describe("authCoreConfig", () => {
	describe("resolveAuthEnvironment", () => {
		it("returns dev for localhost", () => {
			expect(resolveAuthEnvironment("localhost")).toBe("dev");
		});

		it("returns dev for 127.0.0.1", () => {
			expect(resolveAuthEnvironment("127.0.0.1")).toBe("dev");
		});

		it("returns dev for auth.janovix.workers.dev", () => {
			expect(resolveAuthEnvironment("auth.janovix.workers.dev")).toBe("dev");
		});

		it("returns prod for auth.janovix.ai", () => {
			expect(resolveAuthEnvironment("auth.janovix.ai")).toBe("prod");
		});

		it("returns dev as default for unknown hosts", () => {
			expect(resolveAuthEnvironment("unknown.example.com")).toBe("dev");
		});

		it("returns dev for undefined host", () => {
			expect(resolveAuthEnvironment(undefined)).toBe("dev");
		});

		it("returns dev for empty string host", () => {
			expect(resolveAuthEnvironment("")).toBe("dev");
		});

		it("handles host with port", () => {
			expect(resolveAuthEnvironment("localhost:3000")).toBe("dev");
		});
	});

	describe("getAuthCoreBaseUrl", () => {
		it("returns dev URL for localhost", () => {
			const url = getAuthCoreBaseUrl("localhost");
			expect(url).toBe("https://auth-svc.janovix.workers.dev");
		});

		it("returns dev URL for auth.janovix.workers.dev", () => {
			const url = getAuthCoreBaseUrl("auth.janovix.workers.dev");
			expect(url).toBe("https://auth-svc.janovix.workers.dev");
		});

		it("returns prod URL for auth.janovix.ai", () => {
			const url = getAuthCoreBaseUrl("auth.janovix.ai");
			expect(url).toBe("https://auth-svc.janovix.ai");
		});

		it("returns dev URL for undefined host", () => {
			const url = getAuthCoreBaseUrl(undefined);
			expect(url).toBe("https://auth-svc.janovix.workers.dev");
		});
	});
});
