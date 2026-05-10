import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { TEST_API_BASE } from '@/test/config';
import { renderWithProviders } from '@/test/render-utils';
import { LoginForm } from '../components/LoginForm';

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('shows loading state while submitting', async () => {
    // Delay the response so the loading state is visible
    server.use(
      http.post(`${TEST_API_BASE}/api/auth/login`, () => new Promise(() => {}))
    );
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    expect(await screen.findByRole('button', { name: /вход\.\.\./i })).toBeInTheDocument();
  });

  it('shows validation when password is too short', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'short');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/8 символов/i);
    });
  });

  it('shows validation when email is invalid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.type(screen.getByLabelText(/пароль/i), 'password12');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/корректный email/i);
    });
  });

  it('shows inline error on wrong credentials', async () => {
    server.use(
      http.post(`${TEST_API_BASE}/api/auth/login`, () =>
        HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 })
      )
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'wrongpasswrong');
    await user.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/неверный email или пароль/i);
    });
  });

  it('has link to registration page', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByRole('link', { name: /зарегистрироваться/i })).toHaveAttribute('href', '/register');
  });
});
