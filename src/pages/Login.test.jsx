import {render, screen, fireEvent, act} from '@testing-library/react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import Login from './Login';
import * as authModule from '../store/auth';

// Regression test for the login -> redirect race condition : navigate() must
// only fire once the auth context (token/user) has actually been updated,
// not right after the login() promise resolves.

jest.mock('../store/auth');

function tree() {
    return (
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/" element={<div>Home page</div>}/>
                <Route path="/admin" element={<div>Admin page</div>}/>
            </Routes>
        </MemoryRouter>
    );
}

function renderLogin() {
    return render(tree());
}

async function submitForm() {
    fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'alice@example.com'}});
    fireEvent.change(screen.getByLabelText('Mot de passe'), {target: {value: 'secret'}});
    await act(async () => {
        fireEvent.click(screen.getByText('Se connecter'));
    });
}

describe('Login', () => {
    it('does not navigate away as long as the auth context still has no token', async () => {
        const login = jest.fn().mockResolvedValue({user: {id: 1, is_admin: false}});
        authModule.useAuth.mockReturnValue({login, token: null, user: null});

        renderLogin();
        await submitForm();

        expect(login).toHaveBeenCalledWith('alice@example.com', 'secret');
        // login() resolved, but the context hasn't propagated a token yet -> must stay on /login
        expect(screen.queryByText('Home page')).not.toBeInTheDocument();
        expect(screen.getByText('Connexion')).toBeInTheDocument();
    });

    it('navigates home once the auth context is updated with a token', async () => {
        const login = jest.fn().mockResolvedValue({user: {id: 1, is_admin: false}});
        authModule.useAuth.mockReturnValue({login, token: null, user: null});

        const {rerender} = renderLogin();
        await submitForm();
        expect(screen.queryByText('Home page')).not.toBeInTheDocument();

        // Simulate the context finishing its update (token now set) while the
        // same Login instance (and its `loggedIn` state from the submit above) stays mounted.
        authModule.useAuth.mockReturnValue({login, token: 'tok_1', user: {id: 1, is_admin: false}});
        rerender(tree());

        expect(screen.getByText('Home page')).toBeInTheDocument();
    });

    it('navigates to /admin when the logged-in user is an admin', async () => {
        const login = jest.fn().mockResolvedValue({user: {id: 1, is_admin: true}});
        authModule.useAuth.mockReturnValue({login, token: 'tok_admin', user: {id: 1, is_admin: true}});

        renderLogin();
        await submitForm();

        expect(screen.getByText('Admin page')).toBeInTheDocument();
    });
});
