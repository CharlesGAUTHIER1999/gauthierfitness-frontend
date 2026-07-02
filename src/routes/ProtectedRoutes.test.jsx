import {render, screen} from '@testing-library/react';
import {MemoryRouter, Routes, Route} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoutes';
import * as authModule from '../store/auth';

// Tests for ProtectedRoute : redirect to /login if not authenticated, otherwise render children.

jest.mock('../store/auth');

// Renders ProtectedRoute
function renderAt(path, useAuthReturn) {
    authModule.useAuth.mockReturnValue(useAuthReturn);
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <div>Dashboard content</div>
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<div>Login page</div>}/>
            </Routes>
        </MemoryRouter>
    );
}

describe('ProtectedRoute', () => {
    it('renders nothing while loading', () => {
        renderAt('/dashboard', {token: null, loading: true});
        expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument();
        expect(screen.queryByText('Login page')).not.toBeInTheDocument();
    });

    it('redirects to /login when no token', () => {
        renderAt('/dashboard', {token: null, loading: false});
        expect(screen.getByText('Login page')).toBeInTheDocument();
        expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument();
    });

    it('renders children when token is present', () => {
        renderAt('/dashboard', {token: 'tok_42', loading: false});
        expect(screen.getByText('Dashboard content')).toBeInTheDocument();
        expect(screen.queryByText('Login page')).not.toBeInTheDocument();
    });
});
