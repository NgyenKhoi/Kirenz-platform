import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserProfile } from '../types/auth.types';
import AdminRoute from './AdminRoute';

const user = (role: string): UserProfile => ({
  id: 'user-1', email: 'admin@kirenz.local', username: 'admin', role,
  status: 'ACTIVE', emailVerified: true, createdAt: '2026-07-19T00:00:00Z',
});

function renderRoute() {
  return render(<MemoryRouter initialEntries={['/admin']}><Routes>
    <Route path="/admin" element={<AdminRoute><div>Admin content</div></AdminRoute>} />
    <Route path="/home" element={<div>Home content</div>} />
    <Route path="/login" element={<div>Login content</div>} />
  </Routes></MemoryRouter>);
}

afterEach(() => { cleanup(); useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false }); });

describe('AdminRoute', () => {
  it('renders admin content for an authenticated admin', () => {
    useAuthStore.setState({ user: user('ADMIN'), isAuthenticated: true, isLoading: false });
    renderRoute();
    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('redirects a non-admin user to home', () => {
    useAuthStore.setState({ user: user('USER'), isAuthenticated: true, isLoading: false });
    renderRoute();
    expect(screen.getByText('Home content')).toBeInTheDocument();
  });

  it('redirects an anonymous visitor to login', () => {
    renderRoute();
    expect(screen.getByText('Login content')).toBeInTheDocument();
  });
});
