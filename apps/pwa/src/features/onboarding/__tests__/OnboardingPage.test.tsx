import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { TEST_API_BASE } from '@/test/config';
import { renderWithProviders } from '@/test/render-utils';
import { OnboardingPage } from '../components/OnboardingPage';

describe('OnboardingPage', () => {
  it('shows welcome step on mount', () => {
    renderWithProviders(<OnboardingPage />, { authenticated: true });
    expect(screen.getByText(/добро пожаловать/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /далее/i })).toBeInTheDocument();
  });

  it('advances to NFC step on button click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingPage />, { authenticated: true });

    await user.click(screen.getByRole('button', { name: /далее/i }));
    expect(screen.getByText(/просто отсканируй стикер/i)).toBeInTheDocument();
  });

  it('shows final step with "Начать тренировку" button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingPage />, { authenticated: true });

    await user.click(screen.getByRole('button', { name: /далее/i }));
    await user.click(screen.getByRole('button', { name: /далее/i }));
    expect(screen.getByRole('button', { name: /начать тренировку/i })).toBeInTheDocument();
  });

  it('calls complete onboarding API on final step', async () => {
    let apiCalled = false;
    server.use(
      http.post(`${TEST_API_BASE}/api/onboarding/complete`, () => {
        apiCalled = true;
        return HttpResponse.json({});
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<OnboardingPage />, { authenticated: true });

    await user.click(screen.getByRole('button', { name: /далее/i }));
    await user.click(screen.getByRole('button', { name: /далее/i }));
    await user.click(screen.getByRole('button', { name: /начать тренировку/i }));

    await waitFor(() => expect(apiCalled).toBe(true));
  });
});
