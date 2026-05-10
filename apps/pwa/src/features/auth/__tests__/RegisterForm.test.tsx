import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { TEST_API_BASE } from '@/test/config';
import { renderWithProviders } from '@/test/render-utils';
import { RegisterForm } from '../components/RegisterForm';

describe('RegisterForm', () => {
  it('renders all fields', () => {
    renderWithProviders(<RegisterForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument();
  });

  it('shows loading state while submitting', async () => {
    server.use(
      http.post(`${TEST_API_BASE}/api/auth/register`, () => new Promise(() => {}))
    );
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    expect(await screen.findByRole('button', { name: /создание аккаунта\.\.\./i })).toBeInTheDocument();
  });

  it('shows validation toast when password is too short', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'short');
    await user.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/8 символов/i);
    });
  });

  it('shows error on duplicate email', async () => {
    server.use(
      http.post(`${TEST_API_BASE}/api/auth/register`, () =>
        HttpResponse.json({ message: 'User with this email already exists' }, { status: 400 })
      )
    );

    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() => {
      expect(screen.getByText(/не удалось зарегистрироваться/i)).toBeInTheDocument();
    });
  });
});
