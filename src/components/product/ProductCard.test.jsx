import {render, screen, fireEvent} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import ProductCard from './ProductCard';

// ProductCard tests : product rendering, hover image, formatted price, product link.
function renderCard(productOverrides = {}) {
    const product = {
        id: 1,
        slug: 't-shirt-noir',
        name: 'T-shirt Noir',
        main_image: '/img/main.png',
        hover_image: '/img/hover.png',
        price_ttc: 29.9,
        sizes_preview: ['S', 'M', 'L'],
        ...productOverrides,
    };
    return render(
        <MemoryRouter>
            <ProductCard product={product}/>
        </MemoryRouter>
    );
}

describe('ProductCard', () => {
    it('renders product name and price formatted to 2 decimals', () => {
        renderCard();
        expect(screen.getByText('T-shirt Noir')).toBeInTheDocument();
        expect(screen.getByText('29.90 €')).toBeInTheDocument();
    });

    it('renders sizes preview when present', () => {
        renderCard();
        expect(screen.getByText('S • M • L')).toBeInTheDocument();
    });

    it('omits sizes preview when none provided', () => {
        renderCard({sizes_preview: []});
        expect(screen.queryByText(/S • M • L/)).not.toBeInTheDocument();
    });

    it('shows main image by default', () => {
        renderCard();
        const img = screen.getByAltText('T-shirt Noir');
        expect(img.getAttribute('src')).toBe('/img/main.png');
    });

    it('shows hover image on mouse enter', () => {
        renderCard();
        const article = screen.getByText('T-shirt Noir').closest('article');
        fireEvent.mouseEnter(article);
        const img = screen.getByAltText('T-shirt Noir');
        expect(img.getAttribute('src')).toBe('/img/hover.png');
    });

    it('falls back to placeholder when no main_image', () => {
        renderCard({main_image: null, hover_image: null});
        const img = screen.getByAltText('T-shirt Noir');
        expect(img.getAttribute('src')).toBe('/placeholder.png');
    });

    it('wraps card in a link to /products/{slug}', () => {
        renderCard();
        const link = screen.getByRole('link');
        expect(link.getAttribute('href')).toBe('/products/t-shirt-noir');
    });
});
