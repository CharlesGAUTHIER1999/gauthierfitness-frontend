/**
 * Tests du AuthProvider : login, register, logout, persist, bootstrap /me.
 */
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth';
import api from '../api/axios';

jest.mock('../api/axios');

function ConsumerSpy() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="token">{auth.token ?? 'no-token'}</span>
      <span data-testid="user-email">{auth.user?.email ?? 'no-user'}</span>
      <span data-testid="is-auth">{String(auth.isAuthenticated)}</span>
      <span data-testid="loading">{String(auth.loading)}</span>
      <button onClick={() => auth.login('alice@example.com', 'secret')}>login</button>
      <button onClick={() => auth.logout()}>logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <ConsumerSpy />
    </AuthProvider>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  it('starts with no token and loading=true when localStorage empty', async () => {
    api.get.mockRejectedValue(new Error('not called'));
    renderWithProvider();

    expect(screen.getByTestId('token')).toHaveTextContent('no-token');

    // bootstrap finishes synchronously since no token → loading false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
  });

  it('login stores token + user in localStorage and exposes them', async () => {
    api.get.mockResolvedValue({ data: { email: 'alice@example.com' } });
    api.post.mockResolvedValue({
      data: {
        token: 'tok_42',
        user: { id: 1, email: 'alice@example.com', is_admin: false },
      },
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('tok_42');
    });

    expect(localStorage.getItem('token')).toBe('tok_42');
    expect(JSON.parse(localStorage.getItem('user'))).toMatchObject({
      email: 'alice@example.com',
    });
    expect(screen.getByTestId('is-auth')).toHaveTextContent('true');
  });

  it('logout clears token + user from localStorage', async () => {
    localStorage.setItem('token', 'old_token');
    localStorage.setItem('user', JSON.stringify({ email: 'a@a.fr' }));

    api.get.mockResolvedValue({ data: { email: 'a@a.fr' } });
    api.post.mockResolvedValue({ data: { ok: true } });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('bootstrap clears token on /me returning 401 (token invalid)', async () => {
    localStorage.setItem('token', 'expired');
    localStorage.setItem('user', JSON.stringify({ email: 'a@a.fr' }));

    const err = new Error('Unauthenticated');
    err.response = { status: 401 };
    api.get.mockRejectedValue(err);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
  });

  it('bootstrap keeps token when /me errors with 500 (backend down, not auth)', async () => {
    localStorage.setItem('token', 'still_valid');
    localStorage.setItem('user', JSON.stringify({ email: 'a@a.fr' }));

    const err = new Error('Server error');
    err.response = { status: 500 };
    api.get.mockRejectedValue(err);

    // silence le console.warn de bootstrap
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('token')).toBe('still_valid');
    expect(screen.getByTestId('is-auth')).toHaveTextContent('true');

    warnSpy.mockRestore();
  });
});
