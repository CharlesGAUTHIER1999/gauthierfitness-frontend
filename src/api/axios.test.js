// Tests for the shared axios instance

describe('axios instance', () => {
    let api;

    beforeEach(() => {
        jest.resetModules();
        localStorage.clear();
    });

    it('uses /api as fallback baseURL when VITE_API_URL is empty', async () => {
        api = (await import('./axios')).default;
        expect(api.defaults.baseURL).toBe('/api');
    });

    it('sets Accept: application/json header', async () => {
        api = (await import('./axios')).default;
        expect(api.defaults.headers.Accept).toBe('application/json');
    });

    it('attaches Bearer token when present in localStorage', async () => {
        localStorage.setItem('token', 'abc123');
        api = (await import('./axios')).default;
        const config = await api.interceptors.request.handlers[0].fulfilled({headers: {}});
        expect(config.headers.Authorization).toBe('Bearer abc123');
    });

    it('does not attach Authorization when no token in localStorage', async () => {
        api = (await import('./axios')).default;
        const config = await api.interceptors.request.handlers[0].fulfilled({headers: {}});
        expect(config.headers.Authorization).toBeUndefined();
    });

    it('removes token from localStorage on 401 response', async () => {
        localStorage.setItem('token', 'expired_token');
        api = (await import('./axios')).default;
        const responseHandler = api.interceptors.response.handlers[0].rejected;

        try {
            await responseHandler({response: {status: 401}});
        } catch (_) {
            // expected rejection
        }

        expect(localStorage.getItem('token')).toBeNull();
    });

    it('keeps token in localStorage on non-401 errors', async () => {
        localStorage.setItem('token', 'still_valid');
        api = (await import('./axios')).default;
        const responseHandler = api.interceptors.response.handlers[0].rejected;

        try {
            await responseHandler({response: {status: 500}});
        } catch (_) {
            // expected rejection
        }

        expect(localStorage.getItem('token')).toBe('still_valid');
    });

    it('has a 15s timeout configured', async () => {
        api = (await import('./axios')).default;
        expect(api.defaults.timeout).toBe(15000);
    });
});
