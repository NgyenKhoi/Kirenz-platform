import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { friendService } from '../../services/friend.service';
import { UserHoverCard } from './UserHoverCard';

const me = {
  id: 'me', email: 'me@kirenz.local', username: 'me', role: 'USER',
  status: 'ACTIVE', emailVerified: true, createdAt: '2026-01-01T00:00:00Z',
};

function renderCard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <UserHoverCard userId="u-2" name="Thao" avatarUrl={null}>Thao</UserHoverCard>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  useAuthStore.setState({ user: me, isAuthenticated: true, isLoading: false });
  vi.spyOn(authService, 'getUserProfile').mockResolvedValue({
    ...me, id: 'u-2', username: 'thao', displayName: 'Thao Nguyen', bio: 'Hello there', location: 'Ho Chi Minh',
    allowDirectMessages: true,
  });
  vi.spyOn(friendService, 'getStatus').mockResolvedValue({ status: 'NONE' } as never);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});

describe('UserHoverCard', () => {
  it('links to the profile and shows the preview only after the hover delay', async () => {
    renderCard();
    const anchor = screen.getByRole('link', { name: 'Thao' });
    expect(anchor).toHaveAttribute('href', '/profile/u-2');

    fireEvent.mouseEnter(anchor);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await act(async () => { vi.advanceTimersByTime(400); });
    expect(await screen.findByText('Thao Nguyen')).toBeInTheDocument();
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Add friend/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Message/ })).toBeInTheDocument();
  });

  it('does not open when the pointer leaves before the delay', async () => {
    renderCard();
    const anchor = screen.getByRole('link', { name: 'Thao' });
    fireEvent.mouseEnter(anchor);
    fireEvent.mouseLeave(anchor);
    await act(async () => { vi.advanceTimersByTime(600); });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
