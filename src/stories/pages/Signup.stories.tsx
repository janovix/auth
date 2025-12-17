import { SignupView } from "@/components/auth/SignupView";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Meta, StoryObj } from "@storybook/react";
import { authClient } from "@/lib/auth/authClient";
import { mockRouter } from "../mocks/router";

// Mock auth client methods
const mockSignUp = async (_data: {
	name: string;
	email: string;
	password: string;
	callbackURL?: string;
}) => {
	return Promise.resolve({
		data: {},
		error: null,
	} as Awaited<ReturnType<typeof authClient.signUp.email>>);
};

const meta = {
	title: "Pages/Auth/Signup",
	component: SignupView,
	parameters: {
		layout: "fullscreen",
		nextjs: {
			router: mockRouter,
		},
	},
	decorators: [
		(Story) => {
			// Mock auth client for this story
			const originalSignUp = authClient.signUp.email;
			authClient.signUp.email =
				mockSignUp as unknown as typeof authClient.signUp.email;

			return (
				<div className="min-h-screen flex items-center justify-center p-4 bg-background">
					<div className="w-full max-w-2xl">
						<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
							<Story />
						</ThemeProvider>
					</div>
				</div>
			);
		},
	],
} satisfies Meta<typeof SignupView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <SignupView />,
};

export const WithRedirect: Story = {
	render: () => <SignupView redirectTo="/dashboard" />,
};
