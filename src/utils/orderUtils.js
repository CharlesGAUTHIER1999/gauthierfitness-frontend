// Format a number as a price in euros using the French locale
export function formatPriceEUR(n) {
    const v = Number(n || 0);
    return v.toLocaleString("fr-FR", {style: "currency", currency: "EUR"});
}

// Format an ISO date string into a French date format (dd/mm/yyyy)
export function formatDateFR(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

// Format an ISO date string into a French date and time format (dd/mm/yyyy, hh:mm)
export function formatDateTimeFR(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Status code mapping (french display label)
export function statusLabel(orderStatus) {
    const map = {
        new: "Nouvelle",
        processing: "Confirmée",
        shipped: "Expédiée",
        delivered: "Livrée",
        canceled: "Annulée",
    };
    return map[orderStatus] || orderStatus;
}
