import {render, screen} from '@testing-library/react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import AdminRoute from './AdminRoute';
import * as authModule from '../store/auth';

// Tests for AdminRoute

jest.mock('../store/auth');

// Renders AdminRoute at /admin with a mocked useAuth return value
function renderAt(useAuthReturn) {
    authModule.useAuth.mockReturnValue(useAuthReturn);

    return render(
        <MemoryRouter initialEntries={['/admin']}>
            <Routes>
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <div>Admin panel</div>
                        </AdminRoute>
                    }
                />
                <Route path="/login" element={<div>Login page</div>}/>
                <Route path="/" element={<div>Home</div>}/>
            </Routes>
        </MemoryRouter>
    );
}

describe('AdminRoute', () => {
    it('renders nothing while loading', () => {
        renderAt({user: null, token: null, loading: true});
        expect(screen.queryByText('Admin panel')).not.toBeInTheDocument();
        expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('redirects to /login when not authenticated', () => {
        renderAt({user: null, token: null, loading: false});
        expect(screen.getByText('Login page')).toBeInTheDocument();
    });

    it('shows an access-denied message when authenticated but not admin', () => {
        renderAt({
            user: {id: 1, email: 'a@a.fr', is_admin: false},
            token: 'tok',
            loading: false,
        });
        expect(screen.getByText('Accès refusé')).toBeInTheDocument();
        expect(screen.queryByText('Admin panel')).not.toBeInTheDocument();
        expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('renders children when authenticated and admin', () => {
        renderAt({
            user: {id: 1, email: 'admin@a.fr', is_admin: true},
            token: 'tok_admin',
            loading: false,
        });
        expect(screen.getByText('Admin panel')).toBeInTheDocument();
    });
});
