// Mirrors backend/app/Services/Pricing/ShippingCalculator.php — display-only here, the
// backend recomputes and charges the authoritative amount, this never drives the Stripe amount.
export const FREE_SHIPPING_THRESHOLD = 70;
export const STANDARD_SHIPPING_COST = 4.9;
export const EXPRESS_SHIPPING_COST = 9.9;

export const SHIPPING_METHODS = [
    {value: "standard", label: "Standard", eta: "3-5 jours ouvrés"},
    {value: "express", label: "Express", eta: "24-48h"},
];

// Preview of a delivery method's cost, given the product-only subtotal. Express never benefits
// from the free-shipping threshold. The backend is the source of truth for what gets charged.
export function estimateShippingCost(method, productSubtotal) {
    if (method === "express") return EXPRESS_SHIPPING_COST;
    return productSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}
