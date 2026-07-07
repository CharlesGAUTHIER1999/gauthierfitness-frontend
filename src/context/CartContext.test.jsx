/**
 * Tests for CartContext: guest cart fetch/add without a Bearer token.
 */
import {render, screen, waitFor, act} from '@testing-library/react';
import {CartProvider, useCart} from './CartContext';
import api from '../api/axios';

jest.mock('../api/axios');

function ConsumerSpy() {
    const cart = useCart();
    return (
        <div>
            <span data-testid="count">{cart.count}</span>
            <button onClick={() => cart.addItem({productId: 1, quantity: 2})}>add</button>
        </div>
    );
}

function renderWithProvider() {
    return render(
        <CartProvider>
            <ConsumerSpy/>
        </CartProvider>
    );
}

describe('CartProvider (guest)', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.resetAllMocks();
    });

    it('fetches the cart on mount even without a Bearer token (guest)', async () => {
        api.get.mockResolvedValue({
            data: {items: [], count: 0, subtotal: 0, currency: 'EUR'},
        });

        renderWithProvider();

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/cart');
        });
        expect(screen.getByTestId('count')).toHaveTextContent('0');
    });

    it('adds an item as a guest and refetches the cart', async () => {
        api.get
            .mockResolvedValueOnce({data: {items: [], count: 0, subtotal: 0, currency: 'EUR'}})
            .mockResolvedValueOnce({
                data: {
                    items: [{id: 1, product_id: 1, quantity: 2, unit_price: 10, line_total: 20, name: 'T-shirt'}],
                    count: 2,
                    subtotal: 20,
                    currency: 'EUR',
                },
            });
        api.post.mockResolvedValue({data: {ok: true}});

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId('count')).toHaveTextContent('0');
        });

        await act(async () => {
            screen.getByText('add').click();
        });

        expect(api.post).toHaveBeenCalledWith('/cart/items', expect.objectContaining({
            product_id: 1,
            quantity: 2,
        }));

        await waitFor(() => {
            expect(screen.getByTestId('count')).toHaveTextContent('2');
        });
    });
});
