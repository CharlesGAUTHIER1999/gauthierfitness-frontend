// Format number as price (euro)
export function formatPriceEUR(n) {
    const v = Number(n || 0);
    return v.toLocaleString("fr-FR", {style: "currency", currency: "EUR"});
}

// Format ISO date string into French date format
export function formatDateFR(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
}

// Format ISO date string into French date and time format
export function formatDateTimeFR(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

// Status code mapping
export function statusLabel(orderStatus) {
    const map = {
        new: "Nouvelle", processing: "Confirmée", shipped: "Expédiée", delivered: "Livrée", canceled: "Annulée",
    };
    return map[orderStatus] || orderStatus;
}
