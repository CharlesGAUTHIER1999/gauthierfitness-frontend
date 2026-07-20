import api from "./axios";

// Stats
export function getAdminStats() {
    return api.get("/admin/stats").then((r) => r.data);
}

// Products
export function getAdminProducts(params = {}) {
    return api.get("/admin/products", {params}).then((r) => r.data);
}

export function getAdminProduct(id) {
    return api.get(`/admin/products/${id}`).then((r) => r.data);
}

export function createAdminProduct(data) {
    return api.post("/admin/products", data).then((r) => r.data);
}

export function updateAdminProduct(id, data) {
    return api.patch(`/admin/products/${id}`, data).then((r) => r.data);
}

export function deleteAdminProduct(id) {
    return api.delete(`/admin/products/${id}`).then((r) => r.data);
}

export function toggleAdminProductActive(id) {
    return api.patch(`/admin/products/${id}/toggle-active`).then((r) => r.data);
}

// Orders
export function getAdminOrders(params = {}) {
    return api.get("/admin/orders", {params}).then((r) => r.data);
}

export function getAdminOrder(id) {
    return api.get(`/admin/orders/${id}`).then((r) => r.data);
}

export function updateAdminOrderStatus(id, order_status) {
    return api
        .patch(`/admin/orders/${id}/status`, {order_status})
        .then((r) => r.data);
}

// Stock
export function getAdminStock(params = {}) {
    return api.get("/admin/stock", {params}).then((r) => r.data);
}

export function getAdminProductStock(productId) {
    return api.get(`/admin/products/${productId}/stock`).then((r) => r.data);
}

export function addAdminStock(productId, data) {
    return api.post(`/admin/products/${productId}/stock`, data).then((r) => r.data);
}

export function adjustAdminStockLot(lotId, data) {
    return api.patch(`/admin/stock/lots/${lotId}/adjust`, data).then((r) => r.data);
}

export function getAdminStockMovements(productId, params = {}) {
    return api
        .get(`/admin/products/${productId}/stock/movements`, {params})
        .then((r) => r.data);
}
