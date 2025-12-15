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

		it("returns dev for auth.janovix.algenium.dev", () => {
			expect(resolveAuthEnvironment("auth.janovix.algenium.dev")).toBe("dev");
		});

		it("returns dev for auth.janovix.workers.dev", () => {
			expect(resolveAuthEnvironment("auth.janovix.workers.dev")).toBe("dev");
		});

		it("returns dev for PR preview hosts", () => {
			expect(resolveAuthEnvironment("auth-pr-123.janovix.algenium.dev")).toBe(
				"dev",
			);
		});

		it("returns qa for auth.janovix.algenium.qa", () => {
			expect(resolveAuthEnvironment("auth.janovix.algenium.qa")).toBe("qa");
		});

		it("returns prod for auth.janovix.algenium.app", () => {
			expect(resolveAuthEnvironment("auth.janovix.algenium.app")).toBe("prod");
		});

		it("returns dev as default for unknown hosts", () => {
			expect(resolveAuthEnvironment("unknown.example.com")).toBe("dev");
		});

		it("returns dev for undefined host", () => {
			expect(resolveAuthEnvironment(undefined)).toBe("dev");
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

		it("returns dev URL for qa host (preview mode)", () => {
			const url = getAuthCoreBaseUrl("auth.janovix.algenium.qa");
			expect(url).toBe("https://auth-svc.janovix.workers.dev");
		});

		it("returns prod URL for prod host", () => {
			const url = getAuthCoreBaseUrl("auth.janovix.algenium.app");
			expect(url).toBe("https://auth-svc.janovix.ai");
		});
	});
});
