import api from "../api/axios.js";

export const getProducts = async (filters = {}) => {
    const res = await api.get("/products", { params: filters });
    return res.data.data;
};

export const getProduct = async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
};