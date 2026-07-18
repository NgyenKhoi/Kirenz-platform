import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserProfile } from '../types/auth.types';
import ProtectedRoute from './ProtectedRoute';

const user = (role: string): UserProfile => ({
  id: 'user-1', email: 'user@kirenz.local', username: 'user', role,
  status: 'ACTIVE', emailVerified: true, createdAt: '2026-07-19T00:00:00Z',
});

function renderRoute() {
  return render(<MemoryRouter initialEntries={['/home']}><Routes>
    <Route path="/home" element={<ProtectedRoute><div>User feed</div></ProtectedRoute>} />
    <Route path="/admin" element={<div>Admin dashboard</div>} />
    <Route path="/login" element={<div>Login page</div>} />
  </Routes></MemoryRouter>);
}

afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});

describe('ProtectedRoute', () => {
  it('renders user content for an authenticated user', () => {
    useAuthStore.setState({ user: user('USER'), isAuthenticated: true, isLoading: false });
    renderRoute();
    expect(screen.getByText('User feed')).toBeInTheDocument();
  });

  it('redirects an admin away from user routes', () => {
    useAuthStore.setState({ user: user('ADMIN'), isAuthenticated: true, isLoading: false });
    renderRoute();
    expect(screen.getByText('Admin dashboard')).toBeInTheDocument();
  });

  it('redirects an anonymous visitor to login', () => {
    renderRoute();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
