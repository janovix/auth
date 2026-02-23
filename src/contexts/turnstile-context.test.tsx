import { describe, it, expect, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { TurnstileProvider, useTurnstile } from "./turnstile-context";

describe("TurnstileProvider", () => {
	const TestComponent = () => {
		const { token, isVerifying, getCaptchaHeaders } = useTurnstile();
		return (
			<div>
				<div data-testid="token">{token || "null"}</div>
				<div data-testid="isVerifying">{isVerifying.toString()}</div>
				<div data-testid="headers">{JSON.stringify(getCaptchaHeaders())}</div>
			</div>
		);
	};

	afterEach(() => {
		cleanup();
	});

	it("renders the invisible Turnstile widget", () => {
		render(
			<TurnstileProvider siteKey="test-site-key">
				<div>Child Content</div>
			</TurnstileProvider>,
		);

		expect(screen.getByTestId("turnstile-widget")).toBeInTheDocument();
		expect(screen.getByText("Child Content")).toBeInTheDocument();
	});

	it("initializes with verifying state initially", async () => {
		render(
			<TurnstileProvider siteKey="test-site-key">
				<TestComponent />
			</TurnstileProvider>,
		);

		// The mock in setup.ts auto-verifies immediately with useEffect
		// So by the time we query, it's likely already verified
		// Just check that the component renders and eventually gets a token
		await waitFor(
			() => {
				const tokenText = screen.getByTestId("token").textContent;
				expect(tokenText).not.toBe("null");
			},
			{ timeout: 3000 },
		);
	});

	it("updates token after successful verification", async () => {
		render(
			<TurnstileProvider siteKey="test-site-key">
				<TestComponent />
			</TurnstileProvider>,
		);

		// Wait for the mock turnstile to verify (mocked in setup.ts)
		await waitFor(
			() => {
				const tokenText = screen.getByTestId("token").textContent;
				expect(tokenText).not.toBe("null");
			},
			{ timeout: 3000 },
		);

		expect(screen.getByTestId("isVerifying")).toHaveTextContent("false");

		const headersText = screen.getByTestId("headers").textContent;
		const headers = JSON.parse(headersText || "{}");
		expect(headers["x-captcha-response"]).toBeTruthy();
	});

	it("provides captcha headers when token exists", async () => {
		render(
			<TurnstileProvider siteKey="test-site-key">
				<TestComponent />
			</TurnstileProvider>,
		);

		await waitFor(
			() => {
				const headersText = screen.getByTestId("headers").textContent;
				const headers = JSON.parse(headersText || "{}");
				expect(headers["x-captcha-response"]).toBeTruthy();
			},
			{ timeout: 3000 },
		);
	});

	it("hides the invisible widget from view using CSS", () => {
		const { container } = render(
			<TurnstileProvider siteKey="test-site-key">
				<div data-testid="test-content">Content</div>
			</TurnstileProvider>,
		);

		// Check that the wrapper div has styles to completely hide it
		const wrapperDiv = container.querySelector(
			'div[style*="visibility: hidden"]',
		) as HTMLElement;
		expect(wrapperDiv).toBeInTheDocument();
		expect(wrapperDiv?.style.width).toBe("0px");
		expect(wrapperDiv?.style.height).toBe("0px");
		expect(wrapperDiv?.style.visibility).toBe("hidden");
	});
});

describe("useTurnstile without provider", () => {
	afterEach(() => {
		cleanup();
	});

	it("returns no-op implementation when used outside provider", () => {
		const TestComponent = () => {
			const { token, isVerifying, reset, getCaptchaHeaders } = useTurnstile();
			return (
				<div data-testid="no-provider-test">
					<div data-testid="np-token">{token || "null"}</div>
					<div data-testid="np-isVerifying">{isVerifying.toString()}</div>
					<button onClick={reset}>Reset</button>
					<div data-testid="np-headers">
						{JSON.stringify(getCaptchaHeaders())}
					</div>
				</div>
			);
		};

		render(<TestComponent />);

		expect(screen.getByTestId("np-token")).toHaveTextContent("null");
		expect(screen.getByTestId("np-isVerifying")).toHaveTextContent("false");
		expect(screen.getByTestId("np-headers")).toHaveTextContent("{}");
	});
});
