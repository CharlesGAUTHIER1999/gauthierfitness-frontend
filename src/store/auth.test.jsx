import {render, screen, waitFor, act} from '@testing-library/react';
import {AuthProvider, useAuth} from './auth';
import {CartProvider} from '../context/CartContext';
import api, {peekGuestCartToken, clearGuestCartToken} from '../api/axios';

jest.mock('../api/axios');

// Tests for AuthProvider
function ConsumerSpy() {
    const auth = useAuth();
    return (<div>
        <span data-testid="token">{auth.token ?? 'no-token'}</span>
        <span data-testid="user-email">{auth.user?.email ?? 'no-user'}</span>
        <span data-testid="is-auth">{String(auth.isAuthenticated)}</span>
        <span data-testid="loading">{String(auth.loading)}</span>
        <span data-testid="user-city">{auth.user?.city ?? 'no-city'}</span>
        <button onClick={() => auth.login('alice@example.com', 'secret')}>login</button>
        <button onClick={() => auth.logout()}>logout</button>
        <button onClick={() => auth.updateProfile({city: 'Paris'})}>update-profile</button>
    </div>);
}

// Renders ConsumerSpy wrapped in CartProvider + AuthProvider
function renderWithProvider() {
    return render(<CartProvider>
        <AuthProvider>
            <ConsumerSpy/>
        </AuthProvider>
    </CartProvider>);
}

describe('AuthProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.resetAllMocks();
    });

    it('starts with no token and loading=true when localStorage empty', async () => {
        api.get.mockImplementation((url) => url === '/cart' ? Promise.resolve({
            data: {
                items: [], count: 0, subtotal: 0
            }
        }) : Promise.reject(new Error('not called')));
        renderWithProvider();

        expect(screen.getByTestId('token')).toHaveTextContent('no-token');

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });
        expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
    });

    it('login stores token + user in localStorage and exposes them', async () => {
        api.get.mockResolvedValue({data: {email: 'alice@example.com'}});
        api.post.mockResolvedValue({
            data: {
                token: 'tok_42', user: {id: 1, email: 'alice@example.com', is_admin: false},
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

    it('login sends the guest cart token when one is present, then clears it', async () => {
        peekGuestCartToken.mockReturnValue('guest-uuid-123');
        api.get.mockResolvedValue({data: {email: 'alice@example.com'}});
        api.post.mockResolvedValue({
            data: {
                token: 'tok_42', user: {id: 1, email: 'alice@example.com', is_admin: false},
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

        expect(api.post).toHaveBeenCalledWith('/login', expect.objectContaining({
            guest_cart_token: 'guest-uuid-123',
        }));
        expect(clearGuestCartToken).toHaveBeenCalled();
    });

    it('logout clears token + user from localStorage', async () => {
        localStorage.setItem('token', 'old_token');
        localStorage.setItem('user', JSON.stringify({email: 'a@a.fr'}));
        api.get.mockResolvedValue({data: {email: 'a@a.fr'}});
        api.post.mockResolvedValue({data: {ok: true}});
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
        localStorage.setItem('user', JSON.stringify({email: 'a@a.fr'}));
        const err = new Error('Unauthenticated');
        err.response = {status: 401};
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
        localStorage.setItem('user', JSON.stringify({email: 'a@a.fr'}));
        const err = new Error('Server error');
        err.response = {status: 500};
        api.get.mockImplementation((url) => url === '/cart' ? Promise.resolve({
            data: {
                items: [], count: 0, subtotal: 0
            }
        }) : Promise.reject(err));
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {
        });
        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });

        expect(localStorage.getItem('token')).toBe('still_valid');
        expect(screen.getByTestId('is-auth')).toHaveTextContent('true');
        warnSpy.mockRestore();
    });

    it('updateProfile patches /me and refreshes the cached user', async () => {
        localStorage.setItem('token', 'tok_42');
        localStorage.setItem('user', JSON.stringify({email: 'alice@example.com'}));
        api.get.mockResolvedValue({data: {email: 'alice@example.com'}});
        api.patch.mockResolvedValue({
            data: {id: 1, email: 'alice@example.com', city: 'Paris'},
        });

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });

        await act(async () => {
            screen.getByText('update-profile').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('user-city')).toHaveTextContent('Paris');
        });

        expect(api.patch).toHaveBeenCalledWith('/me', {city: 'Paris'});
        expect(JSON.parse(localStorage.getItem('user'))).toMatchObject({city: 'Paris'});
    });
});
