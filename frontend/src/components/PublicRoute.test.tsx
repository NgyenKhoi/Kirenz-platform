import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserProfile } from '../types/auth.types';
import PublicRoute from './PublicRoute';

const user = (role: string, emailVerified = true): UserProfile => ({
  id: 'user-1', email: 'user@kirenz.local', username: 'user', role,
  status: 'ACTIVE', emailVerified, createdAt: '2026-07-19T00:00:00Z',
});

function renderRoute(allowUnverified = false) {
  return render(<MemoryRouter initialEntries={['/login']}><Routes>
    <Route path="/login" element={<PublicRoute allowUnverified={allowUnverified}><div>Public page</div></PublicRoute>} />
    <Route path="/home" element={<div>User feed</div>} />
    <Route path="/admin" element={<div>Admin dashboard</div>} />
  </Routes></MemoryRouter>);
}

afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});

describe('PublicRoute', () => {
  it('renders public content for an anonymous visitor', () => {
    renderRoute();
    expect(screen.getByText('Public page')).toBeInTheDocument();
  });

  it('redirects an authenticated user to the home feed', () => {
    useAuthStore.setState({ user: user('USER'), isAuthenticated: true, isLoading: false });
    renderRoute();
    expect(screen.getByText('User feed')).toBeInTheDocument();
  });

  it('redirects an authenticated admin to the dashboard', () => {
    useAuthStore.setState({ user: user('ADMIN'), isAuthenticated: true, isLoading: false });
    renderRoute();
    expect(screen.getByText('Admin dashboard')).toBeInTheDocument();
  });

  it('keeps an unverified user on login when OTP is allowed', () => {
    useAuthStore.setState({ user: user('USER', false), isAuthenticated: true, isLoading: false });
    renderRoute(true);
    expect(screen.getByText('Public page')).toBeInTheDocument();
  });
});
