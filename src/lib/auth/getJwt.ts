import { serverAuthClient } from "./serverAuthClient";

/**
 * JWT for the current session (Better Auth JWT plugin), for calling flags-svc and other services.
 */
export async function getJwt(): Promise<string | null> {
	try {
		const result = await serverAuthClient.token();
		if (result.error || !result.data?.token) {
			return null;
		}
		return result.data.token;
	} catch {
		return null;
	}
}
