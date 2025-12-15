import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/components/ThemeProvider';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

import type { AuthClient } from '@/lib/auth/authClient';
import { LoginView } from './LoginView';

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider>{ui}</ThemeProvider>);
};

type LoginClient = {
	signIn: {
		email: AuthClient['signIn']['email'];
	};
};

const createClient = (): LoginClient => ({
	signIn: {
		email: vi.fn() as LoginClient['signIn']['email'],
	},
});

describe('LoginView', () => {
	beforeEach(() => {
		pushMock.mockReset();
	});

	it('submits credentials and redirects on success', async () => {
		const client = createClient();
		vi.mocked(client.signIn.email).mockResolvedValue({
			data: {},
			error: null,
		});

		renderWithTheme(<LoginView redirectTo="/account" client={client} />);
		const user = userEvent.setup();

		const forms = screen.getAllByTestId('login-form');
		const form = forms[0];
		const emailInputs = screen.getAllByPlaceholderText('usuario@empresa.mx');
		await user.type(emailInputs[0], 'ana@example.com');
		const passwordInputs = screen.getAllByPlaceholderText('••••••••');
		await user.type(passwordInputs[0], 'Secret123!');
		const checkboxes = screen.getAllByRole('checkbox', { name: /mantener sesión/i });
		await user.click(checkboxes[0]);
		const submitButtons = screen.getAllByRole('button', { name: /ingresar/i });
		const submitButton = submitButtons[0];
		expect(submitButton).toHaveAttribute('type', 'submit');
		fireEvent.submit(form);

		await waitFor(() => {
			expect(client.signIn.email).toHaveBeenCalledWith({
				email: 'ana@example.com',
				password: 'Secret123!',
				rememberMe: false,
				callbackURL: '/account',
			});
			expect(pushMock).toHaveBeenCalledWith('/account');
		});
	});

	it('shows the error returned by auth-core', async () => {
		const client = createClient();
		vi.mocked(client.signIn.email).mockResolvedValue({
			data: null,
			error: { message: 'Credenciales inválidas', status: 401, statusText: 'Unauthorized' },
		});

		renderWithTheme(<LoginView client={client} />);
		const user = userEvent.setup();

		const forms = screen.getAllByTestId('login-form');
		const form = forms[0];
		const emailInputs = screen.getAllByPlaceholderText('usuario@empresa.mx');
		await user.type(emailInputs[0], 'ana@example.com');
		const passwordInputs = screen.getAllByPlaceholderText('••••••••');
		await user.type(passwordInputs[0], 'Secret123!');
		const submitButtons = screen.getAllByRole('button', { name: /ingresar/i });
		const submitButton = submitButtons[0];
		expect(submitButton).toHaveAttribute('type', 'submit');
		fireEvent.submit(form);

		await waitFor(() => {
			expect(screen.getByText(/credenciales inválidas/i, { exact: false })).toBeInTheDocument();
		});
		expect(pushMock).not.toHaveBeenCalled();
	});
});
